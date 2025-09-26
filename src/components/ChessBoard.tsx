import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Game, GameMove, AILevel } from '../types/game';
import { chessAI } from '../lib/chess-ai';
import { firebaseService } from '../lib/firebase-service';
import { Clock, Flag, HandHeart, RotateCcw } from 'lucide-react';

interface ChessBoardProps {
  game: Game;
  onGameUpdate: (game: Game) => void;
  onGameEnd: (result: Game['result'], winnerUid?: string) => void;
  isPlayerTurn: boolean;
  playerColor: 'white' | 'black';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  onGameUpdate,
  onGameEnd,
  isPlayerTurn,
  playerColor
}) => {
  const [chess] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [gameStatus, setGameStatus] = useState<string>('');

  useEffect(() => {
    // Load game moves
    chess.reset();
    game.moves.forEach(move => {
      chess.move(move.san);
    });
    
    updateGameStatus();
  }, [game.moves]);

  useEffect(() => {
    // AI move for AI games
    if (game.mode === 'ai' && game.status === 'active' && isPlayerTurn === false && !chess.isGameOver()) {
      const aiMove = chessAI.getBestMove(chess, game.aiLevel || 'medium');
      if (aiMove) {
        setTimeout(() => makeMove(aiMove), 500);
      }
    }
  }, [isPlayerTurn, game.status]);

  const updateGameStatus = useCallback(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'black' : 'white';
      setGameStatus(`Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins`);
      onGameEnd(winner, winner === playerColor ? game.players.find(p => p.color === playerColor)?.uid : game.players.find(p => p.color !== playerColor)?.uid);
    } else if (chess.isDraw()) {
      setGameStatus('Draw!');
      onGameEnd('draw');
    } else if (chess.isCheck()) {
      setGameStatus('Check!');
    } else {
      const turn = chess.turn() === 'w' ? 'White' : 'Black';
      setGameStatus(`${turn} to move`);
    }
  }, [chess, playerColor, onGameEnd, game.players]);

  const makeMove = useCallback(async (moveString: string) => {
    try {
      const move = chess.move(moveString);
      if (!move) return false;

      const gameMove: GameMove = {
        san: move.san,
        fen: chess.fen(),
        timestamp: Date.now(),
        moveNumber: Math.ceil(chess.history().length / 2)
      };

      const updatedGame: Game = {
        ...game,
        moves: [...game.moves, gameMove]
      };

      if (game.mode === 'online') {
        await firebaseService.addMoveToGame(game.id, gameMove);
      } else {
        onGameUpdate(updatedGame);
      }

      updateGameStatus();
      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  }, [chess, game, onGameUpdate, updateGameStatus]);

  const onDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    // Check if it's player's turn for online games
    if (game.mode === 'online' && !isPlayerTurn) {
      return false;
    }

    // Check if move is legal
    const possibleMoves = chess.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find(m => m.to === targetSquare);
    
    if (!move) return false;

    // Check for promotion
    if (move.promotion) {
      setPendingMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionDialog(true);
      return false;
    }

    return makeMove(`${sourceSquare}${targetSquare}`);
  }, [chess, game.mode, isPlayerTurn, makeMove]);

  const handlePromotion = (piece: string) => {
    if (pendingMove) {
      makeMove(`${pendingMove.from}${pendingMove.to}${piece}`);
      setPendingMove(null);
    }
    setShowPromotionDialog(false);
  };

  const resign = async () => {
    const winner = playerColor === 'white' ? 'black' : 'white';
    const winnerUid = game.players.find(p => p.color === winner)?.uid;
    
    if (game.mode === 'online') {
      await firebaseService.finishGame(game.id, winner, winnerUid);
    } else {
      onGameEnd(winner, winnerUid);
    }
  };

  const offerDraw = async () => {
    if (game.mode === 'online') {
      await firebaseService.finishGame(game.id, 'draw');
    } else {
      onGameEnd('draw');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto p-4">
      <div className="flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg" style={{ width: '600px', height: '600px' }}>
          <Chessboard
            position={chess.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerColor}
            boardWidth={560}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
            }}
            customSquareStyles={{
              [moveFrom || '']: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
              [moveTo || '']: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
            }}
          />
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={resign}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Flag size={16} />
            Resign
          </button>
          <button
            onClick={offerDraw}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <HandHeart size={16} />
            Draw
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Game Status</h3>
          <p className="text-gray-700 dark:text-gray-300">{gameStatus}</p>
          
          {game.mode === 'online' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Room: {game.roomCode}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Move History</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium text-gray-700 dark:text-gray-300">Move</div>
              <div className="font-medium text-gray-700 dark:text-gray-300">White</div>
              <div className="font-medium text-gray-700 dark:text-gray-300">Black</div>
              
              {game.moves.reduce((acc: GameMove[][], move, index) => {
                const moveNumber = Math.ceil((index + 1) / 2);
                const isWhite = index % 2 === 0;
                
                if (isWhite) {
                  acc.push([move]);
                } else {
                  acc[moveNumber - 1].push(move);
                }
                
                return acc;
              }, []).map((movePair, index) => (
                <React.Fragment key={index}>
                  <div className="text-gray-600 dark:text-gray-400">{index + 1}</div>
                  <div className="text-gray-800 dark:text-gray-200">{movePair[0]?.san}</div>
                  <div className="text-gray-800 dark:text-gray-200">{movePair[1]?.san || ''}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPromotionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Promote Pawn</h3>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map(piece => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {piece.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};