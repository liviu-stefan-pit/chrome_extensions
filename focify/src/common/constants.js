export const VERSION = "0.2.1";
export const STORAGE_KEYS = { SETTINGS: "ytf_settings" };
export const DEFAULT_SETTINGS = {
  version: VERSION,
  mode: "off", // off | work
  toggles: {
    hideSidebar: true,
    hideComments: false,
    hideHomeGrid: true,
    hideEndscreen: true,
    hideMiniPlayer: true,
  hideShorts: true
  },
  blocklist: [], // list of channel handles (@handle), channel URLs, or keywords
  pomodoro: { enabled: false, focusMin: 25, breakMin: 5, state: "idle", endAt: null }
};
