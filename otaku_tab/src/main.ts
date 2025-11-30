import './styles/main.css';
import { aniListAPI } from './services/anilist';
import { favoritesService } from './services/favorites';
import { preferencesService } from './services/preferences';
import { initScheduleView } from './components/ScheduleView';
import { initBrowseView } from './components/BrowseView';
import { initTopView } from './components/TopView';
import { initFavoritesPanel } from './components/FavoritesPanel';
import { initSearch } from './components/Search';
import { initAnimeModal } from './components/AnimeModal';
import { qs, qsa } from './utils/dom';

// View management
let currentView: 'schedule' | 'browse' | 'top' | null = null;

function switchView(view: 'schedule' | 'browse' | 'top') {
  if (currentView === view) return;
  
  currentView = view;
  
  // Update tabs
  qsa('.view-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-view') === view) {
      tab.classList.add('active');
    }
  });
  
  // Update content
  qsa('.view-content').forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('active');
  });
  
  const activeContent = qs(`#${view}-view`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
    activeContent.classList.add('active');
  }
  
  // Load view content if not already loaded
  loadViewContent(view);
}

async function loadViewContent(view: 'schedule' | 'browse' | 'top') {
  const content = qs(`#${view}-content`);
  if (!content) return;
  
  // Check if already loaded - but always load schedule on first initialization
  const hasContent = content.children.length > 0;
  const hasSkeletons = content.querySelector('.skeleton');
  const hasActualContent = hasContent && !hasSkeletons;
  
  // For schedule view, check if we have actual anime cards, not just skeletons
  if (view === 'schedule' && hasContent && !hasSkeletons && content.querySelector('[data-anime-id]')) {
    return; // Already loaded with real data
  } else if (view !== 'schedule' && hasActualContent) {
    return; // Other views: already loaded
  }
  
  showLoading();
  
  try {
    switch (view) {
      case 'schedule':
        await initScheduleView();
        break;
      case 'browse':
        await initBrowseView();
        break;
      case 'top':
        await initTopView();
        break;
    }
  } catch (error) {
    console.error(`[App] Failed to load ${view} view:`, error);
    if (content) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-dark-400">
          <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-semibold mb-2">Failed to load content</p>
          <p class="text-sm">Please try again later</p>
        </div>
      `;
    }
  } finally {
    hideLoading();
  }
}

function showLoading() {
  const overlay = qs('#loading-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = qs('#loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Random anime button
async function handleRandomAnime() {
  showLoading();
  try {
    const anime = await aniListAPI.getRandomAnime();
    const { openAnimeModal } = await import('./components/AnimeModal');
    openAnimeModal(anime.id);
  } catch (error) {
    console.error('[App] Failed to get random anime:', error);
  } finally {
    hideLoading();
  }
}

// Initialize the app
async function init() {
  console.log('[App] Initializing Otaku Tab...');
  
  try {
    // Initialize core components
    await Promise.all([
      initFavoritesPanel(),
      initSearch(),
      initAnimeModal(),
    ]);
    
    // Set up view switching
    qsa('.view-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-view') as 'schedule' | 'browse' | 'top';
        if (view) switchView(view);
      });
    });
    
    // Set up action buttons
    const randomBtn = qs('#random-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', handleRandomAnime);
    }
    
    const settingsBtn = qs('#settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', async () => {
        const { openSettingsModal } = await import('./components/SettingsModal');
        openSettingsModal();
      });
    }
    
    // Load preferences and initial view
    const prefs = await preferencesService.getPreferences();
    const defaultView = prefs.defaultView || 'schedule';
    switchView(defaultView);
    
    console.log('[App] Initialization complete');
  } catch (error) {
    console.error('[App] Initialization failed:', error);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
(window as any).__otakuTab = {
  aniListAPI,
  favoritesService,
  preferencesService,
};
