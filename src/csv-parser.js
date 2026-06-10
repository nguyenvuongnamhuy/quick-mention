// ============================================================
//  QUICK MENTION - CSV Parser
//  Parses CSV from Google Sheets (supports quoted fields)
// ============================================================
class CSVParser {
  /**
   * Parse an entire CSV string into an array of rows, each row being an array of columns.
   * Supports quoted fields containing newlines (\n).
   */
  static parseRows(csv) {
    const rows = [];
    let curRow = [];
    let cur = '';
    let inQuotes = false;

    for (const ch of csv) {
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        curRow.push(cur);
        cur = '';
        continue;
      }
      if (ch === '\n' && !inQuotes) {
        curRow.push(cur);
        rows.push(curRow);
        curRow = [];
        cur = '';
        continue;
      }
      cur += ch;
    }
    // Last field / row
    if (cur || curRow.length > 0) {
      curRow.push(cur);
      rows.push(curRow);
    }
    return rows;
  }

  /**
   * Parse column B (members).
   * Format: one user per line, e.g.:
   *   123456789123456789123 (John Doe)
   *   987654321987654321987 (Jane Smith)
   * Extracts userId (21 digits) and name in parentheses.
   */
  static parseMembers(tagStr) {
    if (!tagStr) return [];

    return tagStr
      .split('\n')
      .map(s => s.trim())
      .filter(s => s)
      .map(s => {
        const m = s.match(/(\d{21})\s*\((.+)\)/);
        return m ? { userId: m[1], name: m[2].trim() } : null;
      })
      .filter(m => m !== null);
  }

}