import type { JikanAnime, JikanScheduleEntry } from '../types/jikan';

export function getAnimeImage(anime: JikanAnime | JikanScheduleEntry): string {
  return (
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    anime.images?.webp?.large_image_url ||
    anime.images?.webp?.image_url ||
    ''
  );
}

export function getAnimeTitle(anime: JikanAnime | JikanScheduleEntry): string {
  return anime.title_english || anime.title || 'Unknown';
}

export function formatScore(score?: number): string {
  if (!score) return 'N/A';
  return score.toFixed(2);
}

export function formatEpisodes(episodes?: number): string {
  if (!episodes) return '?';
  return episodes.toString();
}

export function getBroadcastDay(anime: JikanScheduleEntry): string {
  return anime.broadcast?.day || 'Unknown';
}

export function getBroadcastTime(anime: JikanScheduleEntry): string {
  return anime.broadcast?.time || '??:??';
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
