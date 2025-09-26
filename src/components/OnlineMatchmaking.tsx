import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Copy, Check } from 'lucide-react';
import { firebaseService } from '../lib/firebase-service';
import { Game, Player } from '../types/game';
import { useUserStore } from '../store/useStore';

interface OnlineMatchmakingProps {
  onGameStart: (game: Game) => void;
}

export const OnlineMatchmaking: React.FC<OnlineMatchmakingProps> = ({ onGameStart }) => {
  const { user, isGuest } = useUserStore();
  const [roomCode, setRoomCode] = useState('');
  const [createdGame, setCreatedGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoom = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roomCode = firebaseService.generateRoomCode();
      const player: Player = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        color: 'white'
      };
      
      const gameData: Omit<Game, 'id'> = {
        mode: 'online',
        status: 'waiting',
        createdAt: Date.now(),
        players: [player],
        moves: [],
        result: null,
        roomCode,
        currentPlayerUid: user.uid
      };
      
      const gameId = await firebaseService.createGame(gameData);
      const game: Game = { ...gameData, id: gameId };
      
      setCreatedGame(game);
      
      // Subscribe to game updates to detect when second player joins
      const unsubscribe = firebaseService.subscribeToGame(gameId, (updatedGame) => {
        if (updatedGame && updatedGame.players.length === 2) {
          unsubscribe();
          onGameStart(updatedGame);
        }
      });
      
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const game = await firebaseService.findGameByRoomCode(roomCode.toUpperCase());
      
      if (!game) {
        setError('Room not found');
        return;
      }
      
      if (game.players.length >= 2) {
        setError('Room is full');
        return;
      }
      
      const player: Player = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        color: 'black'
      };
      
      const updatedGame: Game = {
        ...game,
        players: [...game.players, player],
        status: 'active'
      };
      
      await firebaseService.updateGame(game.id, {
        players: updatedGame.players,
        status: 'active'
      });
      
      onGameStart(updatedGame);
      
    } catch (err) {
      setError('Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (createdGame?.roomCode) {
      navigator.clipboard.writeText(createdGame.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Sign in Required</h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            You need to sign in to play online games.
          </p>
        </div>
      </div>
    );
  }

  if (createdGame) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Room Created!
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Room Code:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                {createdGame.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Share this code with your opponent to start the game.
          </p>
          
          <div className="animate-pulse text-blue-600 dark:text-blue-400">
            Waiting for opponent...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Online Multiplayer
      </h2>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <button
            onClick={createRoom}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Plus size={20} />
            Create Room
          </button>
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-400">
          or
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-center text-lg tracking-widest mb-4"
            maxLength={6}
          />
          
          <button
            onClick={joinRoom}
            disabled={isLoading || !roomCode.trim()}
            className="w-full flex items-center justify-center gap-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={20} />
            Join Room
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};