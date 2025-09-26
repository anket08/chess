import { create } from 'zustand';
import { User, Game, GameBatch } from '../types/game';

interface GameState {
  currentGame: Game | null;
  gameHistory: Game[];
  currentBatch: GameBatch | null;
  isLoading: boolean;
  error: string | null;
  setCurrentGame: (game: Game | null) => void;
  setGameHistory: (games: Game[]) => void;
  setCurrentBatch: (batch: GameBatch | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addGameToHistory: (game: Game) => void;
}

interface UserState {
  user: User | null;
  isGuest: boolean;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  gameHistory: [],
  currentBatch: null,
  isLoading: false,
  error: null,
  setCurrentGame: (game) => set({ currentGame: game }),
  setGameHistory: (games) => set({ gameHistory: games }),
  setCurrentBatch: (batch) => set({ currentBatch: batch }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addGameToHistory: (game) => 
    set((state) => ({ 
      gameHistory: [game, ...state.gameHistory] 
    })),
}));

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isGuest: false,
  theme: 'light',
  setUser: (user) => set({ user }),
  setIsGuest: (isGuest) => set({ isGuest }),
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('chess-theme', theme);
  },
}));