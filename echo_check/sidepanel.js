// sidepanel.js

// Function to get the title from the current tab.
// It will first check for permissions and request them if necessary.
async function getTitle() {
  const contentDiv = document.getElementById('content');
  contentDiv.textContent = 'Checking permissions...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // --- SECURITY GUARD: Check for restricted URLs ---
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        contentDiv.textContent = 'Cannot access restricted URLs.';
        return;
    }

    const origin = new URL(tab.url).origin;

    // --- PERMISSION CHECK ---
    // Check if the extension already has permission for the current site.
    const hasPermission = await chrome.permissions.contains({
      origins: [origin]
    });

    if (hasPermission) {
      contentDiv.textContent = 'Permission granted. Fetching title...';
      injectScript(tab.id);
    } else {
      // --- PERMISSION REQUEST ---
      // If permission is not granted, request it from the user.
      contentDiv.textContent = 'Requesting permission for this site...';
      chrome.permissions.request({
        origins: [origin]
      }, (granted) => {
        if (granted) {
          contentDiv.textContent = 'Permission granted. Fetching title...';
          injectScript(tab.id);
        } else {
          contentDiv.textContent = 'Permission denied. Cannot access page content.';
        }
      });
    }
  } catch (error) {
    console.error('Error in getTitle:', error);
    contentDiv.textContent = `Error: ${error.message}`;
  }
}

// Function to inject the script and retrieve the title.
async function injectScript(tabId) {
  const contentDiv = document.getElementById('content');
  try {
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.title,
    });

    if (injectionResults && injectionResults[0]) {
      contentDiv.textContent = `Title: ${injectionResults[0].result}`;
    } else {
      contentDiv.textContent = 'Could not retrieve title.';
    }
  } catch (error) {
    console.error('Failed to inject script:', error);
    contentDiv.textContent = `Error: ${error.message}`;
  }
}

document.getElementById('getPageTitle').addEventListener('click', getTitle);
