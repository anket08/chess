import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { HistoryPage } from './pages/HistoryPage';
import { BatchSummaryPage } from './pages/BatchSummaryPage';
import { ProfilePage } from './pages/ProfilePage';
import { useUserStore } from './store/useStore';
import { firebaseService } from './lib/firebase-service';
import { auth } from './lib/firebase';

function App() {
  const { setUser, setIsGuest, setTheme, theme } = useUserStore();

  useEffect(() => {
    // Set initial theme from localStorage
    const savedTheme = localStorage.getItem('chess-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await firebaseService.getUser(user.uid);
        if (userData) {
          setUser(userData);
          setIsGuest(false);
          setTheme(userData.theme);
        }
      } else {
        // Allow guest mode
        setIsGuest(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsGuest, setTheme]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/batch-summary" element={<BatchSummaryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;