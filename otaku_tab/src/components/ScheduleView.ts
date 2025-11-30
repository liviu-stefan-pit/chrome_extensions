import { aniListAPI } from '../services/anilist';
import { qs } from '../utils/dom';
import { renderAnimeCard } from './AnimeCard';
import type { AniListAnime, DayOfWeek } from '../types/anilist';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Get the current day of week in user's local timezone
function getLocalDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export async function initScheduleView() {
  const container = qs('#schedule-content');
  if (!container) return;

  // Show loading skeletons
  container.innerHTML = renderSkeletons();

  try {
    const scheduleData = await aniListAPI.getSchedule();
    
    // Get current day in local timezone
    const localDay = getLocalDayOfWeek();

    // Reorder to start from current local day
    const currentIndex = DAYS_ORDER.indexOf(localDay);
    const orderedDays = [
      ...DAYS_ORDER.slice(currentIndex),
      ...DAYS_ORDER.slice(0, currentIndex),
    ];

    container.innerHTML = orderedDays
      .map((day) => renderDaySection(day, scheduleData[day as DayOfWeek] || [], day === localDay))
      .join('');
  } catch (error) {
    console.error('[ScheduleView] Failed to load schedule:', error);
    container.innerHTML = renderError();
  }
}

function renderDaySection(day: string, anime: AniListAnime[], isToday: boolean): string {
  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
  const badge = isToday ? '<span class="ml-2 px-2 py-0.5 rounded-full bg-accent-pink text-white text-xs font-bold">Today</span>' : '';

  if (anime.length === 0) {
    return `
      <div class="space-y-3">
        <h3 class="text-lg font-bold text-dark-200 flex items-center">
          ${dayName}
          ${badge}
        </h3>
        <p class="text-dark-400 text-sm">No scheduled broadcasts</p>
      </div>
    `;
  }

  return `
    <div class="space-y-3">
      <h3 class="text-lg font-bold text-dark-200 flex items-center">
        ${dayName}
        ${badge}
        <span class="ml-auto text-sm font-normal text-dark-400">${anime.length} shows</span>
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        ${anime.map((a) => renderAnimeCard(a)).join('')}
      </div>
    </div>
  `;
}

function renderSkeletons(): string {
  return `
    <div class="space-y-6">
      ${Array.from({ length: 3 }, () => `
        <div class="space-y-3">
          <div class="skeleton h-7 w-32"></div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            ${Array.from({ length: 7 }, () => '<div class="skeleton aspect-[2/3]"></div>').join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderError(): string {
  return `
    <div class="flex flex-col items-center justify-center h-64 text-dark-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-lg font-semibold mb-2">Failed to load schedule</p>
      <p class="text-sm">Please try again later</p>
    </div>
  `;
}
