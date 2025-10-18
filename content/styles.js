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
      position: fixed;
      bottom: 52px;
      right: 22px;
      cursor: default;
      user-select: none;
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
      cursor: default;
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
      cursor: auto;
      user-select: text;
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
      cursor: default;
      user-select: none;
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
      gap: 0;
      align-items: center;
      padding: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
      cursor: default;
      user-select: none;
      position: relative;
    }

    /* Input with buttons inside */
    #sai-input {
      flex: 1 1 auto;
      min-height: 40px;
      max-height: 160px;
      resize: none;
      padding: 8px 90px 8px 10px; /* Extra right padding for buttons */
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
    }

    #sai-send:hover { 
      background: linear-gradient(180deg, #38bdf8, #0284c7);
      transform: translateY(-50%) scale(1.05);
    }
    #sai-send:active { transform: translateY(-50%) scale(0.95); }

    /* Microphone button - INSIDE INPUT (left of send button) */
    #sai-mic {
      position: absolute;
      right: 46px; /* Positioned to the left of send button */
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

    /* Chat bubble styles - User only */
    .sai-message {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      cursor: auto;
      user-select: text;
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
      cursor: auto;
      user-select: text;
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
      cursor: auto;
      user-select: text;
      word-wrap: break-word;
      overflow-wrap: break-word;
      position: relative;
    }

    .sai-sender {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
      padding: 0 4px;
      cursor: default;
      user-select: none;
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
      cursor: text;
      user-select: text;
    }
    
    .sai-ai-content blockquote {
      border-left: 3px solid rgba(125, 211, 252, 0.4);
      margin: 8px 0;
      padding-left: 12px;
      color: #cfeefe;
    }

    /* Selection styles for better readability */
    .sai-ai-content ::selection,
    .sai-user-bubble ::selection,
    #sai-response ::selection {
      background: rgba(14, 165, 233, 0.3);
      color: #ffffff;
    }

    .sai-ai-content ::-moz-selection,
    .sai-user-bubble ::-moz-selection,
    #sai-response ::-moz-selection {
      background: rgba(14, 165, 233, 0.3);
      color: #ffffff;
    }

    /* Copy button for AI responses */
    .sai-copy-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 6px;
      color: #9fb4d6;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease, background 0.2s ease;
      backdrop-filter: blur(4px);
      z-index: 2;
    }

    .sai-copy-button:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    /* Voice button for AI responses */
    .sai-voice-button {
      position: absolute;
      top: 8px;
      right: 60px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 6px;
      color: #9fb4d6;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease, background 0.2s ease;
      backdrop-filter: blur(4px);
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 24px;
    }

    .sai-voice-button:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #7dd3fc;
    }

    .sai-voice-button.playing {
      color: #7dd3fc;
      background: rgba(125, 211, 252, 0.1);
    }

    .sai-voice-button.playing:hover {
      background: rgba(125, 211, 252, 0.15);
    }

    .sai-ai-message {
      position: relative;
    }

    .sai-ai-message:hover .sai-copy-button,
    .sai-ai-message:hover .sai-voice-button {
      opacity: 1;
    }

    /* Voice controls container */
    .sai-voice-controls {
      display: flex;
      gap: 4px;
      position: absolute;
      top: 8px;
      right: 8px;
    }

    /* Voice loading indicator */
    .sai-voice-loading {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid #7dd3fc;
      border-radius: 50%;
      border-top-color: transparent;
      animation: sai-voice-spin 1s ease-in-out infinite;
    }

    @keyframes sai-voice-spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 400px) {
      .sai-voice-button {
        right: 55px;
      }
      .sai-copy-button {
        right: 8px;
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
    }
    `;
  }
}
