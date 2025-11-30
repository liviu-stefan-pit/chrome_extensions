import { aniListAPI } from '../services/anilist';
import { qs } from '../utils/dom';
import { renderAnimeCard } from './AnimeCard';

export async function initTopView() {
  const container = qs('#top-content');
  if (!container) return;

  // Show loading skeletons
  container.innerHTML = Array.from({ length: 24 }, () => '<div class="skeleton aspect-[2/3]"></div>').join('');

  try {
    const anime = await aniListAPI.getTopAiring();
    // Sort by score (highest first)
    const sortedAnime = [...anime].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    container.innerHTML = sortedAnime.map((a) => renderAnimeCard(a)).join('');
  } catch (error) {
    console.error('[TopView] Failed to load top anime:', error);
    container.innerHTML = renderError();
  }
}

function renderError(): string {
  return `
    <div class="col-span-full flex flex-col items-center justify-center h-64 text-dark-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-lg font-semibold mb-2">Failed to load top anime</p>
      <p class="text-sm">Please try again later</p>
    </div>
  `;
}
