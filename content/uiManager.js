class UIManager {
  static elements = {};
  static isChatOpen = false;
  static isResizing = false;
  static startHeight = 0;
  static startY = 0;

  static createUI() {
    // Create main container
    const wrapper = document.createElement("div");
    wrapper.id = "sai-root";
    wrapper.innerHTML = this.getUITemplate();
    document.body.appendChild(wrapper);

    // Cache element references
    this.cacheElements();

    // Initialize resize functionality
    this.initializeResize();
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
      responseEl: document.getElementById("sai-response"),
      loadingEl: document.getElementById("sai-loading"),
      headerEl: document.getElementById("sai-header"),
      resizeHandle: document.getElementById("sai-resize-handle"),
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
        
        <!-- Resize Handle -->
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

    // Mouse events for resize
    resizeHandle.addEventListener("mousedown", this.startResize.bind(this));

    // Touch events for mobile resize
    resizeHandle.addEventListener(
      "touchstart",
      this.startResizeTouch.bind(this)
    );

    // Prevent text selection during resize
    resizeHandle.addEventListener("selectstart", (e) => e.preventDefault());
    resizeHandle.addEventListener("dragstart", (e) => e.preventDefault());
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
    const minHeight = 320; // Minimum height in pixels
    const maxHeight = window.innerHeight * 0.9; // 80% of viewport height

    // Constrain height within limits
    const constrainedHeight = Math.max(
      minHeight,
      Math.min(newHeight, maxHeight)
    );

    chat.style.height = `${constrainedHeight}px`;

    // Update session data with new height
    SessionManager.saveSessionData();
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

    // Reset to default position and restore saved height
    DragManager.setDefaultPosition();
    this.restoreSavedHeight();
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

  static restoreSavedHeight() {
    // Restore saved height from session if available
    const savedHeight = SessionManager.getSavedHeight();
    if (savedHeight) {
      this.setChatHeight(savedHeight);
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
