import type { FavoriteAnime } from '../types/preferences';

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
      const animeId = anime.id || anime.mal_id;
      
      // Check if already exists
      if (favorites.some(fav => (fav.id || fav.mal_id) === animeId)) {
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

  async removeFavorite(animeId: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => (fav.id || fav.mal_id) !== animeId);
      await chrome.storage.local.set({ [FAVORITES_KEY]: filtered });
      console.log('[Favorites] Removed:', animeId);
    } catch (error) {
      console.error('[Favorites] Failed to remove favorite:', error);
      throw error;
    }
  }

  async isFavorite(animeId: number): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(fav => (fav.id || fav.mal_id) === animeId);
  }

  async toggleFavorite(anime: FavoriteAnime): Promise<boolean> {
    const animeId = anime.id || anime.mal_id;
    if (!animeId) {
      throw new Error('Anime ID is required');
    }
    
    const isFav = await this.isFavorite(animeId);
    
    if (isFav) {
      await this.removeFavorite(animeId);
      return false;
    } else {
      await this.addFavorite(anime);
      return true;
    }
  }

  async getFavoritesByDay(): Promise<Record<string, FavoriteAnime[]>> {
    const favorites = await this.getFavorites();
    // Just return all favorites sorted by added date
    // Day-based sorting is not applicable with AniList
    return {
      all: favorites.sort((a, b) => b.added_at - a.added_at),
    };
  }
}

export const favoritesService = new FavoritesService();
