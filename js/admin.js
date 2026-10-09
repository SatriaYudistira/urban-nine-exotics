/* Owner admin, opened at #admin. Edits save as a draft in this browser and show on
   the site immediately (for you only). "Export site data" downloads a new data.js to publish. */
window.UNEAdmin = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => UNE.esc(s);
  const G = window.UNEGenes;
  const root = $('#admin-root');

  let data = null;
  let view = 'animals';
  let q = '';
  let confirming = null;

  const STATUS = [
    ['available', 'Available', { listing: 'for-sale', status: 'available' }],
    ['hold', 'On hold', { listing: 'for-sale', status: 'hold' }],
    ['sold', 'Sold', { listing: 'for-sale', status: 'sold' }],
    ['breeder', 'Breeder', { listing: 'breeder', status: 'available' }],
    ['holdback', 'Holdback', { listing: 'holdback', status: 'available' }]
  ];
  const statusKey = (a) => a.listing === 'for-sale' ? a.status : a.listing;

  function commit(msg) {
    if (!UNEStore.save(data)) { UNE.toast('Browser storage is full. Remove some photos, then try again.'); return; }
    UNE.refresh(JSON.parse(JSON.stringify(data)));
    render();
    if (msg) UNE.toast(msg);
  }

  /* ---------- password gate ----------
     The password is stored only as a salted PBKDF2 hash in settings.adminAuth.
     On a static host this keeps casual visitors out; it is not server-side security
     (Phase 2 on the VPS adds a real login). Unlock lasts until the tab is closed. */
  const SESSION = 'une-admin-unlocked';
  const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  async function derive(password, saltHex, iter) {
    const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256));
  }
  async function makeAuth(password) {
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const iter = 210000;
    return { salt, iter, hash: await derive(password, salt, iter) };
  }
  const unlocked = () => { try { return sessionStorage.getItem(SESSION) === data.settings.adminAuth?.hash; } catch { return false; } };
  const setUnlocked = (h) => { try { h ? sessionStorage.setItem(SESSION, h) : sessionStorage.removeItem(SESSION); } catch {} };

  function renderGate(err = '') {
    const setup = !data.settings.adminAuth;
    const noCrypto = !window.crypto?.subtle;
    root.innerHTML = `
      <section class="admin wrap gate">
        <form class="gate-card" id="gate-form" novalidate>
          <p class="muted small">Owner panel</p>
          <h1>${setup ? 'Create an admin password' : 'Enter admin password'}</h1>
          <p class="muted">${setup
            ? 'Set a password to keep visitors out of this page. Use at least 8 characters.'
            : 'This page is for the site owner.'}</p>
          ${noCrypto ? '<p class="err">The password check needs a secure connection. Open the site over https or on localhost.</p>' : `
          <label class="field w6"><span>Password</span><input type="password" name="pw" autocomplete="${setup ? 'new-password' : 'current-password'}" required autofocus></label>
          ${setup ? '<label class="field w6"><span>Confirm password</span><input type="password" name="pw2" autocomplete="new-password" required></label>' : ''}
          <p class="err" role="alert">${esc(err)}</p>
          <div class="admin-actions">
            <button class="btn btn-primary" type="submit">${setup ? 'Create password' : 'Unlock'}</button>
            <a class="btn btn-ghost" href="#/">Back to site</a>
          </div>`}
        </form>
      </section>`;
    $('#gate-form input')?.focus();
  }

  async function submitGate(form) {
    const pw = form.pw.value;
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try {
      if (!data.settings.adminAuth) {
        if (pw.length < 8) return renderGate('Use at least 8 characters.');
        if (pw !== form.pw2.value) return renderGate('The two passwords don\'t match.');
        data.settings.adminAuth = await makeAuth(pw);
        setUnlocked(data.settings.adminAuth.hash);
        commit('Password created. Export site data to use it on the live site.');
        return;
      }
      const a = data.settings.adminAuth;
      if (await derive(pw, a.salt, a.iter) === a.hash) { setUnlocked(a.hash); render(); return; }
      await new Promise(r => setTimeout(r, 600));
      renderGate('Wrong password. Try again.');
    } finally { btn.disabled = false; }
  }

  /* ---------- shell ---------- */
  function open() {
    data = UNEStore.load({ draft: true });
    unlocked() ? render() : renderGate();
    window.scrollTo(0, 0);
  }

  function render() {
    if (!unlocked()) return renderGate();
    const dirty = UNEStore.hasDraft();
    root.innerHTML = `
      <section class="admin wrap">
        <div class="admin-top">
          <div>
            <p class="muted small">Owner panel</p>
            <h1>Manage your site</h1>
          </div>
          <div class="admin-actions">
            <a class="btn btn-ghost" href="#/">View site</a>
            <button class="btn btn-ghost" type="button" data-act="lock">Lock</button>
            <button class="btn btn-ghost" type="button" data-act="import">Import data.js</button>
            <button class="btn btn-primary" type="button" data-act="export">Export site data</button>
          </div>
        </div>
        <div class="banner${dirty ? ' is-dirty' : ''}">
          <span>${dirty
            ? 'You have unpublished changes. They are saved in this browser only. Export site data and replace <b>js/data.js</b> to publish them.'
            : 'Everything matches the published site.'}</span>
          ${dirty ? (confirming === '__draft'
            ? `<span class="confirm">Discard all unpublished changes? <button class="btn btn-danger btn-sm" type="button" data-act="discard-yes">Discard</button><button class="btn btn-ghost btn-sm" type="button" data-act="cancel">Keep</button></span>`
            : '<button class="btn btn-ghost btn-sm" type="button" data-act="discard">Discard changes</button>') : ''}
        </div>
        <div class="admin-tabs" role="tablist">
          <button role="tab" type="button" aria-selected="${view === 'animals'}" data-view="animals">Animals (${data.animals.length})</button>
          <button role="tab" type="button" aria-selected="${view === 'pairings'}" data-view="pairings">Breeding season (${(data.pairings || []).length})</button>
          <button role="tab" type="button" aria-selected="${view === 'settings'}" data-view="settings">Site settings</button>
        </div>
        ${view === 'animals' ? animalsView() : view === 'pairings' ? pairingsView() : settingsView()}
      </section>
      <dialog class="sheet" id="sheet"></dialog>
      <input type="file" id="import-file" accept=".js,.json" hidden>`;
  }

  /* ---------- animals list ---------- */
  function animalsView() {
    const t = q.trim().toLowerCase();
    const list = data.animals
      .filter(a => !t || `${a.id} ${a.genes} ${a.name}`.toLowerCase().includes(t))
      .sort((x, y) => (y.featured - x.featured) || String(y.added).localeCompare(String(x.added)));
    return `
      <div class="admin-top" style="margin-bottom:12px">
        <label class="search a-search"><span class="sr">Find an animal</span>
          <input type="search" id="a-q" value="${esc(q)}" placeholder="Find by ID or gene"></label>
        <button class="btn btn-primary" type="button" data-act="add">Add animal</button>
      </div>
      <div class="rows">
        ${list.map(row).join('') || '<p class="muted" style="padding:20px 0">No animals yet. Add your first one.</p>'}
      </div>`;
  }

  function row(a) {
    const s = G.split(a.genes);
    const k = statusKey(a);
    const ctl = confirming === a.id
      ? `<span class="confirm">Delete ${esc(a.id)}? <button class="btn btn-danger btn-sm" type="button" data-act="del-yes" data-id="${esc(a.id)}">Delete</button><button class="btn btn-ghost btn-sm" type="button" data-act="cancel">Keep</button></span>`
      : `<button class="star" type="button" aria-pressed="${!!a.featured}" aria-label="Featured" title="Pin to top" data-act="feat" data-id="${esc(a.id)}">★</button>
         <button class="btn btn-ghost btn-sm" type="button" data-act="edit" data-id="${esc(a.id)}">Edit</button>
         <button class="btn btn-ghost btn-sm" type="button" data-act="del" data-id="${esc(a.id)}">Delete</button>`;
    return `
      <div class="row">
        <img src="${esc(UNE.cover(a))}" alt="">
        <div>
          <p class="gene-title"><span class="g-vis">${esc(s.visualText)}</span>${s.hetText ? ` <span class="g-het">${esc(s.hetText)}</span>` : ''}</p>
          <p class="row-sub">${esc(a.id)} · ${a.sex === 'F' ? '♀' : a.sex === 'M' ? '♂' : '?'} ${esc(a.year)} · ${esc(a.weight)} g${a.photos?.length ? ` · ${a.photos.length} photo${a.photos.length > 1 ? 's' : ''}` : ' · no photos'}</p>
        </div>
        <span class="row-price">${a.listing === 'for-sale' && a.price ? UNE.money(a.price) : '—'}</span>
        <label class="row-status"><span class="sr">Status of ${esc(a.id)}</span>
          <select data-act="status" data-id="${esc(a.id)}">${STATUS.map(([v, l]) => `<option value="${v}"${v === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
        </label>
        <div class="row-ctl">${ctl}</div>
      </div>`;
  }

  /* ---------- animal form ---------- */
  let draftPhotos = [];
  function nextId() {
    const yy = String(new Date().getFullYear()).slice(2);
    const nums = data.animals.map(a => a.id.match(new RegExp(`^UNE-${yy}-(\\d+)$`))?.[1]).filter(Boolean).map(Number);
    return `UNE-${yy}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
  }

  function openForm(id) {
    const a = id ? data.animals.find(x => x.id === id) : {
      id: nextId(), name: '', genes: '', sex: 'F', year: new Date().getFullYear(), weight: '', price: '',
      listing: 'for-sale', status: 'available', featured: false, feeding: '', notes: '', photos: []
    };
    draftPhotos = [...(a.photos || [])];
    const sheet = $('#sheet');
    sheet.innerHTML = `
      <form id="animal-form" novalidate>
        <div class="sheet-head"><h2>${id ? `Edit ${esc(a.id)}` : 'Add animal'}</h2>
          <button class="icon-btn" type="button" aria-label="Close" data-act="close-sheet"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>
        <div class="sheet-body">
          <label class="field w2"><span>ID code</span><input name="id" value="${esc(a.id)}" required><small class="err" data-err="id"></small></label>
          <label class="field w2"><span>Name <small>(optional)</small></span><input name="name" value="${esc(a.name)}"></label>
          <label class="field w2"><span>Status</span><select name="status">${STATUS.map(([v, l]) => `<option value="${v}"${v === statusKey(a) ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
          <label class="field w6"><span>Genes</span><input name="genes" value="${esc(a.genes)}" placeholder="Pastel, Clown, 66% het Pied" autocomplete="off">
            <small>Separate with commas. Write hets as “het Pied”, “66% het Pied” or “pos het Pied”.</small></label>
          <div class="gene-preview" id="gene-preview"></div>
          <label class="field w2"><span>Sex</span><select name="sex">
            <option value="F"${a.sex === 'F' ? ' selected' : ''}>Female</option><option value="M"${a.sex === 'M' ? ' selected' : ''}>Male</option><option value="U"${a.sex === 'U' ? ' selected' : ''}>Unsexed</option></select></label>
          <label class="field w2"><span>Hatch year</span><input name="year" type="number" inputmode="numeric" min="2000" max="2100" value="${esc(a.year)}"><small class="err" data-err="year"></small></label>
          <label class="field w2"><span>Hatch date <small>(optional)</small></span><input name="hatchDate" type="date" value="${esc(a.hatchDate || '')}"></label>
          <label class="field w2"><span>Weight (g)</span><input name="weight" type="number" inputmode="numeric" min="0" value="${esc(a.weight)}"></label>
          <label class="field"><span>Price (${esc(data.settings.currency || 'IDR')})</span><input name="price" type="number" inputmode="numeric" min="0" step="1000" value="${esc(a.price)}"><small>Leave empty to show “Ask for price”.</small></label>
          <label class="field"><span>Feeding</span><input name="feeding" value="${esc(a.feeding)}" placeholder="Eating frozen-thawed rat pinks"></label>
          <label class="field w6"><span>Notes</span><textarea name="notes" placeholder="Pairing, pattern details, anything a buyer should know">${esc(a.notes)}</textarea></label>
          <label class="check"><input type="checkbox" name="featured"${a.featured ? ' checked' : ''}> Featured (pinned to the top and shown in the hero)</label>
          <label class="check"><input type="checkbox" name="proven"${a.proven ? ' checked' : ''}> Proven breeder (has produced a clutch)</label>
          <div class="field w6"><span>Photos <small>(up to 4, first is the cover; resized automatically)</small></span></div>
          <div class="photos" id="photos"></div>
        </div>
        <div class="sheet-foot">
          <span class="muted small">Saved changes show on your site right away, in this browser.</span>
          <div class="admin-actions"><button class="btn btn-ghost" type="button" data-act="close-sheet">Cancel</button>
          <button class="btn btn-primary" type="submit">${id ? 'Save changes' : 'Add animal'}</button></div>
        </div>
      </form>`;
    const form = $('#animal-form');
    const preview = () => {
      const s = G.split(form.genes.value);
      $('#gene-preview').innerHTML = `<span class="muted small">Shows as</span><p class="gene-title"><span class="g-vis">${esc(s.visualText)}</span>${s.hetText ? ` <span class="g-het">${esc(s.hetText)}</span>` : ''}</p>`;
    };
    form.genes.addEventListener('input', preview); preview();
    renderPhotos();
    form.addEventListener('submit', (e) => { e.preventDefault(); saveForm(form, id); });
    sheet.showModal();
  }

  function renderPhotos() {
    const box = $('#photos'); if (!box) return;
    box.innerHTML = draftPhotos.map((p, i) => `
      <div class="ph"><img src="${esc(p)}" alt="Photo ${i + 1}">
        ${i === 0 ? '<span class="pill ph-cover">Cover</span>' : `<button class="pill ph-cover" type="button" data-act="cover" data-i="${i}">Make cover</button>`}
        <button class="ph-x" type="button" aria-label="Remove photo ${i + 1}" data-act="rm-photo" data-i="${i}">×</button></div>`).join('') +
      (draftPhotos.length < 4 ? `<label class="ph ph-add">Add photos<input type="file" accept="image/*" multiple id="photo-in"></label>` : '');
    $('#photo-in')?.addEventListener('change', async (e) => {
      const files = [...e.target.files].slice(0, 4 - draftPhotos.length);
      UNE.toast('Resizing photos…');
      for (const f of files) { try { draftPhotos.push(await compress(f)); } catch { UNE.toast(`Couldn't read ${f.name}. Try a JPG or PNG.`); } }
      renderPhotos();
    });
  }

  /* Resize to max 1200px and re-encode as JPEG (~100–200 KB). */
  async function compress(file, max = 1200, quality = 0.8) {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * k), height: Math.round(bmp.height * k) });
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', quality);
  }

  function saveForm(form, oldId) {
    const v = Object.fromEntries(new FormData(form));
    const id = v.id.trim().toUpperCase();
    $$('[data-err]', form).forEach(e => e.textContent = '');
    let bad = false;
    if (!id) { $('[data-err=id]', form).textContent = 'Enter an ID code, e.g. UNE-25-007.'; bad = true; }
    else if (id !== oldId && data.animals.some(a => a.id === id)) { $('[data-err=id]', form).textContent = `${id} is already used by another animal.`; bad = true; }
    if (v.hatchDate) v.year = v.hatchDate.slice(0, 4);
    const year = parseInt(v.year, 10);
    if (!(year >= 2000 && year <= 2100)) { $('[data-err=year]', form).textContent = 'Enter a 4-digit hatch year.'; bad = true; }
    if (bad) return;
    const st = STATUS.find(s => s[0] === v.status)[2];
    const prev = oldId ? data.animals.find(a => a.id === oldId) : null;
    const a = {
      id, name: v.name.trim(), genes: v.genes.trim(), sex: v.sex, year,
      weight: parseInt(v.weight, 10) || 0, price: parseInt(v.price, 10) || 0,
      ...st, featured: !!v.featured, feeding: v.feeding.trim(), notes: v.notes.trim(),
      hatchDate: v.hatchDate || '', proven: !!v.proven,
      photos: draftPhotos, added: prev?.added || new Date().toISOString().slice(0, 10)
    };
    if (prev) data.animals[data.animals.indexOf(prev)] = a; else data.animals.unshift(a);
    $('#sheet').close();
    commit(prev ? `Saved ${id}` : `Added ${id}`);
  }

  /* ---------- breeding season (pairings) ---------- */
  const PAIR_STATUS = [['planned', 'Planned'], ['paired', 'Paired'], ['ovulated', 'Ovulated'], ['gravid', 'Gravid'], ['laid', 'Eggs laid'], ['hatched', 'Hatched']];
  function pairingsView() {
    const kept = data.animals.filter(a => a.listing !== 'for-sale');
    const opt = (sex, sel) => kept.filter(a => a.sex === sex).map(a => `<option value="${esc(a.id)}"${a.id === sel ? ' selected' : ''}>${esc(a.name ? a.name + ' · ' : '')}${esc(a.genes)} (${esc(a.id)})</option>`).join('');
    const list = (data.pairings || []).slice().sort((x, y) => y.season - x.season);
    const name = (id) => { const a = data.animals.find(x => x.id === id); return a ? esc((a.name ? a.name + ', ' : '') + a.genes) : `<span class="err">${esc(id)} was deleted</span>`; };
    return `
      <p class="muted" style="margin-bottom:14px">Pairings show on the site under "Breeding season". Only breeders and holdbacks can be picked.</p>
      <div class="rows">
        ${list.map(p => `
          <div class="row row-pair">
            <span class="mono">${esc(p.season)}</span>
            <div><p class="gene-title">${name(p.female)} × ${name(p.male)}</p>${p.note ? `<p class="row-sub">${esc(p.note)}</p>` : ''}</div>
            <label><span class="sr">Status</span><select data-act="pair-status" data-id="${esc(p.id)}">${PAIR_STATUS.map(([v, l]) => `<option value="${v}"${v === p.status ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
            <div class="row-ctl">${confirming === p.id
              ? `<span class="confirm">Delete this pairing? <button class="btn btn-danger btn-sm" type="button" data-act="pair-del-yes" data-id="${esc(p.id)}">Delete</button><button class="btn btn-ghost btn-sm" type="button" data-act="cancel">Keep</button></span>`
              : `<button class="btn btn-ghost btn-sm" type="button" data-act="pair-del" data-id="${esc(p.id)}">Delete</button>`}</div>
          </div>`).join('') || '<p class="muted" style="padding:20px 0">No pairings yet.</p>'}
      </div>
      <form id="pair-form" class="sheet-body" style="padding:24px 0 0;max-width:820px" novalidate>
        <div class="field w6"><span style="font-size:17px">Add a pairing</span></div>
        <label class="field"><span>Female</span><select name="female" required>${opt('F')}</select></label>
        <label class="field"><span>Male</span><select name="male" required>${opt('M')}</select></label>
        <label class="field w2"><span>Season</span><input name="season" type="number" inputmode="numeric" value="${new Date().getFullYear()}"></label>
        <label class="field w2"><span>Status</span><select name="status">${PAIR_STATUS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
        <label class="field w6"><span>Note <small>(optional)</small></span><textarea name="note" rows="2" placeholder="What you expect from this clutch"></textarea></label>
        <p class="field w6 err" role="alert" id="pair-err"></p>
        <div class="field w6"><div class="admin-actions"><button class="btn btn-primary" type="submit">Add pairing</button></div></div>
      </form>`;
  }

  /* ---------- settings ---------- */
  function settingsView() {
    const s = data.settings;
    const f = (name, label, opts = {}) => opts.area
      ? `<label class="field w6"><span>${label}</span><textarea name="${name}" rows="${opts.rows || 3}">${esc(s[name])}</textarea>${opts.hint ? `<small>${opts.hint}</small>` : ''}</label>`
      : `<label class="field ${opts.w || ''}"><span>${label}</span><input name="${name}" value="${esc(s[name])}" ${opts.attrs || ''}>${opts.hint ? `<small>${opts.hint}</small>` : ''}</label>`;
    return `
      <form id="settings-form" class="sheet-body" style="padding:8px 0 0;max-width:820px">
        ${f('tagline', 'Headline', { w: 'w6', hint: 'The big line at the top of the site.' })}
        ${f('location', 'Location', { w: 'w2' })}
        ${f('established', 'Breeding since', { w: 'w2', attrs: 'type="number" inputmode="numeric"' })}
        <label class="field w2"><span>Currency</span><select name="currency">${['IDR', 'USD', 'SGD', 'MYR', 'EUR'].map(c => `<option${c === s.currency ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
        ${f('whatsapp', 'WhatsApp number', { w: 'w2', attrs: 'inputmode="tel"', hint: 'With country code, e.g. 6281234567890.' })}
        ${f('instagram', 'Instagram handle', { w: 'w2' })}
        ${f('email', 'Email', { w: 'w2', attrs: 'type="email"' })}
        ${f('about', 'About text', { area: true, rows: 6, hint: 'Leave a blank line between paragraphs.' })}
        ${f('termsDeposit', 'Reserving and deposit', { area: true })}
        ${f('termsShipping', 'Shipping and pickup', { area: true })}
        ${f('termsGuarantee', 'Guarantee', { area: true })}
        <div class="field w6"><div class="admin-actions"><button class="btn btn-primary" type="submit">Save settings</button></div></div>
      </form>
      <form id="pw-form" class="sheet-body" style="padding:32px 0 0;max-width:820px;border-top:1px solid var(--line);margin-top:32px" novalidate>
        <div class="field w6"><span style="font-size:17px">Change admin password</span><small>After changing it, export site data so the live site uses the new password.</small></div>
        <label class="field w2"><span>Current password</span><input type="password" name="cur" autocomplete="current-password"></label>
        <label class="field w2"><span>New password</span><input type="password" name="pw" autocomplete="new-password"></label>
        <label class="field w2"><span>Confirm new password</span><input type="password" name="pw2" autocomplete="new-password"></label>
        <p class="field w6 err" role="alert" id="pw-err"></p>
        <div class="field w6"><div class="admin-actions"><button class="btn btn-ghost" type="submit">Change password</button></div></div>
      </form>`;
  }

  /* ---------- import ---------- */
  async function importFile(file) {
    const text = await file.text();
    let next = null;
    try { next = JSON.parse(text); }
    catch {
      const m = text.match(/window\.UNE_DATA\s*=\s*([\s\S]*?);?\s*$/);
      try { next = m && JSON.parse(m[1].replace(/;\s*$/, '')); } catch {}
    }
    if (!next?.animals || !next?.settings) { UNE.toast('That file is not a site data export.'); return; }
    data = next; commit(`Imported ${data.animals.length} animals`);
  }

  /* ---------- events ---------- */
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act],[data-view]'); if (!b) return;
    if (b.dataset.view) { view = b.dataset.view; confirming = null; render(); return; }
    const id = b.dataset.id;
    const a = id && data.animals.find(x => x.id === id);
    switch (b.dataset.act) {
      case 'add': openForm(null); break;
      case 'lock': setUnlocked(null); renderGate(); UNE.toast('Admin locked'); break;
      case 'edit': openForm(id); break;
      case 'feat': a.featured = !a.featured; commit(a.featured ? `${id} is featured` : `${id} is no longer featured`); break;
      case 'del': confirming = id; render(); break;
      case 'del-yes': data.animals = data.animals.filter(x => x.id !== id); confirming = null; commit(`Deleted ${id}`); break;
      case 'cancel': confirming = null; render(); break;
      case 'pair-del': confirming = id; render(); break;
      case 'pair-del-yes': data.pairings = data.pairings.filter(p => p.id !== id); confirming = null; commit('Pairing deleted'); break;
      case 'discard': confirming = '__draft'; render(); break;
      case 'discard-yes': UNEStore.discardDraft(); confirming = null; data = UNEStore.load(); UNE.refresh(UNEStore.load()); render(); UNE.toast('Changes discarded'); break;
      case 'export': { const n = UNEStore.exportFile(data); UNE.toast(`Exported data.js (${(n / 1048576).toFixed(1)} MB)`); break; }
      case 'import': $('#import-file').click(); break;
      case 'close-sheet': $('#sheet').close(); break;
      case 'rm-photo': draftPhotos.splice(+b.dataset.i, 1); renderPhotos(); break;
      case 'cover': { const [p] = draftPhotos.splice(+b.dataset.i, 1); draftPhotos.unshift(p); renderPhotos(); break; }
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('select[data-act=status]')) {
      const a = data.animals.find(x => x.id === e.target.dataset.id);
      const st = STATUS.find(s => s[0] === e.target.value);
      Object.assign(a, st[2]); commit(`${a.id} is now ${st[1].toLowerCase()}`);
    }
    if (e.target.matches('select[data-act=pair-status]')) {
      const p = data.pairings.find(x => x.id === e.target.dataset.id);
      p.status = e.target.value; commit('Pairing updated');
    }
    if (e.target.id === 'import-file' && e.target.files[0]) importFile(e.target.files[0]);
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'a-q') {
      q = e.target.value; const pos = e.target.selectionStart; render();
      const inp = $('#a-q'); inp.focus(); inp.setSelectionRange(pos, pos);
    }
  });
  root.addEventListener('submit', async (e) => {
    if (e.target.id === 'gate-form') { e.preventDefault(); submitGate(e.target); return; }
    if (e.target.id === 'pair-form') {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(e.target));
      if (!v.female || !v.male) { $('#pair-err').textContent = 'Pick a female and a male. Mark animals as Breeder or Holdback to list them here.'; return; }
      data.pairings = data.pairings || [];
      data.pairings.push({ id: 'P' + Date.now().toString(36), season: parseInt(v.season, 10) || new Date().getFullYear(), female: v.female, male: v.male, status: v.status, note: v.note.trim() });
      commit('Pairing added');
      return;
    }
    if (e.target.id === 'pw-form') {
      e.preventDefault();
      const f = e.target, err = $('#pw-err'), a = data.settings.adminAuth;
      if (await derive(f.cur.value, a.salt, a.iter) !== a.hash) { err.textContent = 'Current password is wrong.'; return; }
      if (f.pw.value.length < 8) { err.textContent = 'Use at least 8 characters for the new password.'; return; }
      if (f.pw.value !== f.pw2.value) { err.textContent = 'The new passwords do not match.'; return; }
      data.settings.adminAuth = await makeAuth(f.pw.value);
      setUnlocked(data.settings.adminAuth.hash);
      commit('Password changed. Export site data to use it on the live site.');
      return;
    }
    if (e.target.id !== 'settings-form') return;
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    v.established = parseInt(v.established, 10) || data.settings.established;
    v.instagram = v.instagram.replace(/^@/, '').trim();
    v.whatsapp = v.whatsapp.replace(/\D/g, '');
    Object.assign(data.settings, v); // adminAuth is not a field here, so it is kept
    commit('Settings saved');
  });

  // app.js routes before this file loads; catch a direct visit to #admin.
  if (location.hash === '#admin') open();
  return { open };
})();
