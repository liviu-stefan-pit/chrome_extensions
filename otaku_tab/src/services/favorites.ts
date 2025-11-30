import type { FavoriteAnime } from '../types/jikan';

const FAVORITES_KEY = 'otaku_tab_favorites';

class FavoritesService {
  async getFavorites(): Promise<FavoriteAnime[]> {
    try {
      const result = await chrome.storage.local.get([FAVORITES_KEY]);
      return result[FAVORITES_KEY] || [];
    } catch (error) {
      console.error('[Favorites] Failed to get favorites:', error);
      return [];
    }
  }

  async addFavorite(anime: FavoriteAnime): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      
      // Check if already exists
      if (favorites.some(fav => fav.mal_id === anime.mal_id)) {
        console.log('[Favorites] Anime already in favorites');
        return;
      }

      favorites.push({
        ...anime,
        added_at: Date.now(),
      });

      await chrome.storage.local.set({ [FAVORITES_KEY]: favorites });
      console.log('[Favorites] Added:', anime.title);
    } catch (error) {
      console.error('[Favorites] Failed to add favorite:', error);
      throw error;
    }
  }

  async removeFavorite(malId: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => fav.mal_id !== malId);
      await chrome.storage.local.set({ [FAVORITES_KEY]: filtered });
      console.log('[Favorites] Removed:', malId);
    } catch (error) {
      console.error('[Favorites] Failed to remove favorite:', error);
      throw error;
    }
  }

  async isFavorite(malId: number): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(fav => fav.mal_id === malId);
  }

  async toggleFavorite(anime: FavoriteAnime): Promise<boolean> {
    const isFav = await this.isFavorite(anime.mal_id);
    
    if (isFav) {
      await this.removeFavorite(anime.mal_id);
      return false;
    } else {
      await this.addFavorite(anime);
      return true;
    }
  }

  async getFavoritesByDay(): Promise<Record<string, FavoriteAnime[]>> {
    const favorites = await this.getFavorites();
    const byDay: Record<string, FavoriteAnime[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      unknown: [],
    };

    favorites.forEach(fav => {
      const day = fav.broadcast_day?.toLowerCase() || 'unknown';
      if (byDay[day]) {
        byDay[day].push(fav);
      } else {
        byDay.unknown.push(fav);
      }
    });

    return byDay;
  }
}

export const favoritesService = new FavoritesService();
