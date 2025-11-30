// Favorites storage module using chrome.storage.sync
// Stores user's favorite anime with their airing schedule info

const STORAGE_KEY = 'otaku_favorites';

/**
 * Data structure:
 * {
 *   [animeId]: {
 *     id: number,
 *     title: string,
 *     image: string,
 *     airingDay: string, // 'monday', 'tuesday', etc.
 *     airingTime: string, // local time
 *     airingAt: number, // unix timestamp
 *     score: number,
 *     addedAt: number // timestamp when added to favorites
 *   }
 * }
 */

// Get all favorites
export async function getFavorites() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.sync) {
      resolve({});
      return;
    }
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || {});
    });
  });
}

// Add anime to favorites
export async function addFavorite(anime) {
  try {
    const favorites = await getFavorites();
    
    // Extract day from broadcast info or airingAt timestamp
    let airingDay = anime.broadcast?.day?.toLowerCase() || '';
    if (!airingDay && anime.airingAt) {
      const date = new Date(anime.airingAt * 1000);
      airingDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    }
    
    // Format airing time
    let airingTime = anime.broadcast?.time || '';
    if (!airingTime && anime.airingAt) {
      const date = new Date(anime.airingAt * 1000);
      airingTime = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    favorites[anime.mal_id || anime.id] = {
      id: anime.mal_id || anime.id,
      title: anime.title,
      image: anime.images?.jpg?.image_url || anime.image || '',
      airingDay: airingDay,
      airingTime: airingTime,
      airingAt: anime.airingAt || null,
      score: anime.score || null,
      episodes: anime.episodes || null,
      url: anime.url || '',
      addedAt: Date.now()
    };
    
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: favorites }, () => {
        console.log('[OtakuTab] Added to favorites:', anime.title);
        resolve(true);
      });
    });
  } catch (error) {
    console.error('[OtakuTab] Error adding favorite:', error);
    return false;
  }
}

// Remove anime from favorites
export async function removeFavorite(animeId) {
  try {
    const favorites = await getFavorites();
    delete favorites[animeId];
    
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: favorites }, () => {
        console.log('[OtakuTab] Removed from favorites:', animeId);
        resolve(true);
      });
    });
  } catch (error) {
    console.error('[OtakuTab] Error removing favorite:', error);
    return false;
  }
}

// Check if anime is favorited
export async function isFavorite(animeId) {
  const favorites = await getFavorites();
  return animeId in favorites;
}

// Get favorites grouped by day of the week
export async function getFavoritesByDay() {
  const favorites = await getFavorites();
  const grouped = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };
  
  Object.values(favorites).forEach(anime => {
    const day = anime.airingDay || 'unknown';
    if (grouped[day]) {
      grouped[day].push(anime);
    }
  });
  
  // Sort each day's anime by airing time
  Object.keys(grouped).forEach(day => {
    grouped[day].sort((a, b) => {
      if (!a.airingAt || !b.airingAt) return 0;
      return a.airingAt - b.airingAt;
    });
  });
  
  return grouped;
}

// Listen for changes to favorites
export function onFavoritesChanged(callback) {
  if (!chrome?.storage?.onChanged) return;
  
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue || {});
    }
  });
}
