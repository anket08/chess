import React from 'react';
import { UserProfile } from '../components/UserProfile';
import { useUserStore } from '../store/useStore';
import { firebaseService } from '../lib/firebase-service';

export const ProfilePage: React.FC = () => {
  const { setUser, setIsGuest } = useUserStore();

  const handleSignIn = async () => {
    const userData = await firebaseService.signInWithGoogle();
    if (userData) {
      setUser(userData);
      setIsGuest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <UserProfile onSignIn={handleSignIn} />
    </div>
  );
};