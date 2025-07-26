const TabUtils = {
  async getAllTabs() {
    return await chrome.tabs.query({});
  },
  async removeDuplicates() {
    const tabs = await TabUtils.getAllTabs();
    const urlGroups = new Map();
    
    // Group tabs by URL
    for (const tab of tabs) {
      if (!tab.url) continue;
      
      // Skip protected URLs from duplicate removal
      const protectedUrls = [
        'chrome://extensions/',
        'chrome://settings/',
        'edge://extensions/',
        'edge://settings/'
      ];
      
      const isProtected = protectedUrls.some(protectedUrl => 
        tab.url.startsWith(protectedUrl)
      );
      
      if (isProtected) continue;
      
      if (!urlGroups.has(tab.url)) {
        urlGroups.set(tab.url, []);
      }
      urlGroups.get(tab.url).push(tab);
    }
    
    // For each URL group, keep the most recently accessed tab and remove others
    for (const [url, tabGroup] of urlGroups) {
      if (tabGroup.length > 1) {
        // Sort by lastAccessed (most recent first), or by id if lastAccessed is not available
        tabGroup.sort((a, b) => {
          if (a.lastAccessed && b.lastAccessed) {
            return b.lastAccessed - a.lastAccessed;
          }
          return b.id - a.id; // Newer tabs usually have higher IDs
        });
        
        // Remove all but the first (most recent) tab
        for (let i = 1; i < tabGroup.length; i++) {
          await chrome.tabs.remove(tabGroup[i].id);
        }
      }
    }
  },
  async removeEmptyTabs() {
    const tabs = await TabUtils.getAllTabs();
    
    // Define tabs that should NOT be closed (user might be actively using them)
    const protectedUrls = [
      'chrome://extensions/',
      'chrome://settings/',
      'chrome://bookmarks/',
      'chrome://history/',
      'chrome://downloads/',
      'chrome://flags/',
      'chrome://apps/',
      'chrome://devtools/',
      'edge://extensions/',
      'edge://settings/',
      'edge://bookmarks/',
      'edge://history/',
      'edge://downloads/',
      'edge://flags/',
      'edge://apps/'
    ];
    
    for (const tab of tabs) {
      // Skip if no URL
      if (!tab.url) continue;
      
      // Only remove truly empty tabs
      if (tab.url === "about:blank") {
        await chrome.tabs.remove(tab.id);
        continue;
      }
      
      // Skip protected URLs that users might be actively using
      const isProtected = protectedUrls.some(protectedUrl => 
        tab.url.startsWith(protectedUrl)
      );
      
      if (isProtected) {
        continue; // Don't remove these tabs
      }
      
      // Remove other internal browser pages that are typically not actively used
      if (tab.url.startsWith("chrome://newtab") || 
          tab.url.startsWith("chrome://new-tab-page") ||
          tab.url.startsWith("edge://newtab") ||
          tab.url.startsWith("edge://new-tab-page") ||
          tab.url === "chrome://") {
        await chrome.tabs.remove(tab.id);
      }
    }
  },
  async cleanTabs() {
    // Remove duplicates and empty tabs in one operation
    console.log('Starting tab cleanup...');
    await TabUtils.removeDuplicates();
    await TabUtils.removeEmptyTabs();
    console.log('Tab cleanup completed');
  }
};

if (typeof window !== "undefined") window.TabUtils = TabUtils;
