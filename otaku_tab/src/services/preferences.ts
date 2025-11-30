import type { UserPreferences } from '../types/preferences';

const PREFERENCES_KEY = 'otaku_tab_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  defaultView: 'schedule',
  enableAnimations: true,
  compactMode: false,
  showAdultContent: false,
  adultContentOnly: false,
};

class PreferencesService {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const result = await chrome.storage.sync.get([PREFERENCES_KEY]);
      return {
        ...DEFAULT_PREFERENCES,
        ...(result[PREFERENCES_KEY] || {}),
      };
    } catch (error) {
      console.error('[Preferences] Failed to get preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...updates };
      await chrome.storage.sync.set({ [PREFERENCES_KEY]: updated });
      console.log('[Preferences] Updated:', updates);
    } catch (error) {
      console.error('[Preferences] Failed to update preferences:', error);
      throw error;
    }
  }

  async resetPreferences(): Promise<void> {
    try {
      await chrome.storage.sync.set({ [PREFERENCES_KEY]: DEFAULT_PREFERENCES });
      console.log('[Preferences] Reset to defaults');
    } catch (error) {
      console.error('[Preferences] Failed to reset preferences:', error);
      throw error;
    }
  }
}

export const preferencesService = new PreferencesService();
