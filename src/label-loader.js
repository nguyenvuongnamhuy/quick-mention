// ============================================================
//  QUICK MENTION - Labels Loader
//  Fetches labels data from Google Sheets (CSV)
//  Column A: name
//  Column B: value
//  Stores in AppState.labels = { name: value }
// ============================================================
class LabelLoader {
  constructor(url) {
    this.url = url;
  }

  /** Fetch and parse CSV, store into AppState.labels */
  async load() {
    try {
      console.log('[LabelLoader] Fetching:', this.url);
      const resp = await fetch(this.url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const csv = await resp.text();
      console.log('[LabelLoader] Received', csv.length, 'bytes. First 200 chars:', csv.slice(0, 200));
      this._parse(csv);
      return true;
    } catch (err) {
      console.error('[LabelLoader] ERROR:', err.message);
      return false;
    }
  }

  _parse(csv) {
    const map = {};
    const rows = CSVParser.parseRows(csv);

    // export?format=csv returns row 1 as header → skip
    const dataRows = rows.slice(1);

    for (const cols of dataRows) {
      const name = cols[0]?.trim();
      const value = cols[1]?.trim();
      if (name && value) {
        map[name] = value;
      }
    }

    AppState.labels = map;
    console.log(`[LabelLoader] Loaded ${Object.keys(map).length} label entries.`);
  }
}