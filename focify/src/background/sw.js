import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../common/constants.js";
import { getSettings, setSettings } from "../common/storage.js";
import { MODES, cycleMode } from "../common/modes.js";

// Dynamic DNR rule IDs (keep stable)
const DNR_RULE_IDS = {
  STRICT_BLOCK_FEEDS: 1001
};

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
  await applyModeDnr(settings.mode);
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;
  if (!changes[STORAGE_KEYS.SETTINGS]) return;
  const { newValue: s } = changes[STORAGE_KEYS.SETTINGS];
  await applyModeDnr(s.mode);
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

async function applyModeDnr(mode) {
  // Strict: block any /feed/* (includes subscriptions)
  const strictRules = [
    {
      id: DNR_RULE_IDS.STRICT_BLOCK_FEEDS,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "||youtube.com/feed/",
        resourceTypes: ["main_frame"]
      }
    }
  ];

  const toAdd = mode === MODES.STRICT ? strictRules : [];
  const toRemove = mode === MODES.STRICT ? [] : [DNR_RULE_IDS.STRICT_BLOCK_FEEDS];

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: toAdd, removeRuleIds: toRemove });
  } catch (e) {
    // Fail soft; DNR may be unavailable in some contexts
    console.warn("DNR update failed", e);
  }
}
