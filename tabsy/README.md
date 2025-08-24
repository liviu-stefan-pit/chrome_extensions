# Tabsy — Smart Tab Manager

Declutter your browser: list tabs, clean duplicates & empty pages, save and restore tab groups, and work from a focused side panel. Fast, private, no fluff.

## ✨ Features
- Clean: remove duplicate URLs & blank/new tab pages
- Group: save selected tabs under a named group
- Restore: reopen all tabs in a group with one click
- Side Panel: persistent view while you browse
- Lightweight: no remote code, trimmed permissions

## 🔒 Privacy
No data leaves your browser. Stored data: group names + URL arrays in `chrome.storage.local`.

## 🧩 Permissions
- `tabs`: enumerate open tabs & reopen on restore
- `storage`: persist groups
- `sidePanel`: optional UI surface

Removed in 1.1.0: `scripting`, `<all_urls>`.

## 🗂 Data Model
```ts
interface SavedGroup { name: string; urls: string[] }
chrome.storage.local.get('groups') => { groups: SavedGroup[] }
```

## 🚀 Roadmap
- Keyboard shortcuts
- Sorting & filtering
- Export / import groups
- Auto-session snapshots (optional)

## 🛠 Development
Load folder via `chrome://extensions` → Load unpacked.

## 🧾 Changelog
See `CHANGELOG.md`.

## ⚖️ License
All rights reserved (private).

> Not affiliated with or endorsed by Google / Chrome.
