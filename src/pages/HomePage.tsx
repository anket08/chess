import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Users, Brain, Crown, Zap } from 'lucide-react';
import { useUserStore } from '../store/useStore';

export const HomePage: React.FC = () => {
  const { user, isGuest } = useUserStore();

  const features = [
    {
      icon: Users,
      title: 'Online Multiplayer',
      description: 'Play against friends or players worldwide in real-time matches',
      color: 'bg-blue-500'
    },
    {
      icon: Brain,
      title: 'AI Opponents',
      description: 'Challenge AI with adjustable difficulty levels from beginner to expert',
      color: 'bg-purple-500'
    },
    {
      icon: Trophy,
      title: 'Game History',
      description: 'Track your progress with detailed game records and statistics',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Offline Play',
      description: 'Play local games that sync when you connect online',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Master the Game
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience chess like never before. Play online, challenge AI opponents, 
          track your progress, and become a true chess master.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/play"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            <Play size={24} />
            Start Playing
          </Link>
          
          {(!user || isGuest) && (
            <Link
              to="/profile"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {user && !isGuest && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.displayName}!</h2>
          <p className="text-blue-100 mb-6">
            Ready to continue your chess journey? Your stats: {user.stats.wins} wins, {user.stats.losses} losses, {user.stats.draws} draws
          </p>
          <Link
            to="/play"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            <Play size={20} />
            Continue Playing
          </Link>
        </div>
      )}
    </div>
  );
};