// ============================================================
//  QUICK MENTION - Chat DOM Sniffer
//  Interacts with Google Chat DOM to extract context
//  (space ID, thread ID, input content, ...)
// ============================================================
class ChatDomSniffer {
  /** Get the currently focused input element (contenteditable) */
  static getInput() {
    const el = document.activeElement;
    return el?.isContentEditable ? el : null;
  }

  /** Get text content from input element */
  static getText(el) {
    return el?.textContent || '';
  }

  /**
   * Find all matching shortcuts in text.
   * Simple substring match: if text contains the shortcut string, it's a match.
   * Google Chat converts @mentions into chips which drop the @ from textContent,
   * but text.includes('@blackdev') still works because we compare against
   * the raw textContent which still contains the full text reconstructed below.
   * Returns [{ shortcut: '@dev', members: [{userId, name}] }].
   * Each tag appears only once in the result.
   */
  static findAllMatches(text, mapping) {
    const results = [];

    for (const [shortcut, members] of Object.entries(mapping)) {
      if (text.includes(shortcut)) {
        results.push({ shortcut, members });
      }
    }

    return results;
  }

  /** Kept for backward compatibility */
  static findMatch(text, mapping) {
    const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (text.includes(key)) {
        return { shortcut: key, tags: mapping[key] };
      }
    }
    return null;
  }

  /** Check if element is a send button, returns the button or null */
  static isSendButton(el) {
    if (!el) return null;
    return el.closest(
      '[aria-label="Gửi tin nhắn"], [aria-label="Send message"], [aria-label="Send"]'
    );
  }

  /**
   * Find the contenteditable input closest to the send button.
   * Used when clicking the send button because activeElement may not update in time.
   */
  static getSendButtonInput(sendBtn) {
    if (!sendBtn) return null;

    // Walk up from Send button, at each level find contenteditable elements.
    // When there are MULTIPLE contenteditable (main input + reply input),
    // pick the one closest to sendBtn (deepest depth).
    let el = sendBtn;
    while (el) {
      el = el.parentElement;
      if (!el || el === document.body) break;

      const inputs = el.querySelectorAll('[contenteditable="true"]');
      if (inputs.length > 0) {
        let best = null;
        let bestDepth = -1;

        for (const input of inputs) {
          let depth = 0;
          let p = input;
          while (p && p !== el) { depth++; p = p.parentElement; }
          if (depth > bestDepth) {
            bestDepth = depth;
            best = input;
          }
        }

        if (best) return best;
      }
    }

    // Final fallback: activeElement
    const active = document.activeElement;
    return active?.isContentEditable ? active : null;
  }

  /**
   * Extract Space ID and Thread ID from URL + DOM.
   * @param {Element} [inputEl] - Input element being typed in. If provided,
   *   thread ID is only extracted from DOM fallback if this input is inside a thread panel.
   */
  static extractContext(inputEl) {
    return {
      spaceId: this._extractSpaceId(),
      threadId: this._extractThreadId(inputEl),
    };
  }

  // ---- Private ----

  static _extractSpaceId() {
    const url = window.location.href;

    const patterns = [
      /\/room\/([^/?\s]+)/,
      /\/(?:chat\/space|app\/chat)\/([^/?\s]+)/,
      /\/chat\/person\/([^/?\s]+)/,
      /\/chat\/groupdm\/([^/?\s]+)/,
    ];

    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }

    // Fallback
    const groupEl = document.querySelector('[data-group-id]');
    const gid = groupEl?.getAttribute('data-group-id');
    if (gid?.startsWith('space/')) return gid.slice('space/'.length);

    return null;
  }

  static _extractThreadId(inputEl) {
    const url = window.location.href;

    // URL: /room/SPACE_ID/THREAD_ID/THREAD_ID
    const m = url.match(/\/room\/[^/?\s]+\/([^/?\s]+)\/\1/);
    if (m) return m[1];

    // Legacy URL: /chat/thread/THREAD_ID
    const m2 = url.match(/\/chat\/thread\/([^/?\s]+)/);
    if (m2) return m2[1];

    // DOM fallback: ONLY extract thread ID if input is inside a thread panel
    if (inputEl) {
      const panel = inputEl.closest('[data-is-detailed-thread-view="true"]');
      if (panel) {
        const tid = panel.getAttribute('data-topic-id') || panel.getAttribute('data-local-topic-id');
        if (tid) return tid;
      }
    }

    return null;
  }
}