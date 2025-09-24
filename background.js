// background.js - MV3 service worker
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
});
