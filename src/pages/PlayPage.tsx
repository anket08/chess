import React, { useState, useEffect } from 'react';
import { GameModeSelector } from '../components/GameModeSelector';
import { OnlineMatchmaking } from '../components/OnlineMatchmaking';
import { ChessBoard } from '../components/ChessBoard';
import { Game, GameMode, Player, AILevel } from '../types/game';
import { useUserStore, useGameStore } from '../store/useStore';
import { firebaseService } from '../lib/firebase-service';
import { offlineStorage } from '../lib/offline-storage';
import { Chess } from 'chess.js';

export const PlayPage: React.FC = () => {
  const { user, isGuest } = useUserStore();
  const { currentGame, setCurrentGame, addGameToHistory } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<'selecting' | 'matchmaking' | 'playing'>('selecting');

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (currentGame && currentGame.status === 'waiting') {
        // Clean up waiting games
        setCurrentGame(null);
      }
    };
  }, []);

  const startLocalGame = (aiLevel?: AILevel) => {
    const player1: Player = {
      uid: user?.uid || 'local-1',
      displayName: user?.displayName || 'Player 1',
      photoURL: user?.photoURL,
      color: 'white'
    };

    const player2: Player = {
      uid: selectedMode === 'ai' ? 'ai' : 'local-2',
      displayName: selectedMode === 'ai' ? `AI (${aiLevel})` : 'Player 2',
      color: 'black'
    };

    const gameData: Game = {
      id: `local-${Date.now()}`,
      mode: selectedMode || 'local',
      status: 'active',
      createdAt: Date.now(),
      players: [player1, player2],
      moves: [],
      result: null,
      aiLevel: selectedMode === 'ai' ? aiLevel : undefined
    };

    setCurrentGame(gameData);
    setGameState('playing');
  };

  const handleModeSelect = (mode: GameMode, options?: { aiLevel?: AILevel }) => {
    setSelectedMode(mode);
    
    if (mode === 'online') {
      setGameState('matchmaking');
    } else {
      startLocalGame(options?.aiLevel);
    }
  };

  const handleGameStart = (game: Game) => {
    setCurrentGame(game);
    setGameState('playing');
  };

  const handleGameUpdate = async (updatedGame: Game) => {
    setCurrentGame(updatedGame);
    
    // Save to offline storage for local games
    if (updatedGame.mode !== 'online') {
      await offlineStorage.saveGame(updatedGame);
    }
  };

  const handleGameEnd = async (result: Game['result'], winnerUid?: string) => {
    if (!currentGame) return;

    const endedAt = Date.now();
    const duration = endedAt - currentGame.createdAt;
    
    const finishedGame: Game = {
      ...currentGame,
      status: 'finished',
      endedAt,
      duration,
      result,
      winnerUid
    };

    if (currentGame.mode === 'online') {
      await firebaseService.finishGame(currentGame.id, result, winnerUid);
    } else {
      await offlineStorage.saveGame(finishedGame);
    }

    addGameToHistory(finishedGame);
    setCurrentGame(null);
    setGameState('selecting');
    setSelectedMode(null);
  };

  const isPlayerTurn = (): boolean => {
    if (!currentGame || !user) return false;
    
    if (currentGame.mode === 'local') return true;
    if (currentGame.mode === 'ai') {
      const playerColor = currentGame.players.find(p => p.uid === user.uid)?.color;
      const chess = new Chess();
      currentGame.moves.forEach(move => chess.move(move.san));
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
      return playerColor === currentTurn;
    }
    
    // Online game logic
    const chess = new Chess();
    currentGame.moves.forEach(move => chess.move(move.san));
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
    const playerColor = currentGame.players.find(p => p.uid === user.uid)?.color;
    return playerColor === currentTurn;
  };

  const getPlayerColor = (): 'white' | 'black' => {
    if (!currentGame || !user) return 'white';
    return currentGame.players.find(p => p.uid === user.uid)?.color || 'white';
  };

  const goBack = () => {
    setCurrentGame(null);
    setSelectedMode(null);
    setGameState('selecting');
  };

  if (gameState === 'playing' && currentGame) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={goBack}
            className="mb-4 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            ← Back to Game Selection
          </button>
          
          <ChessBoard
            game={currentGame}
            onGameUpdate={handleGameUpdate}
            onGameEnd={handleGameEnd}
            isPlayerTurn={isPlayerTurn()}
            playerColor={getPlayerColor()}
          />
        </div>
      </div>
    );
  }

  if (gameState === 'matchmaking') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={goBack}
            className="mb-4 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            ← Back to Game Selection
          </button>
          
          <OnlineMatchmaking onGameStart={handleGameStart} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <GameModeSelector onModeSelect={handleModeSelect} />
    </div>
  );
};