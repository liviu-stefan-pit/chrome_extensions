// Tooltip renderer for Slang Tutor. No frameworks; minimal DOM.
// This is meant to be injected via chrome.scripting and run in the page context.

interface BreakdownItem {
  term: string; meaning: string; type: 'slang'|'emoji'|'acronym'; start: number; end: number;
}

interface Payload {
  type: 'SLANG_TUTOR_TRANSLATION';
  original: string;
  output: string;
  breakdown: BreakdownItem[];
  meta?: any;
}

const CARD_ID = '__slang_tutor_card__';
const OVERLAY_ID = '__slang_tutor_overlay__';
const INLINE_STYLE_ID = 'slang-tutor-inline-style';

function ensureStyles() {
  if (document.getElementById(INLINE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INLINE_STYLE_ID;
  style.textContent = `:root {\n  --stt-bg: #0b1020;\n  --stt-fg: #e9edf5;\n  --stt-muted: #b6c0d4;\n  --stt-accent: #7dd3fc;\n  --stt-border: #1f2a44;\n  --stt-shadow: rgba(0,0,0,0.35);\n}\n.stt-card {\n  position: fixed;\n  max-width: 420px;\n  background: var(--stt-bg);\n  color: var(--stt-fg);\n  border: 1px solid var(--stt-border);\n  border-radius: 10px;\n  box-shadow: 0 10px 30px var(--stt-shadow);\n  font: 14px/1.35 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  z-index: 2147483647; /* max to float above page */\n}\n.stt-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 10px;\n  background: rgba(125, 211, 252, 0.08);\n  border-bottom: 1px solid var(--stt-border);\n}\n.stt-close {\n  background: transparent;\n  color: var(--stt-fg);\n  border: 0;\n  cursor: pointer;\n  font-size: 16px;\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n}\n.stt-close:focus { outline: 2px solid var(--stt-accent); outline-offset: 2px; }\n.stt-close:hover { background: rgba(125,211,252,0.12); }\n\n.stt-body { padding: 10px; }\n.stt-output { margin-bottom: 8px; color: var(--stt-fg); }\n.stt-breakdown { margin: 0; padding-left: 18px; color: var(--stt-muted); }\n.stt-breakdown li { margin: 4px 0; }\n\n/* Screen overlay to capture outside clicks for dismissal */\n.stt-overlay {\n  position: fixed;\n  inset: 0;\n  background: transparent;\n  z-index: 2147483646;\n}`;
  document.documentElement.appendChild(style);
}

function createOverlay(onClose: () => void) {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'stt-overlay';
    overlay.addEventListener('click', onClose, { once: true });
    document.body.appendChild(overlay);
  }
  return overlay as HTMLDivElement;
}

function trapFocus(container: HTMLElement) {
  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last || container).focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first || container).focus(); }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeTooltip();
    }
  });
  (first || container).focus();
}

function getSelectionRect(): DOMRect | null {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;
  const r = sel.getRangeAt(0).getBoundingClientRect();
  if (!r || (r.x === 0 && r.y === 0 && r.width === 0 && r.height === 0)) return null;
  return r;
}

function positionCard(card: HTMLElement) {
  const rect = getSelectionRect();
  const pad = 8;
  let x = window.scrollX + (rect ? rect.left : 20);
  let y = window.scrollY + (rect ? rect.bottom + pad : 20);
  // Keep on-screen
  const { innerWidth: W, innerHeight: H } = window;
  const cw = card.getBoundingClientRect().width || 320;
  const ch = card.getBoundingClientRect().height || 120;
  if (x + cw > window.scrollX + W - 10) x = window.scrollX + W - cw - 10;
  if (y + ch > window.scrollY + H - 10) y = window.scrollY + H - ch - 10;
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
}

function renderTooltip(data: Payload) {
  ensureStyles();

  // Overlay for outside-click to close
  const overlay = createOverlay(closeTooltip);
  overlay.style.display = 'block';

  let card = document.getElementById(CARD_ID) as HTMLDivElement | null;
  if (!card) {
    card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'stt-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-live', 'polite');
    card.tabIndex = -1;

    const header = document.createElement('div');
    header.className = 'stt-header';
    const strong = document.createElement('strong');
    strong.textContent = 'Translation';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'stt-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => closeTooltip());
    header.append(strong, closeBtn);

    const body = document.createElement('div');
    body.className = 'stt-body';

    const out = document.createElement('div');
    out.className = 'stt-output';
    out.id = 'stt-output';

    const list = document.createElement('ul');
    list.className = 'stt-breakdown';
    list.id = 'stt-breakdown';
    list.setAttribute('aria-label', 'Breakdown');

    body.append(out, list);
    card.append(header, body);
    document.body.appendChild(card);
  }

  const outEl = card.querySelector('#stt-output')! as HTMLDivElement;
  const listEl = card.querySelector('#stt-breakdown')! as HTMLUListElement;

  outEl.textContent = data.output;
  listEl.innerHTML = '';
  for (const item of data.breakdown || []) {
    const li = document.createElement('li');
    li.textContent = `${item.term} — ${item.meaning} (${item.type})`;
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

// Message listener for background -> content routing
try {
  chrome.runtime.onMessage.addListener((msg: any) => {
    if (msg && msg.type === 'SLANG_TUTOR_TRANSLATION') {
      renderTooltip(msg as Payload);
    }
  });
} catch {}

// For manual testing in page console:
// renderTooltip({ type: 'SLANG_TUTOR_TRANSLATION', original: 'no cap', output: 'no lie', breakdown: [{term:'no cap', meaning:'no lie', type:'slang', start:0, end:6}] });
