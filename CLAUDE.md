# Quick Mention — Technical Reference

## Architecture

Chrome Extension (Manifest V3) that intercepts Enter/Send in Google Chat, detects shortcut keywords (e.g. `@dev`), and sends webhook mentions.

### Data flow

```
Google Sheets (CSV export)
  ├── Shortcut sheet (gid=0) → SheetLoader → AppState.shortcuts
  ├── Webhook sheet  (gid=500084238) → WebhookSheetLoader → AppState.webhooks
  └── Label sheet    (gid=764047798) → LabelLoader → AppState.labels
                                            ↓
                                    AppState ready
                                            ↓
User types message + presses Enter / clicks Send
                            ↓
          ChatDomSniffer.findAllMatches(text, AppState.shortcuts)
                            ↓
          WebhookClient.send(context, matches) → POST webhook
```

### Key classes

| Class | File | Role |
|-------|------|------|
| `SheetLoader` | `sheet-loader.js` | Parses Shortcut sheet (col A = shortcut, col B = user list) into `AppState.shortcuts` |
| `WebhookSheetLoader` | `webhook-loader.js` | Parses Webhook sheet (col A = name, col B = space ID, col C = URL) into `AppState.webhooks` |
| `LabelLoader` | `label-loader.js` | Parses Label sheet (col A = name, col B = value) into `AppState.labels` |
| `ChatDomSniffer` | `chat-dom.js` | Finds text, extracts space/thread context from DOM |
| `WebhookClient` | `webhook.js` | Sends text messages to Google Chat webhook URL |
| `QuickMentionApp` | `app.js` | Orchestrator: loads data, binds events, handles message |
| `CSVParser` | `csv-parser.js` | Multi-line CSV parser (quoted fields) |

### AppState (src/app-state.js)

```js
AppState = {
  shortcuts: { '@dev': [{ userId, name }] },
  webhooks:   { 'spaceId': 'webhookUrl' },
  labels:     { 'menu': '@menu', 'tags': '*📋 Tags:*', 'spaces': '*📋 Spaces:*' },
  tagsList:   ['@dev', '@qa'],
  spaceNames: ['Team Dev', 'QA Team'],
  ready:      false,
}
```

### Menu detection

- Menu trigger keyword comes from `AppState.labels['menu']` (default: `'@menu'`)
- When trigger is detected, `WebhookClient.sendMenu()` sends a listing of all shortcuts and spaces
- The trigger is excluded from tag matches so it doesn't mention users

### Webhook message

- Text format (not card): each matched shortcut becomes a line with `<users/USER_ID>` mention chips
- 200ms delay before sending to ensure the original message is sent first
- If thread ID present, replies in the same thread

### CSV parser

- Handles multi-line quoted fields (common in Google Sheets CSV export with newlines in cells)
- Columns: `parseRows(csv)` → array of arrays
- Members: `parseMembers(field)` → `[{ userId, name }]` from `userId:Name\nuserId2:Name2`

### Entry point

`index.js` is loaded first (runs before anything else), then `config.js` (constants), then all `src/` files.

## Config (config.js)

Three sheet IDs are hardcoded with their `gid` values:
- Shortcut: `gid=0`
- Webhook: `gid=500084238`
- Label: `gid=764047798`

To use a different sheet, update `SHEET_ID` and optionally the gid values. The sheet must be published to web (CSV format) and publicly readable.