// AniList-only API module for consistent timezone handling
// Uses AniList's UTC timestamps to avoid timezone conversion issues

const ANILIST_API = 'https://graphql.anilist.co';

// Generic AniList POST helper
async function anilistQuery(query, variables) {
  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error('AniList GraphQL ' + JSON.stringify(json.errors));
  return json.data;
}

// Get today's boundaries in user's local timezone
function getTodayBoundaries() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  console.log(`[OtakuTab] Today boundaries in your timezone:`);
  console.log(`[OtakuTab] Start: ${startOfDay.toLocaleString()} (${Math.floor(startOfDay.getTime() / 1000)})`);
  console.log(`[OtakuTab] End: ${endOfDay.toLocaleString()} (${Math.floor(endOfDay.getTime() / 1000)})`);
  
  return {
    startTimestamp: Math.floor(startOfDay.getTime() / 1000),
    endTimestamp: Math.floor(endOfDay.getTime() / 1000)
  };
}

// Fetch today's schedule from AniList
async function fetchAniListSchedule() {
  const { startTimestamp, endTimestamp } = getTodayBoundaries();

  const query = `
    query ($startDate: Int, $endDate: Int) {
      Page(page: 1, perPage: 50) {
        airingSchedules(airingAt_greater: $startDate, airingAt_lesser: $endDate, sort: TIME) {
          airingAt
          episode
          media {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
              medium
            }
            meanScore
            episodes
            siteUrl
            status
            genres
            studios {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    startDate: startTimestamp,
    endDate: endTimestamp
  };

  console.log(`[OtakuTab] Querying AniList for today: ${startTimestamp} to ${endTimestamp}`);

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`AniList GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const schedules = data?.data?.Page?.airingSchedules || [];
    console.log(`[OtakuTab] AniList returned ${schedules.length} airing schedules for today`);
    
    return schedules;
  } catch (error) {
    console.error('[OtakuTab] AniList API error:', error);
    throw error;
  }
}

// Convert AniList format to consistent format - no timezone conversion needed
function normalizeAniListData(anilistItems) {
  return anilistItems.map(item => {
    const media = item.media;
    const airingTime = new Date(item.airingAt * 1000); // Convert Unix timestamp to Date
    
    console.log(`[OtakuTab] ${media.title?.english || media.title?.romaji}: AniList timestamp ${item.airingAt} -> ${airingTime.toISOString()} -> Local: ${airingTime.toLocaleString()}`);
    
    return {
      mal_id: media.id,
      title: media.title?.english || media.title?.romaji || 'Unknown Title',
      images: {
        jpg: {
          image_url: media.coverImage?.large || media.coverImage?.medium || ''
        }
      },
      score: media.meanScore ? media.meanScore / 10 : null,
      episodes: media.episodes,
      url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
      status: media.status,
      broadcast: {
        time: airingTime.toTimeString().slice(0, 5), // Local time
        timezone: 'Local',
        day: airingTime.toLocaleDateString('en-US', { weekday: 'long' })
      },
      genres: media.genres || [],
      studios: media.studios?.nodes?.map(s => s.name) || [],
      source: 'anilist',
      airingAt: item.airingAt, // Keep original timestamp for accurate time display
      episode: item.episode // Episode number
    };
  });
}

// Main export function - AniList only
export async function fetchEnhancedSchedule(dayKey) {
  try {
    console.log('[OtakuTab] Fetching schedule from AniList only (proper UTC timestamps)...');
    
    const anilistSchedule = await fetchAniListSchedule();
    
    if (anilistSchedule && anilistSchedule.length > 0) {
      const results = normalizeAniListData(anilistSchedule);
      console.log(`[OtakuTab] AniList returned ${results.length} items for today`);
      return results;
    } else {
      console.warn('[OtakuTab] No AniList schedule data available');
      return [];
    }
  } catch (error) {
    console.error('[OtakuTab] AniList schedule fetch failed:', error);
    return [];
  }
}

// Import Jikan functions for other features (search, random, etc.)
import { fetchTopAiring, searchAnime, fetchRandomAnime } from './jikan.js';
export { fetchTopAiring, searchAnime, fetchRandomAnime };

// ---- New: Homepage rows (Trending Now / Popular This Season) ----

// Returns trending anime (AniList trending sort) limited
export async function fetchTrendingNow(limit = 12) {
  const query = `query ($perPage:Int){ Page(page:1, perPage:$perPage){ media(sort:TRENDING_DESC, type:ANIME, status_not_in:[NOT_YET_RELEASED], averageScore_greater:40){ id title{romaji english} coverImage{large medium} meanScore episodes siteUrl season seasonYear } } }`;
  const data = await anilistQuery(query, { perPage: limit });
  return (data?.Page?.media||[]).map(m => ({
    id: m.id,
    title: m.title?.english || m.title?.romaji || 'Untitled',
    image: m.coverImage?.large || m.coverImage?.medium || '',
    score: m.meanScore ? (m.meanScore/10) : null,
    episodes: m.episodes,
    url: m.siteUrl,
    season: m.season,
    seasonYear: m.seasonYear,
    source: 'anilist'
  }));
}

// Returns popular for current season
export async function fetchPopularSeason(limit = 12) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const season = month < 3 ? 'WINTER' : month < 6 ? 'SPRING' : month < 9 ? 'SUMMER' : 'FALL';
  const query = `query ($perPage:Int,$season:MediaSeason,$year:Int){ Page(page:1, perPage:$perPage){ media(season:$season, seasonYear:$year, sort:POPULARITY_DESC, type:ANIME){ id title{romaji english} coverImage{large medium} meanScore episodes siteUrl season seasonYear } } }`;
  const data = await anilistQuery(query, { perPage: limit, season, year });
  return (data?.Page?.media||[]).map(m => ({
    id: m.id,
    title: m.title?.english || m.title?.romaji || 'Untitled',
    image: m.coverImage?.large || m.coverImage?.medium || '',
    score: m.meanScore ? (m.meanScore/10) : null,
    episodes: m.episodes,
    url: m.siteUrl,
    season: m.season,
    seasonYear: m.seasonYear,
    source: 'anilist'
  }));
}

