import { initBackground } from './components/background.js';
import { initSchedule } from './components/schedule.js';
import { initSearch } from './components/search.js';
import { initDiscover } from './components/discover.js';
import { initHomepage } from './components/homepage.js';
import { initAnimeDetail } from './components/animeDetail.js';
import { initFavorites } from './components/favorites.js';

// View switching functionality
function initViewSwitcher() {
  const viewButtons = document.querySelectorAll('[data-view]');
  const discoverBtn = document.getElementById('discover-btn');
  
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      
      // Update button states
      viewButtons.forEach(b => b.classList.remove('active-view'));
      btn.classList.add('active-view');
      
      // Update view visibility
      document.querySelectorAll('.content-view').forEach(view => {
        view.classList.remove('active-view');
      });
      document.getElementById(`${targetView}-view`)?.classList.add('active-view');
    });
  });
  
  // Discover button doesn't change view, just opens modal
  // (handled by initDiscover)
}

// Entry point
(async function init() {
  try {
    // Initialize background and favorites in parallel
    await Promise.all([
      initBackground(),
      initFavorites()
    ]);
    
    // Initialize schedule for "Currently Airing" view
    await initSchedule();
    
    // Initialize other components
    initSearch();
    initDiscover();
    initAnimeDetail();
    initViewSwitcher();
    
    // Lazy load homepage content (only when Browse view is accessed)
    const browseBtn = document.getElementById('view-browse');
    let homepageLoaded = false;
    browseBtn?.addEventListener('click', async () => {
      if (!homepageLoaded) {
        await initHomepage();
        homepageLoaded = true;
      }
    }, { once: true });
    
  } catch (e) {
    // Fallback: log but don't break entire page
    console.error('[OtakuTab] Initialization error', e);
  }
})();
