export type GameMode = 'online' | 'local' | 'ai';
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GameResult = 'white' | 'black' | 'draw' | null;
export type AILevel = 'easy' | 'medium' | 'hard';

export interface Player {
  uid: string;
  displayName: string;
  photoURL?: string;
  color: 'white' | 'black';
}

export interface GameMove {
  san: string;
  fen: string;
  timestamp: number;
  moveNumber: number;
}

export interface Game {
  id: string;
  mode: GameMode;
  status: GameStatus;
  createdAt: number;
  endedAt?: number;
  players: Player[];
  moves: GameMove[];
  result: GameResult;
  winnerUid?: string;
  roomCode?: string;
  currentPlayerUid?: string;
  batchId?: string;
  aiLevel?: AILevel;
  duration?: number;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme: 'light' | 'dark';
  stats: UserStats;
}

export interface GameBatch {
  id: string;
  ownerUid: string;
  games: string[];
  createdAt: number;
  summary: {
    total: number;
    wins: number;
    losses: number;
    draws: number;
    avgMoves: number;
  };
}