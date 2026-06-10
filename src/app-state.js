// ============================================================
//  QUICK MENTION - App State (global singleton)
//  Shared across all modules. Loaded once at startup.
// ============================================================
const AppState = {
  /** { '@shortcut': [{ userId, name }] } */
  shortcuts: {},

  /** { 'spaceId': 'webhookUrl' } */
  webhooks: {},

  /** { name: value } */
  labels: {},

  /** List of tag shortcut names (column A from Shortcut sheet) */
  tagsList: [],

  /** List of space names (column A from Webhook sheet) */
  spaceNames: [],

  /** Whether data has been loaded */
  ready: false,
};
