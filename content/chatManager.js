class ChatManager {
  static loadingInterval = null;
  static currentSpeech = {
    utterance: null,
    isPlaying: false,
    currentMessage: null,
    currentButton: null,
    audioContext: null,
    audioElement: null,
  };

  static voiceInput = {
    isRecording: false,
    recognition: null,
    lastVoiceInput: false,
  };

  static initialize(backendUrl) {
    this.BACKEND_URL = backendUrl;
    this.setupChatEventListeners();
    this.initializeVoices();
    this.initializeSpeechRecognition();
  }

  static initializeVoices() {
    // Pre-load voices when available
    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = () => {
        console.log("Voices loaded:", speechSynthesis.getVoices().length);
      };

      // Trigger voices loading
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        setTimeout(() => {
          speechSynthesis.getVoices();
        }, 1000);
      }
    }
  }

  static initializeSpeechRecognition() {
    // Check if speech recognition is available
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceInput.recognition = new SpeechRecognition();

    // Configure recognition
    this.voiceInput.recognition.continuous = false;
    this.voiceInput.recognition.interimResults = true;
    this.voiceInput.recognition.lang = "en-US";
    this.voiceInput.recognition.maxAlternatives = 1;

    // Set up event handlers
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

      // Update input with the transcribed text
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
      this.voiceInput.lastVoiceInput = true; // Mark that this input came from voice
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

    // Microphone button
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

    // Stop any ongoing speech when sending new message
    this.stopSpeech();

    // Stop voice recording if active
    if (this.voiceInput.isRecording) {
      this.stopVoiceInput();
    }

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
      const messageElement = this.appendMessage("ai", formattedResponse, true);

      // Save updated chat history
      SessionManager.saveSessionData();

      // Store the plain text for speech synthesis
      messageElement.setAttribute("data-plain-text", aiResponse);

      // Auto-speak the response if the input came from voice
      if (this.voiceInput.lastVoiceInput) {
        const voiceButton = messageElement.querySelector(".sai-voice-button");
        const contentDiv = messageElement.querySelector(".sai-ai-content");
        if (voiceButton && contentDiv) {
          // Small delay to ensure UI is ready
          setTimeout(() => {
            this.speakMessage(messageElement, contentDiv, voiceButton);
          }, 500);
        }
      }

      // Reset voice input flag
      this.voiceInput.lastVoiceInput = false;
    } catch (err) {
      // Make sure chat is visible even if there's an error
      UIManager.showAfterCapture();
      this.hideLoading();
      console.error(err);
      this.showError(err.message || String(err));

      // Reset voice input flag on error too
      this.voiceInput.lastVoiceInput = false;
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

      // Add voice button for AI responses
      this.addVoiceButton(messageDiv, contentDiv);
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

  static addVoiceButton(messageDiv, contentDiv) {
    const voiceButton = document.createElement("button");
    voiceButton.className = "sai-voice-button";
    voiceButton.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
    // If this message is already being spoken, toggle pause/play
    if (
      this.currentSpeech.currentMessage === messageDiv &&
      this.currentSpeech.isPlaying
    ) {
      this.pauseSpeech();
      voiceButton.classList.remove("playing");
      voiceButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
    } else {
      // Stop any current speech
      this.stopSpeech();

      // Start speaking this message
      this.speakMessage(messageDiv, contentDiv, voiceButton);
    }
  }

  static speakMessage(messageDiv, contentDiv, voiceButton) {
    const plainText =
      messageDiv.getAttribute("data-plain-text") ||
      contentDiv.textContent ||
      contentDiv.innerText;

    if (!plainText.trim()) return;

    // Check if browser supports speech synthesis
    if (!("speechSynthesis" in window)) {
      this.showError("Text-to-speech is not supported in your browser");
      return;
    }

    // Show loading state
    voiceButton.innerHTML = `<div class="sai-voice-loading"></div>`;

    // Get available voices
    const voices = speechSynthesis.getVoices();

    // Enhanced voice selection for natural female voice
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

    // Find the best available voice
    let selectedVoice = null;

    // First try: Find exact matches from preferred list
    for (const voiceName of preferredFemaleVoices) {
      const voice = voices.find((v) => v.name === voiceName);
      if (voice) {
        selectedVoice = voice;
        break;
      }
    }

    // Second try: Find voices with female indicators
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

    // Third try: Find any English voice that's not explicitly male
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (voice) =>
          voice.lang.includes("en") &&
          !voice.name.toLowerCase().includes("male") &&
          !voice.name.toLowerCase().includes("david")
      );
    }

    // Final fallback: Use first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (!selectedVoice) {
      this.showError("No speech voices available");
      voiceButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
      return;
    }

    console.log("Using voice:", selectedVoice.name);

    // Process text for more natural speech
    const processedText = this.processTextForSpeech(plainText);

    // Create utterance with optimized settings for natural speech
    const utterance = new SpeechSynthesisUtterance(processedText);

    // Advanced voice settings for natural female speech
    utterance.voice = selectedVoice;
    utterance.rate = 0.95; // Slightly slower for more natural cadence
    utterance.pitch = 1.2; // Higher pitch for female voice
    utterance.volume = 1;

    // Add slight pauses for better natural flow
    utterance.text = this.addSpeechPauses(utterance.text);

    // Store current speech state
    this.currentSpeech = {
      utterance: utterance,
      isPlaying: true,
      currentMessage: messageDiv,
      currentButton: voiceButton,
    };

    // Update button to show pause icon
    voiceButton.classList.add("playing");
    voiceButton.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    `;

    // Set up event listeners
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

    // Use a small delay to ensure proper voice loading
    setTimeout(() => {
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error starting speech:", error);
        this.stopSpeech();
      }
    }, 50);
  }

  static processTextForSpeech(text) {
    // Clean and process text for more natural speech
    let processed = text
      // Remove markdown symbols
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      // Replace common abbreviations
      .replace(/\bAI\b/gi, "A I")
      .replace(/\bAPI\b/gi, "A P I")
      .replace(/\bCSS\b/gi, "C S S")
      .replace(/\bHTML\b/gi, "H T M L")
      .replace(/\bJS\b/gi, "JavaScript")
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim();

    return processed;
  }

  static addSpeechPauses(text) {
    // Add commas for natural pauses in longer sentences
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
    }
  }

  static resumeSpeech() {
    if (!this.currentSpeech.isPlaying && this.currentSpeech.utterance) {
      speechSynthesis.resume();
      this.currentSpeech.isPlaying = true;
    }
  }

  static stopSpeech() {
    if (this.currentSpeech.utterance) {
      speechSynthesis.cancel();

      if (this.currentSpeech.currentButton) {
        this.currentSpeech.currentButton.classList.remove("playing");
        this.currentSpeech.currentButton.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
        const formattedResponse = ResponseFormatter.formatAiResponse(
          msg.content
        );
        const messageElement = this.appendMessage(
          "ai",
          formattedResponse,
          true
        );
        // Store plain text for speech synthesis
        messageElement.setAttribute("data-plain-text", msg.content);
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
