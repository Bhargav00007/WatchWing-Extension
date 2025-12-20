class ChatManager {
  static loadingInterval = null;
  static loadingMessageDiv = null;
  static currentSpeech = {
    utterance: null,
    isPlaying: false,
    currentMessage: null,
    currentButton: null,
  };

  static voiceInput = {
    isRecording: false,
    recognition: null,
    lastVoiceInput: false,
  };

  static currentUrl = "";
  static currentTitle = "";

  static initialize(backendUrl) {
    this.BACKEND_URL = backendUrl;
    this.setupChatEventListeners();
    this.initializeVoices();
    this.initializeSpeechRecognition();
    this.loadCurrentUrl();
  }

  static async loadCurrentUrl() {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getCurrentUrl" }, (response) => {
          if (response && response.success) {
            this.currentUrl = response.url;
            this.currentTitle = response.title;
          } else {
            this.currentUrl = window.location.href;
            this.currentTitle = document.title;
          }
          resolve();
        });
      });
    } catch (error) {
      this.currentUrl = window.location.href;
      this.currentTitle = document.title;
    }
  }

  static initializeVoices() {
    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = () => {
        console.log("Voices loaded:", speechSynthesis.getVoices().length);
      };

      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        setTimeout(() => {
          speechSynthesis.getVoices();
        }, 1000);
      }
    }
  }

  static initializeSpeechRecognition() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceInput.recognition = new SpeechRecognition();

    this.voiceInput.recognition.continuous = false;
    this.voiceInput.recognition.interimResults = true;
    this.voiceInput.recognition.lang = "en-US";
    this.voiceInput.recognition.maxAlternatives = 1;

    this.voiceInput.recognition.onstart = () => {
      console.log("Speech recognition started");
      this.setRecordingState(true);
    };

    this.voiceInput.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const input = UIManager.elements.input;
      if (finalTranscript) {
        input.value = finalTranscript;
        UIManager.autoSizeTextarea(input);
      } else if (interimTranscript) {
        input.value = interimTranscript;
        UIManager.autoSizeTextarea(input);
      }
    };

    this.voiceInput.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.setRecordingState(false);

      if (event.error === "not-allowed") {
        this.showError(
          "Microphone access denied. Please allow microphone permissions."
        );
      } else if (event.error === "no-speech") {
        this.showError("No speech detected. Please try again.");
      }
    };

    this.voiceInput.recognition.onend = () => {
      console.log("Speech recognition ended");
      this.setRecordingState(false);
    };
  }

  static setRecordingState(isRecording) {
    this.voiceInput.isRecording = isRecording;
    const micButton = document.getElementById("sai-mic");

    if (micButton) {
      if (isRecording) {
        micButton.classList.add("recording");
        micButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
          <div class="sai-recording-indicator"></div>
        `;
      } else {
        micButton.classList.remove("recording");
        micButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        `;
      }
    }
  }

  static toggleVoiceInput() {
    if (!this.voiceInput.recognition) {
      this.showError("Speech recognition is not supported in your browser");
      return;
    }

    if (this.voiceInput.isRecording) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  }

  static startVoiceInput() {
    try {
      this.voiceInput.recognition.start();
      this.voiceInput.lastVoiceInput = true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      this.showError(
        "Failed to start voice input. Please check microphone permissions."
      );
    }
  }

  static stopVoiceInput() {
    try {
      this.voiceInput.recognition.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
    this.setRecordingState(false);
  }

  static setupChatEventListeners() {
    const { btn, input, send, closeBtn } = UIManager.elements;

    btn.addEventListener("click", () => UIManager.openChat());
    closeBtn.addEventListener("click", () => UIManager.closeChat());

    send.addEventListener("click", async () => {
      await this.doSend();
    });

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await this.doSend();
      }
    });

    input.addEventListener("input", (e) => {
      UIManager.autoSizeTextarea(e.target);
    });
    UIManager.autoSizeTextarea(input);

    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });

    const micButton = document.getElementById("sai-mic");
    if (micButton) {
      micButton.addEventListener("click", () => {
        this.toggleVoiceInput();
      });
    }
  }

  static async doSend() {
    const prompt =
      UIManager.elements.input.value.trim() ||
      "Describe what's in this screen.";
    if (!prompt) return;

    this.stopSpeech();

    if (this.voiceInput.isRecording) {
      this.stopVoiceInput();
    }

    SessionManager.addMessage("user", prompt);
    this.appendMessage("user", prompt);

    UIManager.elements.input.value = "";
    UIManager.autoSizeTextarea(UIManager.elements.input);
    UIManager.elements.input.blur();
    UIManager.elements.responseEl.focus();

    this.startInlineLoading();

    try {
      await this.loadCurrentUrl();
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

      UIManager.showAfterCapture();

      const dataUrl = captureResp.dataUrl;

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
        currentUrl: this.currentUrl,
      };

      console.log("Sending request with URL:", this.currentUrl);

      const res = await fetch(this.BACKEND_URL + "/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();
      if (!res.ok) {
        this.hideInlineLoading();
        this.showError(json.error || res.statusText || "Unknown error");
        return;
      }

      this.hideInlineLoading();

      const aiResponse = json.text || json.result || "No result from AI.";

      const formattedResponse = this.processClickableContent(
        aiResponse,
        this.currentUrl
      );

      SessionManager.addMessage("assistant", aiResponse);
      const messageElement = this.appendMessage("ai", formattedResponse, true);

      SessionManager.saveSessionData();

      messageElement.setAttribute("data-plain-text", aiResponse);

      if (this.voiceInput.lastVoiceInput) {
        const voiceButton = messageElement.querySelector(".sai-voice-button");
        const contentDiv = messageElement.querySelector(".sai-ai-content");
        if (voiceButton && contentDiv) {
          setTimeout(() => {
            this.speakMessage(messageElement, contentDiv, voiceButton);
          }, 500);
        }
      }

      this.voiceInput.lastVoiceInput = false;
    } catch (err) {
      UIManager.showAfterCapture();
      this.hideInlineLoading();
      console.error(err);
      this.showError(err.message || String(err));
      this.voiceInput.lastVoiceInput = false;
    }
  }

  static processClickableContent(text, currentUrl) {
    if (!text) return text;

    let processedText = text;

    const isYouTube =
      currentUrl &&
      (currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be"));

    let currentVideoId = null;
    if (isYouTube) {
      const videoIdMatch = currentUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );
      currentVideoId = videoIdMatch ? videoIdMatch[1] : null;
    }

    if (currentVideoId) {
      processedText = processedText.replace(
        /https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+&t=\d+s["\s]*target="_blank">\[https:\/\/[^\]]+\]/g,
        ""
      );
      processedText = processedText.replace(
        /https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+&t=\d+s["\s]*target="_blank">/g,
        ""
      );
    }

    if (currentVideoId) {
      processedText = processedText.replace(
        /[\[\(](\d{1,2}):(\d{2})[\]\)]/g,
        (match, minutes, seconds) => {
          const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
          const timestampUrl = `https://www.youtube.com/watch?v=${currentVideoId}&t=${totalSeconds}s`;
          const displayTime = `${minutes}:${seconds}`;
          return `<a class="sai-timestamp-link" href="${timestampUrl}" target="_blank">[${displayTime}]</a>`;
        }
      );

      processedText = processedText.replace(
        /(?<![\w\/=\-])(\d{1,2}):(\d{2})(?![\w\]])/g,
        (match, minutes, seconds) => {
          const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
          const timestampUrl = `https://www.youtube.com/watch?v=${currentVideoId}&t=${totalSeconds}s`;
          const displayTime = `${minutes}:${seconds}`;
          return `<a class="sai-timestamp-link" href="${timestampUrl}" target="_blank">[${displayTime}]</a>`;
        }
      );

      processedText = processedText.replace(
        /(?<![\w\/=\-])(\d+)s(?![\w\]])/g,
        (match, seconds) => {
          const totalSeconds = parseInt(seconds);
          const minutes = Math.floor(totalSeconds / 60);
          const remainingSeconds = totalSeconds % 60;
          const displayTime = `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
          const timestampUrl = `https://www.youtube.com/watch?v=${currentVideoId}&t=${totalSeconds}s`;
          return `<a class="sai-timestamp-link" href="${timestampUrl}" target="_blank">[${displayTime}]</a>`;
        }
      );
    }

    processedText = processedText.replace(
      /(?<!href=["'])(?<!href=)(https?:\/\/(?!www\.youtube\.com\/watch)[^\s<"']+)(?!["'])/g,
      (match) => {
        return `<a href="${match}" target="_blank" class="sai-url-link">${match}</a>`;
      }
    );

    processedText = processedText.replace(
      /(?<![\w@])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})(?![\w])/g,
      '<a href="mailto:$1" class="sai-email-link">$1</a>'
    );

    return processedText;
  }

  static appendMessage(sender, content, isFormatted = false) {
    const responseEl = UIManager.elements.responseEl;

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
      const bubbleDiv = document.createElement("div");
      bubbleDiv.className = "sai-user-bubble";
      bubbleDiv.textContent = content;
      messageDiv.appendChild(bubbleDiv);
    } else {
      const contentDiv = document.createElement("div");
      contentDiv.className = "sai-ai-content";

      if (isFormatted) {
        const cleanedContent = this.cleanAIResponse(content);
        contentDiv.innerHTML = cleanedContent;
      } else {
        contentDiv.textContent = content;
      }
      messageDiv.appendChild(contentDiv);

      this.addCopyButton(messageDiv, contentDiv);
      this.addVoiceButton(messageDiv, contentDiv);
    }

    responseEl.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    return messageDiv;
  }

  static cleanAIResponse(text) {
    if (!text) return text;

    let cleaned = text;

    cleaned = cleaned
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();

    cleaned = this.formatCodeBlocks(cleaned);
    cleaned = this.formatBoldHeadings(cleaned);
    cleaned = this.formatBulletPoints(cleaned);
    cleaned = this.formatNumberedLists(cleaned);
    cleaned = this.formatParagraphs(cleaned);

    return cleaned;
  }

  static formatCodeBlocks(text) {
    return text.replace(
      /```(\w+)?\s*\n([\s\S]*?)```/g,
      (match, language, code) => {
        const lang = language || "text";
        return `
        <div class="sai-code-block">
          <div class="sai-code-header">
            <span class="sai-code-language">${lang}</span>
          </div>
          <pre class="sai-code-content"><code>${this.escapeHtml(
            code.trim()
          )}</code></pre>
        </div>
      `;
      }
    );
  }

  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  static formatBoldHeadings(text) {
    return text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="sai-bold-heading">$1</strong>'
    );
  }

  static formatBulletPoints(text) {
    const lines = text.split("\n");
    let result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/^[•\*\-]\s+/)) {
        const content = line.replace(/^[•\*\-]\s+/, "");
        if (!inList) {
          result.push('<div class="sai-bullet-list">');
          inList = true;
        }
        result.push(
          `<div class="sai-bullet-item"><span class="sai-bullet">•</span><span class="sai-bullet-content">${content}</span></div>`
        );
      } else {
        if (inList) {
          result.push("</div>");
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push("</div>");
    }

    return result.join("\n");
  }

  static formatNumberedLists(text) {
    const lines = text.split("\n");
    let result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/^\d+\.\s+/)) {
        const match = line.match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          const number = match[1];
          const content = match[2];
          if (!inList) {
            result.push('<div class="sai-numbered-list">');
            inList = true;
          }
          result.push(
            `<div class="sai-numbered-item"><span class="sai-number">${number}.</span><span class="sai-numbered-content">${content}</span></div>`
          );
        }
      } else {
        if (inList) {
          result.push("</div>");
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push("</div>");
    }

    return result.join("\n");
  }

  static formatParagraphs(text) {
    const paragraphs = text.split("\n\n");
    let result = [];

    for (let para of paragraphs) {
      para = para.trim();
      if (!para) continue;

      if (
        para.includes("sai-code-block") ||
        para.includes("sai-bullet-list") ||
        para.includes("sai-numbered-list") ||
        para.includes("sai-bold-heading")
      ) {
        result.push(para);
      } else if (para.includes("<strong")) {
        result.push(`<div class="sai-section">${para}</div>`);
      } else {
        const lines = para.split("\n").filter((l) => l.trim());
        if (lines.length > 0) {
          result.push(`<p class="sai-paragraph">${lines.join("<br>")}</p>`);
        }
      }
    }

    return result.join("");
  }

  static addCopyButton(messageDiv, contentDiv) {
    const copyButton = document.createElement("button");
    copyButton.className = "sai-copy-button";
    copyButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    `;
    copyButton.title = "Copy response to clipboard";

    copyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const textToCopy = contentDiv.textContent || contentDiv.innerText;
      if (this.copyToClipboard(textToCopy)) {
        copyButton.classList.add("copied");
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        `;
        setTimeout(() => {
          copyButton.classList.remove("copied");
          copyButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          `;
        }, 2000);
      }
    });

    messageDiv.appendChild(copyButton);
  }

  static addVoiceButton(messageDiv, contentDiv) {
    const voiceButton = document.createElement("button");
    voiceButton.className = "sai-voice-button";
    voiceButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    `;
    voiceButton.title = "Read response aloud";

    voiceButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSpeech(messageDiv, contentDiv, voiceButton);
    });

    messageDiv.appendChild(voiceButton);
  }

  static toggleSpeech(messageDiv, contentDiv, voiceButton) {
    if (
      this.currentSpeech.currentMessage === messageDiv &&
      this.currentSpeech.isPlaying
    ) {
      this.pauseSpeech();
      voiceButton.classList.remove("playing");
      voiceButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
    } else {
      this.stopSpeech();
      this.speakMessage(messageDiv, contentDiv, voiceButton);
    }
  }

  static speakMessage(messageDiv, contentDiv, voiceButton) {
    const plainText =
      messageDiv.getAttribute("data-plain-text") ||
      contentDiv.textContent ||
      contentDiv.innerText;

    if (!plainText.trim()) return;

    if (!("speechSynthesis" in window)) {
      this.showError("Text-to-speech is not supported in your browser");
      return;
    }

    voiceButton.classList.add("loading");
    voiceButton.innerHTML = `<div class="sai-voice-loading"></div>`;

    const voices = speechSynthesis.getVoices();

    const preferredFemaleVoices = [
      "Google UK English Female",
      "Microsoft Zira Desktop",
      "Samantha",
      "Karen",
      "Victoria",
      "Tessa",
      "Fiona",
      "Moira",
      "Daniel",
      "Google US English",
      "Microsoft David Desktop",
    ];

    let selectedVoice = null;

    for (const voiceName of preferredFemaleVoices) {
      const voice = voices.find((v) => v.name === voiceName);
      if (voice) {
        selectedVoice = voice;
        break;
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("zira") ||
          voice.name.toLowerCase().includes("karen") ||
          voice.name.toLowerCase().includes("victoria") ||
          voice.name.toLowerCase().includes("tessa") ||
          voice.name.toLowerCase().includes("fiona") ||
          voice.name.toLowerCase().includes("moira")
      );
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(
        (voice) =>
          voice.lang.includes("en") &&
          !voice.name.toLowerCase().includes("male") &&
          !voice.name.toLowerCase().includes("david")
      );
    }

    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (!selectedVoice) {
      this.showError("No speech voices available");
      voiceButton.classList.remove("loading");
      voiceButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
      return;
    }

    console.log("Using voice:", selectedVoice.name);

    const processedText = this.processTextForSpeech(plainText);

    const utterance = new SpeechSynthesisUtterance(processedText);

    utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    utterance.text = this.addSpeechPauses(utterance.text);

    this.currentSpeech = {
      utterance: utterance,
      isPlaying: true,
      currentMessage: messageDiv,
      currentButton: voiceButton,
    };

    voiceButton.classList.add("playing");
    voiceButton.classList.remove("loading");
    voiceButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    `;

    utterance.onstart = () => {
      console.log("Speech started with voice:", selectedVoice.name);
    };

    utterance.onend = () => {
      this.stopSpeech();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      this.stopSpeech();
    };

    setTimeout(() => {
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        this.stopSpeech();
      }
    }, 50);
  }

  static processTextForSpeech(text) {
    let processed = text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\bAI\b/gi, "A I")
      .replace(/\bAPI\b/gi, "A P I")
      .replace(/\bCSS\b/gi, "C S S")
      .replace(/\bHTML\b/gi, "H T M L")
      .replace(/\bJS\b/gi, "JavaScript")
      .replace(/\s+/g, " ")
      .trim();

    return processed;
  }

  static addSpeechPauses(text) {
    return text
      .replace(/([.!?])\s+([A-Z])/g, "$1, $2")
      .replace(/([^.,!?;])\s+but\s+/gi, "$1, but ")
      .replace(/([^.,!?;])\s+and\s+([A-Z])/gi, "$1, and $2")
      .replace(/([^.,!?;])\s+or\s+([A-Z])/gi, "$1, or $2");
  }

  static pauseSpeech() {
    if (this.currentSpeech.isPlaying && this.currentSpeech.utterance) {
      speechSynthesis.pause();
      this.currentSpeech.isPlaying = false;

      if (this.currentSpeech.currentButton) {
        this.currentSpeech.currentButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }
  }

  static resumeSpeech() {
    if (!this.currentSpeech.isPlaying && this.currentSpeech.utterance) {
      speechSynthesis.resume();
      this.currentSpeech.isPlaying = true;

      if (this.currentSpeech.currentButton) {
        this.currentSpeech.currentButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
      }
    }
  }

  static stopSpeech() {
    if (this.currentSpeech.utterance) {
      speechSynthesis.cancel();

      if (this.currentSpeech.currentButton) {
        this.currentSpeech.currentButton.classList.remove("playing", "loading");
        this.currentSpeech.currentButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        `;
      }

      this.currentSpeech = {
        utterance: null,
        isPlaying: false,
        currentMessage: null,
        currentButton: null,
      };
    }
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
    welcomeDiv.textContent =
      "Hey, welcome to Watchwing AI! Ask me anything about this screen.";
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
        const currentUrl = this.currentUrl;
        const processedResponse = this.processClickableContent(
          msg.content,
          currentUrl
        );
        const messageElement = this.appendMessage(
          "ai",
          processedResponse,
          true
        );
        messageElement.setAttribute("data-plain-text", msg.content);
      }
    });
  }

  static startInlineLoading() {
    const responseEl = UIManager.elements.responseEl;

    this.loadingMessageDiv = document.createElement("div");
    this.loadingMessageDiv.className =
      "sai-message sai-ai-message sai-loading-message";

    const senderDiv = document.createElement("div");
    senderDiv.className = "sai-sender sai-ai-sender";
    senderDiv.textContent = "Watchwing";

    const contentDiv = document.createElement("div");
    contentDiv.className = "sai-ai-content sai-loading-content";

    const loadingContainer = document.createElement("div");
    loadingContainer.className = "sai-inline-loading";

    const spinner = document.createElement("div");
    spinner.className = "sai-inline-spinner";

    const loadingText = document.createElement("span");
    loadingText.className = "sai-inline-loading-text";
    loadingText.textContent = "Capturing screen...";

    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);
    contentDiv.appendChild(loadingContainer);

    this.loadingMessageDiv.appendChild(senderDiv);
    this.loadingMessageDiv.appendChild(contentDiv);

    responseEl.appendChild(this.loadingMessageDiv);
    this.loadingMessageDiv.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    let step = 1;
    const loadingSteps = [
      "Capturing screen...",
      "Sending to AI for analysis...",
      "Analyzing screen content...",
      "Fetching AI insights...",
      "This may take a while...",
      "Finalizing response...",
    ];

    this.loadingInterval = setInterval(() => {
      step++;
      if (step <= loadingSteps.length) {
        loadingText.textContent = loadingSteps[step - 1];
      }
    }, 2000);
  }

  static hideInlineLoading() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }

    if (this.loadingMessageDiv && this.loadingMessageDiv.parentNode) {
      this.loadingMessageDiv.remove();
      this.loadingMessageDiv = null;
    }
  }

  static showError(msg) {
    const responseEl = UIManager.elements.responseEl;
    const errorDiv = document.createElement("div");
    errorDiv.className = "sai-error-message";
    errorDiv.textContent = `Error: ${msg}`;
    responseEl.appendChild(errorDiv);
    errorDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
