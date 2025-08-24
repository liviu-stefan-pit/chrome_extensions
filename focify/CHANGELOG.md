# Changelog

## 0.2.0 — UI Redesign & Autoplay Revamp
- **Redesigned** popup and options pages with dark green / black minimalist theme (removed Tailwind from popup, custom CSS)
- **Removed** legacy Strict mode code & overlay remnants (modes now Off / Work only)
- **Restored** functional Hide Home Grid toggle (applies in Work mode when enabled)
- **Reworked** Autoplay toggle semantics: allow next video to load but auto-pauses initial playback until user interacts (instead of blocking next video load)
- **Improved** Blocklist stability & mutation handling (no change required by users)
- **Refactored** content script for leaner class application (one-frame delay to avoid layout shift)
- **Cleaned** unused overlay / placeholder CSS & DNR strict logic

## 0.1.7 — Blocklist & Filtering
- **Added**: Blocklist (channels / keywords) with hiding in Work & Strict modes
- **Added**: Options UI for blocklist management
- **Implemented**: Live mutation observer to catch dynamically loaded videos
- **Note**: Blocklist ignored in Off mode

## 0.1.6 — Mode Behavior Fixes (Strict now deprecated)
- **Fixed**: Work mode incorrectly showing empty/overlay style home until a search occurred
- **Fixed**: Strict mode search box not performing searches reliably
- **Changed**: Strict mode no longer blocks viewing search results (overlay only on real home/feed pages)
- **Adjusted**: Work mode no longer hides the home grid even if toggle enabled (browsable focused homepage)
- **Improved**: Overlay evaluation logic & class application ordering

## 0.1.2 — Hotfix 002 (Home Overlay) (Overlay later removed with Strict mode)
- **Fixed**: Blank homepage when "Hide Home Grid" is enabled
- **Added**: Beautiful home overlay with search functionality when home grid is hidden
- **Enhanced**: Proper YouTube SPA navigation detection (`yt-navigate-finish`)
- **Added**: Focused search input with direct YouTube search integration
- **Improved**: Home page detection for various YouTube feed URLs
- **Added**: Visual feedback with gradient overlay and animations

## 0.1.1 — Hotfix 001
- **Fixed**: Content script crash when `document.body` is null at `document_start`
- **Improved**: Better autoplay toggle detection with multiple attribute checks
- **Enhanced**: Robust body element waiting with DOMContentLoaded + RAF fallback

## 0.1.0 — Initial skeleton
- MV3 scaffold with background service worker
- Static DNR for Shorts/Trending/Explore blocking
- CSS-first hiding of sidebar/comments/home grid/endscreen/mini-player
- Popup UI with modes + granular toggles
- **Custom Focify icons** - Abstract focus design with purple gradient
- Icon generation tools (Python script + HTML generator)
- Comprehensive README with features and installation guide
