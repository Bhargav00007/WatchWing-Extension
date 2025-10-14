class ResponseFormatter {
  static cleanAiResponse(text) {
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
      .replace(/<hr\s*\/?>/gi, "-------------\n")
      .replace(/<[^>]*>/g, ""); // Remove any remaining HTML tags

    // Clean up multiple newlines
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n").replace(/^\s+|\s+$/g, "");

    return text;
  }

  static formatAiResponse(text) {
    if (!text) return "";

    // Clean the text first
    text = this.cleanAiResponse(text);

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
}
