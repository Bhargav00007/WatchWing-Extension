(() => {
  const BACKEND_URL = "https://watchwing.vercel.app"; // <-- replace with your server URL in production

  if (window.__screenAiInjected) return;
  window.__screenAiInjected = true;

  // Create container
  const wrapper = document.createElement("div");
  wrapper.id = "sai-root";
  wrapper.innerHTML = `
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
    </div>
  `;
  document.body.appendChild(wrapper);

  // Inject CSS styles (dark mode, no shadows)
  const style = document.createElement("style");
  style.textContent = `
    /* Panel container */
    #sai-panel {
      position: fixed;
      bottom: 52px;
      right: 22px;
      z-index: 2147483647;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
    }

    /* Ask AI button (dark, no shadow) */
    #sai-btn {
      background: linear-gradient(180deg, #0f172a, #0b1220);
      color: #e6f0ff;
      border: 1px solid rgba(255,255,255,0.06);
      padding: 10px 16px;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: transform .12s ease, background .12s ease;
      backdrop-filter: blur(6px);
      opacity: 0.7;
    }
    #sai-btn:hover { background: linear-gradient(180deg, #111c3a, #0d162e); opacity: 0.85; }

    /* Chat panel (dark, no shadow, tighter padding) */
    #sai-chat {
      display:flex;
      flex-direction: column;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 420px;
      max-height: calc(100vh - 48px);
      background: linear-gradient(180deg, #071028, #0b1220);
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.04);
      padding: 6px;
      gap: 8px;
      color: #e6eef8;
      overflow: hidden;
    }

    /* Header */
    #sai-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 8px;
      padding: 4px 6px;
      border-bottom: 1px solid rgba(255,255,255,0.02);
    }
    #sai-title {
      font-weight:700;
      font-size:15px;
      letter-spacing: 0.2px;
      color: #e8f3ff;
    }
    #sai-close {
      background: transparent;
      border: none;
      color: #9fb4d6;
      font-size: 16px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
    }
    #sai-close:hover { background: rgba(255,255,255,0.02); color: #ffffff; }

    /* Body (response container) */
    #sai-body {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      overflow: hidden;
    }

    /* Response area */
    #sai-response {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 10px;
      border-radius: 10px;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.012));
      color: #dbeafe;
      font-size: 14px;
      line-height: 1.45;
    }

    /* Chat separators */
    .sai-separator {
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 8px 0;
    }

    /* Loading overlay (centered) */
    #sai-loading {
      position: absolute;
      display: none;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      align-items: center;
      flex-direction: column;
      gap: 10px;
      z-index: 10;
      text-align: center;
    }
    #sai-loading[aria-hidden="false"] { display:flex; }

    .sai-spinner {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.06);
      border-top-color: #7dd3fc;
      animation: sai-spin 1s linear infinite;
      backdrop-filter: blur(2px);
    }
    @keyframes sai-spin { to { transform: rotate(360deg); } }

    .sai-loading-text {
      color: #cfeefe;
      font-size: 13px;
      opacity: 0.95;
    }

    /* Controls: input + send */
    #sai-controls {
      display:flex;
      gap:6px;
      align-items: center;
      padding: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
    }

    #sai-input {
      flex: 1 1 auto;
      min-height: 40px;
      max-height: 160px;
      resize: none;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.04);
      background: rgba(6,12,20,0.55);
      color: #e6f4ff;
      font-size: 14px;
      line-height: 1.4;
      outline: none;
      overflow-y: auto;
    }
    #sai-input::placeholder { color: rgba(230,240,255,0.45); }

    #sai-send {
      display:flex;
      align-items:center;
      justify-content:center;
      height: 40px;
      width: 44px;
      background: linear-gradient(180deg, #0ea5e9, #0284c7);
      color: #002233;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: transform .12s ease;
    }
    #sai-send:hover { background: linear-gradient(180deg, #38bdf8, #0284c7); }
    #sai-send:active { transform: translateY(1px); }

    /* Scrollbar tweaks for dark mode */
    #sai-response::-webkit-scrollbar, #sai-input::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    #sai-response::-webkit-scrollbar-thumb, #sai-input::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.06);
      border-radius: 8px;
    }

    /* Chat bubble styles - User only */
    .sai-message {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
    }

    .sai-user-message {
      align-items: flex-end;
    }

    .sai-ai-message {
      align-items: flex-start;
    }

    .sai-user-bubble {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      padding: 10px 14px;
      border-radius: 16px;
      border-bottom-right-radius: 6px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .sai-ai-content {
      background: rgba(255, 255, 255, 0.03);
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 4px;
      font-size: 14px;
      line-height: 1.5;
      color: #e6f4ff;
    }

    .sai-sender {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
      padding: 0 4px;
    }

    .sai-user-sender {
      color: #7dd3fc;
      text-align: right;
    }

    .sai-ai-sender {
      color: #a7e3ff;
      text-align: left;
    }

    /* Text formatting styles for AI responses */
    .sai-ai-content b, .sai-ai-content strong {
      font-weight: 700;
      color: #a7e3ff;
    }
    
    .sai-ai-content em, .sai-ai-content i {
      font-style: italic;
      color: #cfeefe;
    }
    
    .sai-ai-content h1, .sai-ai-content h2, .sai-ai-content h3 {
      font-weight: 700;
      margin: 12px 0 8px 0;
      color: #7dd3fc;
    }
    
    .sai-ai-content h1 {
      font-size: 16px;
      border-bottom: 1px solid rgba(125, 211, 252, 0.2);
      padding-bottom: 4px;
    }
    
    .sai-ai-content h2 {
      font-size: 15px;
    }
    
    .sai-ai-content h3 {
      font-size: 14px;
    }
    
    .sai-ai-content p {
      margin: 8px 0;
    }
    
    .sai-ai-content ul, .sai-ai-content ol {
      margin: 8px 0;
      padding-left: 20px;
    }
    
    .sai-ai-content li {
      margin: 4px 0;
    }
    
    .sai-ai-content hr {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 12px 0;
    }
    
    .sai-ai-content code {
      background: rgba(255,255,255,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      color: #bae6fd;
    }
    
    .sai-ai-content blockquote {
      border-left: 3px solid rgba(125, 211, 252, 0.4);
      margin: 8px 0;
      padding-left: 12px;
      color: #cfeefe;
    }
  `;
  document.head.appendChild(style);

  // Element refs
  const btn = document.getElementById("sai-btn");
  const chat = document.getElementById("sai-chat");
  const input = document.getElementById("sai-input");
  const send = document.getElementById("sai-send");
  const closeBtn = document.getElementById("sai-close");
  const responseEl = document.getElementById("sai-response");
  const loadingEl = document.getElementById("sai-loading");

  // Session storage for chat history
  let chatHistory = [];
  let loadingInterval;

  // Helper: show loading overlay with progressive states
  function showLoading(step = 1) {
    if (!loadingEl) return;

    const loadingSteps = [
      "Capturing screen image...",
      "Sending to AI for analysis...",
      "Analyzing image content...",
      "Fetching AI insights...",
      "This may take a while...",
      "Finalizing response...",
    ];

    const loadingText = loadingSteps[step - 1] || "Processing... please wait";
    loadingEl.querySelector(".sai-loading-text").textContent = loadingText;
    loadingEl.setAttribute("aria-hidden", "false");
    responseEl.style.opacity = "0.35";
    responseEl.style.pointerEvents = "none";
  }

  // Progressive loading animation
  function startProgressiveLoading() {
    let step = 1;
    showLoading(step);

    loadingInterval = setInterval(() => {
      step++;
      if (step <= 5) {
        showLoading(step);
      }
    }, 2000); // Change loading text every 1.5 seconds
  }

  function stopProgressiveLoading() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
  }

  function hideLoading() {
    stopProgressiveLoading();
    if (!loadingEl) return;
    loadingEl.setAttribute("aria-hidden", "true");
    responseEl.style.opacity = "1";
    responseEl.style.pointerEvents = "auto";
  }

  // Toggle UI
  btn.addEventListener("click", () => {
    btn.style.display = "none";
    chat.style.display = "flex";
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    chat.style.display = "none";
    btn.style.display = "inline-block";
    // Clear chat history when closing
    chatHistory = [];
    responseEl.textContent = "";
    input.value = "";
    hideLoading();
  });

  // Autosize textarea
  function autoSizeTextarea(el) {
    el.style.height = "auto";
    const maxHeight = 160; // px
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  }
  input.addEventListener("input", (e) => autoSizeTextarea(e.target));
  autoSizeTextarea(input);

  // Utility to append messages
  function appendMessage(sender, content, isFormatted = false) {
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
    }

    responseEl.appendChild(messageDiv);

    // Scroll to show the start of new content
    messageDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    return messageDiv;
  }

  // Clean AI response text (remove HTML tags and format properly)
  function cleanAiResponse(text) {
    if (!text) return "";

    // First, decode any HTML entities
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");

    // Remove HTML tags but keep the content
    text = text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p>/gi, "")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      .replace(/<code>(.*?)<\/code>/gi, "`$1`")
      .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n")
      .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n")
      .replace(/<ul>(.*?)<\/ul>/gi, "$1")
      .replace(/<ol>(.*?)<\/ol>/gi, "$1")
      .replace(/<li>(.*?)<\/li>/gi, "• $1\n")
      .replace(/<hr\s*\/?>/gi, "---\n")
      .replace(/<[^>]*>/g, ""); // Remove any remaining HTML tags

    // Clean up multiple newlines
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n").replace(/^\s+|\s+$/g, "");

    return text;
  }

  // Format AI response text (convert markdown-like syntax to HTML)
  function formatAiResponse(text) {
    if (!text) return "";

    // Clean the text first
    text = cleanAiResponse(text);

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert `code` to <code>
    text = text.replace(/`(.*?)`/g, "<code>$1</code>");

    // Convert # Heading to <h3>
    text = text.replace(/^#\s+(.*)$/gm, "<h3>$1</h3>");

    // Convert ## Heading to <h4>
    text = text.replace(/^##\s+(.*)$/gm, "<h4>$1</h4>");

    // Convert bullet points to list
    text = text.replace(/^•\s+(.*)$/gm, "<li>$1</li>");

    // Wrap consecutive list items in ul
    text = text.replace(/(<li>.*<\/li>)+/gs, function (match) {
      return "<ul>" + match + "</ul>";
    });

    // Convert numbered lists
    text = text.replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>)+/gs, function (match) {
      return "<ol>" + match + "</ol>";
    });

    // Convert --- to <hr>
    text = text.replace(/^---$/gm, "<hr>");

    // Convert line breaks to proper paragraphs
    let paragraphs = text.split(/\n\s*\n/);
    text = paragraphs
      .map((p) => {
        p = p.trim();
        if (!p) return "";
        // If it's already a HTML tag (like h3, ul, etc.), don't wrap in p
        if (
          p.startsWith("<h3>") ||
          p.startsWith("<h4>") ||
          p.startsWith("<ul>") ||
          p.startsWith("<ol>") ||
          p.startsWith("<hr>") ||
          p.startsWith("<li>")
        ) {
          return p;
        }
        return "<p>" + p + "</p>";
      })
      .join("");

    // Convert single newlines to <br> within paragraphs
    text = text.replace(/<\/p>\s*<p>/g, "</p><p>");
    text = text.replace(
      /(?<!<\/?(ul|ol|li|h3|h4|hr|p|br))\n(?!<\/?(ul|ol|li|h3|h4|hr|p))/g,
      "<br>"
    );

    return text;
  }

  async function showError(msg) {
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "#ffb4b4";
    errorDiv.style.fontWeight = "600";
    errorDiv.style.padding = "10px";
    errorDiv.style.textAlign = "center";
    errorDiv.textContent = `Error: ${msg}`;
    responseEl.appendChild(errorDiv);
    errorDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Hide the chat before capturing screen
  function hideChatForCapture() {
    chat.style.display = "none";
    btn.style.display = "none";
    return new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure UI is hidden
  }

  // Show the chat after capturing screen
  function showChatAfterCapture() {
    chat.style.display = "flex";
    btn.style.display = "none";
  }

  // Send handler
  send.addEventListener("click", async () => {
    await doSend();
  });

  // Enter to send (Shift+Enter for newline)
  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await doSend();
    }
  });

  async function doSend() {
    const prompt = input.value.trim() || "Describe what's in this screen.";
    if (!prompt) return;

    // Add user message to chat history and display
    chatHistory.push({ role: "user", content: prompt });
    appendMessage("user", prompt);

    input.value = "";
    autoSizeTextarea(input);
    input.blur();

    responseEl.focus();
    startProgressiveLoading();

    try {
      // Step 1: Hide chat before capturing
      await hideChatForCapture();

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

      // Step 2: Show chat again and continue
      showChatAfterCapture();

      const dataUrl = captureResp.dataUrl;

      // Prepare conversation context
      const conversationContext = chatHistory
        .slice(-6) // Keep last 3 exchanges (6 messages) for context
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

      const res = await fetch(BACKEND_URL + "/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();
      if (!res.ok) {
        hideLoading();
        showError(json.error || res.statusText || "Unknown error");
        return;
      }

      hideLoading();

      // AI reply with formatted text
      const aiResponse = json.text || json.result || "No result from AI.";
      const formattedResponse = formatAiResponse(aiResponse);

      // Add AI message to chat history and display
      chatHistory.push({ role: "assistant", content: aiResponse });
      appendMessage("ai", formattedResponse, true);
    } catch (err) {
      // Make sure chat is visible even if there's an error
      showChatAfterCapture();
      hideLoading();
      console.error(err);
      showError(err.message || String(err));
    }
  }

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });

  window.__watchwing = {
    open: () => btn.click(),
    close: () => closeBtn.click(),
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "toggleAskBtn") {
      btn.style.display = msg.show ? "inline-block" : "none";
    }
  });
})();
