import type { JikanAnime, JikanScheduleEntry, DayOfWeek, CachedData } from '../types/jikan';

const API_BASE = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

interface FetchOptions {
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
}

class JikanAPIService {
  private async getFromCache<T>(key: string): Promise<CachedData<T> | null> {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    } catch (error) {
      console.error('[JikanAPI] Cache read error:', error);
      return null;
    }
  }

  private async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };
      await chrome.storage.local.set({ [key]: cached });
    } catch (error) {
      console.error('[JikanAPI] Cache write error:', error);
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { retries = 3, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        return json.data || json;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[JikanAPI] Attempt ${i + 1}/${retries} failed:`, error);

        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to fetch data');
  }

  private async fetchWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    options: FetchOptions = {}
  ): Promise<T> {
    const { cache = true } = options;

    if (cache) {
      const cached = await this.getFromCache<T>(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[JikanAPI] Cache hit: ${cacheKey}`);
        return cached.data;
      }
    }

    console.log(`[JikanAPI] Fetching: ${cacheKey}`);
    const data = await fetcher();

    if (cache) {
      await this.saveToCache(cacheKey, data);
    }

    return data;
  }

  async getTopAiring(limit: number = 25): Promise<JikanAnime[]> {
    return this.fetchWithCache(
      'top_airing',
      () => this.fetchWithRetry<JikanAnime[]>(
        `${API_BASE}/top/anime?filter=airing&limit=${limit}`
      )
    );
  }

  async getCurrentSeason(limit: number = 25): Promise<JikanAnime[]> {
    return this.fetchWithCache(
      'current_season',
      () => this.fetchWithRetry<JikanAnime[]>(
        `${API_BASE}/seasons/now?limit=${limit}&filter=tv&order_by=score&sort=desc`
      )
    );
  }

  async getScheduleForDay(day: DayOfWeek): Promise<JikanScheduleEntry[]> {
    return this.fetchWithCache(
      `schedule_${day}`,
      () => this.fetchWithRetry<JikanScheduleEntry[]>(
        `${API_BASE}/schedules?filter=${day}&limit=25`
      )
    );
  }

  async getFullSchedule(): Promise<Record<DayOfWeek, JikanScheduleEntry[]>> {
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const scheduleData: Record<string, JikanScheduleEntry[]> = {};

    await Promise.all(
      days.map(async (day) => {
        try {
          scheduleData[day] = await this.getScheduleForDay(day);
        } catch (error) {
          console.error(`[JikanAPI] Failed to fetch ${day}:`, error);
          scheduleData[day] = [];
        }
      })
    );

    return scheduleData as Record<DayOfWeek, JikanScheduleEntry[]>;
  }

  async searchAnime(query: string, limit: number = 10): Promise<JikanAnime[]> {
    if (!query.trim()) {
      return [];
    }

    return this.fetchWithRetry<JikanAnime[]>(
      `${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=popularity&sort=asc`,
      { cache: false }
    );
  }

  async getAnimeById(id: number): Promise<JikanAnime> {
    return this.fetchWithCache(
      `anime_${id}`,
      () => this.fetchWithRetry<JikanAnime>(`${API_BASE}/anime/${id}/full`)
    );
  }

  async getRandomAnime(): Promise<JikanAnime> {
    return this.fetchWithRetry<JikanAnime>(
      `${API_BASE}/random/anime`,
      { cache: false }
    );
  }

  async clearCache(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('[JikanAPI] Cache cleared');
    } catch (error) {
      console.error('[JikanAPI] Failed to clear cache:', error);
    }
  }
}

export const jikanAPI = new JikanAPIService();
