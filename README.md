# WatchWing AI

**Watchwing AI** is a powerful Chrome extension that provides AI-powered screen analysis and assistance. Ask questions about any webpage and get intelligent responses based on visual content analysis.

---

## Features

- **AI-Powered Analysis** — Get detailed insights about any webpage content.
- **Drag & Drop Interface** — Move the chat window anywhere on your screen.
- **Session Management** — Keeps your conversation history during browsing sessions.
- **Dark Theme** — Beautiful and modern dark mode interface.
- **Copy Responses** — Instantly copy AI-generated messages with one click.
- **Progressive Loading** — Smooth visual feedback during processing.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Bhargav00007/watchwing-extension.git
cd watchwing-extension
```

## File Descriptions

### Core Files

- **manifest.json** — Defines the extension’s metadata, permissions, and entry points.
- **background.js** — Handles background processes such as capturing screenshots and communicating with the AI backend.
- **popup.html / popup.js** — Provides a lightweight popup interface for quickly activating or controlling the AI assistant.

### Content Script Modules

- **contentScript.js** — Central orchestrator that initializes all modules and connects the content scripts with the background service worker.
- **uiManager.js** — Dynamically creates and manages the floating chat window and its components (input box, buttons, message container).
- **chatManager.js** — Handles user input, sends messages to the AI, and receives and renders responses in real time.
- **dragManager.js** — Enables smooth drag-and-drop repositioning of the floating chat UI anywhere on the screen.
- **sessionManager.js** — Stores and restores session history locally so conversations persist across page reloads.
- **responseFormatter.js** — Formats and styles AI messages with structured layout, markdown support, and copy-to-clipboard actions.
- **styles.js** — Manages visual theme, layout styles, animations, and color consistency throughout the chat interface.

---

## Usage

1. Navigate to **any webpage**.
2. Click the **“Ask AI”** button in the bottom-right corner.
3. Type your question related to the current screen or page.
4. **Drag and reposition** the chat window as needed.
5. **Copy** any AI response using the copy button beside messages.

---

## Example Questions

- “What’s on this page?”
- “Summarize the main content.”
- “Find contact information.”
- “Explain this chart or diagram.”
- “Who is this page about?”
- “List all links shown here.”

---

## File Structure

```text
watchwing-extension/
├── manifest.json              # Extension configuration and permissions
├── popup.html                 # Popup UI for quick actions
├── popup.js                   # Popup functionality and event handlers
├── background.js              # Background script for screenshot capture and backend calls
├── content/                   # Content scripts (core AI logic)
│   ├── contentScript.js       # Main orchestrator - initializes modules
│   ├── uiManager.js           # Creates and manages the floating chat UI
│   ├── chatManager.js         # Handles sending/receiving messages to the AI
│   ├── dragManager.js         # Enables draggable chat window
│   ├── sessionManager.js      # Saves and restores conversation history
│   ├── responseFormatter.js   # Formats AI text and adds styling
│   └── styles.js              # CSS-in-JS style definitions
└── README.md                  # Project documentation

```
