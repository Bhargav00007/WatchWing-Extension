class SessionManager {
  static chatHistory = [];
  static STORAGE_KEY = "watchwing_chat_session";

  static initialize() {
    this.loadSessionData();

    // Set up beforeunload to clear session storage when tab closes
    window.addEventListener("beforeunload", () => {
      sessionStorage.removeItem(this.STORAGE_KEY);
    });
  }

  static loadSessionData() {
    const savedSession = sessionStorage.getItem(this.STORAGE_KEY);
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        this.chatHistory = sessionData.chatHistory || [];

        const position = sessionData.position || { x: 0, y: 0 };
        DragManager.setPosition(position);

        // Apply saved position if it exists and is not default
        if (position.x !== 0 || position.y !== 0) {
          const chat = UIManager.elements.chat;
          chat.style.left = position.x + "px";
          chat.style.top = position.y + "px";
          chat.style.bottom = "auto";
          chat.style.right = "auto";
        }
      } catch (e) {
        console.error("Error loading session data:", e);
      }
    }
  }

  static saveSessionData() {
    const sessionData = {
      chatHistory: this.chatHistory,
      position: DragManager.getCurrentPosition(),
      timestamp: Date.now(),
    };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }

  static clearSession() {
    this.chatHistory = [];
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  static addMessage(role, content) {
    this.chatHistory.push({ role, content });
  }

  static getChatHistory() {
    return this.chatHistory;
  }

  static setChatHistory(history) {
    this.chatHistory = history;
  }
}
