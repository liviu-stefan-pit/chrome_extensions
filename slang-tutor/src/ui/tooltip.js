"use strict";
var SlangTooltip = (() => {
  // src/ui/tooltip.ts
  var CARD_ID = "__slang_tutor_card__";
  var OVERLAY_ID = "__slang_tutor_overlay__";
  var INLINE_STYLE_ID = "slang-tutor-inline-style";
  function ensureStyles() {
    if (document.getElementById(INLINE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INLINE_STYLE_ID;
    style.textContent = `:root {
  --stt-bg: #0b1020;
  --stt-fg: #e9edf5;
  --stt-muted: #b6c0d4;
  --stt-accent: #7dd3fc;
  --stt-border: #1f2a44;
  --stt-shadow: rgba(0,0,0,0.35);
}
.stt-card {
  position: fixed;
  max-width: 420px;
  background: var(--stt-bg);
  color: var(--stt-fg);
  border: 1px solid var(--stt-border);
  border-radius: 10px;
  box-shadow: 0 10px 30px var(--stt-shadow);
  font: 14px/1.35 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
  z-index: 2147483647; /* max to float above page */
}
.stt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(125, 211, 252, 0.08);
  border-bottom: 1px solid var(--stt-border);
}
.stt-close {
  background: transparent;
  color: var(--stt-fg);
  border: 0;
  cursor: pointer;
  font-size: 16px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.stt-close:focus { outline: 2px solid var(--stt-accent); outline-offset: 2px; }
.stt-close:hover { background: rgba(125,211,252,0.12); }

.stt-body { padding: 10px; }
.stt-output { margin-bottom: 8px; color: var(--stt-fg); }
.stt-breakdown { margin: 0; padding-left: 18px; color: var(--stt-muted); }
.stt-breakdown li { margin: 4px 0; }

/* Screen overlay to capture outside clicks for dismissal */
.stt-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 2147483646;
}`;
    document.documentElement.appendChild(style);
  }
  function createOverlay(onClose) {
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.className = "stt-overlay";
      overlay.addEventListener("click", onClose, { once: true });
      document.body.appendChild(overlay);
    }
    return overlay;
  }
  function trapFocus(container) {
    const focusables = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    container.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last || container).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first || container).focus();
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeTooltip();
      }
    });
    (first || container).focus();
  }
  function getSelectionRect() {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0).getBoundingClientRect();
    if (!r || r.x === 0 && r.y === 0 && r.width === 0 && r.height === 0) return null;
    return r;
  }
  function positionCard(card) {
    const rect = getSelectionRect();
    const pad = 8;
    let x = window.scrollX + (rect ? rect.left : 20);
    let y = window.scrollY + (rect ? rect.bottom + pad : 20);
    const { innerWidth: W, innerHeight: H } = window;
    const cw = card.getBoundingClientRect().width || 320;
    const ch = card.getBoundingClientRect().height || 120;
    if (x + cw > window.scrollX + W - 10) x = window.scrollX + W - cw - 10;
    if (y + ch > window.scrollY + H - 10) y = window.scrollY + H - ch - 10;
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }
  function renderTooltip(data) {
    ensureStyles();
    const overlay = createOverlay(closeTooltip);
    overlay.style.display = "block";
    let card = document.getElementById(CARD_ID);
    if (!card) {
      card = document.createElement("div");
      card.id = CARD_ID;
      card.className = "stt-card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-live", "polite");
      card.tabIndex = -1;
      const header = document.createElement("div");
      header.className = "stt-header";
      const strong = document.createElement("strong");
      strong.textContent = "Translation";
      const closeBtn = document.createElement("button");
      closeBtn.className = "stt-close";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.textContent = "\xD7";
      closeBtn.addEventListener("click", () => closeTooltip());
      header.append(strong, closeBtn);
      const body = document.createElement("div");
      body.className = "stt-body";
      const out = document.createElement("div");
      out.className = "stt-output";
      out.id = "stt-output";
      const list = document.createElement("ul");
      list.className = "stt-breakdown";
      list.id = "stt-breakdown";
      list.setAttribute("aria-label", "Breakdown");
      body.append(out, list);
      card.append(header, body);
      document.body.appendChild(card);
    }
    const outEl = card.querySelector("#stt-output");
    const listEl = card.querySelector("#stt-breakdown");
    outEl.textContent = data.output;
    listEl.innerHTML = "";
    for (const item of data.breakdown || []) {
      const li = document.createElement("li");
      li.textContent = `${item.term} \u2014 ${item.meaning} (${item.type})`;
      listEl.appendChild(li);
    }
    positionCard(card);
    trapFocus(card);
  }
  function closeTooltip() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    const card = document.getElementById(CARD_ID);
    if (card) card.remove();
  }
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "SLANG_TUTOR_TRANSLATION") {
        renderTooltip(msg);
      }
    });
  } catch {
  }
})();
