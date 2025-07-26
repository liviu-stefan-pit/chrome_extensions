const TabUtils = {
  async getAllTabs() {
    return await chrome.tabs.query({});
  },
  async removeDuplicates() {
    const tabs = await this.getAllTabs();
    const seen = new Set();
    for (const tab of tabs) {
      if (!tab.url) continue;
      if (seen.has(tab.url)) await chrome.tabs.remove(tab.id);
      else seen.add(tab.url);
    }
  },
  async removeEmptyTabs() {
    const tabs = await this.getAllTabs();
    for (const tab of tabs) {
      if (!tab.url || tab.url === "about:blank" || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        await chrome.tabs.remove(tab.id);
      }
    }
  }
};

if (typeof window !== "undefined") window.TabUtils = TabUtils;
