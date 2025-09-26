import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, History, BarChart3, User, Crown } from 'lucide-react';
import { useUserStore } from '../store/useStore';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isGuest } = useUserStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/play', icon: Play, label: 'Play' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/batch-summary', icon: BarChart3, label: 'Summary' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Chess Master
            </Link>
            
            <div className="hidden md:flex space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {user && !isGuest && (
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=3B82F6&color=fff`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 p-2 text-xs transition-colors ${
                  isActive(path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};