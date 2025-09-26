import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Calendar, Trophy, Target, TrendingUp } from 'lucide-react';
import { Game, GameBatch } from '../types/game';
import { useUserStore, useGameStore } from '../store/useStore';
import { firebaseService } from '../lib/firebase-service';
import { offlineStorage } from '../lib/offline-storage';
import { Chess } from 'chess.js';

export const BatchSummary: React.FC = () => {
  const { user, isGuest } = useUserStore();
  const { gameHistory } = useGameStore();
  const [batchGames, setBatchGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBatchGames();
  }, [gameHistory, user]);

  const loadBatchGames = async () => {
    setIsLoading(true);
    try {
      // Get last session games (last 10 games or games from today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let allGames: Game[] = [];
      
      if (user && !isGuest) {
        allGames = await firebaseService.getUserGames(user.uid, 20);
      }
      
      const offlineGames = await offlineStorage.getAllGames();
      offlineGames.forEach(game => {
        if (!allGames.find(g => g.id === game.id)) {
          allGames.push(game);
        }
      });
      
      // Sort and take last batch (last 10 games or today's games)
      allGames.sort((a, b) => b.createdAt - a.createdAt);
      const lastBatch = allGames.slice(0, Math.min(10, allGames.length));
      
      setBatchGames(lastBatch);
    } catch (error) {
      console.error('Failed to load batch games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = () => {
    const total = batchGames.length;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalMoves = 0;

    batchGames.forEach(game => {
      totalMoves += game.moves.length;
      
      if (game.result === 'draw') {
        draws += 1;
      } else if (game.winnerUid === user?.uid) {
        wins += 1;
      } else {
        losses += 1;
      }
    });

    return {
      total,
      wins,
      losses,
      draws,
      avgMoves: total > 0 ? Math.round(totalMoves / total) : 0,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0
    };
  };

  const exportBatchToPGN = () => {
    let pgnContent = '';
    
    batchGames.forEach((game, index) => {
      const chess = new Chess();
      const moves = game.moves.map(m => m.san).join(' ');
      
      let pgn = `[Event "Chess Batch Game ${index + 1}"]\n`;
      pgn += `[Site "Chess App"]\n`;
      pgn += `[Date "${new Date(game.createdAt).toISOString().split('T')[0]}"]\n`;
      pgn += `[White "${game.players.find(p => p.color === 'white')?.displayName || 'Unknown'}"]\n`;
      pgn += `[Black "${game.players.find(p => p.color === 'black')?.displayName || 'Unknown'}"]\n`;
      pgn += `[Result "${game.result === 'white' ? '1-0' : game.result === 'black' ? '0-1' : '1/2-1/2'}"]\n\n`;
      pgn += `${moves}\n\n`;
      
      pgnContent += pgn;
    });
    
    const blob = new Blob([pgnContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-batch-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (batchGames.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">No recent games</p>
          <p className="text-gray-500 dark:text-gray-500">Play some games to see your batch summary!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Last Batch Summary</h2>
        <button
          onClick={exportBatchToPGN}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export PGN
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.winRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Moves</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.avgMoves}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">W/L/D</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {summary.wins}/{summary.losses}/{summary.draws}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Games</h3>
        <div className="space-y-3">
          {batchGames.map((game, index) => {
            const result = game.result === 'draw' ? 'Draw' : 
                          game.winnerUid === user?.uid ? 'Win' : 'Loss';
            const resultColor = game.result === 'draw' ? 'text-yellow-600' :
                               game.winnerUid === user?.uid ? 'text-green-600' : 'text-red-600';
            
            return (
              <div
                key={game.id}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">#{index + 1}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {game.mode} {game.mode === 'ai' && `(${game.aiLevel})`}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {game.moves.length} moves
                  </span>
                  <span className={`font-medium ${resultColor}`}>
                    {result}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};