(() => {
  const BACKEND_URL = "https://watchwing.vercel.app";

  // Prevent duplicate injection
  if (window.__screenAiInjected) return;
  window.__screenAiInjected = true;

  // Initialize all modules
  function initializeExtension() {
    try {
      // Create and inject UI
      UIManager.createUI();
      UIManager.injectStyles();

      // Initialize session management
      SessionManager.initialize();

      // Set up drag functionality
      DragManager.initialize();

      // Initialize chat functionality
      ChatManager.initialize(BACKEND_URL);

      // Set up event listeners
      setupEventListeners();

      // Load any existing chat history
      if (SessionManager.chatHistory.length === 0) {
        ChatManager.showWelcomeMessage();
      } else {
        ChatManager.restoreChatHistory();
      }

      console.log("Watchwing AI extension initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Watchwing AI:", error);
    }
  }

  function setupEventListeners() {
    // Chrome runtime messages
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "toggleAskBtn") {
        UIManager.toggleAskButton(msg.show);
      }
    });
  }

  // Global access for external control
  window.__watchwing = {
    open: () => UIManager.openChat(),
    close: () => UIManager.closeChat(),
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  } else {
    initializeExtension();
  }
})();
