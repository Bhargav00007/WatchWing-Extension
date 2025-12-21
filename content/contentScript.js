(() => {
  const BACKEND_URL = "https://watchwing.vercel.app/";

  if (window.__screenAiInjected) return;
  window.__screenAiInjected = true;

  function initializeExtension() {
    try {
      UIManager.createUI();
      UIManager.injectStyles();
      SessionManager.initialize();
      DragManager.initialize();
      ChatManager.initialize(BACKEND_URL);
      setupEventListeners();

      if (SessionManager.chatHistory.length === 0) {
        ChatManager.showWelcomeMessage();
      } else {
        ChatManager.restoreChatHistory();
      }
    } catch (error) {
      console.error("Failed to initialize Watchwing AI:", error);
    }
  }

  function setupEventListeners() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "toggleAskBtn") {
        UIManager.toggleAskButton(msg.show);
      }
    });

    const closeBtn = document.getElementById("sai-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        ChatManager.stopSpeech();
        ChatManager.stopVoiceInput();
      });
    }

    const sendBtn = document.getElementById("sai-send");
    if (sendBtn) {
      const originalSend = sendBtn.onclick;
      sendBtn.onclick = function (e) {
        ChatManager.stopSpeech();
        if (originalSend) originalSend.call(this, e);
      };
    }

    if ("speechSynthesis" in window) {
      speechSynthesis.getVoices();
      setTimeout(() => {
        speechSynthesis.getVoices();
      }, 1000);
    }

    window.addEventListener("resize", () => {
      SessionManager.saveSessionData();
    });

    document.addEventListener("click", (e) => {
      if (
        e.target.matches(
          ".sai-clickable-link, .sai-clickable-timestamp, .sai-clickable-email"
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  window.__watchwing = {
    open: () => UIManager.openChat(),
    close: () => {
      ChatManager.stopSpeech();
      ChatManager.stopVoiceInput();
      UIManager.closeChat();
    },
    speak: (text) => {
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
    resize: (height) => {
      UIManager.setChatHeight(height);
    },
    seekToTimestamp: (seconds) => ChatManager.seekToTimestamp(seconds),
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  } else {
    initializeExtension();
  }
})();
