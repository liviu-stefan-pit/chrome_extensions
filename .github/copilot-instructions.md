# Chrome Extensions Workspace — AI Agent Instructions

## Repository Overview

This is a **multi-project Chrome Extensions workspace** containing:
- **Production extensions** (tabsy, focify, slang-tutor, otaku_tab, easy_tabs) — Custom implementations
- **Learning/template extensions** (hello_world, reading_time, tabs_manager) — Minimal examples
- **chrome-extensions-samples/** — Official Google repository with 50+ reference implementations
  - `api-samples/` — Single API focused examples (storage, tabs, declarativeNetRequest, etc.)
  - `functional-samples/` — Complete features spanning multiple APIs (ai.gemini-*, cookbook.*, sample.*, tutorial.*)

Each extension is self-contained in its own directory with manifest.json, assets, and source code.

## Essential Documentation Files

This workspace includes comprehensive reference documentation:
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Data flows, component relationships, architectural decisions, patterns
- **[API-CONTRACTS.md](API-CONTRACTS.md)** — Chrome API usage patterns, storage contracts, messaging protocols, error handling
- **[EXEMPLARS.md](EXEMPLARS.md)** — Quick reference mapping use cases to implementations across workspace

## Architecture Patterns

### Manifest V3 Standard
All active extensions use **Manifest V3** (MV2 is archived). Key patterns:
- **Service Workers** replace background pages (`background.service_worker`, type: "module")
- **Declarative Net Request** (DNR) for content blocking (see `focify/rules/dnr_static.json`)
- **Side Panel API** for persistent UI (`tabsy`, `easy_tabs`)
- Host permissions are explicit and minimal (see `focify` YouTube-only permissions)

### Project Structure Conventions
Extensions follow this typical structure:
```
extension-name/
├── manifest.json          # MV3 config (required)
├── package.json          # NPM scripts (if build tooling needed)
├── src/                  # Source code (TypeScript or ES modules)
│   ├── background/       # Service worker
│   ├── content/          # Content scripts
│   ├── popup/            # Popup UI
│   └── common/           # Shared utilities
├── assets/ or images/    # Icons and static resources
└── README.md            # Extension-specific docs
```

### Module Systems
- **ES Modules** are standard (`type: "module"` in manifest, `.js` with imports)
- **TypeScript projects** (`slang-tutor`) compile to ES modules via esbuild
- **No bundler** for simple extensions (`tabsy`, `focify`) — direct ES module imports
- **Bundled projects** (`slang-tutor`, `otaku_tab`) use esbuild or Tailwind CLI

## Extension Archetypes

### Simple Extensions (No Build)
**Examples**: `tabsy`, `focify`, `easy_tabs`, `hello_world`
- Pure JavaScript with ES modules
- Load unpacked directly from Chrome developer mode
- CSS written manually or via minimal Tailwind build

### Build-Based Extensions
**Examples**: `slang-tutor` (TypeScript + Tailwind), `otaku_tab` (Tailwind)

**slang-tutor** TypeScript workflow:
```bash
npm run dev        # Concurrent TS + CSS watch
npm run build      # Production build
npm test           # Vitest unit tests
```
- esbuild compiles `.ts` → `.js` (ES modules for service worker, IIFE for content scripts)
- Tailwind processes `src/styles/tailwind.css` → `src/ui/popup.css`
- Path aliases: `@lib/*`, `@slang/*` (tsconfig.json)

**otaku_tab** Tailwind workflow:
```bash
npm run watch:css  # Live CSS development
npm run build:css  # Production minified CSS
npm run dev        # Build CSS + remind to load in Chrome
```
- Custom forest color palette in `tailwind.config.js`
- Component classes prefixed `otk-` (cards, panels, badges)

### Content-Heavy Extensions
**Example**: `focify` (YouTube focus mode)
- **Dynamic CSS injection** via content script (`assets/yt-focus.css`)
- **Class-based toggling** on `<html>` element (e.g., `.focify-work`, `.focify-hide-shorts`)
- **Storage sync** for settings with version migration pattern (see `src/common/storage.js`)
- **Keyboard shortcuts** via `commands` API (Alt+Shift+F to toggle modes)

### Offscreen Document Pattern
**Example**: `sample.tabcapture-recorder` (chrome-extensions-samples)
- **Service worker limitation workaround**: Access DOM/Web APIs from service worker
- **Use cases**: MediaRecorder, Clipboard, Geolocation, DOM parsing
- **Pattern**: Create temporary offscreen document → perform operation → close
- **Reasons**: `USER_MEDIA`, `CLIPBOARD`, `GEOLOCATION`, `DOM_PARSER`, etc.
```javascript
// Create offscreen document
await chrome.offscreen.createDocument({
  url: 'offscreen.html',
  reasons: ['USER_MEDIA'],
  justification: 'Recording from chrome.tabCapture API'
});
```

## Storage Patterns

### Chrome Storage Sync
Used for user settings that sync across devices:
```javascript
// Pattern from focify/src/common/storage.js
export async function getSettings() {
  const obj = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const stored = obj[STORAGE_KEYS.SETTINGS] || {};
  return { ...DEFAULT_SETTINGS, ...stored }; // Merge with defaults
}

export async function setSettings(patch) {
  const current = await getSettings();
  const next = deepMerge(current, patch); // Deep merge for nested objects
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: next });
}
```

### Chrome Storage Local (Caching)
Used for API response caching:
```javascript
// Pattern from otaku_tab/src/api/jikan.js
async function maybeCached(key, maxAgeMs, fetcher) {
  const cached = await getCache(key);
  if (cached && (Date.now() - cached.timestamp) < maxAgeMs) {
    return cached.data;
  }
  const data = await fetcher();
  await setCache(key, { data, timestamp: Date.now() });
  return data;
}
```
Typical cache duration: **6 hours** (SIX_HOURS constant)

## UI Patterns

### Side Panel Extensions
**Examples**: `tabsy`, `easy_tabs`
- Declared in manifest: `"side_panel": { "default_path": "sidepanel/panel.html" }`
- Enabled via service worker: `chrome.sidePanel.setOptions({ enabled: true })`
- Persistent UI alongside browsing tabs
- **Best practice**: Use `setPanelBehavior({ openPanelOnActionClick: true })` for better UX
- **Global vs site-specific**: Can configure per-tab or global panels

### Popup + Options Pattern
Most extensions have:
- **Popup** (quick actions): `action.default_popup`
- **Options page** (detailed settings): `options_page` field
- Shared storage/state via chrome.storage.sync

### Component Architecture (Advanced)
**Example**: `otaku_tab/src/main.js`
```javascript
import { initBackground } from './components/background.js';
import { initSchedule } from './components/schedule.js';
import { initSearch } from './components/search.js';

(async function init() {
  await Promise.all([initBackground(), initSchedule()]);
  initSearch(); // Non-blocking components after critical path
})();
```
Each component is self-contained with init function pattern.

## Development Workflow

### Loading Extensions for Testing
Standard Chrome developer workflow:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked" → select extension folder
4. After changes, click refresh icon on extension card

### Common NPM Scripts (When Present)
- `npm run dev` or `npm run watch:css` — Live development with file watching
- `npm run build` — Production build (minified CSS, compiled TS)
- `npm test` — Run tests (Vitest for TypeScript projects)
- `npm run icons` — Generate icon sizes via Python script

### Icon Generation
Extensions include Python scripts to generate all required icon sizes:
```bash
cd extension-name/icons/
python generate_icons.py  # Requires Pillow: pip install Pillow
```
Required sizes: 16px, 32px, 48px, 128px

## Testing Approach

### Unit Testing (slang-tutor)
- **Framework**: Vitest with TypeScript
- **Location**: `test/**/*.spec.ts`
- **Run**: `npm test` (CI mode) or `npm run test:watch` (dev mode)
- **Pattern**: Test pure functions (lib layer), not Chrome APIs

### Manual Testing
Most extensions rely on manual testing via Chrome developer tools:
- Check console for errors in service worker (chrome://extensions → Inspect)
- Use Chrome DevTools on popup/options pages
- Test permissions in private/incognito mode

## Key Chrome APIs Used

### Common APIs Across Extensions
- **chrome.storage.sync** — User settings (quota: 100KB)
- **chrome.storage.local** — Caching/large data (quota: 10MB)
- **chrome.tabs** — Tab management, queries, manipulation
- **chrome.runtime** — Messaging, lifecycle events

### Extension-Specific APIs
- **chrome.sidePanel** (`tabsy`, `easy_tabs`) — Persistent sidebar UI
- **chrome.declarativeNetRequest** (`focify`) — Content blocking rules
- **chrome.commands** (`focify`) — Keyboard shortcuts
- **chrome.contextMenus** (`slang-tutor`) — Right-click menu items
- **chrome.scripting** (`slang-tutor`) — Dynamic script injection

## External API Integration

### Jikan API Pattern (otaku_tab)
- **Base URL**: `https://api.jikan.moe/v4`
- **No API key required** (free tier)
- **Rate limits**: Respect via client-side caching (6 hours)
- **Error handling**: Graceful fallbacks, console logging
```javascript
async function safeFetch(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json()?.data;
}
```

## Project-Specific Conventions

### File Naming
- **Manifest files**: Always `manifest.json` at project root
- **Service workers**: `background.js` or `src/background/sw.js`
- **Content scripts**: `content.js` or `src/content/main.js`
- **CSS**: Component-specific (e.g., `popup.css`, `yt-focus.css`)

### Permissions Philosophy
- **Minimal permissions**: Only request what's actively used
- **Host permissions**: Be specific (e.g., `https://www.youtube.com/*` not `<all_urls>`)
- **Document in README**: Explain why each permission is needed (see `tabsy/PRIVACY_POLICY.md`)

### Version Management
- Use semantic versioning in manifest.json
- Include CHANGELOG.md for notable projects (`tabsy`, `focify`)
- Store version in constants for migration logic (see `focify/src/common/constants.js`)

## Common Debugging Scenarios

### Service Worker Issues
- **View logs**: chrome://extensions → Inspect service worker
- **Common errors**: Module import paths (must be relative with `.js` extension)
- **Lifecycle**: Service worker idles after ~30 seconds, use `chrome.storage` not global vars

### Content Script Injection
- **Timing**: Use `"run_at": "document_start"` for DOM manipulation before page load
- **Isolated world**: Content scripts can't access page JavaScript directly
- **CSS conflicts**: Prefix classes to avoid collision (e.g., `.focify-*`, `.otk-*`)

### Storage Debugging
```javascript
// Check stored data in console
chrome.storage.sync.get(null, (data) => console.log(data));
chrome.storage.local.get(null, (data) => console.log(data));
```

## When Adding New Extensions

1. **Create directory** with descriptive name (kebab-case)
2. **Start with manifest.json** (copy from similar extension archetype)
3. **Add package.json** if build tooling needed (TypeScript, Tailwind)
4. **Include README.md** with features, installation, privacy notes
5. **Generate icons** (16/32/48/128px) using existing Python scripts
6. **Test permissions** thoroughly in clean Chrome profile
7. **Document storage schema** if using chrome.storage

## Reference Extensions

- **Minimal starter**: `hello_world`, `reading_time`
- **TypeScript + testing**: `slang-tutor`
- **Side panel pattern**: `tabsy`, `cookbook.sidepanel-global`
- **Content blocking**: `focify`, `declarativeNetRequest/url-blocker`
- **API integration**: `otaku_tab`
- **Offscreen documents**: `sample.tabcapture-recorder`, `cookbook.offscreen-*`
- **On-device AI**: `ai.gemini-on-device`, `ai.gemini-on-device-alt-texter`
- **Official samples**: `chrome-extensions-samples/` (Google's reference implementations)

## Finding the Right Example

When implementing a feature:
1. **Check [EXEMPLARS.md](EXEMPLARS.md)** for use case → implementation mapping
2. **Review [API-CONTRACTS.md](API-CONTRACTS.md)** for API usage patterns
3. **Consult [ARCHITECTURE.md](ARCHITECTURE.md)** for architectural context
4. **Look in `chrome-extensions-samples/`** for official Google examples
   - `api-samples/` for single API demonstrations
   - `functional-samples/` for complete feature implementations
