import { STORAGE_KEYS, DEFAULT_SETTINGS } from "../common/constants.js";

const $ = (sel) => document.querySelector(sel);

(async function init() {
  const store = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...(store[STORAGE_KEYS.SETTINGS] || {}) };

  $("#allowlist").value = (settings.allowlist || []).join("\n");
  $("#defaultMode").value = settings.mode || "work";

  $("#save").addEventListener("click", async () => {
    const allowlist = $("#allowlist").value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const mode = $("#defaultMode").value;

    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: { ...settings, allowlist, mode }
    });

    $("#status").textContent = "Saved";
    setTimeout(() => ($("#status").textContent = ""), 1200);
  });
})();
