import type { 
  AniListAnime, 
  AniListResponse, 
  AniListMediaPage,
  AniListSchedulePage,
  DayOfWeek, 
  CachedData 
} from '../types/anilist';
import { preferencesService } from './preferences';

const API_BASE = 'https://graphql.anilist.co';
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

interface FetchOptions {
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
}

class AniListAPIService {
  private async getFromCache<T>(key: string): Promise<CachedData<T> | null> {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    } catch (error) {
      console.error('[AniList] Cache read error:', error);
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
      console.error('[AniList] Cache write error:', error);
    }
  }

  private async fetchGraphQL<T>(
    query: string,
    variables: Record<string, any> = {},
    options: FetchOptions = {}
  ): Promise<T> {
    const { retries = 3, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json: AniListResponse<T> = await response.json();
        
        if ('errors' in json) {
          throw new Error(`GraphQL Error: ${JSON.stringify(json)}`);
        }

        return json.data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[AniList] Attempt ${i + 1}/${retries} failed:`, error);

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
        console.log(`[AniList] Cache hit: ${cacheKey}`);
        return cached.data;
      }
    }

    console.log(`[AniList] Fetching: ${cacheKey}`);
    const data = await fetcher();

    if (cache) {
      await this.saveToCache(cacheKey, data);
    }

    return data;
  }

  private async shouldShowAdult(): Promise<boolean> {
    const prefs = await preferencesService.getPreferences();
    return prefs.showAdultContent ?? false;
  }

  async getTopAiring(limit: number = 30): Promise<AniListAnime[]> {
    const prefs = await preferencesService.getPreferences();
    const showAdult = prefs.showAdultContent ?? false;
    const adultOnly = prefs.adultContentOnly ?? false;
    
    // Determine isAdult filter based on preferences
    // adultOnly=true, showAdult=true: isAdult=true (only adult)
    // adultOnly=false, showAdult=true: isAdult=null (mixed - omit parameter)
    // adultOnly=false, showAdult=false: isAdult=false (safe only)
    let isAdultFilter: boolean | null = null;
    if (adultOnly) {
      isAdultFilter = true;
    } else if (!showAdult) {
      isAdultFilter = false;
    }
    
    return this.fetchWithCache(
      `top_alltime_${adultOnly ? 'adult_only' : showAdult ? 'with_adult' : 'safe'}`,
      async () => {
        const query = `
          query ($page: Int, $perPage: Int, $isAdult: Boolean) {
            Page(page: $page, perPage: $perPage) {
              media(type: ANIME, sort: SCORE_DESC, isAdult: $isAdult) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                  large
                  medium
                  color
                }
                bannerImage
                description
                format
                episodes
                status
                season
                seasonYear
                averageScore
                popularity
                favourites
                genres
                tags {
                  name
                  rank
                }
                studios {
                  nodes {
                    id
                    name
                    isAnimationStudio
                  }
                }
                isAdult
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
                trailer {
                  id
                  site
                  thumbnail
                }
              }
            }
          }
        `;

        console.log('[AniList] Fetching top all-time, adultOnly:', adultOnly, 'showAdult:', showAdult, 'isAdult filter:', isAdultFilter);

        const variables: any = {
          page: 1,
          perPage: limit,
        };
        
        // Only add isAdult if we want to filter (null means show all/mixed)
        if (isAdultFilter !== null) {
          variables.isAdult = isAdultFilter;
        }

        const data = await this.fetchGraphQL<AniListMediaPage>(query, variables);

        console.log('[AniList] Top all-time received:', data.Page.media.length, 'anime');
        return data.Page.media;
      }
    );
  }

  async getCurrentSeason(limit: number = 30): Promise<AniListAnime[]> {
    const prefs = await preferencesService.getPreferences();
    const showAdult = prefs.showAdultContent ?? false;
    const adultOnly = prefs.adultContentOnly ?? false;
    
    // Determine isAdult filter based on preferences
    let isAdultFilter: boolean | null = null;
    if (adultOnly) {
      isAdultFilter = true;
    } else if (!showAdult) {
      isAdultFilter = false;
    }
    
    return this.fetchWithCache(
      `current_season_top_${adultOnly ? 'adult_only' : showAdult ? 'with_adult' : 'safe'}`,
      async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        let season: string;
        if (month >= 1 && month <= 3) season = 'WINTER';
        else if (month >= 4 && month <= 6) season = 'SPRING';
        else if (month >= 7 && month <= 9) season = 'SUMMER';
        else season = 'FALL';

        const query = `
          query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int, $isAdult: Boolean) {
            Page(page: $page, perPage: $perPage) {
              media(season: $season, seasonYear: $year, type: ANIME, sort: SCORE_DESC, isAdult: $isAdult) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                  large
                  medium
                  color
                }
                bannerImage
                description
                format
                episodes
                status
                season
                seasonYear
                averageScore
                popularity
                favourites
                genres
                tags {
                  name
                  rank
                }
                studios {
                  nodes {
                    id
                    name
                    isAnimationStudio
                  }
                }
                isAdult
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
                trailer {
                  id
                  site
                  thumbnail
                }
              }
            }
          }
        `;

        console.log('[AniList] Fetching current season:', season, year, 'adultOnly:', adultOnly, 'showAdult:', showAdult, 'isAdult filter:', isAdultFilter);

        const variables: any = {
          season,
          year,
          page: 1,
          perPage: limit,
        };
        
        // Only add isAdult if we want to filter (null means show all/mixed)
        if (isAdultFilter !== null) {
          variables.isAdult = isAdultFilter;
        }

        const data = await this.fetchGraphQL<AniListMediaPage>(query, variables);

        console.log('[AniList] Current season received:', data.Page.media.length, 'anime');
        return data.Page.media;
      }
    );
  }

  async getSchedule(): Promise<Record<DayOfWeek, AniListAnime[]>> {
    const prefs = await preferencesService.getPreferences();
    const showAdult = prefs.showAdultContent ?? false;
    const adultOnly = prefs.adultContentOnly ?? false;
    
    return this.fetchWithCache(
      `schedule_${adultOnly ? 'adult_only' : showAdult ? 'with_adult' : 'safe'}`,
      async () => {
        // Query each day separately for better results
        const schedule: Record<DayOfWeek, AniListAnime[]> = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        };

        const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const now = new Date();

        // Get schedules for each day of the week
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + dayOffset);
          targetDate.setHours(0, 0, 0, 0);
          
          const startOfDay = Math.floor(targetDate.getTime() / 1000);
          const endOfDay = startOfDay + (24 * 60 * 60) - 1;
          
          const dayOfWeek = days[targetDate.getDay()];

          const query = `
            query ($startDate: Int, $endDate: Int, $page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
                pageInfo {
                  total
                  currentPage
                  lastPage
                  hasNextPage
                  perPage
                }
                airingSchedules(airingAt_greater: $startDate, airingAt_lesser: $endDate, sort: TIME) {
                  id
                  airingAt
                  episode
                  media {
                    id
                    idMal
                    title {
                      romaji
                      english
                      native
                    }
                    coverImage {
                      extraLarge
                      large
                      medium
                      color
                    }
                    bannerImage
                    description
                    format
                    episodes
                    status
                    season
                    seasonYear
                    averageScore
                    popularity
                    favourites
                    genres
                    studios {
                      nodes {
                        id
                        name
                        isAnimationStudio
                      }
                    }
                    isAdult
                    nextAiringEpisode {
                      episode
                      airingAt
                      timeUntilAiring
                    }
                    trailer {
                      id
                      site
                      thumbnail
                    }
                  }
                }
              }
            }
          `;

          try {
            // Fetch all pages for this day
            let currentPage = 1;
            let hasNextPage = true;
            let daySchedules: any[] = [];

            while (hasNextPage) {
              const data = await this.fetchGraphQL<AniListSchedulePage>(query, {
                startDate: startOfDay,
                endDate: endOfDay,
                page: currentPage,
                perPage: 50,
              });

              daySchedules = daySchedules.concat(data.Page.airingSchedules);
              hasNextPage = data.Page.pageInfo.hasNextPage;
              currentPage++;

              if (hasNextPage) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            console.log(`[AniList] ${dayOfWeek} (${targetDate.toDateString()}): ${daySchedules.length} schedules`);

            // Process schedules for this day
            daySchedules.forEach((scheduleEntry) => {
              if (!scheduleEntry.media) return;
              
              // Filter based on adult content preferences
              if (adultOnly && !scheduleEntry.media.isAdult) return;
              if (!showAdult && scheduleEntry.media.isAdult) return;

              const animeWithAiring: AniListAnime = {
                ...scheduleEntry.media,
                nextAiringEpisode: {
                  episode: scheduleEntry.episode,
                  airingAt: scheduleEntry.airingAt,
                  timeUntilAiring: scheduleEntry.airingAt - Math.floor(Date.now() / 1000),
                },
              };

              schedule[dayOfWeek].push(animeWithAiring);
            });

          } catch (error) {
            console.error(`[AniList] Error fetching schedule for ${dayOfWeek}:`, error);
          }

          // Small delay between days
          if (dayOffset < 6) {
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }

        // Log final counts
        Object.keys(schedule).forEach(day => {
          console.log(`[AniList] Final ${day}: ${schedule[day as DayOfWeek].length} anime`);
        });

        return schedule;
      }
    );
  }

  async searchAnime(query: string, limit: number = 15): Promise<AniListAnime[]> {
    if (!query.trim()) {
      return [];
    }

    const prefs = await preferencesService.getPreferences();
    const showAdult = prefs.showAdultContent ?? false;
    const adultOnly = prefs.adultContentOnly ?? false;

    // Determine isAdult filter based on preferences
    let isAdultFilter: boolean | null = null;
    if (adultOnly) {
      isAdultFilter = true;
    } else if (!showAdult) {
      isAdultFilter = false;
    }

    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            format
            status
            averageScore
            popularity
            isAdult
            nextAiringEpisode {
              episode
              airingAt
              timeUntilAiring
            }
          }
        }
      }
    `;

    const variables: any = {
      search: query,
      page: 1,
      perPage: limit,
    };
    
    // Only add isAdult if we want to filter (null means show all/mixed)
    if (isAdultFilter !== null) {
      variables.isAdult = isAdultFilter;
    }

    const data = await this.fetchGraphQL<AniListMediaPage>(
      graphqlQuery,
      variables,
      { cache: false }
    );

    return data.Page.media;
  }

  async getAnimeById(id: number): Promise<AniListAnime> {
    return this.fetchWithCache(
      `anime_${id}`,
      async () => {
        const query = `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              idMal
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
                medium
                color
              }
              bannerImage
              description
              format
              episodes
              status
              season
              seasonYear
              averageScore
              popularity
              favourites
              genres
              studios {
                nodes {
                  id
                  name
                  isAnimationStudio
                }
              }
              isAdult
              source
              countryOfOrigin
              duration
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              nextAiringEpisode {
                episode
                airingAt
                timeUntilAiring
              }
              trailer {
                id
                site
                thumbnail
              }
            }
          }
        `;

        const data = await this.fetchGraphQL<{ Media: AniListAnime }>(query, { id });
        return data.Media;
      }
    );
  }

  async getRandomAnime(): Promise<AniListAnime> {
    const showAdult = await this.shouldShowAdult();
    
    // Get a random page between 1-50 and random result from that page
    const randomPage = Math.floor(Math.random() * 50) + 1;
    
    const query = `
      query ($page: Int, $perPage: Int, $isAdult: Boolean) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            description
            format
            episodes
            status
            season
            seasonYear
            averageScore
            popularity
            favourites
            genres
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            isAdult
            nextAiringEpisode {
              episode
              airingAt
              timeUntilAiring
            }
            trailer {
              id
              site
              thumbnail
            }
          }
        }
      }
    `;

    const data = await this.fetchGraphQL<AniListMediaPage>(
      query,
      {
        page: randomPage,
        perPage: 20,
        isAdult: showAdult,
      },
      { cache: false }
    );

    const media = data.Page.media;
    if (media.length === 0) {
      throw new Error('No anime found');
    }

    return media[Math.floor(Math.random() * media.length)];
  }

  async clearCache(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('[AniList] Cache cleared');
    } catch (error) {
      console.error('[AniList] Failed to clear cache:', error);
    }
  }
}

export const aniListAPI = new AniListAPIService();
