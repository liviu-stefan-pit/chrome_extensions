import { favoritesService } from '../services/favorites';
import { qs } from '../utils/dom';
import { formatRelativeTime, truncateText } from '../utils/anime';

export async function initFavoritesPanel() {
  await renderFavorites();

  // Listen for favorite changes (custom events from AnimeModal)
  document.addEventListener('favorite-changed', () => {
    renderFavorites();
  });
}

export async function renderFavorites() {
  const container = qs('#favorites-content');
  const countBadge = qs('#favorites-count');
  
  if (!container) return;

  try {
    const favorites = await favoritesService.getFavorites();
    
    if (countBadge) {
      countBadge.textContent = favorites.length.toString();
    }

    if (favorites.length === 0) {
      container.innerHTML = renderEmptyState();
      return;
    }

    // Sort by added_at (most recent first)
    favorites.sort((a, b) => b.added_at - a.added_at);

    container.innerHTML = favorites.map((fav) => renderFavoriteCard(fav)).join('');

    // Add click handlers
    container.querySelectorAll('[data-anime-id]').forEach((card) => {
      const animeId = parseInt(card.getAttribute('data-anime-id') || '0');
      if (animeId) {
        card.addEventListener('click', async () => {
          const { openAnimeModal } = await import('./AnimeModal');
          openAnimeModal(animeId);
        });
      }
    });

    // Add remove handlers
    container.querySelectorAll('[data-remove-id]').forEach((btn) => {
      const animeId = parseInt(btn.getAttribute('data-remove-id') || '0');
      if (animeId) {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await favoritesService.removeFavorite(animeId);
          await renderFavorites();
          document.dispatchEvent(new CustomEvent('favorite-changed'));
        });
      }
    });
  } catch (error) {
    console.error('[FavoritesPanel] Failed to render favorites:', error);
    container.innerHTML = renderError();
  }
}

function renderFavoriteCard(fav: any): string {
  const addedAgo = formatRelativeTime(fav.added_at);
  const title = truncateText(fav.title, 40);

  return `
    <div class="group relative cursor-pointer rounded-xl overflow-hidden bg-dark-800/40 border border-white/5 hover:border-primary-500/30 transition-all hover:scale-[1.02]" data-anime-id="${fav.mal_id}">
      <div class="flex gap-3 p-3">
        <img 
          src="${fav.image_url}" 
          alt="${fav.title}"
          class="w-16 h-24 object-cover rounded-lg flex-none"
          loading="lazy"
        />
        <div class="flex-1 min-w-0 flex flex-col">
          <h4 class="text-sm font-semibold text-dark-50 mb-1 line-clamp-2">${title}</h4>
          <div class="mt-auto text-xs text-dark-400 space-y-1">
            ${fav.score ? `<div class="text-accent-amber">⭐ ${fav.score.toFixed(1)}</div>` : ''}
            ${fav.broadcast_day ? `<div>${fav.broadcast_day}${fav.broadcast_time ? ` • ${fav.broadcast_time}` : ''}</div>` : ''}
            <div class="text-dark-500">${addedAgo}</div>
          </div>
        </div>
        <button 
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-dark-900/90 hover:bg-red-500 text-dark-400 hover:text-white transition-all"
          data-remove-id="${fav.mal_id}"
          title="Remove from favorites"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="flex flex-col items-center justify-center h-full text-dark-400 text-center p-6">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      <p class="text-sm font-semibold mb-1">No favorites yet</p>
      <p class="text-xs">Click the heart icon on any anime to add it here</p>
    </div>
  `;
}

function renderError(): string {
  return `
    <div class="flex flex-col items-center justify-center h-full text-dark-400 text-center p-6">
      <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-sm">Failed to load favorites</p>
    </div>
  `;
}
