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

    // Stop speech when closing the chat
    const closeBtn = document.getElementById("sai-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        ChatManager.stopSpeech();
        ChatManager.stopVoiceInput();
      });
    }

    // Stop speech when sending new messages
    const sendBtn = document.getElementById("sai-send");
    if (sendBtn) {
      const originalSend = sendBtn.onclick;
      sendBtn.onclick = function (e) {
        ChatManager.stopSpeech();
        if (originalSend) originalSend.call(this, e);
      };
    }

    // Pre-load voices
    if ("speechSynthesis" in window) {
      // Force voice loading
      speechSynthesis.getVoices();

      // Re-try voice loading after a delay
      setTimeout(() => {
        speechSynthesis.getVoices();
      }, 1000);
    }
  }

  // Global access for external control
  window.__watchwing = {
    open: () => UIManager.openChat(),
    close: () => {
      ChatManager.stopSpeech();
      ChatManager.stopVoiceInput();
      UIManager.closeChat();
    },
    speak: (text) => {
      // External API to trigger speech
      const responseEl = document.getElementById("sai-response");
      if (responseEl) {
        const lastAiMessage = responseEl.querySelector(
          ".sai-ai-message:last-child"
        );
        if (lastAiMessage) {
          const voiceButton = lastAiMessage.querySelector(".sai-voice-button");
          const contentDiv = lastAiMessage.querySelector(".sai-ai-content");
          if (voiceButton && contentDiv) {
            ChatManager.speakMessage(lastAiMessage, contentDiv, voiceButton);
          }
        }
      }
    },
    startVoiceInput: () => ChatManager.startVoiceInput(),
    stopVoiceInput: () => ChatManager.stopVoiceInput(),
    stopSpeech: () => ChatManager.stopSpeech(),
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  } else {
    initializeExtension();
  }
})();
