import { aniListAPI } from '../services/anilist';
import { qs } from '../utils/dom';
import { debounce } from '../utils/timing';
import { getAnimeImage, getAnimeTitle, truncateText } from '../utils/anime';

export function initSearch() {
  const searchInput = qs<HTMLInputElement>('#search-input');
  const searchResults = qs('#search-results');

  if (!searchInput || !searchResults) return;

  const handleSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
      return;
    }

    searchResults.classList.remove('hidden');
    searchResults.innerHTML = renderSearchLoading();

    try {
      const results = await aniListAPI.searchAnime(query, 10);

      if (results.length === 0) {
        searchResults.innerHTML = renderNoResults();
        return;
      }

      searchResults.innerHTML = results.map((anime) => renderSearchResult(anime)).join('');

      // Add click handlers
      searchResults.querySelectorAll('[data-anime-id]').forEach((item) => {
        item.addEventListener('click', async () => {
          const animeId = parseInt(item.getAttribute('data-anime-id') || '0');
          if (animeId) {
            searchInput.value = '';
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            
            const { openAnimeModal } = await import('./AnimeModal');
            openAnimeModal(animeId);
          }
        });
      });
    } catch (error) {
      console.error('[Search] Search failed:', error);
      searchResults.innerHTML = renderSearchError();
    }
  }, 500);

  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    handleSearch(query);
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
      searchResults.classList.add('hidden');
    }
  });

  // Re-open search results when focusing on input with existing results
  searchInput.addEventListener('focus', () => {
    if (searchResults.children.length > 0 && searchInput.value.trim()) {
      searchResults.classList.remove('hidden');
    }
  });
}

function renderSearchResult(anime: any): string {
  const imageUrl = getAnimeImage(anime);
  const title = truncateText(getAnimeTitle(anime), 50);
  const type = anime.format || 'Unknown';
  const score = anime.averageScore ? anime.averageScore.toFixed(0) : 'N/A';

  return `
    <div class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-dark-700/60 transition-colors group" data-anime-id="${anime.id}">
      <img 
        src="${imageUrl}" 
        alt="${title}"
        class="w-12 h-16 object-cover rounded-lg flex-none"
        loading="lazy"
      />
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-dark-50 mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">${title}</h4>
        <div class="flex items-center gap-2 text-xs text-dark-400">
          <span>${type}</span>
          ${anime.averageScore ? `<span>•</span><span class="text-accent-amber">⭐ ${score}</span>` : ''}
        </div>
      </div>
      <svg class="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </div>
  `;
}

function renderSearchLoading(): string {
  return `
    <div class="flex items-center justify-center p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  `;
}

function renderNoResults(): string {
  return `
    <div class="flex flex-col items-center justify-center p-6 text-dark-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <p class="text-sm font-semibold">No results found</p>
    </div>
  `;
}

function renderSearchError(): string {
  return `
    <div class="flex flex-col items-center justify-center p-6 text-dark-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-sm font-semibold">Search failed</p>
      <p class="text-xs mt-1">Please try again</p>
    </div>
  `;
}
