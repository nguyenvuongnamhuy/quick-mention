# Quick Mention

A Chrome extension that expands shortcut keywords into Google Chat mentions via webhook. Type `@dev` and the extension automatically sends a webhook mentioning all members of that group.

> ⚠️ **Browser only**: This extension works exclusively on desktop browsers (Chrome/Edge/Brave). Not supported on mobile.

## How it works

1. The extension loads 3 sheets from a public Google Sheet (CSV export):
   - **Shortcut sheet**: maps `@keyword` → list of user IDs
   - **Webhook sheet**: maps space ID → webhook URL
   - **Label sheet**: configurable labels (e.g., menu trigger keyword, display text)
2. When you type a shortcut (e.g., `@dev`) and press Enter / click Send, the extension:
   - Detects all matching shortcuts in your message text
   - Sends a webhook to the current space mentioning all matched users
   - If replying in a thread, the webhook replies in the same thread
3. Type `@menu` (configurable via Label sheet) to see all available shortcuts and spaces

## Installation

You have two options:

### Option 1 — Download .crx from Releases

1. Go to the **Releases** page of this repo
2. Download the latest `quick-mention.crx`
3. Open Chrome / Edge / Brave and go to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Drag and drop the `.crx` file onto the page

### Option 2 — Load unpacked (for development)

1. Clone the repo:
   ```bash
   git clone <this-repo-url>
   cd quick-mention
   ```
2. Create & edit config:
   ```bash
   cp config.example.js config.js
   ```
3. Open Chrome / Edge / Brave and go to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked**
6. Select the `quick-mention` folder

### 3. Configure the Google Sheet

The extension reads from a default Google Sheet ID in `config.js`. To use your own sheet:

1. Create a new Google Sheet with **exactly 3 tabs** (names must match):
   - **Shortcut**: col A = shortcut (e.g. `@dev`), col B = user IDs (one per line, format `userId:Name`)
   - **Webhook**: col A = space name, col B = space ID, col C = webhook URL
   - **Label**: col A = label name, col B = value (e.g. `menu` → `@menu`)
2. Publish: **File → Share → Publish to web** (CSV format)
3. Copy the Sheet ID from the URL and update `config.js`
4. Reload the extension at `chrome://extensions/`

### 4. Usage

- Open [Google Chat](https://chat.google.com)
- Type `@dev` (or any configured shortcut) in the message input
- Press **Enter** or click **Send**
- The extension sends a webhook mentioning the matching members
- Type `@menu` (or your custom label) to list all shortcuts and spaces

## Sheet format

### Shortcut sheet (gid=0)

| Shortcut | Google User ID |
|----------|----------------|
| @dev | 123456789 (Jack)<br>987654321 (Justin) |
| @qa | 111111111 (Jane)<br>222222222 (John) |

### Webhook sheet (gid=500084238)

| Space Name | Space ID | Webhook URL |
|------------|----------|-------------|
| Team Dev | AAAAAA... | https://chat.googleapis.com/... |

### Label sheet (gid=764047798)

| Label | Value |
|-------|-------|
| menu | @menu |
| tags | *📋 Tags:* |
| spaces | *📋 Spaces:* |

## Project structure

```
config.js              # Sheet IDs and URLs
index.js               # Entry point
manifest.json          # Chrome extension manifest
src/
  app-state.js         # Global singleton state
  app.js               # Main application logic
  chat-dom.js          # DOM interaction (find text, extract context)
  csv-parser.js        # Multi-line CSV parser
  label-loader.js      # Loads Label sheet data
  shortcut-loader.js   # Loads Shortcut sheet data
  webhook-loader.js    # Loads Webhook sheet data
  webhook.js           # Webhook client (send messages to Google Chat)
```

## Tech stack

- Vanilla JavaScript (no frameworks)
- Google Sheets CSV export as data source
- Google Chat webhook API (text messages)
- Chrome Extension Manifest V3