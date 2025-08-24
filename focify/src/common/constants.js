export const VERSION = "0.1.3";
export const STORAGE_KEYS = { SETTINGS: "ytf_settings" };
export const DEFAULT_SETTINGS = {
  version: VERSION,
  mode: "off", // off | work | strict
  toggles: {
    hideSidebar: true,
    hideComments: false,
    hideHomeGrid: true,
    hideEndscreen: true,
    hideMiniPlayer: true,
    hideShorts: true,
    disableAutoplay: true
  },
  allowlist: [],
  pomodoro: { enabled: false, focusMin: 25, breakMin: 5, state: "idle", endAt: null }
};
