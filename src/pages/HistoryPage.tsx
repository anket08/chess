import React from 'react';
import { GameHistory } from '../components/GameHistory';

export const HistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <GameHistory />
    </div>
  );
};