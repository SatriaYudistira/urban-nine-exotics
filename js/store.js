/* Storage layer. Phase 1 keeps admin edits as a draft in this browser and
   exports a new data.js to publish. Phase 2 (VPS) replaces load/save with
   API calls — nothing else in the app needs to change.

   The draft lives in IndexedDB (hundreds of MB, room for full-quality photos);
   localStorage (~5 MB) is only a fallback and is migrated on first load.
   load()/hasDraft() stay synchronous by reading an in-memory copy that
   `ready` fills from IndexedDB at startup. */
window.UNEStore = (() => {
  const KEY = 'une-draft-v1';
  const DB = 'une', OS = 'kv';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function readLS() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }
  let draft = readLS();

  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('no indexedDB'));
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(OS);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function idb(mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(OS, mode), req = fn(t.objectStore(OS));
      t.oncomplete = () => res(req?.result);
      t.onerror = t.onabort = () => rej(t.error);
    });
  }

  /* Startup: prefer the IndexedDB draft; move an old localStorage draft into IndexedDB. */
  const ready = (async () => {
    try {
      const stored = await idb('readonly', s => s.get(KEY));
      if (stored) draft = stored;
      else if (draft) { await idb('readwrite', s => s.put(draft, KEY)); try { localStorage.removeItem(KEY); } catch {} }
    } catch { /* no IndexedDB (private mode): keep the localStorage copy */ }
  })();

  return {
    ready,
    /* Public visitors always see published data; the owner sees their draft. */
    load({ draft: wantDraft = false } = {}) {
      return clone((wantDraft && draft) || window.UNE_DATA);
    },
    hasDraft: () => !!draft,
    /* Saves synchronously to memory, then persists. Resolves false if nothing could store it. */
    save(data) {
      draft = clone(data);
      return idb('readwrite', s => s.put(draft, KEY)).then(() => true).catch(() => {
        try { localStorage.setItem(KEY, JSON.stringify(draft)); return true; } catch { return false; }
      });
    },
    discardDraft() {
      draft = null;
      idb('readwrite', s => s.delete(KEY)).catch(() => {});
      try { localStorage.removeItem(KEY); } catch {}
    },
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
