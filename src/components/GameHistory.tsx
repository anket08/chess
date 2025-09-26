import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Trophy, Target, Download } from 'lucide-react';
import { Game, User } from '../types/game';
import { firebaseService } from '../lib/firebase-service';
import { offlineStorage } from '../lib/offline-storage';
import { useUserStore } from '../store/useStore';
import { Chess } from 'chess.js';

interface GameHistoryProps {
  onGameSelect?: (game: Game) => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ onGameSelect }) => {
  const { user, isGuest } = useUserStore();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameHistory();
  }, [user, isGuest]);

  const loadGameHistory = async () => {
    setIsLoading(true);
    try {
      let gameHistory: Game[] = [];
      
      if (user && !isGuest) {
        // Load online games
        gameHistory = await firebaseService.getUserGames(user.uid, 50);
        
        // Sync with offline storage
        await offlineStorage.syncWithFirestore(gameHistory);
      }
      
      // Load offline games
      const offlineGames = await offlineStorage.getAllGames();
      
      // Combine and deduplicate
      const allGames = [...gameHistory];
      offlineGames.forEach(offlineGame => {
        if (!allGames.find(g => g.id === offlineGame.id)) {
          allGames.push(offlineGame);
        }
      });
      
      // Sort by date
      allGames.sort((a, b) => b.createdAt - a.createdAt);
      
      setGames(allGames);
    } catch (error) {
      console.error('Failed to load game history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getResultColor = (game: Game, userUid?: string) => {
    if (!game.result || !userUid) return 'text-gray-600 dark:text-gray-400';
    
    if (game.result === 'draw') return 'text-yellow-600 dark:text-yellow-400';
    
    const userWon = game.winnerUid === userUid;
    return userWon ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getResultText = (game: Game, userUid?: string) => {
    if (!game.result) return 'In Progress';
    if (game.result === 'draw') return 'Draw';
    if (!userUid) return `${game.result === 'white' ? 'White' : 'Black'} wins`;
    
    const userWon = game.winnerUid === userUid;
    return userWon ? 'Win' : 'Loss';
  };

  const exportGameToPGN = (game: Game) => {
    const chess = new Chess();
    const moves = game.moves.map(m => m.san).join(' ');
    
    let pgn = `[Event "Chess Game"]\n`;
    pgn += `[Site "Chess App"]\n`;
    pgn += `[Date "${new Date(game.createdAt).toISOString().split('T')[0]}"]\n`;
    pgn += `[White "${game.players.find(p => p.color === 'white')?.displayName || 'Unknown'}"]\n`;
    pgn += `[Black "${game.players.find(p => p.color === 'black')?.displayName || 'Unknown'}"]\n`;
    pgn += `[Result "${game.result === 'white' ? '1-0' : game.result === 'black' ? '0-1' : '1/2-1/2'}"]\n\n`;
    pgn += `${moves}`;
    
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${game.id}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Game History</h2>
      
      {games.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">No games played yet</p>
          <p className="text-gray-500 dark:text-gray-500">Start playing to see your game history here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
              onClick={() => onGameSelect?.(game)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {game.mode} {game.mode === 'ai' && `(${game.aiLevel})`}
                      </span>
                    </div>
                    
                    <div className={`font-semibold ${getResultColor(game, user?.uid)}`}>
                      {getResultText(game, user?.uid)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(game.createdAt)}
                    </div>
                    
                    {game.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {formatDuration(game.duration)}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Trophy size={16} />
                      {game.moves.length} moves
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      vs {game.players.find(p => p.uid !== user?.uid)?.displayName || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportGameToPGN(game);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Export PGN"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};