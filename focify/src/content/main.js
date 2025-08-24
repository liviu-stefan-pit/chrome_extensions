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
  work: "ytf-mode-work",
  strict: "ytf-mode-strict"
};

let currentMode = null;
let currentToggles = null;
let bodyReady = false;

init();

async function init() {
  // Mark when <body> appears
  if (document.body) bodyReady = true;
  else {
    const onBody = () => { 
      bodyReady = true; 
      applyBodyPlaceholderClass(Boolean(currentToggles?.hideHomeGrid));
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

  // Best-effort: keep autoplay off
  trySetAutoplayOff();
  const mo = new MutationObserver(() => trySetAutoplayOff());
  mo.observe(document.documentElement, { childList: true, subtree: true });
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
  
  // Only apply hiding classes if mode is not "off"
  if (currentMode !== "off") {
    for (const [k, cls] of Object.entries(CLASSMAP)) {
      if (currentToggles[k]) html.classList.add(cls);
    }
  }

  // Placeholder class on <body> – defer until body exists
  applyBodyPlaceholderClass(Boolean(currentToggles.hideHomeGrid && currentMode !== "off"));
  
  // Re-evaluate home overlay when settings change
  evaluateHomeOverlay();
}

function applyBodyPlaceholderClass(enabled) {
  if (!bodyReady || !document.body) return; // will be applied when body becomes ready
  const b = document.body;
  if (enabled) b.classList.add("ytf-show-home-placeholder");
  else b.classList.remove("ytf-show-home-placeholder");
}

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

function evaluateHomeOverlay() {
  // Show different overlays based on mode
  if (currentMode === "off") {
    // Off mode: no overlay, normal YouTube
    removeHomeOverlay();
    return;
  }
  
  if (currentMode === "work" && currentToggles?.hideHomeGrid && isHomePage()) {
    // Work mode: only show overlay if hiding home grid and on home page
    createWorkModeOverlay();
    return;
  }
  
  if (currentMode === "strict") {
    // Strict mode: always show search interface, everywhere except video pages
    if (isVideoPage()) {
      removeHomeOverlay();
      // On video pages in strict mode, hide everything except video and sidebar
      applyStrictVideoMode();
    } else {
      createStrictModeOverlay();
    }
    return;
  }
  
  // Default: remove overlay
  removeHomeOverlay();
}

function createWorkModeOverlay() {
  // Remove existing overlay first
  removeHomeOverlay();
  
  if (!document.body) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'focify-home-overlay';
  overlay.innerHTML = `
    <div class="focify-home-content focify-work-mode">
      <div class="focify-home-icon">💼</div>
      <h2>Work Mode Active</h2>
      <p>Distractions hidden • Search to find specific content</p>
      <div class="focify-search-container">
        <input type="text" class="focify-search-input" placeholder="Search YouTube..." />
        <button class="focify-search-btn">Search</button>
      </div>
      <div class="focify-tips">
        <small>💡 Tip: Use <kbd>Alt+Shift+F</kbd> to cycle focus modes</small>
      </div>
    </div>
  `;
  
  // Add event listeners
  const searchInput = overlay.querySelector('.focify-search-input');
  const searchBtn = overlay.querySelector('.focify-search-btn');
  
  const performSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/results?search_query=${encodeURIComponent(query)}`;
    }
  };
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Focus the search input
  setTimeout(() => searchInput.focus(), 100);
  
  document.body.appendChild(overlay);
}

function createStrictModeOverlay() {
  // Remove existing overlay first
  removeHomeOverlay();
  
  if (!document.body) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'focify-home-overlay';
  overlay.innerHTML = `
    <div class="focify-home-content focify-strict-mode">
      <div class="focify-home-icon">🎯</div>
      <h2>Focify Strict Mode</h2>
      <p>Search-only interface • Maximum focus</p>
      <div class="focify-search-container">
        <input type="text" class="focify-search-input" placeholder="Search for specific content..." />
        <button class="focify-search-btn">Search</button>
      </div>
      <div class="focify-tips">
        <small>🔒 Strict mode: Only search and video watching allowed</small>
      </div>
    </div>
  `;
  
  // Add event listeners
  const searchInput = overlay.querySelector('.focify-search-input');
  const searchBtn = overlay.querySelector('.focify-search-btn');
  
  const performSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/results?search_query=${encodeURIComponent(query)}`;
    }
  };
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Focus the search input
  setTimeout(() => searchInput.focus(), 100);
  
  document.body.appendChild(overlay);
}

function applyStrictVideoMode() {
  // In strict mode on video pages, hide everything except video and related sidebar
  if (!document.body) return;
  
  // Add strict video mode class to body for CSS targeting
  document.body.classList.add('focify-strict-video-mode');
}

function removeHomeOverlay() {
  const existing = document.getElementById('focify-home-overlay');
  if (existing) {
    existing.remove();
  }
  
  // Also remove strict video mode class
  if (document.body) {
    document.body.classList.remove('focify-strict-video-mode');
  }
}

function trySetAutoplayOff() {
  try {
    localStorage.setItem("yt-player-autonav", JSON.stringify({ data: "0" }));
  } catch {}

  const toggle = document.querySelector(
    "#toggle.ytd-compact-autoplay-renderer paper-toggle-button, ytd-watch-flexy [role='checkbox'][aria-label*='Autoplay']"
  );
  // If toggle exists and is ON, click to turn it OFF
  if (toggle && (toggle.hasAttribute?.("checked") || toggle.getAttribute?.("aria-checked") === "true")) {
    try { toggle.click(); } catch {}
  }
}
