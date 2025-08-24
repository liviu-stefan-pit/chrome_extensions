import { initBackground } from './components/background.js';
import { initSchedule } from './components/schedule.js';
import { initSearch } from './components/search.js';
import { initDiscover } from './components/discover.js';
// Replaces legacy highlights grid with new structured homepage rows
import { initHomepage } from './components/homepage.js';

// Entry point
(async function init() {
  try {
    await Promise.all([
      initBackground(),
      initSchedule(),
    ]);
  initSearch();
  initDiscover();
  initHomepage();
  } catch (e) {
    // Fallback: log but don't break entire page
    console.error('[OtakuTab] Initialization error', e);
  }
})();
