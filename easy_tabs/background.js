/**
 * background.js
 *
 * Background service worker for Easy Tabs extension.
 * Handles user preference for popup vs side panel mode.
 */

// Initialize extension on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  // Set default preference if not exists
  const result = await chrome.storage.sync.get('displayMode');
  if (!result.displayMode) {
    await chrome.storage.sync.set({ displayMode: 'panel' });
  }
  await updateDisplayMode();
});

chrome.runtime.onStartup.addListener(async () => {
  await updateDisplayMode();
});

// Listen for preference changes
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync' && changes.displayMode) {
    await updateDisplayMode();
  }
});

// Update the extension behavior based on user preference
async function updateDisplayMode() {
  const result = await chrome.storage.sync.get('displayMode');
  const mode = result.displayMode || 'panel';
  
  if (mode === 'panel') {
    // Configure for side panel
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    chrome.action.setPopup({ popup: '' });
  } else {
    // Configure for popup
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    chrome.action.setPopup({ popup: 'popup/popup.html' });
  }
}
