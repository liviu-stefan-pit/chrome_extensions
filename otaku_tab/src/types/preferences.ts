// User preferences and favorites

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'auto';
  defaultView?: 'schedule' | 'browse' | 'top';
  enableAnimations?: boolean;
  compactMode?: boolean;
  showAdultContent?: boolean;
  adultContentOnly?: boolean;
}

export interface FavoriteAnime {
  id?: number;  // AniList ID
  mal_id?: number;  // MyAnimeList ID (legacy)
  idMal?: number;  // MAL ID from AniList
  title: string;
  image_url: string;
  score?: number;
  episodes?: number;
  status?: string;
  added_at: number;
}
