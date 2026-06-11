// ============================================================
//  QUICK MENTION - Webhook Client
//  Sends data to Google Chat API.
//  Webhook URL is resolved from AppState.webhooks[spaceId].
//  If threadId is present, replies in thread.
//  Sends a single message with all matched members.
// ============================================================
class WebhookClient {
  /** Check if space has a webhook configured */
  static isConfigured(spaceId) {
    return spaceId && !!AppState.webhooks[spaceId];
  }

  /**
   * Send menu webhook: list all tags and space names.
   */
  static async sendMenu(context) {
    const { spaceId, threadId } = context;

    if (!this.isConfigured(spaceId)) {
      console.log(`[Quick Mention] Space "${spaceId}" has no webhook. Skipping menu.`);
      return false;
    }

    let webhookUrl = AppState.webhooks[spaceId];

    const tagsLabel = AppState.labels['tags'] || '*📋 Tags:*';
    const spacesLabel = AppState.labels['spaces'] || '*📋 Spaces:*';
    const menuTag = AppState.labels['menu'] || '@menu';

    const lines = [];
    lines.push('*' + tagsLabel + '*');
    lines.push(`  • ${menuTag}`);
    AppState.tagsList.forEach(t => lines.push(`  • ${t}`));
    lines.push('');
    lines.push('*' + spacesLabel + '*');
    AppState.spaceNames
      .filter(n => !/\(hide\)/i.test(n))
      .forEach(n => lines.push(`  • ${n}`));

    const payload = { text: lines.join('\n') };

    if (threadId) {
      webhookUrl += '&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD';
      payload.thread = {
        name: `spaces/${spaceId}/threads/${threadId}`,
      };
    }

    await new Promise(r => setTimeout(r, 100));

    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${body}`);
      }

      console.log(`[Quick Mention] Menu sent.`);
      return true;
    } catch (err) {
      console.error('[Quick Mention] Webhook menu error:', err);
      return false;
    }
  }

  /**
   * Send webhook with matched tags.
   * Message format per tag:
   *   @dev: @John @Jack
   *   @qa: @Jane @Judy
   * @param {Object} context - { spaceId, threadId }
   * @param {Array} matches - [{ shortcut, members: [{userId, name}] }]
   */
  static async send(context, matches) {
    const { spaceId, threadId } = context;

    if (!this.isConfigured(spaceId)) {
      console.log(`[Quick Mention] Space "${spaceId}" has no webhook. Skipping.`);
      return false;
    }

    let webhookUrl = AppState.webhooks[spaceId];

    // Build text: one line per tag
    const lines = matches.map(m => {
      const mentions = m.members
        .map(mm => `<users/${mm.userId}>`)
        .join(' ');
      return `*${m.shortcut}:* ${mentions}`;
    });
    const text = lines.join('\n');

    // Use text message (not card)
    const payload = { text };

    // If threadId present, reply in thread
    if (threadId) {
      webhookUrl += '&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD';
      payload.thread = {
        name: `spaces/${spaceId}/threads/${threadId}`,
      };
    }

    // Delay 200ms so the original message is sent before the webhook
    await new Promise(r => setTimeout(r, 200));

    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${body}`);
      }

      console.log(`[Quick Mention] Webhook sent (${matches.length} tags).`, threadId ? `(reply thread ${threadId})` : '(new message)');
      return true;
    } catch (err) {
      console.error('[Quick Mention] Webhook error:', err);
      return false;
    }
  }
}