/* Storage layer. Phase 1 keeps admin edits as a draft in this browser and
   exports a new data.js to publish. Phase 2 (VPS) replaces load/save with
   API calls — nothing else in the app needs to change. */
window.UNEStore = (() => {
  const KEY = 'une-draft-v1';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function readDraft() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  return {
    /* Public visitors always see published data; the owner sees their draft. */
    load({ draft = false } = {}) {
      const d = draft && readDraft();
      return clone(d || window.UNE_DATA);
    },
    hasDraft: () => !!readDraft(),
    save(data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
      catch { return false; } // usually quota: too many uncompressed photos
    },
    discardDraft() { try { localStorage.removeItem(KEY); } catch {} },
    exportFile(data) {
      const body = '/* Published site data. The admin panel\'s "Export site data" button\n   regenerates this file — replace it to publish your changes. */\n' +
        'window.UNE_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
      const url = URL.createObjectURL(new Blob([body], { type: 'text/javascript' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'data.js' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return body.length;
    }
  };
})();
