// service-worker.js

// A function to enable the action icon on permitted sites
async function updateActionIcon(tab) {
  if (tab && tab.url) {
    // Check if the URL is a permitted one.
    // Extensions cannot run on chrome:// URLs or the webstore.
    const isAllowed = !tab.url.startsWith("chrome://") && !tab.url.startsWith("https://chrome.google.com");
    
    if (isAllowed) {
      await chrome.action.enable(tab.id);
    } else {
      await chrome.action.disable(tab.id);
    }
  }
}

// Listen for when a tab is updated and check if we should enable the action
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We are only interested in the 'complete' status
  if (changeInfo.status === 'complete') {
    updateActionIcon(tab);
  }
});

// Listen for when the active tab changes and check if we should enable the action
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateActionIcon(tab);
});


// Open the side panel when the action icon is clicked.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
