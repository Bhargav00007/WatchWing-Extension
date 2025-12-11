class Styles {
  static getStyles() {
    return `
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

    /* Chat panel (dark, no shadow, tighter padding) - RESIZABLE */
    #sai-chat {
      display:flex;
      flex-direction: column;
      width: 360px;
      max-width: calc(100vw - 48px);
      min-height: 320px;
      max-height: 80vh;
      height: 600px;
      background: linear-gradient(180deg, #071028, #0b1220);
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.04);
      padding: 6px;
      gap: 8px;
      color: #e6eef8;
      overflow: hidden;
      position: fixed;
      bottom: 52px;
      right: 22px;
      cursor: default;
      user-select: none;
      resize: both;
      min-width: 300px;
      max-width: 90vw;
    }

    /* Header */
    #sai-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 8px;
      padding: 4px 6px;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      cursor: grab;
      flex-shrink: 0;
    }
    #sai-header:active {
      cursor: grabbing;
    }
    #sai-title {
      font-weight:700;
      font-size:15px;
      letter-spacing: 0.2px;
      color: #e8f3ff;
    }
    
    /* Header buttons container */
    #sai-header-buttons {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    /* Header buttons styling */
    .sai-header-btn {
      background: transparent;
      border: none;
      color: #9fb4d6;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
    }
    
    .sai-header-btn:hover {
      background: rgba(255,255,255,0.05);
      color: #ffffff;
    }
    
    .sai-header-btn:active {
      background: rgba(255,255,255,0.08);
      transform: scale(0.95);
    }
    
    #sai-close {
      font-size: 16px;
      line-height: 1;
    }
    
    #sai-clear svg {
      width: 16px;
      height: 16px;
    }

    /* Clear chat confirmation message */
    .sai-clear-confirmation {
      text-align: center;
      padding: 12px;
      color: #7dd3fc;
      font-size: 14px;
      font-style: italic;
      opacity: 0.8;
      cursor: default;
      user-select: none;
    }

    /* Body (response container) - FLEXIBLE */
    #sai-body {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      overflow: hidden;
      cursor: default;
      min-height: 120px;
    }

    /* Response area - SCROLLABLE AND FLEXIBLE */
    #sai-response {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 10px;
      border-radius: 10px;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.012));
      color: #dbeafe;
      font-size: 14px;
      line-height: 1.5;
      cursor: auto;
      user-select: text;
      flex: 1;
      min-height: 0;
    }

    /* Welcome message */
    .sai-welcome-message {
      text-align: center;
      color: #7dd3fc;
      font-size: 16px;
      font-weight: 600;
      padding: 20px;
      opacity: 0.9;
      cursor: default;
      user-select: none;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Chat separators */
    .sai-separator {
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 8px 0;
    }

    /* NEW: Inline Loading Message */
    .sai-loading-message {
      animation: sai-message-appear 0.3s ease-out;
    }

    .sai-loading-content {
      background: rgba(255, 255, 255, 0.03);
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .sai-inline-loading {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sai-inline-spinner {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(125, 211, 252, 0.2);
      border-top-color: #7dd3fc;
      animation: sai-spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes sai-spin { 
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); } 
    }

    .sai-inline-loading-text {
      color: #cfeefe;
      font-size: 14px;
      line-height: 1.5;
    }

    /* Controls: input + send */
    #sai-controls {
      display:flex;
      gap: 0;
      align-items: center;
      padding: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
      cursor: default;
      user-select: none;
      position: relative;
      flex-shrink: 0;
    }

    /* Input with buttons inside */
    #sai-input {
      flex: 1 1 auto;
      min-height: 40px;
      max-height: 120px;
      resize: none;
      padding: 2px 90px 2px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.04);
      background: rgba(6,12,20,0.55);
      color: #e6f4ff;
      font-size: 14px;
      line-height: 1.4;
      outline: none;
      overflow-y: auto;
      cursor: text;
      user-select: text;
      width: 100%;
    }
    #sai-input::placeholder { color: rgba(230,240,255,0.45); }

    /* Send button - INSIDE INPUT */
    #sai-send {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display:flex;
      align-items:center;
      justify-content:center;
      height: 32px;
      width: 32px;
      background: linear-gradient(180deg, #0ea5e9, #0284c7);
      color: #002233;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      z-index: 3;
      margin-right:4px;
      margin-left:2px;
    }

    #sai-send:hover { 
      background: linear-gradient(180deg, #38bdf8, #0284c7);
      transform: translateY(-50%) scale(1.05);
    }
    #sai-send:active { transform: translateY(-50%) scale(0.95); }

    /* Microphone button - INSIDE INPUT */
    #sai-mic {
      position: absolute;
      right: 46px;
      top: 50%;
      transform: translateY(-50%);
      display:flex;
      align-items:center;
      justify-content:center;
      height: 32px;
      width: 32px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: #9fb4d6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      user-select: none;
      z-index: 3;
    }

    #sai-mic:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #7dd3fc;
      transform: translateY(-50%) scale(1.05);
    }

    #sai-mic.recording {
      border-color: #0ea5e9;
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
      color: #0ea5e9;
      animation: sai-pulse 1.5s ease-in-out infinite;
    }

    #sai-mic.recording:hover {
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.4);
    }

    @keyframes sai-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(14, 165, 233, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
      }
    }

    /* Voice recording indicator */
    .sai-recording-indicator {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: sai-recording-pulse 1s infinite;
    }

    @keyframes sai-recording-pulse {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.7;
      }
      100% {
        transform: scale(0.8);
        opacity: 1;
      }
    }

    /* Resize handle */
    .sai-resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nwse-resize;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .sai-resize-handle::before {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      border-right: 2px solid rgba(255,255,255,0.3);
      border-bottom: 2px solid rgba(255,255,255,0.3);
      border-radius: 1px;
    }

    #sai-chat:hover .sai-resize-handle {
      opacity: 0.7;
    }

    .sai-resize-handle:hover {
      opacity: 1 !important;
    }

    /* Scrollbar tweaks for dark mode */
    #sai-response::-webkit-scrollbar, #sai-input::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    #sai-response::-webkit-scrollbar-thumb, #sai-input::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.06);
      border-radius: 8px;
      cursor: pointer;
    }

    #sai-response::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
    }

    #sai-response::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.1);
    }

    /* ==================== CHAT MESSAGE STYLES ==================== */

    .sai-message {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      cursor: auto;
      user-select: text;
      animation: sai-message-appear 0.3s ease-out;
    }

    @keyframes sai-message-appear {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sai-user-message {
      align-items: flex-end;
    }

    .sai-ai-message {
      align-items: flex-start;
      position: relative;
    }

    .sai-user-bubble {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      padding: 12px 16px;
      border-radius: 16px;
      border-bottom-right-radius: 6px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      cursor: auto;
      user-select: text;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
    }

    .sai-ai-content {
      background: rgba(255, 255, 255, 0.03);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 6px;
      font-size: 14px;
      line-height: 1.7;
      color: #e6f4ff;
      cursor: auto;
      user-select: text;
      word-wrap: break-word;
      overflow-wrap: break-word;
      position: relative;
      max-width: 100%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .sai-sender {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      padding: 0 4px;
      cursor: default;
      user-select: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .sai-user-sender {
      color: #7dd3fc;
      text-align: right;
    }

    .sai-ai-sender {
      color: #a7e3ff;
      text-align: left;
    }

    /* ==================== ENHANCED CONTENT FORMATTING ==================== */

    /* Paragraphs with better spacing */
    .sai-paragraph {
      margin: 0 0 16px 0;
      line-height: 1.7;
      color: #e6f4ff;
    }

    .sai-paragraph:last-child {
      margin-bottom: 0;
    }

    /* Bold headings in vibrant blue - INLINE LAYOUT */
    .sai-bold-heading {
      color: #60a5fa;
      font-weight: 700;
      display: inline;
      margin: 0;
      line-height: 1.7;
      font-size: 14px;
    }

    /* Section container */
    .sai-section {
      margin: 16px 0;
    }

    /* ==================== BEAUTIFUL LIST STYLING - INLINE LAYOUT ==================== */

    /* Bullet list styling - INLINE HORIZONTAL LAYOUT */
    .sai-bullet-list {
      margin: 14px 0;
      padding: 0;
    }

    .sai-bullet-item {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      margin: 8px 0;
      line-height: 1.7;
      gap: 8px;
    }

    .sai-bullet {
      color: #60a5fa;
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
      line-height: 1.7;
    }

    .sai-bullet-content {
      color: #e6f4ff;
      flex: 1;
      line-height: 1.7;
    }

    /* Numbered list styling - INLINE HORIZONTAL LAYOUT */
    .sai-numbered-list {
      margin: 14px 0;
      padding: 0;
    }

    .sai-numbered-item {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      margin: 8px 0;
      line-height: 1.7;
      gap: 8px;
    }

    .sai-number {
      color: #60a5fa;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
      line-height: 1.7;
      min-width: 24px;
    }

    .sai-numbered-content {
      color: #e6f4ff;
      flex: 1;
      line-height: 1.7;
    }

    /* ==================== CLICKABLE LINKS STYLING ==================== */

    /* YouTube timestamp links - Vibrant and clear */
    .sai-timestamp-link {
      color: #60a5fa !important;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
      display: inline;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(96, 165, 250, 0.08);
      border: 1px solid rgba(96, 165, 250, 0.2);
    }

    .sai-timestamp-link:hover {
      color: #93c5fd !important;
      background: rgba(96, 165, 250, 0.15);
      border-color: rgba(96, 165, 250, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(96, 165, 250, 0.2);
    }

    .sai-timestamp-link:active {
      color: #38bdf8 !important;
      transform: translateY(0);
    }

    /* Regular URL links */
    .sai-url-link {
      color: #7dd3fc !important;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-thickness: 1px;
      cursor: pointer;
      transition: all 0.2s ease;
      word-break: break-all;
      display: inline;
    }

    .sai-url-link:hover {
      color: #a5f3fc !important;
      text-decoration-thickness: 2px;
      background: rgba(125, 211, 252, 0.08);
      padding: 0 3px;
      border-radius: 3px;
    }

    /* Email links */
    .sai-email-link {
      color: #7dd3fc !important;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sai-email-link:hover {
      color: #a5f3fc !important;
      background: rgba(125, 211, 252, 0.08);
      padding: 0 3px;
      border-radius: 3px;
    }

    /* ==================== TEXT FORMATTING ==================== */

    .sai-ai-content b, .sai-ai-content strong {
      font-weight: 700;
      color: #a7e3ff;
    }
    
    .sai-ai-content em, .sai-ai-content i {
      font-style: italic;
      color: #cfeefe;
    }
    
    .sai-ai-content h1, .sai-ai-content h2, .sai-ai-content h3, .sai-ai-content h4 {
      font-weight: 700;
      margin: 18px 0 10px 0;
      color: #60a5fa;
      line-height: 1.3;
    }
    
    .sai-ai-content h1, .sai-h2 {
      font-size: 17px;
      border-bottom: 2px solid rgba(96, 165, 250, 0.25);
      padding-bottom: 8px;
      margin-top: 20px;
    }
    
    .sai-ai-content h2, .sai-h3 {
      font-size: 16px;
      margin-top: 16px;
    }
    
    .sai-ai-content h3, .sai-h4 {
      font-size: 15px;
      margin-top: 14px;
    }
    
    .sai-ai-content p {
      margin: 12px 0;
      line-height: 1.7;
    }
    
    .sai-ai-content ul, .sai-ai-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    .sai-ai-content li {
      margin: 8px 0;
      line-height: 1.7;
    }
    
    .sai-ai-content hr, .sai-divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 20px 0;
    }
    
    .sai-ai-content code, .sai-inline-code {
      background: rgba(255,255,255,0.08);
      padding: 3px 7px;
      border-radius: 5px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      color: #bae6fd;
      cursor: text;
      user-select: text;
      border: 1px solid rgba(255,255,255,0.06);
    }
    
    .sai-ai-content blockquote {
      border-left: 4px solid rgba(96, 165, 250, 0.5);
      margin: 16px 0;
      padding-left: 16px;
      color: #cfeefe;
      font-style: italic;
      background: rgba(96, 165, 250, 0.03);
      padding: 12px 16px;
      border-radius: 6px;
    }

    /* Better line breaks */
    .sai-ai-content br {
      content: "";
      display: block;
      margin: 6px 0;
    }

    /* Selection styles */
    .sai-ai-content ::selection,
    .sai-user-bubble ::selection,
    #sai-response ::selection {
      background: rgba(96, 165, 250, 0.35);
      color: #ffffff;
    }

    .sai-ai-content ::-moz-selection,
    .sai-user-bubble ::-moz-selection,
    #sai-response ::-moz-selection {
      background: rgba(96, 165, 250, 0.35);
      color: #ffffff;
    }

    /* ==================== COPY & VOICE BUTTONS ==================== */

    /* Copy button */
    .sai-copy-button {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 6px;
      color: #9fb4d6;
      padding: 6px 8px;
      font-size: 11px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
    }

    .sai-copy-button:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: scale(1.05);
    }

    .sai-copy-button.copied {
      color: #4ade80;
      background: rgba(74, 222, 128, 0.15);
    }

    /* Voice button */
    .sai-voice-button {
      position: absolute;
      top: 12px;
      right: 46px;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 6px;
      color: #9fb4d6;
      padding: 6px 8px;
      font-size: 11px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
    }

    .sai-voice-button:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #7dd3fc;
      transform: scale(1.05);
    }

    .sai-voice-button.playing {
      color: #7dd3fc;
      background: rgba(125, 211, 252, 0.15);
    }

    .sai-voice-button.playing:hover {
      background: rgba(125, 211, 252, 0.2);
    }

    .sai-voice-button.loading {
      background: rgba(125, 211, 252, 0.1);
    }

    .sai-ai-message:hover .sai-copy-button,
    .sai-ai-message:hover .sai-voice-button {
      opacity: 1;
    }

    /* Voice loading indicator */
    .sai-voice-loading {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid #7dd3fc;
      border-radius: 50%;
      border-top-color: transparent;
      animation: sai-voice-spin 0.8s ease-in-out infinite;
    }

    @keyframes sai-voice-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error message styling */
    .sai-error-message {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 10px;
      padding: 14px;
      margin: 10px 0;
      color: #fca5a5;
      font-size: 13px;
      line-height: 1.6;
      animation: sai-error-appear 0.3s ease-out;
    }

    @keyframes sai-error-appear {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
/* ==================== BEAUTIFUL CODE BLOCK STYLING ==================== */

.sai-code-block {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.8);
}

.sai-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.9);
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.sai-code-language {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: #7dd3fc;
}



.sai-code-content {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  background: rgba(15, 23, 42, 0.95);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #e2e8f0;
  max-height: 300px;
}

.sai-code-content code {
  background: none;
  padding: 0;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  white-space: pre;
}

/* Syntax highlighting for common languages */
.sai-code-content .keyword { color: #f472b6; } /* pink */
.sai-code-content .string { color: #86efac; } /* green */
.sai-code-content .comment { color: #94a3b8; font-style: italic; } /* gray */
.sai-code-content .function { color: #7dd3fc; } /* light blue */
.sai-code-content .number { color: #fdba74; } /* orange */
.sai-code-content .class { color: #c084fc; } /* purple */
.sai-code-content .operator { color: #fca5a5; } /* red */

    /* ==================== RESPONSIVE ADJUSTMENTS ==================== */

    @media (max-width: 400px) {
      #sai-chat {
        width: calc(100vw - 40px);
        min-width: unset;
        max-width: calc(100vw - 40px);
        height: 70vh;
        min-height: 300px;
        max-height: 80vh;
      }
      
      .sai-voice-button {
        right: 40px;
        width: 26px;
        height: 26px;
      }
      .sai-copy-button {
        right: 10px;
        width: 26px;
        height: 26px;
      }
      #sai-mic {
        width: 30px;
        height: 30px;
        right: 42px;
      }
      #sai-send {
        width: 30px;
        height: 30px;
      }
      #sai-input {
        padding-right: 80px;
      }
      
      .sai-resize-handle {
        opacity: 0.5;
      }

      .sai-ai-content {
        padding: 14px;
      }

      .sai-bullet-item,
      .sai-numbered-item {
        margin: 8px 0;
      }
      
      #sai-header-buttons {
        gap: 2px;
      }
      
      .sai-header-btn {
        width: 26px;
        height: 26px;
      }
    }

    /* Small screen height adjustments */
    @media (max-height: 600px) {
      #sai-chat {
        min-height: 280px;
        max-height: 75vh;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .sai-timestamp-link {
        text-decoration-thickness: 2px;
        border-width: 2px;
      }
      
      .sai-url-link {
        text-decoration-thickness: 2px;
      }
      
      .sai-bold-heading {
        font-weight: 800;
      }
    }

    /* Print styles */
    @media print {
      #sai-panel, #sai-btn {
        display: none !important;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    `;
  }
}
