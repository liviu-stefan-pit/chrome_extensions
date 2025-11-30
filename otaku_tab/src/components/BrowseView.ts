import { jikanAPI } from '../services/jikan';
import { qs } from '../utils/dom';
import { renderAnimeCard } from './AnimeCard';

export async function initBrowseView() {
  const container = qs('#browse-content');
  if (!container) return;

  // Show loading skeletons
  container.innerHTML = Array.from({ length: 24 }, () => '<div class="skeleton aspect-[2/3]"></div>').join('');

  try {
    const anime = await jikanAPI.getCurrentSeason();
    container.innerHTML = anime.map((a) => renderAnimeCard(a)).join('');
  } catch (error) {
    console.error('[BrowseView] Failed to load anime:', error);
    container.innerHTML = renderError();
  }
}

function renderError(): string {
  return `
    <div class="col-span-full flex flex-col items-center justify-center h-64 text-dark-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-lg font-semibold mb-2">Failed to load anime</p>
      <p class="text-sm">Please try again later</p>
    </div>
  `;
}
