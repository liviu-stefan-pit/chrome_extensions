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

// Handle new tabs to ensure side panel is available
chrome.tabs.onCreated.addListener(async (tab) => {
  const result = await chrome.storage.sync.get('displayMode');
  const mode = result.displayMode || 'panel';
  
  if (mode === 'panel') {
    try {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        enabled: true,
        path: 'popup/popup.html'
      });
    } catch (error) {
      // Ignore errors for system pages or restricted tabs
    }
  }
});

// Handle new windows to ensure side panel is available
chrome.windows.onCreated.addListener(async (window) => {
  const result = await chrome.storage.sync.get('displayMode');
  const mode = result.displayMode || 'panel';
  
  if (mode === 'panel') {
    try {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'popup/popup.html'
      });
    } catch (error) {
      // Ignore errors
    }
  }
});

// Update the extension behavior based on user preference
async function updateDisplayMode() {
  const result = await chrome.storage.sync.get('displayMode');
  const mode = result.displayMode || 'panel';
  
  if (mode === 'panel') {
    // Configure for side panel
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    await chrome.action.setPopup({ popup: '' });
    
    // Enable side panel for all tabs to keep it persistent
    try {
      // Get all windows and enable side panel for each
      const windows = await chrome.windows.getAll();
      for (const window of windows) {
        await chrome.sidePanel.setOptions({
          tabId: undefined, // Apply to all tabs in the window
          enabled: true,
          path: 'popup/popup.html'
        });
      }
    } catch (error) {
      console.log('Side panel setup:', error.message);
    }
  } else {
    // Configure for popup
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    await chrome.action.setPopup({ popup: 'popup/popup.html' });
  }
}
