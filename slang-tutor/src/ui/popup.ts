import { toFormal, toSlang, explainBreakdown } from "../lib/slang";
import { slangOfTheDay } from "../lib/daypicker";

// Minimal chrome types
declare const chrome: any;

const el = {
  input: document.getElementById('input') as HTMLTextAreaElement,
  modeRadios: Array.from(document.querySelectorAll<HTMLInputElement>('input[name="mode"]')),
  optEmoji: document.getElementById('opt-emoji') as HTMLInputElement,
  optAcronyms: document.getElementById('opt-acronyms') as HTMLInputElement,
  btnTranslate: document.getElementById('btn-translate') as HTMLButtonElement,
  btnClear: document.getElementById('btn-clear') as HTMLButtonElement,
  btnCopy: document.getElementById('btn-copy') as HTMLButtonElement,
  output: document.getElementById('output') as HTMLDivElement,
  breakdown: document.getElementById('breakdown') as HTMLUListElement,
  history: document.getElementById('history') as HTMLUListElement,
  historyClear: document.getElementById('btn-history-clear') as HTMLButtonElement,
  sotd: document.getElementById('sotd') as HTMLDivElement,
  toast: document.getElementById('toast') as HTMLDivElement,
};

function t(key: string, subs?: string[]) { return chrome?.i18n?.getMessage?.(key, subs) || key; }

function applyI18n() {
  // Labels and text content
  const titleEl = document.querySelector('h1'); if (titleEl) titleEl.textContent = t('appTitle');
  const inputLabel = document.querySelector('label[for="input"]'); if (inputLabel) inputLabel.textContent = t('inputLabel');
  const outLabel = document.querySelector('span.text-sm'); if (outLabel) outLabel.textContent = t('outputLabel');
  const bdh2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.toLowerCase().includes('breakdown')); if (bdh2) bdh2.textContent = t('breakdownTitle');
  const histTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.toLowerCase().includes('history')); if (histTitle) histTitle.textContent = t('historyTitle');

  // Buttons/switches
  el.btnTranslate.textContent = t('btnTranslate');
  el.btnClear.textContent = t('btnClear');
  el.btnCopy.textContent = t('btnCopy');
  const mode1 = document.querySelector('input[name="mode"][value="slang->formal"]')?.parentElement; if (mode1) mode1.lastChild && (mode1.lastChild.textContent = ' ' + t('modeSlangFormal'));
  const mode2 = document.querySelector('input[name="mode"][value="formal->slang"]')?.parentElement; if (mode2) mode2.lastChild && (mode2.lastChild.textContent = ' ' + t('modeFormalSlang'));
  const decEmoji = document.querySelector('label[for="opt-emoji"]') || el.optEmoji?.parentElement; if (decEmoji) decEmoji.lastChild && (decEmoji.lastChild.textContent = ' ' + t('decodeEmoji'));
  const decAcr = document.querySelector('label[for="opt-acronyms"]') || el.optAcronyms?.parentElement; if (decAcr) decAcr.lastChild && (decAcr.lastChild.textContent = ' ' + t('decodeAcronyms'));
  const btnHistClr = document.getElementById('btn-history-clear'); if (btnHistClr) btnHistClr.textContent = t('clearHistory');

  // Placeholder
  el.input.placeholder = t('placeholderInput');
}

function toast(msgKey: string) {
  el.toast.textContent = t(msgKey);
  el.toast.classList.remove('hidden');
  setTimeout(() => el.toast.classList.add('hidden'), 1500);
}

function getMode(): 'slang->formal' | 'formal->slang' {
  const r = el.modeRadios.find(x => x.checked);
  return (r?.value as any) || 'slang->formal';
}

function setSotd() {
  const s = slangOfTheDay();
  el.sotd.textContent = t('sotd', [s.term, s.meaning]);
}

function renderBreakdown(items: Array<{term:string; meaning:string; type:string;}>) {
  el.breakdown.innerHTML = '';
  for (const i of items) {
    const li = document.createElement('li');
    li.textContent = `${i.term} — ${i.meaning} (${i.type})`;
    el.breakdown.appendChild(li);
  }
}

async function loadHistory(): Promise<any[]> {
  try {
    const { st_history } = await chrome.storage.sync.get({ st_history: [] });
    return Array.isArray(st_history) ? st_history : [];
  } catch { return []; }
}

async function saveHistory(entry: any) {
  const hist = await loadHistory();
  hist.unshift(entry);
  const trimmed = hist.slice(0, 10);
  try { await chrome.storage.sync.set({ st_history: trimmed }); } catch {}
  renderHistory(trimmed);
}

function renderHistory(hist: any[]) {
  el.history.innerHTML = '';
  for (const h of hist) {
    const li = document.createElement('li');
    li.className = 'border border-slate-200 dark:border-slate-700 rounded-md p-2';
    const a = document.createElement('button');
    a.className = 'text-left w-full hover:underline';
    a.textContent = `${h.mode}: ${h.input}`;
    a.addEventListener('click', () => {
      el.input.value = h.input;
      (document.querySelector(`input[name=mode][value="${h.mode}"]`) as HTMLInputElement).checked = true;
      el.optEmoji.checked = !!h.decodeEmoji; el.optAcronyms.checked = !!h.decodeAcronyms;
      translate();
    });
    li.appendChild(a);
    el.history.appendChild(li);
  }
}

async function translate() {
  const text = (el.input.value || '').trim();
  if (!text) { el.output.textContent = ''; el.breakdown.innerHTML=''; return; }
  const mode = getMode();
  if (mode === 'slang->formal') {
    const output = toFormal(text, { decodeEmoji: el.optEmoji.checked, decodeAcronyms: el.optAcronyms.checked });
    const breakdown = explainBreakdown(text);
    el.output.textContent = output;
    renderBreakdown(breakdown);
    await saveHistory({ ts: Date.now(), mode, input: text, output, decodeEmoji: el.optEmoji.checked, decodeAcronyms: el.optAcronyms.checked });
  } else {
    const output = toSlang(text);
    el.output.textContent = output;
    renderBreakdown([]);
    await saveHistory({ ts: Date.now(), mode, input: text, output, decodeEmoji: false, decodeAcronyms: false });
  }
}

function wireEvents() {
  el.btnTranslate.addEventListener('click', translate);
  el.btnClear.addEventListener('click', () => { el.input.value=''; el.output.textContent=''; el.breakdown.innerHTML=''; el.input.focus(); });
  el.btnCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.output.textContent || '');
      toast('toastCopied');
    } catch { toast('toastCopyFailed'); }
  });
  el.input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); translate(); }
  });
  el.historyClear.addEventListener('click', async () => {
    try { await chrome.storage.sync.set({ st_history: [] }); } catch {}
    renderHistory([]);
  });
}

(async function init() {
  applyI18n();
  setSotd();
  wireEvents();
  const hist = await loadHistory();
  renderHistory(hist);
})();
