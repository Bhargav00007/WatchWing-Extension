class ChatManager {
  static loadingInterval = null;

  static initialize(backendUrl) {
    this.BACKEND_URL = backendUrl;
    this.setupChatEventListeners();
  }

  static setupChatEventListeners() {
    const { btn, input, send, closeBtn } = UIManager.elements;

    // Toggle UI
    btn.addEventListener("click", () => UIManager.openChat());
    closeBtn.addEventListener("click", () => UIManager.closeChat());

    // Send message
    send.addEventListener("click", async () => {
      await this.doSend();
    });

    // Enter to send (Shift+Enter for newline)
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await this.doSend();
      }
    });

    // Auto-size textarea
    input.addEventListener("input", (e) => {
      UIManager.autoSizeTextarea(e.target);
    });
    UIManager.autoSizeTextarea(input);

    // Button accessibility
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  }

  static async doSend() {
    const prompt =
      UIManager.elements.input.value.trim() ||
      "Describe what's in this screen.";
    if (!prompt) return;

    // Add user message to chat history and display
    SessionManager.chatHistory.push({ role: "user", content: prompt });
    this.appendMessage("user", prompt);

    UIManager.elements.input.value = "";
    UIManager.autoSizeTextarea(UIManager.elements.input);
    UIManager.elements.input.blur();

    UIManager.elements.responseEl.focus();
    this.startProgressiveLoading();

    try {
      // Hide chat before capturing
      await UIManager.hideForCapture();

      const captureResp = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "capture" }, (resp) => {
          if (chrome.runtime.lastError)
            return reject(new Error(chrome.runtime.lastError.message));
          resolve(resp);
        });
      });

      if (!captureResp.success) {
        throw new Error(captureResp.error || "capture failed");
      }

      // Show chat again and continue
      UIManager.showAfterCapture();

      const dataUrl = captureResp.dataUrl;

      // Prepare conversation context
      const conversationContext = SessionManager.chatHistory
        .slice(-6)
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const requestBody = {
        image: dataUrl,
        prompt: prompt,
        conversationHistory: conversationContext,
      };

      const res = await fetch(this.BACKEND_URL + "/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();
      if (!res.ok) {
        this.hideLoading();
        this.showError(json.error || res.statusText || "Unknown error");
        return;
      }

      this.hideLoading();

      // AI reply with formatted text
      const aiResponse = json.text || json.result || "No result from AI.";
      const formattedResponse = ResponseFormatter.formatAiResponse(aiResponse);

      // Add AI message to chat history and display
      SessionManager.chatHistory.push({
        role: "assistant",
        content: aiResponse,
      });
      this.appendMessage("ai", formattedResponse, true);

      // Save updated chat history
      SessionManager.saveSessionData();
    } catch (err) {
      // Make sure chat is visible even if there's an error
      UIManager.showAfterCapture();
      this.hideLoading();
      console.error(err);
      this.showError(err.message || String(err));
    }
  }

  static appendMessage(sender, content, isFormatted = false) {
    const responseEl = UIManager.elements.responseEl;

    // Clear welcome message if it's the first actual message
    if (responseEl.querySelector(".sai-welcome-message")) {
      responseEl.innerHTML = "";
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `sai-message ${
      sender === "user" ? "sai-user-message" : "sai-ai-message"
    }`;

    const senderDiv = document.createElement("div");
    senderDiv.className = `sai-sender ${
      sender === "user" ? "sai-user-sender" : "sai-ai-sender"
    }`;
    senderDiv.textContent = sender === "user" ? "You" : "Watchwing";

    messageDiv.appendChild(senderDiv);

    if (sender === "user") {
      // User message with bubble
      const bubbleDiv = document.createElement("div");
      bubbleDiv.className = "sai-user-bubble";
      bubbleDiv.textContent = content;
      messageDiv.appendChild(bubbleDiv);
    } else {
      // AI message without bubble, just formatted content
      const contentDiv = document.createElement("div");
      contentDiv.className = "sai-ai-content";
      if (isFormatted) {
        contentDiv.innerHTML = content;
      } else {
        contentDiv.textContent = content;
      }
      messageDiv.appendChild(contentDiv);

      // Add copy button for AI responses
      this.addCopyButton(messageDiv, contentDiv);
    }

    responseEl.appendChild(messageDiv);

    // Scroll to show the start of new content
    messageDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    return messageDiv;
  }

  static addCopyButton(messageDiv, contentDiv) {
    const copyButton = document.createElement("button");
    copyButton.className = "sai-copy-button";
    copyButton.textContent = "Copy";
    copyButton.title = "Copy response to clipboard";

    copyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const textToCopy = contentDiv.textContent || contentDiv.innerText;
      if (this.copyToClipboard(textToCopy)) {
        copyButton.textContent = "Copied!";
        copyButton.style.color = "#4ade80";
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.style.color = "";
        }, 2000);
      }
    });

    messageDiv.appendChild(copyButton);
  }

  static copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  }

  static showWelcomeMessage() {
    const responseEl = UIManager.elements.responseEl;
    responseEl.innerHTML = "";
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "sai-welcome-message";
    welcomeDiv.textContent = "Hey, welcome to Watchwing";
    responseEl.appendChild(welcomeDiv);
  }

  static restoreChatHistory() {
    const responseEl = UIManager.elements.responseEl;
    responseEl.innerHTML = "";

    if (SessionManager.chatHistory.length === 0) {
      this.showWelcomeMessage();
      return;
    }

    SessionManager.chatHistory.forEach((msg) => {
      if (msg.role === "user") {
        this.appendMessage("user", msg.content);
      } else {
        const formattedResponse = ResponseFormatter.formatAiResponse(
          msg.content
        );
        this.appendMessage("ai", formattedResponse, true);
      }
    });
  }

  static startProgressiveLoading() {
    let step = 1;
    this.showLoading(step);

    this.loadingInterval = setInterval(() => {
      step++;
      if (step <= 5) {
        this.showLoading(step);
      }
    }, 2000);
  }

  static showLoading(step = 1) {
    const loadingEl = UIManager.elements.loadingEl;
    const responseEl = UIManager.elements.responseEl;

    if (!loadingEl) return;

    const loadingSteps = [
      "Capturing screen ...",
      "Sending to AI for analysis...",
      "Analyzing screen content...",
      "Fetching AI insights...",
      "This may take a while...",
      "Finalizing response...",
      "Finalizing response...",
    ];

    const loadingText = loadingSteps[step - 1] || "Processing... please wait";
    loadingEl.querySelector(".sai-loading-text").textContent = loadingText;
    loadingEl.setAttribute("aria-hidden", "false");
    responseEl.style.opacity = "0.35";
    responseEl.style.pointerEvents = "none";
  }

  static hideLoading() {
    this.stopProgressiveLoading();

    const loadingEl = UIManager.elements.loadingEl;
    const responseEl = UIManager.elements.responseEl;

    if (!loadingEl) return;
    loadingEl.setAttribute("aria-hidden", "true");
    responseEl.style.opacity = "1";
    responseEl.style.pointerEvents = "auto";
  }

  static stopProgressiveLoading() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }

  static showError(msg) {
    const responseEl = UIManager.elements.responseEl;
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "#ffb4b4";
    errorDiv.style.fontWeight = "600";
    errorDiv.style.padding = "10px";
    errorDiv.style.textAlign = "center";
    errorDiv.textContent = `Error: ${msg}`;
    responseEl.appendChild(errorDiv);
    errorDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
