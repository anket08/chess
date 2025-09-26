import localforage from 'localforage';
import { Game, User } from '../types/game';

class OfflineStorage {
  private gamesStore = localforage.createInstance({ name: 'chess-games' });
  private userStore = localforage.createInstance({ name: 'chess-user' });

  async saveGame(game: Game): Promise<void> {
    await this.gamesStore.setItem(game.id, game);
  }

  async getGame(gameId: string): Promise<Game | null> {
    return await this.gamesStore.getItem(gameId);
  }

  async getAllGames(): Promise<Game[]> {
    const games: Game[] = [];
    await this.gamesStore.iterate((value: Game) => {
      games.push(value);
    });
    return games.sort((a, b) => b.createdAt - a.createdAt);
  }

  async removeGame(gameId: string): Promise<void> {
    await this.gamesStore.removeItem(gameId);
  }

  async saveUser(user: User): Promise<void> {
    await this.userStore.setItem('current-user', user);
  }

  async getUser(): Promise<User | null> {
    return await this.userStore.getItem('current-user');
  }

  async clearUser(): Promise<void> {
    await this.userStore.removeItem('current-user');
  }

  async syncWithFirestore(onlineGames: Game[]): Promise<void> {
    const offlineGames = await this.getAllGames();
    
    // Remove games that exist online
    for (const onlineGame of onlineGames) {
      const offlineGame = await this.getGame(onlineGame.id);
      if (offlineGame) {
        await this.removeGame(onlineGame.id);
      }
    }
  }
}

export const offlineStorage = new OfflineStorage();