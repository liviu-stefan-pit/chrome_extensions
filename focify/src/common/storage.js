import { STORAGE_KEYS, DEFAULT_SETTINGS, VERSION } from "./constants.js";

export async function getSettings() {
  const obj = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const stored = obj[STORAGE_KEYS.SETTINGS] || {};
  // Merge with defaults so new keys are introduced
  const merged = { ...DEFAULT_SETTINGS, ...stored, toggles: { ...DEFAULT_SETTINGS.toggles, ...(stored.toggles||{}) } };
  // Version migration: if version mismatch, patch stored version only (non-destructive)
  if (merged.version !== VERSION) {
    merged.version = VERSION;
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: merged });
  }
  return merged;
}

export async function setSettings(patch) {
  const current = await getSettings();
  const next = deepMerge(current, patch);
  next.version = VERSION;
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: next });
  return next;
}

export function onSettingsChanged(handler) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes[STORAGE_KEYS.SETTINGS]) {
      const { newValue } = changes[STORAGE_KEYS.SETTINGS];
      handler(newValue);
    }
  });
}

function deepMerge(target, patch) {
  if (Array.isArray(patch)) return patch.slice();
  if (typeof patch !== "object" || patch === null) return patch;
  const out = { ...target };
  for (const k of Object.keys(patch)) {
    out[k] = deepMerge(target?.[k], patch[k]);
  }
  return out;
}
