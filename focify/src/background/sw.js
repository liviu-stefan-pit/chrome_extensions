import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../common/constants.js";
import { getSettings, setSettings } from "../common/storage.js";
import { MODES, cycleMode } from "../common/modes.js";

// No dynamic DNR rules needed after removing strict mode

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Seed defaults if missing
    const existing = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    if (!existing[STORAGE_KEYS.SETTINGS]) {
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
    }
  }

  // Ensure DNR matches current mode
  const settings = await getSettings();
  // No DNR adjustments required
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;
  if (!changes[STORAGE_KEYS.SETTINGS]) return;
  const { newValue: s } = changes[STORAGE_KEYS.SETTINGS];
  // No DNR adjustments required
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-focus-mode") {
    const s = await getSettings();
    const nextMode = cycleMode(s.mode);
    await setSettings({ mode: nextMode });
  }
  if (command === "pomodoro-toggle") {
    // Placeholder for Step 2 (Pomodoro)
  }
});

// Removed applyModeDnr
