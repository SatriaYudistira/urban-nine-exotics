/* Public site: hero, catalogue, filters, detail view, about, contacts. All wording goes through UNEi18n. */
window.UNE = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = window.UNEGenes;
  const I = window.UNEi18n, t = I.t, loc = I.loc;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let data = UNEStore.load({ draft: true });
  const state = { tab: 'available', sex: 'all', year: 'all', q: '', sort: 'featured', genes: [] };

  /* ---------- helpers ---------- */
  function money(n) {
    const cur = data.settings.currency || 'IDR';
    try { return new Intl.NumberFormat(cur === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
    catch { return `${cur} ${Number(n).toLocaleString()}`; }
  }
  /* Gene facets, MorphMarket / RCD style: visual genes plus "Het X" as separate traits. Gene names are never translated. */
  const geneKeys = (a) => G.parse(a.genes).filter(g => !/^normal$/i.test(g.gene)).map(g => g.kind === 'het' ? 'Het ' + g.gene : g.gene);
  const DAY = 864e5;
  const isNew = (a) => a.listing === 'for-sale' && a.status === 'available' && a.added && (Date.now() - new Date(a.added)) / DAY <= 21;
  function hatched(a, long) {
    if (!a.hatchDate) return String(a.year);
    const d = new Date(a.hatchDate + 'T00:00:00');
    return isNaN(d) ? String(a.year) : d.toLocaleDateString(I.lang === 'id' ? 'id-ID' : 'en-GB', long ? { day: 'numeric', month: 'short', year: 'numeric' } : { month: 'short', year: 'numeric' });
  }
  const sexWord = (s) => t('sex.' + (s === 'F' || s === 'M' ? s : 'U'));
  const sexGlyph = (s) => s === 'F' ? '♀' : s === 'M' ? '♂' : '?';
  const cover = (a) => a.photos?.[0] || G.art(a.id, a.genes);
  const tabOf = (a) => a.listing !== 'for-sale' ? 'collection' : a.status === 'sold' ? 'sold' : 'available';
  const waLink = (text) => `https://wa.me/${(data.settings.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  function statusPill(a) {
    if (a.listing === 'breeder') return `<span class="pill pill-breeder">${t('pill.breeder')}</span>`;
    if (a.listing === 'holdback') return `<span class="pill pill-hold">${t('pill.holdback')}</span>`;
    if (a.status === 'hold') return `<span class="pill pill-hold">${t('pill.hold')}</span>`;
    if (a.status === 'sold') return `<span class="pill pill-sold">${t('pill.sold')}</span>`;
    return '';
  }
  function priceLine(a) {
    if (a.listing !== 'for-sale') return `<span class="price price-nfs">${t('price.nfs')}</span>`;
    if (a.status === 'sold') return `<span class="price price-sold"><s>${money(a.price)}</s></span>`;
    return a.price ? `<span class="price">${money(a.price)}</span>` : `<span class="price price-nfs">${t('price.ask')}</span>`;
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
        <h1 class="hero-title">${esc(loc(data.settings, 'tagline'))}</h1>
        <p class="hero-sub">${avail ? (avail === 1 ? t('hero.sub.one') : t('hero.sub', { n: avail })) : t('hero.none')}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/available" data-jump>${t('hero.cta')}</a>
          <a class="btn btn-ghost" href="#about">${t('hero.how')}</a>
        </div>
      </div>
      ${a ? `
      <a class="hero-feature" href="#/animal/${encodeURIComponent(a.id)}">
        <figure class="hero-media"><img src="${esc(cover(a))}" alt="${esc(a.genes)}" fetchpriority="high"></figure>
        <div class="hero-card">
          <p class="hero-flag">${a.featured ? t('hero.featured') : t('hero.latest')}</p>
          ${geneTitle(a, 'p', 'gene-title gene-title-lg')}
          <p class="meta"><span class="sex">${sexGlyph(a.sex)}</span> ${sexWord(a.sex)}, ${esc(hatched(a))}<span class="sep"></span>${esc(a.weight)} g<span class="sep"></span><span class="mono">${esc(a.id)}</span></p>
          ${priceLine(a)}
        </div>
      </a>` : ''}`;

    const breeders = data.animals.filter(x => x.listing === 'breeder').length;
    const s = data.settings;
    $('#storebar').innerHTML = `
      <div class="sb-item"><span class="sb-k">${t('sb.based')}</span><span class="sb-v">${esc(s.location)}</span></div>
      <div class="sb-item"><span class="sb-k">${t('sb.since')}</span><span class="sb-v">${esc(s.established)}</span></div>
      <div class="sb-item"><span class="sb-k">${t('sb.available')}</span><span class="sb-v num">${avail}</span></div>
      <div class="sb-item"><span class="sb-k">${t('sb.breeders')}</span><span class="sb-v num">${breeders}</span></div>
      <div class="sb-item"><span class="sb-k">${t('sb.genes')}</span><span class="sb-v num">${G.morphCount(data.animals)}</span></div>`;
  }

  /* ---------- catalogue ---------- */
  function filtered({ ignoreGenes = false } = {}) {
    const q = state.q.trim().toLowerCase();
    let list = data.animals.filter(a => tabOf(a) === state.tab);
    if (!ignoreGenes && state.genes.length) list = list.filter(a => { const k = geneKeys(a).map(x => x.toLowerCase()); return state.genes.every(g => k.includes(g.toLowerCase())); });
    if (state.sex !== 'all') list = list.filter(a => a.sex === state.sex);
    if (state.year !== 'all') list = list.filter(a => String(a.year) === state.year);
    if (q) {
      const terms = q.split(/[\s,]+/).filter(Boolean);
      list = list.filter(a => { const hay = `${a.genes} ${a.id} ${a.name}`.toLowerCase(); return terms.every(w => hay.includes(w)); });
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
          <div class="card-tags">${a.featured && a.status !== 'sold' ? `<span class="pill pill-feat">${t('pill.featured')}</span>` : ''}${isNew(a) ? `<span class="pill pill-new">${t('pill.new')}</span>` : ''}${statusPill(a)}${a.proven ? `<span class="pill">${t('pill.proven')}</span>` : ''}</div>
          ${n > 1 ? `<span class="photo-count" aria-label="${t('photos.n', { n })}"><svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>${n}</span>` : ''}
        </div>
        <div class="card-body">
          ${geneTitle(a)}
          <p class="meta"><span class="sex" title="${sexWord(a.sex)}">${sexGlyph(a.sex)}</span>${esc(hatched(a))}<span class="sep"></span>${esc(a.weight)} g${a.name ? `<span class="sep"></span>${esc(a.name)}` : ''}</p>
          <div class="card-foot">${priceLine(a)}<span class="mono id">${esc(a.id)}</span></div>
        </div>
      </a>`;
  }

  function renderFacets() {
    const counts = new Map();
    filtered({ ignoreGenes: true }).forEach(a => new Set(geneKeys(a)).forEach(k => {
      const id = k.toLowerCase(); const c = counts.get(id) || { label: k, n: 0 }; c.n++; counts.set(id, c);
    }));
    state.genes.forEach(g => { if (!counts.has(g.toLowerCase())) counts.set(g.toLowerCase(), { label: g, n: 0 }); });
    const items = [...counts.values()].sort((x, y) => (/^Het /.test(x.label) - /^Het /.test(y.label)) || (y.n - x.n) || x.label.localeCompare(y.label));
    $('#facets').innerHTML = items.length < 2 ? '' : items.map(c => {
      const on = state.genes.some(g => g.toLowerCase() === c.label.toLowerCase());
      return `<button type="button" class="facet${/^Het /.test(c.label) ? ' facet-het' : ''}" aria-pressed="${on}" data-gene="${esc(c.label)}">${esc(c.label)} <span>${c.n}</span></button>`;
    }).join('') + (state.genes.length ? `<button type="button" class="facet-clear" data-reset>${t('clear')}</button>` : '');
  }

  function renderCatalog() {
    renderFacets();
    const list = filtered();
    $('#grid').innerHTML = list.map(card).join('') || `
      <div class="empty">
        <p class="empty-title">${t('empty')}</p>
        <button class="btn btn-ghost" type="button" data-reset>${t('clear.filters')}</button>
      </div>`;
    $('#result-count').textContent = list.length === 1 ? t('count.one') : t('count.many', { n: list.length });
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
    sel.innerHTML = `<option value="all">${t('year.any')}</option>` + years.map(y => `<option value="${y}">${t('year.opt', { y })}</option>`).join('');
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
    const feeding = loc(a, 'feeding'), notes = loc(a, 'notes');
    dlg.innerHTML = `
      <div class="detail-inner">
        <button class="icon-btn detail-close" type="button" aria-label="${t('close')}" data-close>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="gallery">
          <figure class="gallery-main"><img src="${esc(photos[0])}" alt="${esc(a.genes)}" id="gallery-main"></figure>
          ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<button type="button" class="thumb" aria-label="${t('photo.n', { n: i + 1 })}" aria-pressed="${i === 0}" data-photo="${i}"><img src="${esc(p)}" alt=""></button>`).join('')}</div>` : ''}
          ${a.photos?.length ? '' : `<p class="muted small">${t('detail.placeholder')}</p>`}
        </div>
        <div class="detail-info">
          <p class="detail-id"><span class="mono">${esc(a.id)}</span>${statusPill(a)}</p>
          ${geneTitle(a, 'h2', 'gene-title gene-title-xl')}
          ${a.name ? `<p class="detail-name">${esc(a.name)}</p>` : ''}
          <div class="price-row">${priceLine(a)}</div>
          <ul class="chips" aria-label="${t('detail.genetics')}">
            ${s.visual.map(g => `<li class="chip chip-vis">${esc(g.gene)}</li>`).join('')}
            ${s.het.map(g => `<li class="chip chip-het"><span>${esc(g.label)}</span> ${esc(g.gene)}</li>`).join('')}
            ${!s.visual.length && !s.het.length ? '<li class="chip chip-vis">Normal</li>' : ''}
          </ul>
          <dl class="facts">
            <div><dt>${t('f.sex')}</dt><dd>${sexWord(a.sex)}</dd></div>
            <div><dt>${t('f.hatched')}</dt><dd>${esc(hatched(a, true))}</dd></div>
            ${a.listing !== 'for-sale' ? `<div><dt>${t('f.breeding')}</dt><dd>${a.proven ? t('br.proven') : a.listing === 'holdback' ? t('br.holdback') : t('br.unproven')}</dd></div>` : ''}
            <div><dt>${t('f.weight')}</dt><dd>${esc(a.weight)} g</dd></div>
            <div><dt>${t('f.feeding')}</dt><dd>${esc(feeding || '—')}</dd></div>
            <div><dt>${t('f.origin')}</dt><dd>${t('origin')}</dd></div>
          </dl>
          ${notes ? `<p class="notes">${esc(notes)}</p>` : ''}
          <div class="detail-actions">
            ${forSale && a.status !== 'hold'
              ? `<a class="btn btn-primary btn-wide" href="${waLink(t('wa.ask', { id: a.id, genes: a.genes }))}" target="_blank" rel="noopener">${t('btn.ask', { id: esc(a.id) })}</a>`
              : `<a class="btn btn-ghost btn-wide" href="${waLink(t('wa.similar', { id: a.id }))}" target="_blank" rel="noopener">${t('btn.similar')}</a>`}
            <button class="btn btn-ghost" type="button" data-copy="${esc(location.href)}" data-copy-label="${esc(t('copy.linkto', { id: a.id }))}">${t('btn.copylink')}</button>
          </div>
          <p class="muted small">${t('detail.other')} <a href="#contact" data-close>${t('detail.contacts')}</a>.</p>
        </div>
      </div>
      ${(() => { const r = related(a); return r.length ? `<section class="related"><h3>${t('related')}</h3><div class="grid related-grid">${r.map(card).join('')}</div></section>` : ''; })()}`;
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    document.title = `${a.id} ${s.visualText} | Urban Nine Exotics`;
  }
  /* Up to 4 available animals sharing the most genes (visual or het) with this one. */
  function related(a) {
    const base = (k) => k.replace(/^Het /, '').replace(/\s*\(.*\)/, '').toLowerCase();
    const mine = new Set(geneKeys(a).map(base));
    return data.animals
      .filter(x => x.id !== a.id && tabOf(x) === 'available' && x.status === 'available')
      .map(x => ({ x, score: new Set(geneKeys(x).map(base).filter(k => mine.has(k))).size }))
      .filter(r => r.score > 0).sort((p, q) => q.score - p.score).slice(0, 4).map(r => r.x);
  }
  function closeDetail() {
    const dlg = $('#detail');
    if (dlg.open) dlg.close();
    document.title = 'Urban Nine Exotics';
  }

  /* ---------- about + contacts ---------- */
  function renderAbout() {
    const s = data.settings;
    $('#about-text').innerHTML = String(loc(s, 'about') || '').split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('');
    const steps = [['step.reserve', loc(s, 'termsDeposit')], ['step.ship', loc(s, 'termsShipping')], ['step.guarantee', loc(s, 'termsGuarantee')]].filter(x => x[1]);
    $('#steps').innerHTML = steps.map(([h, txt]) => `<li><h3>${t(h)}</h3><p>${esc(txt)}</p></li>`).join('');
    const wa = (s.whatsapp || '').replace(/\D/g, '');
    const rows = [
      wa && ['WhatsApp', '+' + wa, `https://wa.me/${wa}`],
      s.instagram && ['Instagram', '@' + s.instagram.replace(/^@/, ''), `https://instagram.com/${s.instagram.replace(/^@/, '')}`],
      s.email && ['Email', s.email, `mailto:${s.email}`]
    ].filter(Boolean);
    $('#contacts').innerHTML = rows.map(([k, v, href]) => `
      <li><span class="c-k">${k}</span><a class="c-v" href="${esc(href)}" target="_blank" rel="noopener">${esc(v)}</a>
      <button class="icon-btn copy" type="button" data-copy="${esc(v)}" aria-label="${t('copy.x', { k })}">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
      </button></li>`).join('');
    $('#about-fig').innerHTML = window.UNEPhotos ? UNEPhotos.figure('about', { alt: t('alt.about'), cls: 'r-fig about-fig' }) : '';
    $('#foot-location').textContent = t('foot.ship', { loc: s.location });
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------- routing ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const isAdmin = h === 'admin' || h.startsWith('admin/');
    document.body.classList.toggle('admin-mode', isAdmin);
    $('#public').hidden = isAdmin; $('#admin-root').hidden = !isAdmin;
    if (isAdmin) { closeDetail(); window.UNEAdmin?.open(); return; }
    const r = h.match(/^\/research(?:\/([\w-]+))?$/);
    $('#research-root').hidden = !r; $('#public').hidden = !!r;
    if (r) {
      closeDetail();
      $$('[data-nav]').forEach(l => l.toggleAttribute('aria-current', l.dataset.nav === 'research'));
      if (!window.UNEResearch) return;
      UNEResearch.build($('#research-root'), data.settings.whatsapp);
      document.title = `${t('title.research')} | Urban Nine Exotics`;
      const target = r[1] && document.getElementById('r-' + r[1]);
      // after layout (and the browser's own scroll restore) settles
      requestAnimationFrame(() => setTimeout(() => target ? target.scrollIntoView() : window.scrollTo(0, 0), 0));
      UNEResearch.watch();
      return;
    }
    $$('[data-nav]').forEach(l => l.toggleAttribute('aria-current', l.dataset.nav === state.tab));
    // In-page anchors (#about, #projects, #contact) clicked from another view
    if (/^[a-z]+$/.test(h)) { document.title = 'Urban Nine Exotics'; document.getElementById(h)?.scrollIntoView(); }
    const m = h.match(/^\/animal\/(.+)$/);
    if (m) {
      const a = data.animals.find(x => x.id === m[1]);
      if (a && state.tab !== tabOf(a)) { state.tab = tabOf(a); state.genes = []; renderCatalog(); }
      openDetail(m[1]); return;
    }
    closeDetail();
    const tb = h.match(/^\/(available|collection|sold)$/);
    if (tb && tb[1] !== state.tab) { state.tab = tb[1]; state.genes = []; renderCatalog(); }
  }

  /* ---------- breeding projects ---------- */
  function renderProjects() {
    const list = (data.pairings || []).filter(p => data.animals.some(a => a.id === p.female) && data.animals.some(a => a.id === p.male));
    $('#projects').hidden = !list.length;
    if (!list.length) return;
    const seasons = [...new Set(list.map(p => p.season))].sort((a, b) => b - a);
    $('#projects-h').textContent = t('proj.h', { y: seasons[0] });
    const parent = (id) => {
      const a = data.animals.find(x => x.id === id);
      return `<a class="parent" href="#/animal/${encodeURIComponent(a.id)}"><img src="${esc(cover(a))}" alt="" loading="lazy"><span class="parent-sex">${sexGlyph(a.sex)}</span>
        <span class="parent-txt">${geneTitle(a, 'span')}${a.name ? `<span class="muted small">${esc(a.name)}</span>` : ''}</span></a>`;
    };
    $('#pairings').innerHTML = list.filter(p => p.season === seasons[0]).map(p => `
      <li class="pairing">
        <div class="pair-head"><span class="pill pill-${p.status}">${t('ps.' + p.status)}</span></div>
        <div class="pair-parents">${parent(p.female)}<span class="pair-x" aria-label="${t('paired.with')}">×</span>${parent(p.male)}</div>
        ${loc(p, 'note') ? `<p class="pair-note">${esc(loc(p, 'note'))}</p>` : ''}
      </li>`).join('');
  }

  function renderAll() { I.apply(); renderHero(); renderYears(); renderCatalog(); renderProjects(); renderAbout(); renderLang(); }
  function renderLang() { $$('.lang-switch [data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === I.lang)); }

  /* ---------- events ---------- */
  function bind() {
    $$('.tabs [data-tab]').forEach(b => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.tab; }));
    $('.tabs').addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tabs = $$('.tabs [data-tab]'); const i = tabs.findIndex(x => x.dataset.tab === state.tab);
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); next.click();
    });
    $$('.seg [data-sex]').forEach(b => b.addEventListener('click', () => { state.sex = b.dataset.sex; renderCatalog(); }));
    const f = $('#filters');
    f.q.addEventListener('input', () => { state.q = f.q.value; renderCatalog(); });
    f.year.addEventListener('change', () => { state.year = f.year.value; renderCatalog(); });
    f.sort.addEventListener('change', () => { state.sort = f.sort.value; renderCatalog(); });

    // language
    $$('.lang-switch [data-lang]').forEach(b => b.addEventListener('click', () => I.set(b.dataset.lang)));
    I.onChange(() => {
      renderAll();
      if (!$('#research-root').hidden || !$('#detail').open) route(); // rebuild research / titles in the new language
      if ($('#detail').open) { const m = location.hash.match(/^#\/animal\/(.+)$/); if (m) openDetail(decodeURIComponent(m[1])); }
    });

    document.addEventListener('click', async (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        try { await navigator.clipboard.writeText(copy.dataset.copy); toast(t('copied', { x: copy.dataset.copyLabel || copy.dataset.copy })); }
        catch { toast(t('copy.blocked')); }
        return;
      }
      if (e.target.closest('[data-reset]')) {
        Object.assign(state, { sex: 'all', year: 'all', q: '', genes: [] }); f.q.value = ''; f.year.value = 'all'; renderCatalog(); return;
      }
      const fb = e.target.closest('[data-gene]');
      if (fb) {
        const g = fb.dataset.gene, i = state.genes.findIndex(x => x.toLowerCase() === g.toLowerCase());
        i >= 0 ? state.genes.splice(i, 1) : state.genes.push(g); renderCatalog(); return;
      }
      const thumb = e.target.closest('[data-photo]');
      if (thumb) {
        $('#gallery-main').src = $('img', thumb).src;
        $$('.thumb').forEach(x => x.setAttribute('aria-pressed', x === thumb)); return;
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
    try { const th = localStorage.getItem('une-theme'); if (th) root.dataset.theme = th; } catch {}
    $('[data-theme-toggle]').addEventListener('click', () => {
      const dark = root.dataset.theme !== 'light';
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('une-theme', root.dataset.theme); } catch {}
    });
  }

  /* Called by admin after edits so the public view reflects the draft. */
  function refresh(next) { if (next) data = next; renderAll(); }

  bind(); renderAll(); route();
  // The owner's draft loads from IndexedDB a moment later; re-render with it if there is one.
  UNEStore.ready.then(() => { if (UNEStore.hasDraft()) { data = UNEStore.load({ draft: true }); renderAll(); if (!document.body.classList.contains('admin-mode')) route(); } });
  return { refresh, toast, money, esc, cover, tabOf, get data() { return data; } };
})();
