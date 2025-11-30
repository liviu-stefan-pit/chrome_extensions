import { jikanAPI } from '../services/jikan';
import { favoritesService } from '../services/favorites';
import { qs } from '../utils/dom';
import { getAnimeImage, getAnimeTitle, formatScore } from '../utils/anime';
import type { JikanAnime } from '../types/jikan';

let currentAnimeId: number | null = null;

export async function initAnimeModal() {
  // Set up event delegation for anime cards
  document.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('[data-anime-id]');
    if (card && !card.hasAttribute('data-remove-id')) {
      const animeId = parseInt(card.getAttribute('data-anime-id') || '0');
      if (animeId) {
        openAnimeModal(animeId);
      }
    }
  });

  // Close modal handlers
  const modal = qs('#anime-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAnimeModal();
      }
    });
  }

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAnimeId) {
      closeAnimeModal();
    }
  });
}

export async function openAnimeModal(animeId: number) {
  const modal = qs('#anime-modal');
  const content = qs('#anime-modal-content');

  if (!modal || !content) return;

  currentAnimeId = animeId;
  modal.classList.remove('hidden');
  content.innerHTML = renderModalLoading();

  try {
    const anime = await jikanAPI.getAnimeById(animeId);
    const isFav = await favoritesService.isFavorite(animeId);
    content.innerHTML = renderModalContent(anime, isFav);

    // Add favorite button handler
    const favBtn = content.querySelector('#favorite-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => toggleFavorite(anime));
    }

    // Add close button handler
    const closeBtn = content.querySelector('#close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeAnimeModal);
    }
  } catch (error) {
    console.error('[AnimeModal] Failed to load anime:', error);
    content.innerHTML = renderModalError();
  }
}

export function closeAnimeModal() {
  const modal = qs('#anime-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentAnimeId = null;
}

async function toggleFavorite(anime: JikanAnime) {
  try {
    const isFav = await favoritesService.toggleFavorite({
      mal_id: anime.mal_id,
      title: getAnimeTitle(anime),
      image_url: getAnimeImage(anime),
      score: anime.score,
      broadcast_day: anime.broadcast?.day,
      broadcast_time: anime.broadcast?.time,
      episodes: anime.episodes,
      status: anime.status,
      added_at: Date.now(),
    });

    // Update button state
    const favBtn = qs('#favorite-btn');
    if (favBtn) {
      if (isFav) {
        favBtn.classList.add('is-favorite');
        favBtn.innerHTML = `
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
      } else {
        favBtn.classList.remove('is-favorite');
        favBtn.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        `;
      }
    }

    // Dispatch event to update favorites panel
    document.dispatchEvent(new CustomEvent('favorite-changed'));
  } catch (error) {
    console.error('[AnimeModal] Failed to toggle favorite:', error);
  }
}

function renderModalContent(anime: JikanAnime, isFavorite: boolean): string {
  const imageUrl = getAnimeImage(anime);
  const title = getAnimeTitle(anime);
  const score = formatScore(anime.score);
  const synopsis = anime.synopsis || 'No synopsis available.';
  const genres = anime.genres?.map((g) => g.name).join(', ') || 'Unknown';
  const type = anime.type || 'Unknown';
  const status = anime.status || 'Unknown';
  const episodes = anime.episodes || '?';
  const aired = anime.aired?.string || 'Unknown';
  const studios = anime.studios?.map((s) => s.name).join(', ') || 'Unknown';
  const favClass = isFavorite ? 'is-favorite' : '';
  const favIcon = isFavorite
    ? '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>';

  return `
    <button id="close-modal-btn" class="absolute top-6 right-6 z-10 p-3 rounded-full bg-dark-800/80 hover:bg-dark-700 border border-white/10 hover:border-primary-500/50 text-dark-200 hover:text-white transition-all hover:scale-110">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <div class="flex flex-col md:flex-row gap-8 p-8">
      <!-- Image -->
      <div class="flex-none">
        <img 
          src="${imageUrl}" 
          alt="${title}"
          class="w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 space-y-6">
        <!-- Title -->
        <div>
          <h2 class="text-3xl font-bold text-gradient mb-2">${title}</h2>
          ${anime.title_japanese ? `<p class="text-lg text-dark-300">${anime.title_japanese}</p>` : ''}
        </div>

        <!-- Meta Info -->
        <div class="flex flex-wrap gap-3">
          <span class="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold">${type}</span>
          <span class="px-3 py-1 rounded-full bg-dark-800 text-dark-200 text-sm">${status}</span>
          <span class="px-3 py-1 rounded-full bg-dark-800 text-dark-200 text-sm">${episodes} episodes</span>
          ${anime.score ? `<span class="px-3 py-1 rounded-full bg-accent-amber/20 text-accent-amber text-sm font-semibold">⭐ ${score}</span>` : ''}
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button id="favorite-btn" class="favorite-btn ${favClass}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
            ${favIcon}
          </button>
          <a href="${anime.url}" target="_blank" class="btn-secondary">
            View on MAL
          </a>
        </div>

        <!-- Synopsis -->
        <div>
          <h3 class="text-lg font-bold text-dark-200 mb-2">Synopsis</h3>
          <p class="text-dark-300 leading-relaxed">${synopsis}</p>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-dark-400">Genres:</span>
            <span class="text-dark-200 ml-2">${genres}</span>
          </div>
          <div>
            <span class="text-dark-400">Studios:</span>
            <span class="text-dark-200 ml-2">${studios}</span>
          </div>
          <div>
            <span class="text-dark-400">Aired:</span>
            <span class="text-dark-200 ml-2">${aired}</span>
          </div>
          ${anime.broadcast?.string ? `
            <div>
              <span class="text-dark-400">Broadcast:</span>
              <span class="text-dark-200 ml-2">${anime.broadcast.string}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderModalLoading(): string {
  return `
    <div class="flex items-center justify-center h-96">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
    </div>
  `;
}

function renderModalError(): string {
  return `
    <div class="flex flex-col items-center justify-center h-96 text-dark-400 p-8">
      <svg class="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-xl font-semibold mb-2">Failed to load anime</p>
      <p class="text-sm">Please try again later</p>
      <button onclick="document.getElementById('anime-modal').classList.add('hidden')" class="btn-secondary mt-6">
        Close
      </button>
    </div>
  `;
}
