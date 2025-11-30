import type { AniListAnime } from '../types/anilist';
import { getAnimeImage, getAnimeTitle, formatScore } from '../utils/anime';

export function renderAnimeCard(anime: AniListAnime): string {
  const imageUrl = getAnimeImage(anime);
  const title = getAnimeTitle(anime);
  const score = anime.averageScore ? formatScore(anime.averageScore) : 'N/A';
  const type = anime.format || 'Unknown';
  const isAiring = anime.status === 'RELEASING';

  return `
    <div class="anime-card" data-anime-id="${anime.id}">
      <img 
        src="${imageUrl}" 
        alt="${title}"
        class="anime-card-image"
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
      />
      <div class="anime-card-overlay"></div>
      <div class="anime-card-content">
        <h3 class="text-sm font-bold text-white mb-1 line-clamp-2">${title}</h3>
        <div class="flex items-center justify-between text-xs">
          <span class="text-dark-300">${type}</span>
          ${anime.averageScore ? `<span class="text-accent-amber font-semibold">⭐ ${score}</span>` : ''}
        </div>
        ${isAiring ? '<span class="inline-block mt-2 px-2 py-1 rounded-full bg-accent-emerald/20 text-accent-emerald text-xs font-semibold">Airing</span>' : ''}
      </div>
    </div>
  `;
}
