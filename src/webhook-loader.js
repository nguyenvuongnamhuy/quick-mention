// ============================================================
//  QUICK MENTION - Webhook Sheet Loader
//  Fetches space-webhook mapping from Google Sheets (CSV)
//  Column A: name
//  Column B: space ID
//  Column C: webhook URL
// ============================================================
class WebhookLoader {
  constructor(url) {
    this.url = url;
    this.mapping = {}; // { spaceId: webhookUrl }
  }

  /** Fetch and parse CSV, store into AppState.webhooks */
  async load() {
    try {
      console.log('[WebhookLoader] Fetching:', this.url);
      const resp = await fetch(this.url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const csv = await resp.text();
      console.log('[WebhookLoader] Received', csv.length, 'bytes. First 200 chars:', csv.slice(0, 200));
      this._parse(csv);
      return true;
    } catch (err) {
      console.error('[WebhookLoader] ERROR:', err.message);
      return false;
    }
  }

  _parse(csv) {
    const map = {};
    const spaceNames = [];
    const rows = CSVParser.parseRows(csv);

    // export?format=csv returns row 1 as header → skip
    const dataRows = rows.slice(1);

    for (const cols of dataRows) {
      if (cols.length < 3) continue;

      // Column A = name (used for menu)
      const name = cols[0]?.trim();
      // Column B = space ID
      // Column C = webhook URL
      const spaceId = cols[1].trim();
      const webhookUrl = cols[2].trim().replace(/^"|"$/g, '');

      if (name) spaceNames.push(name);

      if (spaceId && webhookUrl) {
        map[spaceId] = webhookUrl;
      }
    }

    AppState.webhooks = map;
    AppState.spaceNames = spaceNames;
    console.log(`[Quick Mention] Loaded ${Object.keys(map).length} webhook mappings.`);
  }
}