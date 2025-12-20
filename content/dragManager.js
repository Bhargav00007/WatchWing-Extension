class DragManager {
  static isDragging = false;
  static dragOffset = { x: 0, y: 0 };
  static currentPosition = { x: 0, y: 0 };

  static initialize() {
    const headerEl = UIManager.elements.headerEl;
    if (!headerEl) return;

    headerEl.addEventListener("mousedown", (e) => this.startDrag(e));
    document.addEventListener("mousemove", (e) => this.onDrag(e));
    document.addEventListener("mouseup", () => this.stopDrag());

    headerEl.addEventListener("touchstart", (e) => this.startDragTouch(e));
    document.addEventListener("touchmove", (e) => this.onDragTouch(e));
    document.addEventListener("touchend", () => this.stopDrag());
  }

  static startDrag(e) {
    if (UIManager.isResizing) return;

    this.isDragging = true;
    const chat = UIManager.elements.chat;
    const rect = chat.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;
    UIManager.elements.headerEl.style.cursor = "grabbing";
    e.preventDefault();
  }

  static startDragTouch(e) {
    if (e.touches.length === 1 && !UIManager.isResizing) {
      this.isDragging = true;
      const chat = UIManager.elements.chat;
      const rect = chat.getBoundingClientRect();
      this.dragOffset.x = e.touches[0].clientX - rect.left;
      this.dragOffset.y = e.touches[0].clientY - rect.top;
      UIManager.elements.headerEl.style.cursor = "grabbing";
      e.preventDefault();
    }
  }

  static onDrag(e) {
    if (!this.isDragging) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    this.setChatPosition(x, y);
    e.preventDefault();
  }

  static onDragTouch(e) {
    if (!this.isDragging || e.touches.length !== 1) return;

    const x = e.touches[0].clientX - this.dragOffset.x;
    const y = e.touches[0].clientY - this.dragOffset.y;

    this.setChatPosition(x, y);
    e.preventDefault();
  }

  static stopDrag() {
    this.isDragging = false;
    UIManager.elements.headerEl.style.cursor = "grab";
    SessionManager.saveSessionData();
  }

  static setChatPosition(x, y) {
    const chat = UIManager.elements.chat;

    const maxX = window.innerWidth - chat.offsetWidth;
    const maxY = window.innerHeight - chat.offsetHeight;

    this.currentPosition.x = Math.max(0, Math.min(x, maxX));
    this.currentPosition.y = Math.max(0, Math.min(y, maxY));

    chat.style.left = this.currentPosition.x + "px";
    chat.style.top = this.currentPosition.y + "px";
    chat.style.bottom = "auto";
    chat.style.right = "auto";
  }

  static setDefaultPosition() {
    const chat = UIManager.elements.chat;
    chat.style.bottom = "52px";
    chat.style.right = "22px";
    chat.style.left = "auto";
    chat.style.top = "auto";
    this.currentPosition = { x: 0, y: 0 };
  }

  static getCurrentPosition() {
    return this.currentPosition;
  }

  static setPosition(position) {
    this.currentPosition = position;
  }
}
