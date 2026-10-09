/* Public site: hero, catalogue, filters, detail view, about, contacts. */
window.UNE = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = window.UNEGenes;

  let data = UNEStore.load({ draft: true });
  const state = { tab: 'available', sex: 'all', year: 'all', q: '', sort: 'featured' };

  /* ---------- helpers ---------- */
  function money(n) {
    const cur = data.settings.currency || 'IDR';
    try { return new Intl.NumberFormat(cur === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
    catch { return `${cur} ${Number(n).toLocaleString()}`; }
  }
  const sexWord = (s) => s === 'F' ? 'Female' : s === 'M' ? 'Male' : 'Unsexed';
  const sexGlyph = (s) => s === 'F' ? '♀' : s === 'M' ? '♂' : '?';
  const cover = (a) => a.photos?.[0] || G.art(a.id, a.genes);
  const tabOf = (a) => a.listing !== 'for-sale' ? 'collection' : a.status === 'sold' ? 'sold' : 'available';
  const waLink = (text) => `https://wa.me/${(data.settings.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  function statusPill(a) {
    if (a.listing === 'breeder') return '<span class="pill pill-breeder">Breeder</span>';
    if (a.listing === 'holdback') return '<span class="pill pill-hold">Holdback</span>';
    if (a.status === 'hold') return '<span class="pill pill-hold">On hold</span>';
    if (a.status === 'sold') return '<span class="pill pill-sold">Sold</span>';
    return '';
  }
  function priceLine(a) {
    if (a.listing !== 'for-sale') return '<span class="price price-nfs">Not for sale</span>';
    if (a.status === 'sold') return `<span class="price price-sold"><s>${money(a.price)}</s></span>`;
    return a.price ? `<span class="price">${money(a.price)}</span>` : '<span class="price price-nfs">Ask for price</span>';
  }
  function geneTitle(a, tag = 'h3', cls = 'gene-title') {
    const s = G.split(a.genes);
    return `<${tag} class="${cls}"${tag === 'h2' ? ' id="detail-title"' : ''}><span class="g-vis">${esc(s.visualText)}</span>${s.hetText ? ` <span class="g-het">${esc(s.hetText)}</span>` : ''}</${tag}>`;
  }

  /* ---------- hero + store bar ---------- */
  function renderHero() {
    const pool = data.animals.filter(a => tabOf(a) === 'available');
    const a = pool.find(x => x.featured && x.status === 'available') || pool.find(x => x.status === 'available') || data.animals[0];
    const avail = data.animals.filter(x => tabOf(x) === 'available' && x.status === 'available').length;
    $('#hero').innerHTML = `
      <div class="hero-copy">
        <h1 class="hero-title">${esc(data.settings.tagline)}</h1>
        <p class="hero-sub">${avail ? `${avail} animal${avail > 1 ? 's' : ''} available now. Every listing shows real genetics, weight and feeding.` : 'Nothing is available right now. Follow us for the next clutch.'}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/available" data-jump>See available animals</a>
          <a class="btn btn-ghost" href="#about">How to buy</a>
        </div>
      </div>
      ${a ? `
      <a class="hero-feature" href="#/animal/${encodeURIComponent(a.id)}">
        <figure class="hero-media"><img src="${esc(cover(a))}" alt="${esc(a.genes)}" fetchpriority="high"></figure>
        <div class="hero-card">
          <p class="hero-flag">${a.featured ? 'Featured' : 'Latest'}</p>
          ${geneTitle(a, 'p', 'gene-title gene-title-lg')}
          <p class="meta"><span class="sex">${sexGlyph(a.sex)}</span> ${sexWord(a.sex)}, ${esc(a.year)}<span class="sep"></span>${esc(a.weight)} g<span class="sep"></span><span class="mono">${esc(a.id)}</span></p>
          ${priceLine(a)}
        </div>
      </a>` : ''}`;

    const breeders = data.animals.filter(x => x.listing === 'breeder').length;
    const s = data.settings;
    $('#storebar').innerHTML = `
      <div class="sb-item"><span class="sb-k">Based in</span><span class="sb-v">${esc(s.location)}</span></div>
      <div class="sb-item"><span class="sb-k">Breeding since</span><span class="sb-v">${esc(s.established)}</span></div>
      <div class="sb-item"><span class="sb-k">Available</span><span class="sb-v num">${avail}</span></div>
      <div class="sb-item"><span class="sb-k">Breeders</span><span class="sb-v num">${breeders}</span></div>
      <div class="sb-item"><span class="sb-k">Genes in the collection</span><span class="sb-v num">${G.morphCount(data.animals)}</span></div>`;
  }

  /* ---------- catalogue ---------- */
  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = data.animals.filter(a => tabOf(a) === state.tab);
    if (state.sex !== 'all') list = list.filter(a => a.sex === state.sex);
    if (state.year !== 'all') list = list.filter(a => String(a.year) === state.year);
    if (q) {
      const terms = q.split(/[\s,]+/).filter(Boolean);
      list = list.filter(a => { const hay = `${a.genes} ${a.id} ${a.name}`.toLowerCase(); return terms.every(t => hay.includes(t)); });
    }
    const by = {
      featured: (x, y) => (y.featured - x.featured) || (x.status === 'hold') - (y.status === 'hold') || String(y.added).localeCompare(String(x.added)),
      newest: (x, y) => (y.year - x.year) || String(y.added).localeCompare(String(x.added)),
      'price-asc': (x, y) => x.price - y.price,
      'price-desc': (x, y) => y.price - x.price
    };
    return list.sort(by[state.sort] || by.featured);
  }

  function card(a) {
    const n = a.photos?.length || 0;
    return `
      <a class="card${a.status === 'sold' ? ' is-sold' : ''}" href="#/animal/${encodeURIComponent(a.id)}">
        <div class="card-media">
          <img src="${esc(cover(a))}" alt="${esc(a.genes)}" loading="lazy" decoding="async">
          <div class="card-tags">${a.featured && a.status !== 'sold' ? '<span class="pill pill-feat">Featured</span>' : ''}${statusPill(a)}</div>
          ${n > 1 ? `<span class="photo-count" aria-label="${n} photos"><svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>${n}</span>` : ''}
        </div>
        <div class="card-body">
          ${geneTitle(a)}
          <p class="meta"><span class="sex" title="${sexWord(a.sex)}">${sexGlyph(a.sex)}</span>${esc(a.year)}<span class="sep"></span>${esc(a.weight)} g${a.name ? `<span class="sep"></span>${esc(a.name)}` : ''}</p>
          <div class="card-foot">${priceLine(a)}<span class="mono id">${esc(a.id)}</span></div>
        </div>
      </a>`;
  }

  function renderCatalog() {
    const list = filtered();
    $('#grid').innerHTML = list.map(card).join('') || `
      <div class="empty">
        <p class="empty-title">No animals match these filters.</p>
        <button class="btn btn-ghost" type="button" data-reset>Clear filters</button>
      </div>`;
    $('#result-count').textContent = `${list.length} ${list.length === 1 ? 'animal' : 'animals'}`;
    $$('.tabs [data-tab]').forEach(b => {
      const on = b.dataset.tab === state.tab;
      b.setAttribute('aria-selected', on);
      $('.tab-n', b).textContent = data.animals.filter(a => tabOf(a) === b.dataset.tab).length;
    });
    $$('[data-nav]').forEach(l => l.toggleAttribute('aria-current', l.dataset.nav === state.tab));
    $$('.seg [data-sex]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sex === state.sex));
  }

  function renderYears() {
    const years = [...new Set(data.animals.map(a => a.year))].sort((a, b) => b - a);
    const sel = $('#filters [name=year]');
    sel.innerHTML = '<option value="all">Any hatch year</option>' + years.map(y => `<option value="${y}">${y} hatch</option>`).join('');
    sel.value = years.map(String).includes(state.year) ? state.year : 'all';
  }

  /* ---------- detail ---------- */
  function openDetail(id) {
    const a = data.animals.find(x => x.id === id);
    const dlg = $('#detail');
    if (!a) return closeDetail();
    const s = G.split(a.genes);
    const photos = a.photos?.length ? a.photos : [cover(a)];
    const forSale = a.listing === 'for-sale' && a.status !== 'sold';
    const msg = `Hi Urban Nine, I'm interested in ${a.id} (${a.genes}). Is it still available?`;
    dlg.innerHTML = `
      <div class="detail-inner">
        <button class="icon-btn detail-close" type="button" aria-label="Close" data-close>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="gallery">
          <figure class="gallery-main"><img src="${esc(photos[0])}" alt="${esc(a.genes)}" id="gallery-main"></figure>
          ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<button type="button" class="thumb" aria-label="Photo ${i + 1}" aria-pressed="${i === 0}" data-photo="${i}"><img src="${esc(p)}" alt=""></button>`).join('')}</div>` : ''}
          ${a.photos?.length ? '' : '<p class="muted small">Photos coming soon. The pattern shown is a placeholder.</p>'}
        </div>
        <div class="detail-info">
          <p class="detail-id"><span class="mono">${esc(a.id)}</span>${statusPill(a)}</p>
          ${geneTitle(a, 'h2', 'gene-title gene-title-xl')}
          ${a.name ? `<p class="detail-name">${esc(a.name)}</p>` : ''}
          <div class="price-row">${priceLine(a)}</div>
          <ul class="chips" aria-label="Genetics">
            ${s.visual.map(g => `<li class="chip chip-vis">${esc(g.gene)}</li>`).join('')}
            ${s.het.map(g => `<li class="chip chip-het"><span>${esc(g.label)}</span> ${esc(g.gene)}</li>`).join('')}
            ${!s.visual.length && !s.het.length ? '<li class="chip chip-vis">Normal</li>' : ''}
          </ul>
          <dl class="facts">
            <div><dt>Sex</dt><dd>${sexWord(a.sex)}</dd></div>
            <div><dt>Hatched</dt><dd>${esc(a.year)}</dd></div>
            <div><dt>Weight</dt><dd>${esc(a.weight)} g</dd></div>
            <div><dt>Feeding</dt><dd>${esc(a.feeding || '—')}</dd></div>
          </dl>
          ${a.notes ? `<p class="notes">${esc(a.notes)}</p>` : ''}
          <div class="detail-actions">
            ${forSale && a.status !== 'hold'
              ? `<a class="btn btn-primary btn-wide" href="${waLink(msg)}" target="_blank" rel="noopener">Ask about ${esc(a.id)} on WhatsApp</a>`
              : `<a class="btn btn-ghost btn-wide" href="${waLink(`Hi Urban Nine, I saw ${a.id} on your site. Will you have anything similar?`)}" target="_blank" rel="noopener">Ask about similar animals</a>`}
            <button class="btn btn-ghost" type="button" data-copy="${esc(a.id)}">Copy ID</button>
          </div>
          <p class="muted small">Prefer Instagram or email? <a href="#contact" data-close>See all contacts</a>.</p>
        </div>
      </div>`;
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    document.title = `${a.id} ${s.visualText} | Urban Nine Exotics`;
  }
  function closeDetail() {
    const dlg = $('#detail');
    if (dlg.open) dlg.close();
    document.title = 'Urban Nine Exotics';
  }

  /* ---------- about + contacts ---------- */
  function renderAbout() {
    const s = data.settings;
    $('#about-text').innerHTML = String(s.about || '').split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('');
    const steps = [['Reserve', s.termsDeposit], ['Ship or pick up', s.termsShipping], ['Guarantee', s.termsGuarantee]].filter(x => x[1]);
    $('#steps').innerHTML = steps.map(([h, t]) => `<li><h3>${h}</h3><p>${esc(t)}</p></li>`).join('');
    const wa = (s.whatsapp || '').replace(/\D/g, '');
    const rows = [
      wa && ['WhatsApp', '+' + wa, `https://wa.me/${wa}`],
      s.instagram && ['Instagram', '@' + s.instagram.replace(/^@/, ''), `https://instagram.com/${s.instagram.replace(/^@/, '')}`],
      s.email && ['Email', s.email, `mailto:${s.email}`]
    ].filter(Boolean);
    $('#contacts').innerHTML = rows.map(([k, v, href]) => `
      <li><span class="c-k">${k}</span><a class="c-v" href="${esc(href)}" target="_blank" rel="noopener">${esc(v)}</a>
      <button class="icon-btn copy" type="button" data-copy="${esc(v)}" aria-label="Copy ${k}">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
      </button></li>`).join('');
    $('#foot-location').textContent = `${s.location}. Shipping across Indonesia.`;
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- routing ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const isAdmin = h === 'admin' || h.startsWith('admin/');
    document.body.classList.toggle('admin-mode', isAdmin);
    $('#public').hidden = isAdmin; $('#admin-root').hidden = !isAdmin;
    if (isAdmin) { closeDetail(); window.UNEAdmin?.open(); return; }
    const m = h.match(/^\/animal\/(.+)$/);
    if (m) {
      const a = data.animals.find(x => x.id === m[1]);
      if (a && state.tab !== tabOf(a)) { state.tab = tabOf(a); renderCatalog(); }
      openDetail(m[1]); return;
    }
    closeDetail();
    const t = h.match(/^\/(available|collection|sold)$/);
    if (t && t[1] !== state.tab) { state.tab = t[1]; renderCatalog(); }
  }

  function renderAll() { renderHero(); renderYears(); renderCatalog(); renderAbout(); }

  /* ---------- events ---------- */
  function bind() {
    $$('.tabs [data-tab]').forEach(b => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.tab; }));
    $('.tabs').addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tabs = $$('.tabs [data-tab]'); const i = tabs.findIndex(t => t.dataset.tab === state.tab);
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); next.click();
    });
    $$('.seg [data-sex]').forEach(b => b.addEventListener('click', () => { state.sex = b.dataset.sex; renderCatalog(); }));
    const f = $('#filters');
    f.q.addEventListener('input', () => { state.q = f.q.value; renderCatalog(); });
    f.year.addEventListener('change', () => { state.year = f.year.value; renderCatalog(); });
    f.sort.addEventListener('change', () => { state.sort = f.sort.value; renderCatalog(); });

    document.addEventListener('click', async (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        try { await navigator.clipboard.writeText(copy.dataset.copy); toast(`Copied ${copy.dataset.copy}`); }
        catch { toast('Copy is blocked here. Select the text instead.'); }
        return;
      }
      if (e.target.closest('[data-reset]')) {
        Object.assign(state, { sex: 'all', year: 'all', q: '' }); f.q.value = ''; f.year.value = 'all'; renderCatalog(); return;
      }
      const thumb = e.target.closest('[data-photo]');
      if (thumb) {
        $('#gallery-main').src = $('img', thumb).src;
        $$('.thumb').forEach(t => t.setAttribute('aria-pressed', t === thumb)); return;
      }
      if (e.target.closest('[data-jump]')) { setTimeout(() => $('#catalog').scrollIntoView({ behavior: 'smooth' }), 0); }
      if (e.target.closest('[data-close]')) {
        e.preventDefault();
        const to = e.target.closest('a')?.getAttribute('href');
        history.pushState(null, '', '#/' + state.tab); closeDetail();
        if (to === '#contact') $('#contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
    const dlg = $('#detail');
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); history.pushState(null, '', '#/' + state.tab); closeDetail(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) { history.pushState(null, '', '#/' + state.tab); closeDetail(); } });
    window.addEventListener('hashchange', route);

    // theme
    const root = document.documentElement;
    try { const t = localStorage.getItem('une-theme'); if (t) root.dataset.theme = t; } catch {}
    $('[data-theme-toggle]').addEventListener('click', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('une-theme', root.dataset.theme); } catch {}
    });
  }

  /* Called by admin after edits so the public view reflects the draft. */
  function refresh(next) { if (next) data = next; renderAll(); }

  bind(); renderAll(); route();
  return { refresh, toast, money, esc, cover, tabOf, get data() { return data; } };
})();
