// ============================================================
//  QUICK MENTION - Configuration
// ============================================================

// public Google Sheet (read-only, no auth required)
const SHEET_ID = '';

// Sheet Shortcut (tab "Shortcut", gid=0): column A = shortcut, column B = userId (Name)\nuserId2 (Name2)
const GRID_SHORTCUT_NUMBER = 0;
const SHEET_SHORTCUT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GRID_SHORTCUT_NUMBER}`;

// Sheet Webhook (tab "Webhook", gid=500084238): column A = name, column B = space ID, column C = webhook URL
const GRID_WEBHOOK_NUMBER = 0;
const SHEET_WEBHOOK_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GRID_WEBHOOK_NUMBER}`;

// Sheet Label (tab "Label", gid=764047798): column A = Label (name), column B = Value
const GRID_LABEL_NUMBER = 0;
const SHEET_LABEL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GRID_LABEL_NUMBER}`;
