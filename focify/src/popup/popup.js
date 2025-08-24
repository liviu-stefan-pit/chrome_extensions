import { VERSION, STORAGE_KEYS, DEFAULT_SETTINGS } from "../common/constants.js";

const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

(async function init() {
  byId("version").textContent = VERSION;

  const store = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...(store[STORAGE_KEYS.SETTINGS] || {}) };

  // Modes
  const modeRadios = document.querySelectorAll("input[name='mode']");
  for (const r of modeRadios) r.checked = r.value === settings.mode;
  for (const r of modeRadios) {
    r.addEventListener("change", () => save({ mode: r.value }));
  }

  // Toggles
  for (const key of Object.keys(DEFAULT_SETTINGS.toggles)) {
    const el = byId(key);
    if (el) {
      el.checked = !!settings.toggles[key];
      el.addEventListener("change", () => save({ toggles: { [key]: el.checked } }));
    }
  }

  byId("openOptions").addEventListener("click", () => chrome.runtime.openOptionsPage());
})();

async function save(patch) {
  // Merge into current settings
  const { SETTINGS } = STORAGE_KEYS;
  const cur = (await chrome.storage.sync.get(SETTINGS))[SETTINGS] || DEFAULT_SETTINGS;
  const next = deepMerge(cur, patch);
  await chrome.storage.sync.set({ [SETTINGS]: next });
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
