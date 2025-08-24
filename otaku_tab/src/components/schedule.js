import { fetchEnhancedSchedule } from '../api/anilist-only.js';
import { getCurrentDayKey } from '../utils/time.js';

const scheduleListEl = () => document.getElementById('schedule-list');
const scheduleErrorEl = () => document.getElementById('schedule-error');
const sortSelectEl = () => document.getElementById('sort-select');

// Store the original data for re-sorting
let scheduleData = [];

function renderSkeleton(count = 6) {
  const list = scheduleListEl();
  list.classList.add('skeleton-grid');
  list.innerHTML = Array.from({ length: count }).map(()=>'<div class="skeleton skeleton-item"></div>').join('');
}

function clearSkeleton() {
  const list = scheduleListEl();
  list.classList.remove('skeleton-grid');
}

function formatTimeOriginal(anime) {
  const time = anime?.broadcast?.time || '';
  const tz = anime?.broadcast?.timezone || '';
  return { time, tz };
}

// Simple timezone conversion using the actual airing timestamp from AniList
function formatLocalTime(anime) {
  try {
    // AniList provides proper UTC timestamps - use them directly!
    if (anime?.airingAt) {
      const airingDate = new Date(anime.airingAt * 1000); // Convert from Unix timestamp
      const localTime = airingDate.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      console.log(`[OtakuTab] ${anime.title}: AniList timestamp ${anime.airingAt} -> UTC: ${airingDate.toISOString()} -> Your time: ${localTime}`);
      return localTime;
    }
    
    // Fallback if no timestamp available
    const time = anime?.broadcast?.time || '';
    if (!time) return null;
    
    console.log(`[OtakuTab] ${anime.title}: Using fallback time string: ${time}`);
    return time;
  } catch (error) {
    console.warn('[OtakuTab] Error formatting local time for', anime?.title, error);
    return anime?.broadcast?.time || null;
  }
}

function sortItems(items, sortBy) {
  const sorted = items.slice();
  
  // Parse sort direction from the value
  const [criteria, direction] = sortBy.split('_');
  const isAsc = direction === 'asc';
  
  switch (criteria) {
    case 'score':
      return sorted.sort((a, b) => {
        const as = a?.score ?? -1; 
        const bs = b?.score ?? -1;
        if (as === -1 && bs === -1) return 0;
        const result = bs - as; // Natural order: highest first
        return isAsc ? -result : result;
      });
      
    case 'title':
      return sorted.sort((a, b) => {
        const titleA = (a?.title || '').toLowerCase();
        const titleB = (b?.title || '').toLowerCase();
        const result = titleA.localeCompare(titleB);
        return isAsc ? result : -result;
      });
      
    case 'time':
      return sorted.sort((a, b) => {
        const timeA = a?.broadcast?.time || '';
        const timeB = b?.broadcast?.time || '';
        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;
        const result = timeA.localeCompare(timeB);
        return isAsc ? result : -result;
      });
      
    case 'episodes':
      return sorted.sort((a, b) => {
        const epsA = a?.episodes ?? 0;
        const epsB = b?.episodes ?? 0;
        const result = epsB - epsA; // Natural order: most first
        return isAsc ? -result : result;
      });
      
    default:
      return sorted;
  }
}

function renderSchedule(items) {
  const list = scheduleListEl();
  list.innerHTML = items.map(item => {
    const img = item?.images?.jpg?.image_url || item?.images?.webp?.image_url || '';
    const title = item?.title || 'Untitled';
    const local = formatLocalTime(item);
    const metaTime = local || item?.broadcast?.time || 'Unknown';
    const url = item?.url || '#';
    const score = item?.score != null ? item.score.toFixed(1) : null;
    const episodes = item?.episodes;
    
    return `<a class="otk-card group" href="${url}" target="_blank" rel="noopener noreferrer" role="listitem">
      <img src="${img}" alt="${escapeHtml(title)} poster">
      <div class="flex flex-col gap-1 min-w-0">
        <h3 class="otk-card-title text-base">${escapeHtml(title)}</h3>
        <div class="otk-card-meta">
          <span class="otk-badge-outline" title="Broadcast time in your PC's timezone">${escapeHtml(metaTime)}</span>
          ${score ? `<span class=\"otk-badge-accent\" title=\"Score\">★ ${score}</span>` : ''}
          ${episodes ? `<span class=\"otk-badge-outline\" title=\"Episodes\">${episodes} eps</span>` : ''}
        </div>
      </div>
    </a>`;
  }).join('');
}

function handleSortChange() {
  const sortBy = sortSelectEl()?.value || 'score_desc';
  const sortedItems = sortItems(scheduleData, sortBy);
  renderSchedule(sortedItems);
}

function showError(message) {
  const el = scheduleErrorEl();
  el.textContent = message;
  el.classList.remove('hidden');
}

function escapeHtml(str='') { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

export async function initSchedule() {
  try {
    renderSkeleton();
    const dayKey = getCurrentDayKey();
    const data = await fetchEnhancedSchedule(dayKey);
    scheduleData = Array.isArray(data) ? data : [];
    
    clearSkeleton();
    if (!scheduleData.length) {
      scheduleListEl().innerHTML = '<div class="text-xs text-cyber-300">No airing anime found for today.</div>';
      return;
    }
    
    // Set up sort handler
    const sortSelect = sortSelectEl();
    if (sortSelect) {
      sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Initial render with default sort (score descending)
    handleSortChange();
    
  } catch (e) {
    clearSkeleton();
    showError('Failed to load schedule. Please refresh.');
    console.error('[OtakuTab] schedule error', e);
  }
}
