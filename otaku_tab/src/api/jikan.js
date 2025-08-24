// Centralized Jikan API module with caching via chrome.storage.local
// Provides: fetchTopAiring, fetchScheduleForDay, searchAnime, fetchRandomAnime

const API_BASE = 'https://api.jikan.moe/v4';
const SIX_HOURS = 1000 * 60 * 60 * 6;

// Generic storage wrapper
async function getCache(key) {
  return new Promise(resolve => {
    if (!chrome?.storage?.local) return resolve(null);
    chrome.storage.local.get([key], result => {
      resolve(result[key] || null);
    });
  });
}
async function setCache(key, value) {
  return new Promise(resolve => {
    if (!chrome?.storage?.local) return resolve();
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

async function maybeCached(key, maxAgeMs, fetcher) {
  try {
    const cached = await getCache(key);
    if (cached && (Date.now() - cached.timestamp) < maxAgeMs) {
      return cached.data;
    }
  } catch (e) {
    console.warn('[OtakuTab] cache read failed', key, e);
  }
  const data = await fetcher();
  try {
    await setCache(key, { data, timestamp: Date.now() });
  } catch (e) {
    console.warn('[OtakuTab] cache write failed', key, e);
  }
  return data;
}

async function safeFetch(url) {
  console.log('[OtakuTab] Fetching:', url);
  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json' },
      method: 'GET'
    });
    console.log('[OtakuTab] Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const error = `Request failed ${res.status} ${res.statusText}: ${text.slice(0,120)}`;
      console.error('[OtakuTab] Request failed:', error);
      throw new Error(error);
    }
    
    const json = await res.json();
    console.log('[OtakuTab] Response data received:', json?.data ? 'Yes' : 'No');
    return json?.data;
  } catch (error) {
    console.error('[OtakuTab] Fetch error:', error);
    throw error;
  }
}

export async function fetchTopAiring() {
  return maybeCached('top_airing', SIX_HOURS, async () => {
    return safeFetch(`${API_BASE}/top/anime?filter=airing&limit=25`);
  });
}

export async function fetchCurrentSeason() {
  // Get current season automatically based on date
  return maybeCached('current_season', SIX_HOURS, async () => {
    // Jikan automatically returns current season when no year/season specified
    return safeFetch(`${API_BASE}/seasons/now?limit=25&filter=tv&order_by=score&sort=desc`);
  });
}

export async function fetchScheduleForDay(dayKey) {
  return maybeCached(`schedule_${dayKey}`, SIX_HOURS, async () => {
    return safeFetch(`${API_BASE}/schedules/${dayKey}`);
  });
}

export async function searchAnime(query) {
  const url = `${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=5`;
  return safeFetch(url);
}

export async function fetchRandomAnime() {
  const url = `${API_BASE}/random/anime`;
  return safeFetch(url);
}
