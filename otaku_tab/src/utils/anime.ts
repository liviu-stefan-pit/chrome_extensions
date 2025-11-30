import type { AniListAnime } from '../types/anilist';

export function getAnimeImage(anime: AniListAnime): string {
  return (
    anime.coverImage?.extraLarge ||
    anime.coverImage?.large ||
    anime.coverImage?.medium ||
    ''
  );
}

export function getAnimeTitle(anime: AniListAnime): string {
  return anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown';
}

export function formatScore(score?: number): string {
  if (!score) return 'N/A';
  return score.toFixed(0);
}

export function formatEpisodes(episodes?: number): string {
  if (!episodes) return '?';
  return episodes.toString();
}

export function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
