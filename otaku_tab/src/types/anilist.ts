// AniList API Type Definitions

export interface AniListAnime {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    extraLarge?: string;
    large?: string;
    medium?: string;
    color?: string;
  };
  bannerImage?: string;
  description?: string;
  format?: string;
  episodes?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
  popularity?: number;
  favourites?: number;
  genres?: string[];
  studios?: {
    nodes: Array<{
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }>;
  };
  isAdult?: boolean;
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
  airingSchedule?: {
    nodes: Array<{
      id: number;
      airingAt: number;
      episode: number;
    }>;
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  source?: string;
  countryOfOrigin?: string;
  duration?: number;
}

export interface AniListScheduleEntry {
  id: number;
  airingAt: number;
  episode: number;
  media: AniListAnime;
  dayOfWeek?: string;
}

export interface AniListResponse<T> {
  data: T;
}

export interface AniListPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AniListMediaPage {
  Page: {
    pageInfo: AniListPageInfo;
    media: AniListAnime[];
  };
}

export interface AniListSchedulePage {
  Page: {
    pageInfo: AniListPageInfo;
    airingSchedules: AniListScheduleEntry[];
  };
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface CachedData<T> {
  data: T;
  timestamp: number;
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

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'auto';
  defaultView?: 'schedule' | 'browse' | 'top';
  enableAnimations?: boolean;
  compactMode?: boolean;
  showAdultContent?: boolean;
}
