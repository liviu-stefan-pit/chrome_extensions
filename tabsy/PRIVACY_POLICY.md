# Tabsy – Privacy & Permissions

## Unique Purpose
Tabsy has a single, narrow goal: help users declutter their browser by viewing, cleaning and saving/restoring logical groups of open tabs.

## Data Collection
Tabsy collects no personal data, sends nothing to external servers, and performs all logic locally in the browser.

## Permissions Justification
- `tabs`: Needed to query open tabs, remove duplicates / empties on user action, and open tabs when restoring a saved group. No content inspection beyond URL/title provided by Chrome.
- `storage`: Stores only saved tab groups (name + list of URLs) locally via `chrome.storage.local`. User may delete groups; uninstalling clears the data.
- `sidePanel`: Enables optional side panel UI for persistent tab management workflow.

Removed permissions: `scripting` (unused) and broad host access (`<all_urls>`) to minimize scope.

## Remote Code
None. All code is packaged. No runtime fetch, CDN scripts, eval, or dynamic module injection.

## Data Deletion
- Delete groups in the UI
- Uninstall extension

## Affiliation
Not affiliated with or endorsed by Google / Chrome. All trademarks belong to their owners.

Last updated: 2025-08-24
