import React from 'react';
import { Users, User, Bot, Wifi, WifiOff } from 'lucide-react';
import { GameMode, AILevel } from '../types/game';

interface GameModeSelectorProps {
  onModeSelect: (mode: GameMode, options?: { aiLevel?: AILevel }) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onModeSelect }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Choose Game Mode
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Online Multiplayer</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Play against other players online in real-time
            </p>
            <button
              onClick={() => onModeSelect('online')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Play Online
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Local 2-Player</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Play with a friend on the same device
            </p>
            <button
              onClick={() => onModeSelect('local')}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Play Local
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">vs Computer</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Challenge the AI at different difficulty levels
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => onModeSelect('ai', { aiLevel: 'easy' })}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Easy
              </button>
              <button
                onClick={() => onModeSelect('ai', { aiLevel: 'medium' })}
                className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
              >
                Medium
              </button>
              <button
                onClick={() => onModeSelect('ai', { aiLevel: 'hard' })}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};