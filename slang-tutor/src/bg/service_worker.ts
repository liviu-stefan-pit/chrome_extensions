// MV3 Service Worker: Context menu + selection capture + translation routing
// Note: Manifest currently points to JS at src/background/service-worker.js.
// This TS module implements the logic; wire a build step later to produce the background script or adjust manifest.

import { explainBreakdown, toFormal } from "../lib/slang";
import { DEBUG } from "../config";

type CMClickInfo = { menuItemId: any; selectionText?: string };
type TabLike = { id?: number | null };

const MENU_ID = "slang-tutor-translate-selection";

function log(...args: any[]) {
  if (DEBUG) console.log("[SlangTutor]", ...args);
}

function createContextMenus() {
  try {
    chrome.contextMenus.remove(MENU_ID, () => void chrome.runtime.lastError);
  } catch {}
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Translate Slang",
    contexts: ["selection"],
  }, () => {
    if (chrome.runtime.lastError && DEBUG) {
      console.warn("[SlangTutor] menu create error:", chrome.runtime.lastError.message);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});
chrome.runtime.onStartup?.addListener?.(() => {
  createContextMenus();
});

async function getSelectionFromPage(tabId: number): Promise<string> {
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          const sel = globalThis.getSelection?.()?.toString() ?? "";
          return sel.trim();
        } catch {
          return "";
        }
      },
    });
    const value = (res && (res as any).result) ?? (res as any);
    return typeof value === "string" ? value : "";
  } catch (e) {
    if (DEBUG) console.warn("[SlangTutor] executeScript selection failed", e);
    return "";
  }
}

async function handleTranslateClick(info: CMClickInfo, tab?: TabLike) {
  if (!tab || tab.id == null) return;
  let selected = (info.selectionText ?? "").trim();
  if (!selected) {
    // MV3-safe: try executeScript to read live selection from page
    selected = await getSelectionFromPage(tab.id);
  }
  if (!selected) {
    log("No selection to translate");
    return;
  }

  try {
    const breakdown = explainBreakdown(selected);
    const output = toFormal(selected, { decodeEmoji: true, decodeAcronyms: true });

    const payload = {
      type: "SLANG_TUTOR_TRANSLATION",
      original: selected,
      output,
      breakdown,
      meta: { source: "contextMenu" },
    } as const;

    try {
      // Ensure the tooltip listener is present by injecting our script first.
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/ui/tooltip.js"],
      });
    } catch (e) {
      if (DEBUG) console.warn("[SlangTutor] failed injecting tooltip.js", e);
    }
    try {
      await chrome.tabs.sendMessage(tab.id, payload);
    } catch (e) {
      if (DEBUG) console.warn("[SlangTutor] sendMessage failed (no CS?)", e);
    }
  } catch (e) {
    if (DEBUG) console.error("[SlangTutor] translate error", e);
  }
}

chrome.contextMenus.onClicked.addListener((info: CMClickInfo, tab: TabLike) => {
  if (info.menuItemId === MENU_ID) {
    void handleTranslateClick(info, tab);
  }
});
