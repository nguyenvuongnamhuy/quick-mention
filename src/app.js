// ============================================================
//  QUICK MENTION - Application
//  Flow:
//  1. Load 3 sheets (Shortcut + Webhook + Label) → AppState
//  2. Attach event listeners (keydown + mousedown)
//  3. On Enter / Send click:
//     a. Get input text
//     b. findAllMatches → [{ shortcut: '@tag', members: [{userId, name}] }]
//        If empty → skip, don't send anything
//     c. If menu trigger keyword is present, send menu webhook
//     d. If there are tag matches, send mention webhook
// ============================================================
class QuickMentionApp {
  constructor() {
    this.shortcutLoader = new ShortcutLoader(SHEET_SHORTCUT_URL);
    this.webhookLoader = new WebhookLoader(SHEET_WEBHOOK_URL);
    this.labelLoader = new LabelLoader(SHEET_LABEL_URL);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  /** Start the app */
  async init() {
    // Load all 3 sheets in parallel
    const [shortcutOk, webhookOk, labelOk] = await Promise.all([
      this.shortcutLoader.load(),
      this.webhookLoader.load(),
      this.labelLoader.load(),
    ]);

    // Attach event listeners (only after data is ready)
    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('mousedown', this._onMouseDown, true);

    console.log(`[Quick Mention] Ready. Shortcut: ${shortcutOk ? 'OK' : 'FAIL'} | Webhook: ${webhookOk ? 'OK' : 'FAIL'} | Label: ${labelOk ? 'OK' : 'FAIL'}`);
  }

  // ---- Event handlers ----

  _onKeyDown(e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    this._handleMessage(ChatDomSniffer.getInput());
  }

  _onMouseDown(e) {
    const sendBtn = ChatDomSniffer.isSendButton(e.target);
    if (!sendBtn) return;

    const el = ChatDomSniffer.getSendButtonInput(sendBtn);
    this._handleMessage(el);
  }

  // ---- Core ----

  _handleMessage(el) {
    if (!el) return;

    const text = ChatDomSniffer.getText(el);
    const matches = ChatDomSniffer.findAllMatches(text, AppState.shortcuts);
    const context = ChatDomSniffer.extractContext(el);

    // Resolve trigger from Labels sheet: if labels has 'menu', use its value (e.g. '@menu')
    const menuTrigger = AppState.labels['menu'] || '@menu';
    const hasMenu = text.includes(menuTrigger);

    // Send menu message if trigger is present
    if (hasMenu) {
      WebhookClient.sendMenu(context);
    }

    // Send tag mentions if there are any (filter out menu trigger if it exists in shortcuts)
    const tagMatches = matches.filter(m => m.shortcut !== menuTrigger);
    if (tagMatches.length > 0) {
      this._log(context, tagMatches);
      WebhookClient.send(context, tagMatches);
    }
  }

  _log(context, matches) {
    const tags = matches.map(m => m.shortcut).join(', ');
    const allMembers = matches.flatMap(m => m.members.map(mm => mm.name));

    console.log(`[Quick Mention] ==============================`);
    console.log(`[Quick Mention] Space ID:`, context.spaceId || '(N/A)');
    console.log(`[Quick Mention] Thread ID:`, context.threadId || '(original message)');
    console.log(`[Quick Mention] Tags:`, tags);
    console.log(`[Quick Mention] Members:`, allMembers.join(', '));
    console.log(`[Quick Mention] ==============================`);
  }
}