class ResponseFormatter {
  static cleanAiResponse(text) {
    if (!text) return "";

    // Decode HTML entities
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");

    // Remove HTML tags but preserve structure
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
      .replace(/<[^>]*>/g, "");

    // Clean up multiple newlines
    text = text.replace(/\n\s*\n\s*\n+/g, "\n\n").trim();

    return text;
  }

  static formatAiResponse(text) {
    if (!text) return "";

    // Clean the text first
    text = this.cleanAiResponse(text);

    // Convert markdown code blocks with language specification
    text = this.formatCodeBlocks(text);

    // Convert markdown bold to HTML with blue styling
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="sai-bold-heading">$1</strong>'
    );

    // Convert markdown italic to HTML
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert markdown inline code to HTML
    text = text.replace(/`(.*?)`/g, '<code class="sai-inline-code">$1</code>');

    // Convert headings
    text = text.replace(/^###\s+(.*)$/gm, '<h4 class="sai-h4">$1</h4>');
    text = text.replace(/^##\s+(.*)$/gm, '<h3 class="sai-h3">$1</h3>');
    text = text.replace(/^#\s+(.*)$/gm, '<h2 class="sai-h2">$1</h2>');

    // Convert horizontal rules
    text = text.replace(/^---$/gm, '<hr class="sai-divider">');

    // Process bullet points with proper structure
    text = this.formatBulletPoints(text);

    // Process numbered lists with proper structure
    text = this.formatNumberedLists(text);

    // Convert paragraphs
    text = this.formatParagraphs(text);

    return text;
  }

  // NEW: Format code blocks with language labels
  static formatCodeBlocks(text) {
    // Handle code blocks with language specification like ```python, ```javascript, etc.
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

  // Helper method to escape HTML for code blocks
  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
    // Split by double newlines to get paragraphs
    const blocks = text.split("\n\n");
    let result = [];

    for (let block of blocks) {
      block = block.trim();
      if (!block) continue;

      // Check if block is already formatted (contains HTML tags)
      if (
        block.includes("sai-code-block") ||
        block.includes("sai-bullet-list") ||
        block.includes("sai-numbered-list") ||
        block.includes("<h2") ||
        block.includes("<h3") ||
        block.includes("<h4") ||
        block.includes("<hr") ||
        block.includes("sai-bold-heading")
      ) {
        result.push(block);
      } else {
        // Regular text - split by single newlines for line breaks
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l);

        if (lines.length > 0) {
          // Join lines with <br> for better readability
          result.push(`<p class="sai-paragraph">${lines.join("<br>")}</p>`);
        }
      }
    }

    return result.join("");
  }

  // Helper method to strip HTML for plain text (useful for copying/speech)
  static stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Helper method to detect if text contains markdown
  static hasMarkdown(text) {
    return /(\*\*|__|`|#{1,6}\s|^\d+\.\s|^[•\*\-]\s)/m.test(text);
  }

  // Enhanced method to format clickable content (URLs, emails, etc.)
  static makeContentClickable(text, currentUrl) {
    if (!text) return text;

    // Check if we're on YouTube
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

    // Remove malformed YouTube URLs
    if (currentVideoId) {
      text = text.replace(
        /https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+&t=\d+s["\s]*target="_blank">\[https:\/\/[^\]]+\]/g,
        ""
      );

      text = text.replace(
        /https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+&t=\d+s["\s]*target="_blank">/g,
        ""
      );
    }

    // Handle YouTube timestamps
    if (currentVideoId) {
      // [MM:SS] format
      text = text.replace(
        /[\[\(](\d{1,2}):(\d{2})[\]\)]/g,
        (match, minutes, seconds) => {
          const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
          const timestampUrl = `https://www.youtube.com/watch?v=${currentVideoId}&t=${totalSeconds}s`;
          const displayTime = `${minutes}:${seconds}`;
          return `<a class="sai-timestamp-link" href="${timestampUrl}" target="_blank">[${displayTime}]</a>`;
        }
      );

      // Standalone MM:SS
      text = text.replace(
        /(?<![\w\/=\-])(\d{1,2}):(\d{2})(?![\w\]])/g,
        (match, minutes, seconds) => {
          const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
          const timestampUrl = `https://www.youtube.com/watch?v=${currentVideoId}&t=${totalSeconds}s`;
          const displayTime = `${minutes}:${seconds}`;
          return `<a class="sai-timestamp-link" href="${timestampUrl}" target="_blank">[${displayTime}]</a>`;
        }
      );

      // Seconds only (570s)
      text = text.replace(
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

    // Make regular URLs clickable (avoid YouTube watch URLs and already linked content)
    text = text.replace(
      /(?<!href=["'])(?<!href=)(https?:\/\/(?!www\.youtube\.com\/watch)[^\s<"']+)(?!["'])/g,
      (match) => {
        return `<a href="${match}" target="_blank" class="sai-url-link">${match}</a>`;
      }
    );

    // Make email addresses clickable
    text = text.replace(
      /(?<![\w@])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})(?![\w])/g,
      '<a href="mailto:$1" class="sai-email-link">$1</a>'
    );

    return text;
  }

  // Method to add YouTube timestamp styling
  static styleTimestamps(text) {
    // Ensure timestamps have proper styling class
    return text.replace(
      /<a([^>]*?)class="sai-timestamp-link"([^>]*?)>\[(\d{1,2}:\d{2})\]<\/a>/g,
      '<a$1class="sai-timestamp-link"$2>[$3]</a>'
    );
  }
}
