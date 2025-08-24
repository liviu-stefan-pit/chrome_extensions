// Focify content script (classic script, not module)

const CLASSMAP = {
  hideSidebar: "ytf--hide-sidebar",
  hideComments: "ytf--hide-comments",
  hideHomeGrid: "ytf--hide-home-grid",
  hideEndscreen: "ytf--hide-endscreen",
  hideMiniPlayer: "ytf--hide-miniplayer",
  hideShorts: "ytf--hide-shorts"
};

const MODE_CLASS = {
  off: "ytf-mode-off",
  work: "ytf-mode-work"
};

let currentMode = null;
let currentToggles = null;
let currentBlocklist = [];
let bodyReady = false;

init();

async function init() {
  // Mark when <body> appears
  if (document.body) bodyReady = true;
  else {
    const onBody = () => { 
      bodyReady = true; 
      evaluateHomeOverlay();
    };
    // DOMContentLoaded is sufficient; RAF loop is a fallback for SPA-y loads
    document.addEventListener("DOMContentLoaded", onBody, { once: true });
    waitForBody(onBody);
  }

  const s = await chrome.storage.sync.get("ytf_settings");
  const settings = s.ytf_settings || {};
  apply(settings);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.ytf_settings) apply(changes.ytf_settings.newValue || {});
  });

  // Listen for YouTube SPA navigation
  window.addEventListener("yt-navigate-finish", evaluateHomeOverlay);
  window.addEventListener("popstate", evaluateHomeOverlay);
  // Re-enforce autoplay preference on navigation
  window.addEventListener("yt-navigate-finish", () => { if (currentToggles?.disableAutoplay) scheduleAutoplayPauseEnforce(); });
  window.addEventListener("popstate", () => { if (currentToggles?.disableAutoplay) scheduleAutoplayPauseEnforce(); });
  
  // Also check after a short delay for initial page load
  setTimeout(evaluateHomeOverlay, 1000);

  // Intercept clicks to Shorts and redirect to /watch when possible
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target?.closest?.("a[href*='/shorts/']");
      if (!a) return;
      const m = a.href.match(/\/shorts\/([\w-]{6,})/);
      if (m && m[1]) {
        e.preventDefault();
        e.stopPropagation();
        location.assign(`https://www.youtube.com/watch?v=${m[1]}`);
      }
    },
    true
  );

  // Basic autoplay preference (turn off YT toggle & pause after navigation)
  trySetAutoplayOff();
  const mo = new MutationObserver(() => { trySetAutoplayOff(); if (currentToggles?.disableAutoplay) scheduleAutoplayPauseEnforce(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  scheduleAutoplayPauseEnforce();
}

function apply(settings) {
  const html = document.documentElement;

  // Mode classes
  if (currentMode && MODE_CLASS[currentMode]) html.classList.remove(MODE_CLASS[currentMode]);
  currentMode = settings.mode || "off";
  html.classList.add(MODE_CLASS[currentMode]);

  // Toggle classes on <html> - only apply if NOT in off mode
  if (currentToggles) {
    for (const k of Object.keys(CLASSMAP)) html.classList.remove(CLASSMAP[k]);
  }
  currentToggles = settings.toggles || {};
  currentBlocklist = settings.blocklist || [];
  
  // Only apply hiding classes if mode is not off, but delay one animation frame to let YouTube layout first row.
  for (const cls of Object.values(CLASSMAP)) html.classList.remove(cls); // reset first
  if (currentMode !== 'off') {
    requestAnimationFrame(() => {
      for (const [k, cls] of Object.entries(CLASSMAP)) {
        if (!currentToggles[k]) continue;
        html.classList.add(cls);
      }
    });
  }
  
  // Re-evaluate home overlay when settings change
  evaluateHomeOverlay();
  applyBlocklistFiltering();
  restoreHomeLayoutIfNeeded();
  if (currentToggles?.disableAutoplay) scheduleAutoplayPauseEnforce();
}

// Placeholder removed

function waitForBody(cb) {
  if (document.body) { cb(); return; }
  const roop = () => {
    if (document.body) { cb(); return; }
    requestAnimationFrame(roop);
  };
  requestAnimationFrame(roop);
}

function isHomePage() {
  const path = window.location.pathname;
  const search = window.location.search;
  
  // YouTube home page variations
  return (
    path === '/' || 
    path === '' || 
    path === '/feed/subscriptions' ||
    (path === '/results' && !search) || // Empty search
    path.startsWith('/feed/')
  );
}

function isVideoPage() {
  const path = window.location.pathname;
  return path === '/watch' || path.startsWith('/watch?');
}

function isSearchResultsPage() {
  const path = window.location.pathname;
  return path === '/results' && window.location.search.includes('search_query=');
}

function evaluateHomeOverlay() { removeHomeOverlay(); }

function restoreHomeLayoutIfNeeded() {
  // Only forcibly restore if mode is off or the toggle itself is not enabled.
  if (currentMode === 'off' || !currentToggles?.hideHomeGrid) {
    document.documentElement.classList.remove(CLASSMAP.hideHomeGrid);
  }
}

function applyBlocklistFiltering() {
  if (!currentBlocklist.length) return;
  if (currentMode === 'off') return; // only in work mode

  // Prepare normalized patterns
  const chHandles = new Set();
  const chUrls = [];
  const keywords = [];
  currentBlocklist.forEach(entry => {
    if (entry.startsWith('@')) chHandles.add(entry.toLowerCase());
    else if (/^https?:\/\//i.test(entry)) chUrls.push(entry.toLowerCase());
    else keywords.push(entry.toLowerCase());
  });

  const candidates = document.querySelectorAll(
    'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer'
  );

  candidates.forEach(el => {
    if (el.__focifyHidden) return;
    const titleEl = el.querySelector('#video-title');
    const chanEl = el.querySelector('ytd-channel-name a, a.yt-simple-endpoint[href*="/channel/"], a.yt-simple-endpoint[href*="/@"]');
    const title = (titleEl?.textContent || '').trim().toLowerCase();
    const channelHref = (chanEl?.getAttribute('href') || '').toLowerCase();
    const channelText = (chanEl?.textContent || '').trim().toLowerCase();

    let hide = false;
    // Channel handle match
    if (!hide) {
      for (const h of chHandles) {
        if (channelHref.includes(h) || channelText.includes(h.slice(1))) { hide = true; break; }
      }
    }
    // Channel URL match
    if (!hide) {
      for (const u of chUrls) { if (channelHref.startsWith(u)) { hide = true; break; } }
    }
    // Keyword in title
    if (!hide) {
      for (const kw of keywords) { if (kw && title.includes(kw)) { hide = true; break; } }
    }

    if (hide) {
      el.style.display = 'none';
      el.__focifyHidden = true;
    }
  });

  // Observe for dynamically added videos
  if (!window.__focifyBlocklistObserver) {
    const obs = new MutationObserver(() => applyBlocklistFiltering());
    obs.observe(document.documentElement, { childList: true, subtree: true });
    window.__focifyBlocklistObserver = obs;
  }
}

// Removed strict overlay + video mode helpers

function removeHomeOverlay() { /* overlay removed */ }

let autoplayAttempts = 0;
function resetAutoplayAttempts() { autoplayAttempts = 0; }
function trySetAutoplayOff() {
  if (!currentToggles?.disableAutoplay) return; // Only act if user enabled it
  try {
    // Known localStorage flag YouTube reads
    localStorage.setItem("yt-player-autonav", JSON.stringify({ data: "0" }));
    localStorage.setItem("yt-player-autonav-detected", JSON.stringify({ data: "0" }));
  } catch {}

  const selector = [
    "#toggle.ytd-compact-autoplay-renderer paper-toggle-button",
    "ytd-watch-flexy [role='checkbox'][aria-label*='utoplay']",
  "button.ytp-autonav-toggle-button",
  "[class*='autonav'][aria-pressed]",
  "[class*='autoplay'][aria-pressed]"
  ].join(", ");
  const toggle = document.querySelector(selector);
  if (!toggle) {
    if (autoplayAttempts < 30) { // extend attempts (~15s)
      autoplayAttempts++;
      setTimeout(trySetAutoplayOff, 500);
    }
    return;
  }

  const isOn = (() => {
    if (toggle.matches('button.ytp-autonav-toggle-button')) {
      return toggle.getAttribute('aria-pressed') === 'true';
    }
    return toggle.hasAttribute?.('checked') || toggle.getAttribute?.('aria-checked') === 'true';
  })();

  if (isOn) {
    try { toggle.click(); } catch {}
  }
}

// Simple pause-after-navigation enforcement
let userInteractedWithVideo = false;
function scheduleAutoplayPauseEnforce() {
  userInteractedWithVideo = false;
  const registerInteraction = (e) => {
    if (!currentToggles?.disableAutoplay) return;
    const target = e.target;
    if (target && target.closest && target.closest('#movie_player')) {
      userInteractedWithVideo = true;
      cleanup();
    }
  };
  document.addEventListener('click', registerInteraction, true);
  document.addEventListener('keydown', registerInteraction, true);
  let attempts = 0;
  function attempt() {
    if (!currentToggles?.disableAutoplay) { cleanup(); return; }
    const vid = document.querySelector('video.html5-main-video');
    if (vid) {
      // If playing automatically and user hasn't interacted yet, pause & reset to 0 (keeps next video ready but not consuming attention)
      if (!userInteractedWithVideo && !vid.paused && vid.currentTime < 3) {
        try { vid.pause(); vid.currentTime = 0; } catch {}
      }
      // If video remains paused we can stop early
      if (vid.paused) {
        cleanup();
        return;
      }
    }
    attempts++;
    if (attempts < 30) requestAnimationFrame(attempt); else cleanup();
  }
  requestAnimationFrame(attempt);
  function cleanup() {
    document.removeEventListener('click', registerInteraction, true);
    document.removeEventListener('keydown', registerInteraction, true);
  }
}
