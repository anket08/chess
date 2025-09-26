import React from 'react';
import { User, LogOut, Sun, Moon, Trophy, Target, TrendingUp } from 'lucide-react';
import { useUserStore } from '../store/useStore';
import { firebaseService } from '../lib/firebase-service';

interface UserProfileProps {
  onSignIn: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSignIn }) => {
  const { user, isGuest, theme, setTheme, setUser, setIsGuest } = useUserStore();

  const handleSignOut = async () => {
    await firebaseService.signOut();
    setUser(null);
    setIsGuest(false);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (user && !isGuest) {
      await firebaseService.updateUserTheme(user.uid, newTheme);
    }
    
    // Update document class for theme
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (isGuest || !user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {isGuest ? 'Guest Mode' : 'Sign In'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isGuest 
              ? 'Sign in to save your games and play online'
              : 'Sign in to access all features'
            }
          </p>
          
          <button
            onClick={onSignIn}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
          >
            Sign in with Google
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=3B82F6&color=fff`}
            alt={user.displayName}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.displayName}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.wins}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.losses}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.draws}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};