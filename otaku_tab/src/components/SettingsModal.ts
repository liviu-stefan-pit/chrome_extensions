import { preferencesService } from '../services/preferences';
import { aniListAPI } from '../services/anilist';
import { qs } from '../utils/dom';
import type { UserPreferences } from '../types/preferences';

let modalElement: HTMLElement | null = null;
let currentPreferences: UserPreferences;

export async function openSettingsModal() {
  if (modalElement) {
    modalElement.classList.remove('hidden');
    return;
  }

  currentPreferences = await preferencesService.getPreferences();
  
  modalElement = document.createElement('div');
  modalElement.id = 'settings-modal';
  modalElement.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm';
  modalElement.innerHTML = renderModalContent();
  
  document.body.appendChild(modalElement);
  
  setupEventListeners();
}

export function closeSettingsModal() {
  if (modalElement) {
    modalElement.classList.add('hidden');
  }
}

function renderModalContent(): string {
  return `
    <div class="bg-dark-900 rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/10">
        <h2 class="text-2xl font-bold text-dark-50 flex items-center gap-3">
          <svg class="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Settings
        </h2>
        <button id="close-settings" class="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-dark-50 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Default View -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-dark-200">Default View</label>
          <select id="pref-default-view" class="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
            <option value="schedule" ${currentPreferences.defaultView === 'schedule' ? 'selected' : ''}>Currently Airing</option>
            <option value="browse" ${currentPreferences.defaultView === 'browse' ? 'selected' : ''}>Browse</option>
            <option value="top" ${currentPreferences.defaultView === 'top' ? 'selected' : ''}>Top Rated</option>
          </select>
          <p class="text-xs text-dark-400">Choose which view to display when opening a new tab</p>
        </div>

        <!-- Theme -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-dark-200">Theme</label>
          <select id="pref-theme" class="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
            <option value="dark" ${currentPreferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${currentPreferences.theme === 'light' ? 'selected' : ''}>Light (Coming Soon)</option>
            <option value="auto" ${currentPreferences.theme === 'auto' ? 'selected' : ''}>Auto (Coming Soon)</option>
          </select>
          <p class="text-xs text-dark-400">Light and Auto themes are coming in a future update</p>
        </div>

        <!-- Enable Animations -->
        <div class="flex items-center justify-between p-4 bg-dark-800/40 rounded-xl border border-white/10">
          <div>
            <label class="block text-sm font-semibold text-dark-200">Enable Animations</label>
            <p class="text-xs text-dark-400 mt-1">Show smooth transitions and effects</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="pref-animations" class="sr-only peer" ${currentPreferences.enableAnimations ? 'checked' : ''}>
            <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>

        <!-- Compact Mode -->
        <div class="flex items-center justify-between p-4 bg-dark-800/40 rounded-xl border border-white/10">
          <div>
            <label class="block text-sm font-semibold text-dark-200">Compact Mode</label>
            <p class="text-xs text-dark-400 mt-1">Show more content with smaller cards</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="pref-compact" class="sr-only peer" ${currentPreferences.compactMode ? 'checked' : ''}>
            <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>

        <!-- Show Adult Content -->
        <div class="flex items-center justify-between p-4 bg-dark-800/40 rounded-xl border border-white/10">
          <div>
            <label class="block text-sm font-semibold text-dark-200">Show 18+ Content</label>
            <p class="text-xs text-dark-400 mt-1">Include adult anime in all results (mixed with regular anime)</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="pref-adult-content" class="sr-only peer" ${currentPreferences.showAdultContent ? 'checked' : ''}>
            <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>

        <!-- Adult Content Only -->
        <div id="adult-only-container" class="flex items-center justify-between p-4 bg-dark-800/40 rounded-xl border border-white/10 ${!currentPreferences.showAdultContent ? 'opacity-50 cursor-not-allowed' : ''}">
          <div>
            <label class="block text-sm font-semibold text-dark-200">18+ Content Only</label>
            <p class="text-xs text-dark-400 mt-1">Show ONLY adult anime across all tabs</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="pref-adult-only" class="sr-only peer" ${currentPreferences.adultContentOnly ? 'checked' : ''} ${!currentPreferences.showAdultContent ? 'disabled' : ''}>
            <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 peer-disabled:opacity-50"></div>
          </label>
        </div>

        <!-- Cache Management -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-dark-200">Cache Management</label>
          <button id="clear-cache-btn" class="w-full px-4 py-3 bg-dark-800 hover:bg-dark-700 border border-white/10 rounded-xl text-dark-50 font-medium transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Clear Cache
          </button>
          <p class="text-xs text-dark-400">Clear cached anime data to force fresh updates from the API</p>
        </div>

        <!-- About -->
        <div class="p-4 bg-dark-800/40 rounded-xl border border-white/10">
          <h3 class="text-sm font-semibold text-dark-200 mb-2">About Otaku Tab</h3>
          <p class="text-xs text-dark-400 leading-relaxed mb-3">
            A beautiful Chrome extension for anime fans. Discover airing anime, browse popular titles, and manage your favorites.
          </p>
          <p class="text-xs text-dark-500">
            Data provided by <a href="https://anilist.co" target="_blank" class="text-primary-400 hover:text-primary-300 underline">AniList API</a>
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-between gap-3 p-6 border-t border-white/10">
        <button id="reset-settings-btn" class="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-dark-400 hover:text-dark-50 font-medium transition-colors">
          Reset to Defaults
        </button>
        <div class="flex gap-3">
          <button id="cancel-settings-btn" class="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-dark-50 font-medium transition-colors">
            Cancel
          </button>
          <button id="save-settings-btn" class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-pink text-white font-semibold shadow-neon hover:shadow-neon-lg transition-all hover:scale-105">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  if (!modalElement) return;

  // Close button
  const closeBtn = modalElement.querySelector('#close-settings');
  closeBtn?.addEventListener('click', closeSettingsModal);

  // Cancel button
  const cancelBtn = modalElement.querySelector('#cancel-settings-btn');
  cancelBtn?.addEventListener('click', closeSettingsModal);

  // Click outside to close
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeSettingsModal();
    }
  });

  // Save button
  const saveBtn = modalElement.querySelector('#save-settings-btn');
  saveBtn?.addEventListener('click', handleSave);

  // Reset button
  const resetBtn = modalElement.querySelector('#reset-settings-btn');
  resetBtn?.addEventListener('click', handleReset);

  // Clear cache button
  const clearCacheBtn = modalElement.querySelector('#clear-cache-btn');
  clearCacheBtn?.addEventListener('click', handleClearCache);
  
  // Adult content toggles dependency
  const adultContentCheckbox = modalElement.querySelector('#pref-adult-content') as HTMLInputElement;
  const adultOnlyCheckbox = modalElement.querySelector('#pref-adult-only') as HTMLInputElement;
  const adultOnlyContainer = modalElement.querySelector('#adult-only-container') as HTMLElement;
  
  if (adultContentCheckbox && adultOnlyCheckbox && adultOnlyContainer) {
    // Disable "adult only" if "show adult" is not checked
    const updateAdultOnlyState = () => {
      if (!adultContentCheckbox.checked) {
        adultOnlyCheckbox.checked = false;
        adultOnlyCheckbox.disabled = true;
        adultOnlyContainer.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        adultOnlyCheckbox.disabled = false;
        adultOnlyContainer.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    };
    
    // Initialize state
    updateAdultOnlyState();
    
    // Add event listener
    adultContentCheckbox.addEventListener('change', updateAdultOnlyState);
  }
}

async function handleSave() {
  const defaultView = (qs<HTMLSelectElement>('#pref-default-view')?.value || 'schedule') as 'schedule' | 'browse' | 'top';
  const theme = (qs<HTMLSelectElement>('#pref-theme')?.value || 'dark') as 'dark' | 'light' | 'auto';
  const enableAnimations = qs<HTMLInputElement>('#pref-animations')?.checked ?? true;
  const compactMode = qs<HTMLInputElement>('#pref-compact')?.checked ?? false;
  const showAdultContent = qs<HTMLInputElement>('#pref-adult-content')?.checked ?? false;
  const adultContentOnly = qs<HTMLInputElement>('#pref-adult-only')?.checked ?? false;

  try {
    await preferencesService.updatePreferences({
      defaultView,
      theme,
      enableAnimations,
      compactMode,
      showAdultContent,
      adultContentOnly,
    });

    // Show success message
    showToast('Settings saved successfully!', 'success');
    
    // Close modal after a short delay
    setTimeout(() => {
      closeSettingsModal();
      
      // Reload the page to apply changes
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('[SettingsModal] Failed to save settings:', error);
    showToast('Failed to save settings', 'error');
  }
}

async function handleReset() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  try {
    await preferencesService.resetPreferences();
    showToast('Settings reset to defaults', 'success');
    
    setTimeout(() => {
      closeSettingsModal();
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('[SettingsModal] Failed to reset settings:', error);
    showToast('Failed to reset settings', 'error');
  }
}

async function handleClearCache() {
  if (!confirm('Are you sure you want to clear the cache? This will remove all cached anime data.')) {
    return;
  }

  try {
    await aniListAPI.clearCache();
    showToast('Cache cleared successfully!', 'success');
  } catch (error) {
    console.error('[SettingsModal] Failed to clear cache:', error);
    showToast('Failed to clear cache', 'error');
  }
}

function showToast(message: string, type: 'success' | 'error') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-[10001] px-6 py-4 rounded-xl border shadow-2xl animate-slide-up ${
    type === 'success'
      ? 'bg-green-500/90 border-green-400 text-white'
      : 'bg-red-500/90 border-red-400 text-white'
  }`;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      ${type === 'success'
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
      }
      <span class="font-semibold">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(1rem)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
