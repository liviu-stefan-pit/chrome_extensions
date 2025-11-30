import { aniListAPI } from '../services/anilist';
import { qs } from '../utils/dom';
import { renderAnimeCard } from './AnimeCard';

let currentPage = 1;
let isLoading = false;
let hasMore = true;
let scrollContainer: HTMLElement | null = null;

export async function initBrowseView() {
  const container = qs('#browse-content');
  if (!container) return;

  // Reset state
  currentPage = 1;
  isLoading = false;
  hasMore = true;

  // Get scroll container
  scrollContainer = container.closest('.overflow-y-auto');

  // Show loading skeletons
  container.innerHTML = Array.from({ length: 24 }, () => '<div class="skeleton aspect-[2/3]"></div>').join('');

  try {
    const anime = await loadPage(1);
    // Sort by score (highest first)
    const sortedAnime = [...anime].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    container.innerHTML = sortedAnime.map((a) => renderAnimeCard(a)).join('');

    // Setup infinite scroll
    setupInfiniteScroll();
  } catch (error) {
    console.error('[BrowseView] Failed to load anime:', error);
    container.innerHTML = renderError();
  }
}

async function loadPage(page: number) {
  isLoading = true;
  const anime = await aniListAPI.getCurrentSeason(page, 30);
  isLoading = false;
  
  if (anime.length < 30) {
    hasMore = false;
  }
  
  return anime;
}

function setupInfiniteScroll() {
  if (!scrollContainer) return;

  scrollContainer.removeEventListener('scroll', handleScroll);
  scrollContainer.addEventListener('scroll', handleScroll);
}

async function handleScroll() {
  if (!scrollContainer || isLoading || !hasMore) return;

  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  // Load more when 80% scrolled
  if (scrollTop + clientHeight >= scrollHeight * 0.8) {
    currentPage++;
    isLoading = true;

    const container = qs('#browse-content');
    if (!container) return;

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'col-span-full flex justify-center py-8';
    loadingDiv.innerHTML = `
      <div class="flex items-center gap-3 text-primary-400">
        <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading more...</span>
      </div>
    `;
    container.appendChild(loadingDiv);

    try {
      const anime = await loadPage(currentPage);
      const sortedAnime = [...anime].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      
      // Remove loading indicator
      loadingDiv.remove();
      
      // Append new cards
      container.insertAdjacentHTML('beforeend', sortedAnime.map((a) => renderAnimeCard(a)).join(''));
    } catch (error) {
      console.error('[BrowseView] Failed to load more anime:', error);
      loadingDiv.remove();
    }
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
