// AniList-only API module for consistent timezone handling
// Uses AniList's UTC timestamps to avoid timezone conversion issues

// Remove Jikan import - using AniList only
// import { fetchScheduleForDay as jikanSchedule, fetchTopAiring, searchAnime, fetchRandomAnime } from './jikan.js';

const ANILIST_API = 'https://graphql.anilist.co';

// Get today's boundaries in user's local timezone using proper Chrome extension timezone handling
function getTodayBoundaries() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  console.log(`[OtakuTab] Today boundaries in your timezone:`);
  console.log(`[OtakuTab] Start: ${startOfDay.toLocaleString()} (${Math.floor(startOfDay.getTime() / 1000)})`);
  console.log(`[OtakuTab] End: ${endOfDay.toLocaleString()} (${Math.floor(endOfDay.getTime() / 1000)})`);
  
  return {
    startOfDay,
    endOfDay,
    startTimestamp: Math.floor(startOfDay.getTime() / 1000),
    endTimestamp: Math.floor(endOfDay.getTime() / 1000),
    todayDateString: now.toDateString()
  };
}

// Filter Jikan data to only show anime airing today in user's timezone using simplified conversion
function filterJikanDataForToday(jikanData) {
  const now = new Date();
  const userToday = now.toDateString();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  console.log(`[OtakuTab] Filtering for user's today: ${userToday} in timezone: ${userTimezone}`);
  
  return jikanData.filter(item => {
    if (!item?.broadcast?.time || !item?.broadcast?.timezone) {
      return false;
    }
    
    try {
      const { time } = item.broadcast; // Ignore timezone, assume JST
      const [hours, minutes] = time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return false;
      }
      
      // Convert JST broadcast time to user's timezone
      const localTime = convertTimezoneToUserTZ(time);
      
      // Check if this falls on user's today
      const isToday = localTime.toDateString() === userToday;
      
      console.log(`[OtakuTab] ${item.title}: ${time} JST -> ${localTime.toLocaleString()} local (today: ${isToday})`);
      
      return isToday;
    } catch (error) {
      console.warn('[OtakuTab] Error filtering item:', item.title, error);
      return false;
    }
  });
}

// Convert a JST time to user's local timezone - simplified approach like professional anime sites
function convertTimezoneToUserTZ(broadcastTime, broadcastTimezone = 'Asia/Tokyo') {
  try {
    // Extract hours and minutes from broadcast time (format: "HH:MM")
    const [hours, minutes] = broadcastTime.split(':').map(Number);
    
    // Create a date object for today in JST
    const now = new Date();
    const todayJST = new Date(now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }));
    
    // Set the JST broadcast time
    const jstTime = new Date(todayJST);
    jstTime.setHours(hours, minutes, 0, 0);
    
    // Convert JST time to user's local timezone
    // This is the key: create a Date in JST and let JavaScript handle the conversion
    const jstString = jstTime.toLocaleDateString('sv-SE') + 'T' + 
                     jstTime.toTimeString().substring(0, 8);
    const jstDate = new Date(jstString + '+09:00'); // JST is UTC+9
    
    console.log(`[OtakuTab] Converting ${broadcastTime} JST to local: ${jstDate.toLocaleString()}`);
    
    return jstDate;
  } catch (error) {
    console.warn('[OtakuTab] Timezone conversion error:', error);
    // Fallback: return current time with broadcast time
    const [hours, minutes] = broadcastTime.split(':').map(Number);
    const fallbackDate = new Date();
    fallbackDate.setHours(hours, minutes, 0, 0);
    return fallbackDate;
  }
}

// Enhanced schedule fetching with multiple sources
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
              romaji
              english
            }
            coverImage {
              large
              medium
            }
            meanScore
            episodes
            siteUrl
            status
            format
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

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { startDate: startTimestamp, endDate: endTimestamp }
      })
    });

    if (!response.ok) throw new Error(`AniList API error: ${response.status}`);
    
    const result = await response.json();
    return result?.data?.Page?.airingSchedules || [];
  } catch (error) {
    console.warn('[OtakuTab] AniList API failed:', error);
    return [];
  }
}

// Convert AniList format to consistent format - no timezone conversion needed
// AniList already provides proper UTC timestamps
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
      score: media.meanScore ? media.meanScore / 10 : null, // Convert 0-100 to 0-10
      episodes: media.episodes,
      url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
      status: media.status,
      broadcast: {
        time: airingTime.toTimeString().slice(0, 5), // HH:MM format in local time
        timezone: 'Local', // Already converted by browser
        day: airingTime.toLocaleDateString('en-US', { weekday: 'long' })
      },
      genres: media.genres || [],
      studios: media.studios?.nodes?.map(s => s.name) || [],
      source: 'anilist',
      airingAt: item.airingAt // Keep original timestamp for accurate time display
    };
  });
}

// Normalize titles for better duplicate detection
function normalizeTitleForComparison(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b(the|a|an)\b/g, '') // Remove articles
    .replace(/\b(season|s)\s*\d+/g, '') // Remove season numbers
    .replace(/\b(part|pt)\s*\d+/g, '') // Remove part numbers
    .replace(/\b(ova|ona|special|movie|tv|web)\b/g, '') // Remove format indicators
    .trim();
}

// Extract multiple title variations for comparison
function getTitleVariations(item) {
  const titles = new Set();
  
  if (item.title) titles.add(normalizeTitleForComparison(item.title));
  if (item.title_english) titles.add(normalizeTitleForComparison(item.title_english));
  if (item.title_japanese) titles.add(normalizeTitleForComparison(item.title_japanese));
  if (item.titles) {
    item.titles.forEach(titleObj => {
      if (titleObj.title) titles.add(normalizeTitleForComparison(titleObj.title));
    });
  }
  
  return Array.from(titles).filter(t => t.length > 2); // Filter out very short titles
}

// Merge and deduplicate data from multiple sources with improved duplicate detection
function mergeScheduleData(jikanData, anilistData) {
  // Filter Jikan data to only include today's anime in user's timezone
  const todayJikanData = filterJikanDataForToday(jikanData || []);
  
  console.log(`[OtakuTab] Jikan items after today filtering: ${todayJikanData.length} (from ${jikanData?.length || 0})`);
  
  const merged = [...todayJikanData];
  
  // Create a set of all title variations from Jikan data for better duplicate detection
  const jikanTitleVariations = new Set();
  todayJikanData.forEach(item => {
    getTitleVariations(item).forEach(title => jikanTitleVariations.add(title));
  });
  
  console.log(`[OtakuTab] Jikan title variations for duplicate check: ${jikanTitleVariations.size}`);

  // Add AniList items that aren't already in Jikan data (AniList is already filtered for today)
  let duplicatesFound = 0;
  anilistData?.forEach(item => {
    const itemTitleVariations = getTitleVariations(item);
    const isDuplicate = itemTitleVariations.some(title => jikanTitleVariations.has(title));
    
    if (!isDuplicate) {
      merged.push(item);
      // Add this item's titles to prevent duplicates within AniList data too
      itemTitleVariations.forEach(title => jikanTitleVariations.add(title));
    } else {
      duplicatesFound++;
      console.log(`[OtakuTab] Skipping duplicate: ${item.title} (matches existing title)`);
    }
  });
  
  console.log(`[OtakuTab] Removed ${duplicatesFound} duplicates from AniList data`);

  // Sort by airing time (earliest first), then by score
  return merged.sort((a, b) => {
    // Try to get actual airing timestamps for proper sorting
    const timeA = getAiringTimestamp(a);
    const timeB = getAiringTimestamp(b);
    
    if (timeA && timeB) {
      return timeA - timeB; // Earlier shows first
    }
    
    // Fallback to score sorting if timestamps unavailable
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    return scoreB - scoreA;
  });
}

// Helper function to get airing timestamp for sorting
function getAiringTimestamp(item) {
  // AniList items have direct timestamp
  if (item.airingAt) {
    return item.airingAt * 1000; // Convert to milliseconds
  }
  
  // For Jikan items, try to construct timestamp from broadcast info
  if (item?.broadcast?.time) {
    try {
      const [hours, minutes] = item.broadcast.time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const today = new Date();
        const timestamp = new Date(today);
        timestamp.setHours(hours, minutes, 0, 0);
        return timestamp.getTime();
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }
  
  return null;
}

// Enhanced schedule fetching with multiple sources and strict today-only filtering
export async function fetchEnhancedSchedule(dayKey) {
  try {
    console.log('[OtakuTab] Fetching schedule from AniList only (no timezone conversion needed)...');
    
    // Fetch only from AniList - it provides proper UTC timestamps
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
