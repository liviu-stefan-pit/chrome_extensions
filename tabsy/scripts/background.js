chrome.runtime.onInstalled.addListener(() => {
  console.log("Tab Manager Extension installed.");
  chrome.sidePanel.setOptions({
    path: "sidepanel/panel.html",
    enabled: true
  });
});