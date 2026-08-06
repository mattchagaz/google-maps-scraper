// Thin wrappers around chrome.* APIs used by the popup.

const SESSION_KEY = 'gmapsPopupSession';

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getMapsTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  return tab.url.includes('google.com/maps') || tab.url.includes('maps.google.com') ? tab : null;
}

export function saveSession(data) {
  return chrome.storage.session.set({ [SESSION_KEY]: data });
}

export function loadSession() {
  return new Promise((resolve) => {
    chrome.storage.session.get(SESSION_KEY, (result) => {
      resolve(result?.[SESSION_KEY] || null);
    });
  });
}
