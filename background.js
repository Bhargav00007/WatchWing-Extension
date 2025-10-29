// background.js - MV3 service worker
chrome.runtime.onInstalled.addListener(() => {});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "capture") {
    // Capture the visible area of the active tab.
    try {
      chrome.tabs.captureVisibleTab(
        { format: "png", quality: 80 },
        (dataUrl) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true, dataUrl });
          }
        }
      );
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    // Return true to indicate we'll call sendResponse asynchronously.
    return true;
  }

  if (msg?.action === "getCurrentUrl") {
    // Get current active tab URL and title
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendResponse({
            success: true,
            url: tabs[0].url,
            title: tabs[0].title,
          });
        } else {
          sendResponse({ success: false, error: "No active tab found" });
        }
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true; // Will respond asynchronously
  }

  if (msg?.action === "getActiveTab") {
    // Get complete active tab information
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendResponse({
            success: true,
            tab: {
              id: tabs[0].id,
              url: tabs[0].url,
              title: tabs[0].title,
            },
          });
        } else {
          sendResponse({ success: false, error: "No active tab found" });
        }
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true; // Will respond asynchronously
  }

  // Handle any other message types if needed
  if (msg?.action === "ping") {
    sendResponse({ success: true, message: "Background worker is active" });
    return false;
  }
});

// Optional: Handle tab updates to track URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
  }
});

// Optional: Handle tab activation to track current tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {});
});
