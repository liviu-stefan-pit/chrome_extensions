export function onInstalledOnce(cb) {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") cb(details);
  });
}

export function isYouTubeUrl(url) {
  try {
    const u = new URL(url);
    return /(^|\.)youtube\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}
