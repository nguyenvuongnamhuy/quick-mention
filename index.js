// ============================================================
//  QUICK MENTION - Entry Point
//  Loads modules in correct dependency order
//  (Declared in manifest.json > content_scripts > js)
// ============================================================

// Bootstrap: initialize app after DOM is ready
const app = new QuickMentionApp();

async function boot() {
  // If DOM isn't ready yet, wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  }
  await app.init();
}

boot();
