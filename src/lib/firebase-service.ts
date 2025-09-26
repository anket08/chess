import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import { Game, User, GameBatch, GameMove } from '../types/game';
import { offlineStorage } from './offline-storage';

class FirebaseService {
  async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userData: User = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        theme: 'light',
        stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 }
      };

      await this.createOrUpdateUser(userData);
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    await offlineStorage.clearUser();
  }

  async createOrUpdateUser(userData: User): Promise<void> {
    const userRef = doc(db, 'users', userData.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await updateDoc(userRef, userData);
    } else {
      // Update only non-stats fields
      await updateDoc(userRef, {
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL
      });
    }
    
    await offlineStorage.saveUser(userData);
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updateUserTheme(uid: string, theme: 'light' | 'dark'): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { theme });
  }

  async createGame(gameData: Omit<Game, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
    await updateDoc(doc(db, 'games', gameId), updates);
  }

  async addMoveToGame(gameId: string, move: GameMove): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      const currentMoves = gameDoc.data().moves || [];
      await updateDoc(gameRef, {
        moves: [...currentMoves, move],
        currentPlayerUid: move.currentPlayerUid
      });
    }
  }

  async getGame(gameId: string): Promise<Game | null> {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    return gameDoc.exists() ? { id: gameDoc.id, ...gameDoc.data() } as Game : null;
  }

  async getUserGames(uid: string, limitCount: number = 10): Promise<Game[]> {
    const q = query(
      collection(db, 'games'),
      where('players', 'array-contains-any', [{ uid }]),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
  }

  async findGameByRoomCode(roomCode: string): Promise<Game | null> {
    const q = query(
      collection(db, 'games'),
      where('roomCode', '==', roomCode),
      where('status', '==', 'waiting'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Game;
  }

  subscribeToGame(gameId: string, callback: (game: Game | null) => void): () => void {
    return onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Game);
      } else {
        callback(null);
      }
    });
  }

  async createBatch(ownerUid: string): Promise<string> {
    const batchData: Omit<GameBatch, 'id'> = {
      ownerUid,
      games: [],
      createdAt: Date.now(),
      summary: {
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        avgMoves: 0
      }
    };
    
    const docRef = await addDoc(collection(db, 'batches'), batchData);
    return docRef.id;
  }

  async updateBatch(batchId: string, updates: Partial<GameBatch>): Promise<void> {
    await updateDoc(doc(db, 'batches', batchId), updates);
  }

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async finishGame(gameId: string, result: Game['result'], winnerUid?: string): Promise<void> {
    const batch = writeBatch(db);
    const gameRef = doc(db, 'games', gameId);
    
    // Update game
    batch.update(gameRef, {
      status: 'finished',
      result,
      winnerUid,
      endedAt: serverTimestamp()
    });

    // Update player stats
    const game = await this.getGame(gameId);
    if (game) {
      for (const player of game.players) {
        const userRef = doc(db, 'users', player.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentStats = userDoc.data().stats || { wins: 0, losses: 0, draws: 0, totalGames: 0 };
          const newStats = { ...currentStats };
          
          newStats.totalGames += 1;
          
          if (result === 'draw') {
            newStats.draws += 1;
          } else if (winnerUid === player.uid) {
            newStats.wins += 1;
          } else {
            newStats.losses += 1;
          }
          
          batch.update(userRef, { stats: newStats });
        }
      }
    }
    
    await batch.commit();
  }
}

export const firebaseService = new FirebaseService();