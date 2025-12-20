class UIManager {
  static elements = {};
  static isChatOpen = false;
  static isResizing = false;
  static startHeight = 0;
  static startY = 0;

  static createUI() {
    const wrapper = document.createElement("div");
    wrapper.id = "sai-root";
    wrapper.innerHTML = this.getUITemplate();
    document.body.appendChild(wrapper);

    this.cacheElements();
    this.initializeResize();
    this.initializeClearButton();
  }

  static cacheElements() {
    this.elements = {
      panel: document.getElementById("sai-panel"),
      btn: document.getElementById("sai-btn"),
      chat: document.getElementById("sai-chat"),
      input: document.getElementById("sai-input"),
      send: document.getElementById("sai-send"),
      mic: document.getElementById("sai-mic"),
      closeBtn: document.getElementById("sai-close"),
      clearBtn: document.getElementById("sai-clear"),
      responseEl: document.getElementById("sai-response"),
      headerEl: document.getElementById("sai-header"),
      resizeHandle: document.getElementById("sai-resize-handle"),
    };
  }

  static getUITemplate() {
    return `
    <div id="sai-panel" class="sai-closed">
      <button id="sai-btn" title="Ask AI">Ask AI</button>

      <div id="sai-chat" style="display:none;">
        <div id="sai-header">
          <div id="sai-title">Watchwing</div>
          <div id="sai-header-buttons">
            <button id="sai-clear" class="sai-header-btn" title="Clear chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
            <button id="sai-close" class="sai-header-btn">✕</button>
          </div>
        </div>

        <div id="sai-body">
          <div id="sai-response"></div>
        </div>

        <div id="sai-controls">
          <button id="sai-mic" title="Voice input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
          <textarea id="sai-input" placeholder="Ask about this screen..."></textarea>
          <button id="sai-send" title="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div id="sai-resize-handle" class="sai-resize-handle" title="Resize window"></div>
      </div>
    </div>`;
  }

  static injectStyles() {
    const style = document.createElement("style");
    style.textContent = Styles.getStyles();
    document.head.appendChild(style);
  }

  static initializeResize() {
    const resizeHandle = this.elements.resizeHandle;
    const chat = this.elements.chat;

    if (!resizeHandle || !chat) return;

    resizeHandle.addEventListener("mousedown", this.startResize.bind(this));
    resizeHandle.addEventListener(
      "touchstart",
      this.startResizeTouch.bind(this)
    );
    resizeHandle.addEventListener("selectstart", (e) => e.preventDefault());
    resizeHandle.addEventListener("dragstart", (e) => e.preventDefault());
  }

  static initializeClearButton() {
    const clearBtn = this.elements.clearBtn;
    if (!clearBtn) return;

    clearBtn.addEventListener("click", () => {
      this.clearChat();
    });
  }

  static clearChat() {
    const responseEl = this.elements.responseEl;
    if (!responseEl) return;

    responseEl.innerHTML = "";

    if (typeof SessionManager !== "undefined") {
      SessionManager.clearConversationHistory();
    }

    if (typeof ChatManager !== "undefined" && ChatManager.clearHistory) {
      ChatManager.clearHistory();
    }

    this.showClearConfirmation();

    if (this.elements.input) {
      this.elements.input.focus();
    }
  }

  static showClearConfirmation() {
    const responseEl = this.elements.responseEl;
    if (!responseEl) return;

    const confirmation = document.createElement("div");
    confirmation.className = "sai-clear-confirmation";
    confirmation.textContent = "Chat cleared";

    responseEl.appendChild(confirmation);

    setTimeout(() => {
      if (confirmation.parentNode === responseEl) {
        responseEl.removeChild(confirmation);
      }
    }, 1500);
  }

  static startResize(e) {
    e.preventDefault();
    this.isResizing = true;
    this.startHeight = this.elements.chat.offsetHeight;
    this.startY = e.clientY;

    document.addEventListener("mousemove", this.handleResize.bind(this));
    document.addEventListener("mouseup", this.stopResize.bind(this));

    this.elements.chat.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
  }

  static startResizeTouch(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    this.isResizing = true;
    this.startHeight = this.elements.chat.offsetHeight;
    this.startY = e.touches[0].clientY;

    document.addEventListener("touchmove", this.handleResizeTouch.bind(this));
    document.addEventListener("touchend", this.stopResize.bind(this));

    this.elements.chat.style.userSelect = "none";
  }

  static handleResize(e) {
    if (!this.isResizing) return;

    const deltaY = this.startY - e.clientY;
    const newHeight = this.startHeight + deltaY;

    this.setChatHeight(newHeight);
  }

  static handleResizeTouch(e) {
    if (!this.isResizing || e.touches.length !== 1) return;

    const deltaY = this.startY - e.touches[0].clientY;
    const newHeight = this.startHeight + deltaY;

    this.setChatHeight(newHeight);
  }

  static setChatHeight(newHeight) {
    const chat = this.elements.chat;
    const minHeight = 320;
    const maxHeight = window.innerHeight * 0.9;

    const constrainedHeight = Math.max(
      minHeight,
      Math.min(newHeight, maxHeight)
    );

    chat.style.height = `${constrainedHeight}px`;

    if (typeof SessionManager !== "undefined") {
      SessionManager.saveSessionData();
    }
  }

  static stopResize() {
    this.isResizing = false;

    document.removeEventListener("mousemove", this.handleResize.bind(this));
    document.removeEventListener("mouseup", this.stopResize.bind(this));
    document.removeEventListener(
      "touchmove",
      this.handleResizeTouch.bind(this)
    );
    document.removeEventListener("touchend", this.stopResize.bind(this));

    this.elements.chat.style.userSelect = "";
    document.body.style.cursor = "";
  }

  static openChat() {
    this.elements.btn.style.display = "none";
    this.elements.chat.style.display = "flex";
    this.elements.input.focus();
    this.isChatOpen = true;

    if (typeof DragManager !== "undefined") {
      DragManager.setDefaultPosition();
    }
    this.restoreSavedHeight();
  }

  static closeChat() {
    this.elements.chat.style.display = "none";
    this.elements.btn.style.display = "inline-block";
    this.elements.input.value = "";
    if (typeof ChatManager !== "undefined") {
      ChatManager.hideLoading();
    }
    this.isChatOpen = false;

    if (typeof SessionManager !== "undefined") {
      SessionManager.saveSessionData();
    }
  }

  static restoreSavedHeight() {
    if (typeof SessionManager !== "undefined") {
      const savedHeight = SessionManager.getSavedHeight();
      if (savedHeight) {
        this.setChatHeight(savedHeight);
      }
    }
  }

  static toggleAskButton(show) {
    this.elements.btn.style.display = show ? "inline-block" : "none";
  }

  static autoSizeTextarea(textarea) {
    textarea.style.height = "auto";
    const maxHeight = 120;
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
