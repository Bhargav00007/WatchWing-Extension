class UIManager {
  static elements = {};
  static isChatOpen = false;

  static createUI() {
    // Create main container
    const wrapper = document.createElement("div");
    wrapper.id = "sai-root";
    wrapper.innerHTML = this.getUITemplate();
    document.body.appendChild(wrapper);

    // Cache element references
    this.cacheElements();
  }

  static cacheElements() {
    this.elements = {
      panel: document.getElementById("sai-panel"),
      btn: document.getElementById("sai-btn"),
      chat: document.getElementById("sai-chat"),
      input: document.getElementById("sai-input"),
      send: document.getElementById("sai-send"),
      closeBtn: document.getElementById("sai-close"),
      responseEl: document.getElementById("sai-response"),
      loadingEl: document.getElementById("sai-loading"),
      headerEl: document.getElementById("sai-header"),
    };
  }

  static getUITemplate() {
    return `
    <div id="sai-panel" class="sai-closed" aria-live="polite" aria-atomic="true">
      <button id="sai-btn" title="Ask AI">Ask AI</button>

      <div id="sai-chat" role="dialog" aria-label="Watchwing assistant" style="display:none;">
        <div id="sai-header">
          <div id="sai-title">Watchwing</div>
          <button id="sai-close" aria-label="Close">✕</button>
        </div>

        <div id="sai-body">
          <div id="sai-response" aria-live="polite"></div>

          <div id="sai-loading" aria-hidden="true">
            <div class="sai-spinner"></div>
            <div class="sai-loading-text">Processing... please wait</div>
          </div>
        </div>

        <div id="sai-controls">
          <textarea id="sai-input" placeholder="Ask something about this screen..."></textarea>
          <button id="sai-send" title="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
  }

  static injectStyles() {
    const style = document.createElement("style");
    style.textContent = Styles.getStyles();
    document.head.appendChild(style);
  }

  static openChat() {
    this.elements.btn.style.display = "none";
    this.elements.chat.style.display = "flex";
    this.elements.input.focus();
    this.isChatOpen = true;

    // Reset to default position
    DragManager.setDefaultPosition();
  }

  static closeChat() {
    this.elements.chat.style.display = "none";
    this.elements.btn.style.display = "inline-block";
    this.elements.input.value = "";
    ChatManager.hideLoading();
    this.isChatOpen = false;

    // Save session data when closing
    SessionManager.saveSessionData();
  }

  static toggleAskButton(show) {
    this.elements.btn.style.display = show ? "inline-block" : "none";
  }

  static autoSizeTextarea(textarea) {
    textarea.style.height = "auto";
    const maxHeight = 160;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  }

  static hideForCapture() {
    this.elements.chat.style.display = "none";
    this.elements.btn.style.display = "none";
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  static showAfterCapture() {
    this.elements.chat.style.display = "flex";
    this.elements.btn.style.display = "none";
  }

  static getElement(id) {
    return this.elements[id] || document.getElementById(id);
  }
}
