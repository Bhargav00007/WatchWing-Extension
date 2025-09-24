(() => {
  const BACKEND_URL = "http://localhost:3000"; // <-- replace with your server URL in production

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
      bottom: 22px;
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
    }
    #sai-btn:hover { background: linear-gradient(180deg, #111c3a, #0d162e); }

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
      padding: 6px; /* reduced padding */
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
      height: 40px; /* match input height */
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

  // Helper: show loading overlay
  function showLoading(text = "Processing... please wait") {
    if (!loadingEl) return;
    loadingEl.querySelector(".sai-loading-text").textContent = text;
    loadingEl.setAttribute("aria-hidden", "false");
    responseEl.style.opacity = "0.35";
    responseEl.style.pointerEvents = "none";
  }

  function hideLoading() {
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
  function appendMessage(html, opts = { prepend: false }) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.style.marginBottom = "6px";
    wrapper.style.whiteSpace = "pre-wrap";
    if (opts.prepend) responseEl.prepend(wrapper);
    else responseEl.appendChild(wrapper);
    responseEl.scrollTop = responseEl.scrollHeight;
  }

  async function showError(msg) {
    appendMessage(
      `<div style="color:#ffb4b4;font-weight:600">Error: ${msg}</div>`
    );
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

    appendMessage(
      `<div style="color:#bfe9ff;font-weight:700">You: </div><div style="color:#e6f4ff;margin-top:4px">${escapeHtml(
        prompt
      )}</div>`
    );
    input.value = "";
    autoSizeTextarea(input);
    input.blur();

    responseEl.focus();
    showLoading("Capturing screen...");

    try {
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

      const dataUrl = captureResp.dataUrl;
      showLoading("Sending to AI... (this may take a few seconds)");

      const res = await fetch(BACKEND_URL + "/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, prompt }),
      });

      const json = await res.json();
      if (!res.ok) {
        hideLoading();
        showError(json.error || res.statusText || "Unknown error");
        return;
      }

      hideLoading();
      const aiText = json.text || json.result || "No result from AI.";
      appendMessage(
        `<div style="color:#a7e3ff;font-weight:700">Watchwing:</div><div style="margin-top:6px;color:#dcefff">${escapeHtml(
          aiText
        )}</div>`
      );
    } catch (err) {
      hideLoading();
      console.error(err);
      showError(err.message || String(err));
    } finally {
      hideLoading();
    }
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
