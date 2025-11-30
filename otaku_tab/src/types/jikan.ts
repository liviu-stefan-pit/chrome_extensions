// Jikan API v4 Type Definitions

export interface JikanImage {
  image_url?: string;
  small_image_url?: string;
  large_image_url?: string;
  jpg?: {
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
  };
  webp?: {
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
  };
}

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg?: JikanImage;
    webp?: JikanImage;
  };
  trailer?: {
    youtube_id?: string;
    url?: string;
    embed_url?: string;
  };
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  type?: string;
  source?: string;
  episodes?: number;
  status?: string;
  airing: boolean;
  aired?: {
    from?: string;
    to?: string;
    prop?: {
      from?: { day?: number; month?: number; year?: number };
      to?: { day?: number; month?: number; year?: number };
    };
    string?: string;
  };
  duration?: string;
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: string;
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
  producers?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  licensors?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  studios?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  genres?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  explicit_genres?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  themes?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  demographics?: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

export interface JikanScheduleEntry extends JikanAnime {
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduleByDay {
  [key: string]: JikanScheduleEntry[];
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export interface FavoriteAnime {
  mal_id: number;
  title: string;
  image_url: string;
  score?: number;
  broadcast_day?: string;
  broadcast_time?: string;
  episodes?: number;
  status?: string;
  added_at: number;
}

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'auto';
  defaultView?: 'schedule' | 'browse' | 'top';
  enableAnimations?: boolean;
  compactMode?: boolean;
}
