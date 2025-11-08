// Favorites component - displays user's favorite anime in weekly swimlanes
import { getFavoritesByDay, onFavoritesChanged, removeFavorite } from '../utils/favorites.js';
import { showAnimeDetail } from './animeDetail.js';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function createFavoriteCard(anime) {
  const img = escapeHtml(anime.image);
  const title = escapeHtml(anime.title);
  const time = escapeHtml(anime.airingTime || 'TBA');
  const score = anime.score ? `★ ${anime.score.toFixed(1)}` : '';
  
  return `
    <div class="fav-card" data-id="${anime.id}">
      <div class="fav-thumb-wrapper">
        <img src="${img}" alt="${title}" loading="lazy">
        <button class="fav-remove group" data-id="${anime.id}" title="Remove from favorites" aria-label="Remove ${title} from favorites">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="fav-meta">
        <h4 class="fav-title">${title}</h4>
        <div class="fav-info">
          <span class="fav-time">${time}</span>
          ${score ? `<span class="fav-score">${score}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function createDaySwimlane(day, animeList) {
  const dayLabel = DAY_LABELS[day];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const isToday = day === today;
  const todayClass = isToday ? 'fav-day-today' : '';
  
  const cards = animeList.length > 0
    ? animeList.map(createFavoriteCard).join('')
    : '<div class="fav-empty">No favorites for this day</div>';
  
  return `
    <div class="fav-day-column ${todayClass}">
      <h3 class="fav-day-header">
        ${dayLabel}
        ${isToday ? '<span class="fav-today-badge">Today</span>' : ''}
      </h3>
      <div class="fav-day-content" data-day="${day}">
        ${cards}
      </div>
    </div>
  `;
}

async function renderFavorites() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  
  const favoritesByDay = await getFavoritesByDay();
  
  // Check if there are any favorites at all
  const totalFavorites = Object.values(favoritesByDay).reduce((sum, day) => sum + day.length, 0);
  
  if (totalFavorites === 0) {
    container.innerHTML = `
      <div class="fav-empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h3>No Favorites Yet</h3>
        <p>Click the heart icon on any anime to add it to your weekly schedule</p>
      </div>
    `;
    return;
  }
  
  // Render swimlanes for each day
  const swimlanesHTML = DAYS_ORDER.map(day => 
    createDaySwimlane(day, favoritesByDay[day])
  ).join('');
  
  container.innerHTML = `<div class="fav-swimlanes">${swimlanesHTML}</div>`;
  
  // Add event listeners
  attachEventListeners();
}

function attachEventListeners() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  
  // Click on card to show details
  container.addEventListener('click', async (e) => {
    const card = e.target.closest('.fav-card:not(.fav-remove)');
    if (card) {
      const id = parseInt(card.getAttribute('data-id'), 10);
      if (id) showAnimeDetail(id);
    }
    
    // Remove button
    const removeBtn = e.target.closest('.fav-remove');
    if (removeBtn) {
      e.stopPropagation();
      const id = parseInt(removeBtn.getAttribute('data-id'), 10);
      if (id) {
        await removeFavorite(id);
        // Renderchevron will be triggered by storage change listener
      }
    }
  });
}

export async function initFavorites() {
  await renderFavorites();
  
  // Listen for changes to favorites
  onFavoritesChanged(() => {
    renderFavorites();
  });
}
