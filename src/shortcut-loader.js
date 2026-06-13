// ============================================================
//  QUICK MENTION - Shortcut Loader
//  Fetches tag data from Google Sheets (CSV) and parses into mapping.
//  Stores result in AppState.shortcuts.
//
//  Column A: shortcut (e.g. @dev)
//  Column B: list of users separated by newline.
//           Each user format: userId:Name (e.g. 11111:An Nguyen)
//  Column C: Enable (checkbox). Only rows with TRUE are loaded.
// ============================================================
class ShortcutLoader {
  constructor(url) {
    this.url = url;
  }

  /** Fetch and parse CSV, store into AppState */
  async load() {
    try {
      console.log('[ShortcutLoader] Fetching:', this.url);
      const resp = await fetch(this.url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const csv = await resp.text();
      console.log('[ShortcutLoader] Received', csv.length, 'bytes. First 200 chars:', csv.slice(0, 200));
      this._parse(csv);
      return true;
    } catch (err) {
      console.error('[ShortcutLoader] ERROR:', err.message);
      return false;
    }
  }

  _parse(csv) {
    const map = {};
    const tagsList = [];
    const rows = CSVParser.parseRows(csv);

    // export?format=csv returns row 1 as header → skip
    const dataRows = rows.slice(1);

    for (const cols of dataRows) {
      const rawShortcut = cols[0]?.trim();
      if (!rawShortcut) continue;

      // Column C: Enable — skip rows where checkbox is not checked
      const enabled = (cols[2] || '').trim().toUpperCase() === 'TRUE';
      if (!enabled) continue;

      const shortcut = rawShortcut.startsWith('@') ? rawShortcut : '@' + rawShortcut;
      tagsList.push(shortcut);

      const members = CSVParser.parseMembers(cols[1] || '');

      if (members.length > 0) {
        map[shortcut] = members;
      }
    }

    AppState.shortcuts = map;
    AppState.tagsList = tagsList;
    console.log(`[Quick Mention] Loaded ${Object.keys(map).length} shortcut tags.`);
  }
}