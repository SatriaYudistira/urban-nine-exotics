/* Animation page (#/animation): a 3D ball python you can dress in any combination of common
   MorphMarket genes, shown as a hatchling, juvenile or adult, or all three side by side.
   The snake is procedural: a tube built along a moving spine, with a skin painted on a canvas
   from the chosen genes. Three.js is loaded from a CDN only when this page is opened. */
window.UNEAnim = (() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = () => (window.UNEi18n?.lang === 'id' ? 'id' : 'en');

  /* ---------- genes: [id, name, type, EN, ID]  rec = recessive, inc = incomplete dominant, dom = dominant ---------- */
  const GENES = [
    ['pied', 'Pied', 'rec', 'White patches. The amount of white varies from a little to almost all white, even within one clutch.', 'Bercak putih. Jumlah putihnya bisa sedikit sampai hampir putih semua, bahkan dalam satu clutch.'],
    ['clown', 'Clown', 'rec', 'A wide dark stripe down the back, clean golden sides and a distinctive head pattern.', 'Garis gelap lebar di punggung, sisi badan keemasan yang bersih, dan motif kepala yang khas.'],
    ['albino', 'Albino', 'rec', 'No black pigment: white and bright yellow with pink-red eyes.', 'Tanpa pigmen hitam: putih dan kuning terang, mata merah muda.'],
    ['lavender', 'Lavender Albino', 'rec', 'An albino with lavender where a normal albino is white, and ruby eyes.', 'Albino dengan warna lavender di bagian yang biasanya putih, mata merah delima.'],
    ['axanthic', 'Axanthic', 'rec', 'No yellow pigment: black, grey and silver. Albino plus Axanthic makes a Snow.', 'Tanpa pigmen kuning: hitam, abu-abu, dan perak. Albino + Axanthic = Snow.'],
    ['hypo', 'Hypo (Ghost)', 'rec', 'Less black pigment, so the dark parts turn a warm milk-chocolate brown.', 'Pigmen hitam berkurang, sehingga bagian gelap jadi cokelat susu yang hangat.'],
    ['desertghost', 'Desert Ghost', 'rec', 'Faded, sandy colours with soft contrast.', 'Warna pudar seperti pasir dengan kontras yang lembut.'],
    ['banana', 'Banana', 'inc', 'Lavender-grey and bright yellow. Black freckles appear and increase with age.', 'Lavender keabuan dan kuning terang. Bintik hitam muncul dan bertambah seiring umur.'],
    ['pastel', 'Pastel', 'inc', 'Brighter yellow, lighter pattern and blushed sides. Often browns out with age.', 'Kuning lebih cerah, motif lebih terang, sisi badan merona. Sering menggelap (browning) seiring umur.'],
    ['mojave', 'Mojave', 'inc', 'Golden, connected pattern. Mojave + Lesser or two Mojaves makes a white, blue-eyed BEL.', 'Motif keemasan yang menyambung. Mojave + Lesser atau Super Mojave = BEL putih bermata biru.'],
    ['lesser', 'Lesser', 'inc', 'Lighter, blushed browns. Lesser + Mojave or two Lessers makes a BEL.', 'Cokelat lebih terang dan merona. Lesser + Mojave atau Super Lesser = BEL.'],
    ['enchi', 'Enchi', 'inc', 'Orange tones and a reduced pattern. Super Enchi is bright orange.', 'Nuansa oranye dan motif lebih sedikit. Super Enchi oranye terang.'],
    ['fire', 'Fire', 'inc', 'Lighter and yellower with a clean belly. Super Fire is a near-white, black-eyed snake.', 'Lebih terang dan kuning, perut bersih. Super Fire hampir putih dengan mata hitam.'],
    ['yellowbelly', 'Yellow Belly', 'inc', 'Subtle: cleaner sides and belly. Two copies make the Ivory, pale with a yellow-grey back stripe.', 'Halus: sisi dan perut lebih bersih. Dua salinan = Ivory, pucat dengan garis punggung kuning keabuan.'],
    ['orangedream', 'Orange Dream', 'inc', 'Orange blotches and faded sides. The Super is pale orange.', 'Bercak oranye dan sisi pudar. Super-nya oranye pucat.'],
    ['cinnamon', 'Cinnamon', 'inc', 'Darker reddish brown, reduced pattern. Super Cinnamon is almost solid brown.', 'Cokelat kemerahan lebih gelap, motif berkurang. Super Cinnamon hampir cokelat polos.'],
    ['blackpastel', 'Black Pastel', 'inc', 'Darker olive brown, reduced pattern. Super Black Pastel is almost solid black.', 'Cokelat zaitun lebih gelap, motif berkurang. Super Black Pastel hampir hitam polos.'],
    ['ghi', 'GHI', 'inc', 'Dark, smoky and high-contrast, with dark flakes on the belly.', 'Gelap, berasap, kontras tinggi, dengan bintik gelap di perut.'],
    ['leopard', 'Leopard', 'inc', 'Small dark speckles through the pattern, which is slightly reduced.', 'Bintik gelap kecil di seluruh motif, motifnya sedikit berkurang.'],
    ['spotnose', 'Spotnose', 'inc', 'The pattern breaks into chains and spots, with dots on the face. The Super is pale.', 'Motif pecah jadi rantai dan bintik, ada titik di wajah. Super-nya pucat.'],
    ['spider', 'Spider', 'dom', 'A thin web pattern on light sides. Every Spider carries a neurological head wobble, so many breeders avoid it.', 'Motif jaring tipis di sisi yang terang. Semua Spider membawa wobble (gangguan saraf), jadi banyak breeder menghindarinya.'],
    ['pinstripe', 'Pinstripe', 'dom', 'A thin pinstripe down the back, clean sides and no alien-head marks.', 'Garis tipis di punggung, sisi bersih, tanpa motif "alien head".']
  ];
  const GENE = Object.fromEntries(GENES.map(g => [g[0], g]));
  const BEL = ['mojave', 'lesser'], BPC = ['cinnamon', 'blackpastel']; // allelic groups: two copies max between them

  const PRESETS = [
    ['Normal', {}],
    ['Banana Pied', { banana: 1, pied: 1 }],
    ['Clown Pied', { clown: 1, pied: 1 }],
    ['Banana Clown', { banana: 1, clown: 1 }],
    ['Albino Pied', { albino: 1, pied: 1 }],
    ['Super Pastel Clown', { pastel: 2, clown: 1 }],
    ['Bumblebee', { pastel: 1, spider: 1 }],
    ['Lemon Blast', { pastel: 1, pinstripe: 1 }],
    ['Enchi Pastel', { enchi: 1, pastel: 1 }],
    ['BEL', { lesser: 1, mojave: 1 }],
    ['Snow', { albino: 1, axanthic: 1 }],
    ['Ivory', { yellowbelly: 2 }],
    ['Lavender Pied', { lavender: 1, pied: 1 }],
    ['Super Cinnamon', { cinnamon: 2 }]
  ];

  /* Typical sizes (sources: Animal Diversity Web; breeder size charts). Model length is mid-range. */
  const STAGES = {
    baby: { len: 0.36, girth: 34, head: 1.3, en: ['Hatchling', '0–6 months', '25–43 cm', '50–100 g'], id: ['Bayi', '0–6 bulan', '25–43 cm', '50–100 g'] },
    juv: { len: 0.75, girth: 31, head: 1.12, en: ['Juvenile', '6–18 months', '60–90 cm', '300–700 g'], id: ['Remaja', '6–18 bulan', '60–90 cm', '300–700 g'] },
    adult: { len: 1.2, girth: 28, head: 1, en: ['Adult', '3+ years', 'Males 90–105 cm, females 105–140 cm', 'Males 1.2–1.8 kg, females 1.8–3 kg'], id: ['Dewasa', '3+ tahun', 'Jantan 90–105 cm, betina 105–140 cm', 'Jantan 1,2–1,8 kg, betina 1,8–3 kg'] }
  };
  const ORDER = ['baby', 'juv', 'adult'];

  const TXT = {
    en: {
      h: 'Morph animation', lede: 'Pick genes and see what the combination looks like as a hatchling, juvenile and adult. Let it move, rest, or ball up the way ball pythons do when they feel shy. Drag to turn the view.',
      stage: 'Age', compare: 'Compare sizes', pose: 'Behaviour', move: 'Move', stay: 'Stay', ball: 'Ball up',
      play: 'Pause', resume: 'Play', reroll: 'Another individual', rerollTip: 'Same genes, a different snake: patterns and Pied white vary between animals',
      zoomIn: 'Zoom in', zoomOut: 'Zoom out', headcam: 'Head close-up',
      presets: 'Popular combos', genes: 'Genes', clear: 'Clear',
      rec: 'Recessive', recTip: 'Needs two copies to show. One copy (het) looks normal.',
      inc: 'Incomplete dominant', incTip: 'One copy shows. Tap again for the Super (two copies).',
      dom: 'Dominant', domTip: 'One copy shows.',
      what: 'What you are seeing', len: 'Length', wt: 'Weight', age: 'Age',
      skin: 'Skin, unrolled: the back runs along the middle, the belly along the edges.',
      ask: 'Ask about this combo', copy: 'Copy link',
      note: 'An illustration of typical animals, not a photo. Real snakes vary a lot, especially Pied white and how colours change with age.',
      loading: 'Loading 3D…', nogl: 'The 3D view could not start on this device (no WebGL, or offline). The skin pattern below still updates.',
      wa: 'Hi Urban Nine, I like the {x} combo. Do you have or plan anything like it?',
      superW: 'Super', normal: 'Normal',
      n_bel_pied: 'Pied white does not show on an all-white snake.',
      n_het: 'Recessive genes need two copies. A het (one copy) looks normal but can pass the gene on.',
      canvas: 'Animated 3D ball python', sizeAll: 'Same individual at three ages, to scale'
    },
    id: {
      h: 'Animasi morph', lede: 'Pilih gen dan lihat tampilan kombinasinya saat bayi, remaja, dan dewasa. Biarkan bergerak, diam, atau menggulung seperti ball python saat malu. Geser untuk memutar tampilan.',
      stage: 'Umur', compare: 'Bandingkan ukuran', pose: 'Gerakan', move: 'Bergerak', stay: 'Diam', ball: 'Menggulung',
      play: 'Jeda', resume: 'Putar', reroll: 'Individu lain', rerollTip: 'Gen sama, ular berbeda: motif dan putih Pied berbeda tiap ekor',
      zoomIn: 'Perbesar', zoomOut: 'Perkecil', headcam: 'Lihat kepala',
      presets: 'Kombinasi populer', genes: 'Gen', clear: 'Hapus',
      rec: 'Resesif', recTip: 'Perlu dua salinan agar terlihat. Satu salinan (het) tampak normal.',
      inc: 'Ko-dominan (incomplete dominant)', incTip: 'Satu salinan sudah terlihat. Ketuk lagi untuk Super (dua salinan).',
      dom: 'Dominan', domTip: 'Satu salinan sudah terlihat.',
      what: 'Yang Anda lihat', len: 'Panjang', wt: 'Berat', age: 'Umur',
      skin: 'Kulit dibentangkan: punggung di tengah, perut di tepi atas dan bawah.',
      ask: 'Tanya kombinasi ini', copy: 'Salin link',
      note: 'Ilustrasi dari contoh umum, bukan foto. Ular asli sangat bervariasi, terutama putih Pied dan perubahan warna seiring umur.',
      loading: 'Memuat 3D…', nogl: 'Tampilan 3D tidak bisa jalan di perangkat ini (tidak ada WebGL atau sedang offline). Motif kulit di bawah tetap berubah.',
      wa: 'Halo Urban Nine, saya suka kombinasi {x}. Ada atau ada rencana yang mirip?',
      superW: 'Super', normal: 'Normal',
      n_bel_pied: 'Putih Pied tidak terlihat pada ular yang sudah putih semua.',
      n_het: 'Gen resesif perlu dua salinan. Het (satu salinan) tampak normal tapi bisa menurunkan gennya.',
      canvas: 'Ball python 3D bergerak', sizeAll: 'Individu yang sama di tiga umur, skala asli'
    }
  };
  const tx = (k) => TXT[L()][k] ?? TXT.en[k];

  /* ---------- state ---------- */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = { genes: {}, stage: 'adult', compare: false, pose: 'move', playing: !reduceMotion, seed: 7 };

  function fromHash(arg) {
    const g = {};
    String(arg || '').split('+').filter(Boolean).forEach(tok => {
      const sup = tok.startsWith('super-'), id = sup ? tok.slice(6) : tok;
      if (GENE[id]) g[id] = sup && GENE[id][2] === 'inc' ? 2 : 1;
    });
    return g;
  }
  const toHash = () => Object.entries(S.genes).map(([id, n]) => (n === 2 ? 'super-' : '') + id).join('+');

  /* ---------- colour helpers ---------- */
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const css = (c, a = 1) => `rgba(${c.map(v => Math.round(v)).join(',')},${a})`;
  const lum = (c) => .3 * c[0] + .59 * c[1] + .11 * c[2];
  function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- genes → colours and pattern parameters ---------- */
  function phenotype(g, stage) {
    const n = (id) => g[id] || 0;
    const age = { baby: 0, juv: .5, adult: 1 }[stage];
    const P = { dark: [34, 25, 20], blotch: [118, 88, 58], key: [30, 21, 16], belly: [236, 229, 212], head: [42, 30, 23], eye: [52, 40, 32], tongue: [40, 30, 32], rim: null };
    const T = { reduce: 0, connect: 0, keyhole: 1, blush: 0, sideClean: 0, bellyDots: .5, bellyDark: 0, web: 0, pin: 0, clown: 0, leopard: 0, spot: 0, freckle: 0, solid: 0, solidCol: null, stripe: 0, stripeCol: null, leu: null, pied: n('pied') ? 1 : 0, faceDots: 0 };

    const bel = n('mojave') + n('lesser'), bpc = n('cinnamon') + n('blackpastel');
    if (n('pastel')) { const k = n('pastel'); P.blotch = mix(P.blotch, [222, 176, 44], .42 + .3 * (k - 1)); P.dark = mix(P.dark, [92, 64, 30], .2 * k); P.key = mix(P.key, [72, 50, 22], .2 * k); P.head = mix(P.head, [98, 68, 30], .2 * k); T.blush += .3 * k; T.keyhole -= .15 * k; T.reduce += .12 * k; T.bellyDots -= .2 * k;
      if (age) P.blotch = mix(P.blotch, [176, 128, 62], .14 * age); }
    if (n('enchi')) { const k = n('enchi'); P.blotch = mix(P.blotch, [216, 126, 42], .38 * k); P.dark = mix(P.dark, [82, 50, 26], .16 * k); T.reduce += .25 * k; T.keyhole -= .3 * k; T.blush += .25 * k; T.connect += .2; }
    if (n('orangedream')) { const k = n('orangedream'); P.blotch = mix(P.blotch, [230, 124, 64], .45 * k); P.dark = mix(P.dark, k > 1 ? [204, 150, 120] : [98, 58, 36], k > 1 ? .55 : .22); P.key = mix(P.key, [110, 64, 40], .2 * k); T.reduce += .18 * k; T.blush += .3 * k; }
    if (n('fire') === 1) { P.blotch = mix(P.blotch, [228, 184, 86], .4); P.dark = mix(P.dark, [86, 60, 34], .3); P.head = mix(P.head, [90, 64, 38], .3); T.keyhole -= .2; T.blush += .2; T.bellyDots = 0; }
    if (n('yellowbelly') === 1) { T.sideClean += .6; T.bellyDots = 0; T.blush += .1; }
    if (bel === 1 && n('mojave')) { P.blotch = mix(P.blotch, [198, 152, 70], .35); P.dark = mix(P.dark, [62, 42, 28], .2); T.connect += .5; T.blush += .25; T.keyhole += .1; }
    if (bel === 1 && n('lesser')) { P.dark = mix(P.dark, [94, 68, 42], .35); P.head = mix(P.head, [98, 72, 46], .35); P.blotch = mix(P.blotch, [204, 162, 98], .3); T.blush += .45; T.reduce += .15; T.keyhole -= .25; }
    if (bpc === 1) {
      if (n('cinnamon')) { P.dark = mix(P.dark, [62, 34, 22], .55); P.blotch = mix(P.blotch, [118, 70, 40], .42); P.key = mix(P.key, [40, 22, 16], .5); }
      else { P.dark = mix(P.dark, [34, 28, 22], .55); P.blotch = mix(P.blotch, [106, 80, 48], .45); P.key = mix(P.key, [22, 20, 16], .5); }
      T.reduce += .2; T.bellyDots += .3; T.keyhole -= .2;
    }
    if (bpc === 2) { T.solid = .9; T.solidCol = n('cinnamon') === 2 ? [58, 36, 26] : n('blackpastel') === 2 ? [36, 31, 27] : [47, 33, 26]; P.belly = [96, 84, 72]; P.head = T.solidCol; }
    if (n('ghi')) { const k = n('ghi'); P.dark = mix(P.dark, [20, 18, 16], .6); P.key = [14, 12, 11]; P.blotch = mix(P.blotch, [146, 120, 84], .42 * k); T.bellyDark += .6 * k; T.keyhole += .2;
      if (k > 1) { T.solid = .62; T.solidCol = [40, 36, 32]; } }
    if (n('leopard')) { const k = n('leopard'); T.leopard += .55 * k; T.reduce += .12 * k; T.blush += .15 * k; if (k > 1) P.blotch = mix(P.blotch, [214, 176, 112], .3); }
    if (n('spotnose')) { const k = n('spotnose'); T.spot += .7; T.reduce += .25 * k; T.sideClean += .3; T.keyhole -= .5; T.faceDots = 1; P.blotch = mix(P.blotch, [208, 168, 104], .25 * k);
      if (k > 1) { T.solid = .62; T.solidCol = [222, 198, 152]; } }
    if (n('spider')) { T.web = 1; T.sideClean += .5; T.reduce += .3; T.keyhole = 0; }
    if (n('pinstripe')) { T.pin = 1; T.reduce += .4; T.blush += .2; T.keyhole = 0; }
    if (n('clown')) { T.clown = 1; P.blotch = mix(P.blotch, [212, 152, 62], .35); T.keyhole -= .5; }
    if (n('banana')) { const k = n('banana'); P.dark = mix(P.dark, k > 1 ? [196, 178, 198] : [150, 122, 148], .88); P.key = mix(P.key, k > 1 ? [170, 150, 172] : [124, 96, 122], .85); P.head = mix(P.head, k > 1 ? [190, 172, 192] : [146, 118, 144], .88);
      P.blotch = mix(P.blotch, [238, 188, 60], k > 1 ? .78 : .62); P.belly = [246, 242, 234]; T.freckle = (.12 + .8 * age) * (k > 1 ? .6 : 1); if (k > 1) T.reduce += .3; P.tongue = [120, 96, 118]; }
    if (n('hypo')) { P.dark = mix(P.dark, [144, 100, 60], .75); P.key = mix(P.key, [122, 82, 50], .75); P.head = mix(P.head, [150, 106, 64], .7); P.blotch = mix(P.blotch, [234, 188, 106], .4); P.eye = [70, 50, 36]; }
    if (n('desertghost')) { P.dark = mix(P.dark, [120, 98, 74], .6); P.key = mix(P.key, [102, 82, 62], .6); P.blotch = mix(P.blotch, [216, 186, 130], .45); P.head = mix(P.head, [132, 106, 80], .6); T.blush += .2; }
    if (T.solidCol && (n('hypo') || n('desertghost'))) T.solidCol = mix(T.solidCol, [140, 100, 66], .6);

    // Pigment-removing genes go last so they act on whatever the pattern genes produced.
    if (n('axanthic')) {
      const grey = (c, lift = 0) => { const l = Math.min(255, lum(c) + lift); return [l * .97, l * .98, l * 1.02]; };
      P.dark = grey(P.dark); P.key = grey(P.key); P.head = grey(P.head); P.blotch = grey(P.blotch, 22); P.belly = grey(P.belly, 8);
      if (T.solidCol) T.solidCol = grey(T.solidCol);
    }
    if (n('lavender') && !n('albino')) {
      const lav = (c, lo, hi) => mix(hi, lo, Math.min(1, (255 - lum(c)) / 230));
      P.dark = lav(P.dark, [160, 122, 164], [214, 190, 214]); P.key = lav(P.key, [150, 112, 154], [206, 182, 208]); P.head = lav(P.head, [164, 126, 166], [214, 192, 214]);
      P.blotch = n('axanthic') ? [238, 226, 236] : mix(P.blotch, [240, 208, 116], .72); P.belly = [250, 246, 242]; P.eye = [150, 24, 46]; P.tongue = [218, 150, 170];
      if (T.solidCol) T.solidCol = lav(T.solidCol, [150, 112, 154], [214, 190, 214]);
      T.freckle *= .2;
    }
    if (n('albino')) {
      P.dark = [248, 242, 230]; P.key = [242, 232, 214]; P.head = [248, 241, 228]; P.belly = [252, 250, 246]; P.eye = [214, 70, 92]; P.tongue = [226, 156, 170];
      P.blotch = n('axanthic') ? [244, 237, 214] : mix(P.blotch, [248, 200, 44], .78);
      if (T.solidCol) T.solidCol = mix(T.solidCol, [238, 196, 120], .8);
      T.freckle *= .15; T.bellyDark = 0;
    }
    P.rim = T.leu ? P.blotch : mix(P.blotch, n('albino') ? [255, 246, 214] : n('axanthic') ? [226, 226, 230] : [232, 192, 116], .45);
    T.keyhole = Math.max(0, T.keyhole); T.reduce = Math.min(1, T.reduce); T.blush = Math.min(1, T.blush); T.sideClean = Math.min(1, T.sideClean); T.bellyDots = Math.max(0, T.bellyDots);

    // Whole-body overrides
    if (bel === 2) { T.leu = 'bel'; P.eye = [70, 136, 206]; P.tongue = [212, 160, 170]; }
    else if (n('fire') === 2) { T.leu = 'fire'; P.eye = [14, 12, 10]; P.tongue = [200, 150, 160]; }
    if (T.leu) { const w = T.leu === 'bel' ? [248, 246, 240] : [247, 240, 220]; Object.assign(P, { dark: w, key: w, head: w, belly: [252, 251, 248], blotch: mix(w, [240, 220, 160], .25) }); T.solid = 0; T.solidCol = null; }
    if (n('yellowbelly') === 2 && !T.leu) { T.solid = .9; T.solidCol = n('albino') ? [250, 244, 226] : mix(lum(P.dark) > 150 ? P.dark : [236, 228, 206], [236, 228, 206], .7); T.stripe = 1; T.stripeCol = n('albino') ? [244, 214, 120] : mix([206, 186, 134], P.blotch, .25); P.head = T.solidCol; }
    return { P, T, age };
  }

  function comboName(g) {
    const has = (id, k = 1) => (g[id] || 0) >= k, used = new Set(), parts = [];
    const take = (label, ...ids) => { ids.forEach(i => used.add(i)); parts.push(label); };
    const bel = (g.mojave || 0) + (g.lesser || 0);
    if (bel === 2) take(g.mojave === 2 ? 'Super Mojave (BEL)' : g.lesser === 2 ? 'Super Lesser (BEL)' : 'BEL', 'mojave', 'lesser');
    if (g.fire === 2) take('Super Fire (Black-Eyed Leucistic)', 'fire');
    if (g.yellowbelly === 2) take('Ivory', 'yellowbelly');
    if ((g.cinnamon || 0) + (g.blackpastel || 0) === 2 && g.cinnamon === 1) take('Black Pastel Cinnamon', 'cinnamon', 'blackpastel');
    if (has('spider') && has('pinstripe') && g.pastel === 1) take('Spinnerbee', 'spider', 'pinstripe', 'pastel');
    else if (has('spider') && g.pastel === 2) take('Killer Bee', 'spider', 'pastel');
    else if (has('spider') && g.pastel === 1) take('Bumblebee', 'spider', 'pastel');
    else if (has('pinstripe') && g.pastel === 2) take('Super Blast', 'pinstripe', 'pastel');
    else if (has('pinstripe') && g.pastel === 1) take('Lemon Blast', 'pinstripe', 'pastel');
    if (has('spider') && has('pinstripe') && !used.has('spider')) take('Spinner', 'spider', 'pinstripe');
    if (g.mojave === 1 && g.pastel === 1 && !used.has('pastel') && !used.has('mojave')) take('Pastave', 'mojave', 'pastel');
    const albSnow = has('albino') && has('axanthic');
    GENES.forEach(([id, name, type]) => {
      if (!g[id] || used.has(id)) return;
      if (albSnow && (id === 'albino' || id === 'axanthic')) { if (id === 'albino') parts.push('Snow'); return; }
      parts.push((g[id] === 2 ? 'Super ' : '') + name);
    });
    // MorphMarket habit: dominant and incomplete dominant names first, then recessives with Pied last ("Banana Clown Pied")
    const REC = ['Lavender Albino', 'Albino', 'Snow', 'Axanthic', 'Hypo (Ghost)', 'Desert Ghost', 'Clown', 'Pied'];
    return [...parts.filter(p => !REC.includes(p)), ...parts.filter(p => REC.includes(p)).sort((a, b) => REC.indexOf(a) - REC.indexOf(b))].join(' ') || tx('normal');
  }

  /* ---------- skin painter: u (x) runs snout → tail, v (y) runs around the body, back at the middle ---------- */
  const W = 2048, H = 320, MID = H / 2, SC = 2; // skin is drawn in W x H units at SC x resolution
  function blob(x, cx, cy, rx, ry, r, jag = .3, n = 9) {
    const p = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 - jag / 2 + r() * jag; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    x.beginPath();
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = m(p[n - 1], p[0]); x.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const c = p[i], e = m(c, p[(i + 1) % n]); x.quadraticCurveTo(c[0], c[1], e[0], e[1]); }
    x.closePath(); x.fill();
  }
  function dots(x, count, r, col, alpha, ymin, ymax, x0, rmin = .4) {
    x.fillStyle = css(col, alpha);
    for (let i = 0; i < count; i++) { const cx = x0 + r() * (W - x0), cy = ymin + r() * (ymax - ymin), rr = (rmin + r() * (1 - rmin)) * dots.size; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); }
  }

  function paint(ph, seed, hs, target) {
    const c = target || document.createElement('canvas'); c.width = W * SC; c.height = H * SC;
    const x = c.getContext('2d', { willReadFrequently: true }), r = rng(seed * 7919 + 13), { P, T } = ph;
    x.setTransform(SC, 0, 0, SC, 0, 0);
    const HEAD = Math.round(W * .055 * hs), body0 = HEAD - 6, sp = W * .056;
    const light = mix(P.blotch, P.belly, .35);

    x.fillStyle = css(P.dark); x.fillRect(0, 0, W, H);
    if (!T.leu) {
      const plain = T.web || T.pin;
      if (T.clown) {
        // golden body, dark dorsal stripe with teardrop "heads", a few lateral remnants
        x.fillStyle = css(P.blotch); x.fillRect(body0, 0, W, H);
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, css(mix(P.blotch, P.dark, .25))); g.addColorStop(.32, css(P.blotch, 0)); g.addColorStop(.68, css(P.blotch, 0)); g.addColorStop(1, css(mix(P.blotch, P.dark, .25)));
        x.fillStyle = g; x.fillRect(body0, 0, W, H);
        const hw = H * (plain ? .02 : .045);
        x.fillStyle = css(P.dark);
        for (let px = body0; px < W; px += 6) { const w = hw * (1 + .25 * Math.sin(px * .05 + r() * .3)); x.fillRect(px, MID - w, 7, w * 2); }
        for (let cx = body0 + sp * .8; cx < W; cx += sp * (1.6 + r() * 1.4)) {
          const side = r() < .5 ? -1 : 1;
          blob(x, cx, MID + side * H * .07, sp * .16, H * .09, r, .35, 7);
          if (r() < .4) blob(x, cx + sp * .4, MID - side * H * .06, sp * .11, H * .06, r, .35, 7);
        }
        if (!plain) for (let cx = body0 + sp; cx < W; cx += sp * (2 + r() * 2)) { x.fillStyle = css(P.key, .75); blob(x, cx, MID + (r() < .5 ? -1 : 1) * H * .25, sp * .07, H * .035, r); }
      } else if (plain) {
        x.fillStyle = css(light); x.fillRect(body0, 0, W, H);
        const g = x.createLinearGradient(0, 0, 0, H); const top = mix(P.blotch, P.dark, .2 * (1 - T.reduce));
        g.addColorStop(.18, css(light, 0)); g.addColorStop(.42, css(top)); g.addColorStop(.58, css(top)); g.addColorStop(.82, css(light, 0));
        x.fillStyle = g; x.fillRect(body0, 0, W, H);
      } else {
        // normal: dark ground, big lateral "alien head" blotches and dorsal blotches between them
        const grow = 1 + .45 * T.reduce + .25 * T.connect;
        for (let i = -1, cx = body0; cx < W + sp; i++, cx = body0 + i * sp) {
          for (const side of [-1, 1]) {
            const bx = cx + (side > 0 ? sp * .5 : 0) + (r() - .5) * sp * .3, by = MID + side * H * (.2 + r() * .03);
            const rx = sp * .4 * grow * (.8 + r() * .35), ry = H * .15 * (1 + .25 * T.reduce) * (.85 + r() * .3);
            const st = r(), ox = (r() - .5) * rx, extra = r() < .5;
            const shape = (k, pad) => { const rr = rng(Math.floor(st * 1e9)); blob(x, bx, by, rx + pad, ry + pad, rr, .5, 11); if (extra) blob(x, bx + ox, by + side * ry * .7, rx * .45 + pad, ry * .45 + pad, rr, .5, 8); };
            x.fillStyle = css(P.rim); shape(0, 2.6); x.fillStyle = css(P.blotch); shape(0, 0);
            if (T.keyhole > .05) {
              x.fillStyle = css(P.key, Math.min(1, T.keyhole));
              const k = Math.min(1.2, T.keyhole) * (1 - .5 * T.reduce);
              blob(x, bx - rx * .22, by + side * ry * .2, rx * .3 * k, ry * .32 * k, r, .45, 8);
              blob(x, bx + rx * .3, by + side * ry * .12, rx * .2 * k, ry * .24 * k, r, .45, 7);
            }
          }
          const dx = cx + sp * .25 + (r() - .5) * sp * .2;
          { const st = r(), dy = (r() - .5) * 14; x.fillStyle = css(P.rim); blob(x, dx, MID + dy, sp * .24 * grow + 2.6, H * .07 * grow + 2.6, rng(Math.floor(st * 1e9)), .5, 9); x.fillStyle = css(P.blotch); blob(x, dx, MID + dy, sp * .24 * grow, H * .07 * grow, rng(Math.floor(st * 1e9)), .5, 9); }
          if (T.connect > .1 || r() < .3) { x.fillStyle = css(P.blotch, Math.min(1, .6 + T.connect)); blob(x, dx + (r() - .5) * sp * .2, MID + (r() < .5 ? -1 : 1) * H * .1, sp * .1, H * .08, r, .4, 7); }
        }
        // lower flank speckle and belly-edge blotching
        dots.size = 6; dots(x, 260 * (1 - T.sideClean), r, P.blotch, .8, H * .08, H * .16, body0); dots(x, 260 * (1 - T.sideClean), r, P.blotch, .8, H * .84, H * .92, body0);
      }
      if (T.sideClean) {
        for (const [a, b] of [[0, .3], [1, .7]]) {
          const g = x.createLinearGradient(0, H * a, 0, H * b); g.addColorStop(0, css(mix(P.blotch, P.belly, .2), T.sideClean)); g.addColorStop(1, css(mix(P.blotch, P.belly, .2), 0));
          x.fillStyle = g; x.fillRect(body0, Math.min(H * a, H * b), W, Math.abs(b - a) * H);
        }
      }
      if (T.web) {
        x.strokeStyle = css(P.dark, T.pin ? .7 : .95); x.lineWidth = 3; x.lineJoin = 'round';
        for (let cx = body0; cx < W; cx += sp * .62) {
          for (const side of [-1, 1]) {
            x.beginPath(); let px = cx, py = MID;
            x.moveTo(px, py);
            for (let k = 0; k < 4; k++) { px += sp * (.18 + r() * .14) * (k % 2 ? -1 : 1); py += side * H * (.06 + r() * .03); x.lineTo(px, py); }
            x.stroke();
            if (r() < .55) { x.beginPath(); x.moveTo(cx + sp * .1, MID + side * H * .12); x.lineTo(cx + sp * .42, MID + side * H * .14); x.stroke(); }
          }
        }
        x.lineWidth = 4; x.beginPath(); x.moveTo(body0, MID); for (let px = body0; px < W; px += 20) x.lineTo(px, MID + (r() - .5) * 5); x.stroke();
      }
      if (T.pin) {
        x.fillStyle = css(P.dark); for (let px = body0; px < W; px += 4) x.fillRect(px, MID - 3 - r(), 5, 6);
        x.fillStyle = css(P.dark, .85);
        for (const side of [-1, 1]) for (let px = body0 + r() * sp; px < W; px += sp * (1.2 + r())) x.fillRect(px, MID + side * H * .16, sp * (.6 + r() * .9), 3);
      }
      if (T.leopard) { dots.size = 4.5; dots(x, 700 * T.leopard, r, P.key, .78, H * .12, H * .88, body0, .35); }
      if (T.spot) {
        x.fillStyle = css(P.key, .85 * Math.min(1, T.spot));
        for (const side of [-1, 1]) for (const lane of [.13, .27]) for (let px = body0 + r() * 20; px < W; px += 22 + r() * 30) { x.beginPath(); x.arc(px, MID + side * H * lane + (r() - .5) * 10, 5 + r() * 5, 0, 7); x.fill(); }
      }
      if (T.blush) {
        const g = x.createLinearGradient(0, 0, 0, H), b = mix(P.blotch, [255, 236, 190], .25);
        g.addColorStop(.2, css(b, 0)); g.addColorStop(.5, css(b, .45 * T.blush)); g.addColorStop(.8, css(b, 0));
        x.fillStyle = g; x.fillRect(body0, 0, W, H);
      }
      if (T.solid) { x.fillStyle = css(T.solidCol, T.solid); x.fillRect(0, 0, W, H); }
      if (T.stripe) { const g = x.createLinearGradient(0, MID - H * .1, 0, MID + H * .1); g.addColorStop(0, css(T.stripeCol, 0)); g.addColorStop(.5, css(T.stripeCol, .95)); g.addColorStop(1, css(T.stripeCol, 0)); x.fillStyle = g; x.fillRect(body0, MID - H * .1, W, H * .2); }
      if (T.freckle) { dots.size = 2.4; dots(x, 1300 * T.freckle, r, [24, 18, 14], .85, H * .12, H * .88, body0, .3); }
    } else {
      // leucistic: white with a faint ghost of colour along the back
      const g = x.createLinearGradient(0, 0, 0, H), tint = T.leu === 'fire' ? [240, 214, 150] : [236, 222, 186];
      g.addColorStop(.3, css(tint, 0)); g.addColorStop(.5, css(tint, .35)); g.addColorStop(.7, css(tint, 0));
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }

    // belly
    for (const [a, b] of [[0, .13], [1, .87]]) {
      const g = x.createLinearGradient(0, H * a, 0, H * b); g.addColorStop(0, css(P.belly)); g.addColorStop(.75, css(P.belly)); g.addColorStop(1, css(P.belly, 0));
      x.fillStyle = g; x.fillRect(0, Math.min(H * a, H * b), W, H * .13);
    }
    if (!T.leu && T.bellyDots) { dots.size = 4; dots(x, 120 * T.bellyDots, r, P.key, .55, H * .1, H * .13, HEAD); dots(x, 120 * T.bellyDots, r, P.key, .55, H * .87, H * .9, HEAD); }
    if (T.bellyDark) { dots.size = 5; dots(x, 500 * T.bellyDark, r, mix(P.dark, P.belly, .3), .6, 0, H * .1, HEAD); dots(x, 500 * T.bellyDark, r, mix(P.dark, P.belly, .3), .6, H * .9, H, HEAD); }

    // head: x 0..HEAD. Eyes sit at about MID ± 0.2H.
    if (!T.leu) {
      // painted on its own layer, then faded into the neck so there is no hard edge where the body pattern starts
      const HW = HEAD * 1.35, hcv = document.createElement('canvas'); hcv.width = Math.ceil(HW * SC); hcv.height = H * SC;
      const body = x;
      {
      const x = hcv.getContext('2d'); x.setTransform(SC, 0, 0, SC, 0, 0);
      const top = T.clown ? P.blotch : P.head, eyeX = HEAD * .35;
      x.fillStyle = css(top); x.fillRect(0, MID - H * .27, HW, H * .54);
      if (T.clown) {
        x.fillStyle = css(P.dark);
        x.beginPath(); x.moveTo(HEAD * .15, MID); x.quadraticCurveTo(HEAD * .55, MID - H * .1, HW, MID - H * .05); x.lineTo(HW, MID + H * .05); x.quadraticCurveTo(HEAD * .55, MID + H * .1, HEAD * .15, MID); x.fill();
        for (const side of [-1, 1]) { x.beginPath(); x.moveTo(HEAD * .05, MID + side * H * .19); x.quadraticCurveTo(eyeX, MID + side * H * .16, HEAD * .62, MID + side * H * .24); x.lineTo(HEAD * .55, MID + side * H * .26); x.quadraticCurveTo(eyeX, MID + side * H * .22, HEAD * .05, MID + side * H * .215); x.fill(); }
      } else {
        // light stripe from above the eye back along the side of the head, dark band through the eye to the jaw angle
        const stripe = mix(P.rim || P.blotch, P.belly, .15), band = mix(P.head, P.key, .5);
        for (const side of [-1, 1]) {
          x.fillStyle = css(band); x.beginPath(); x.moveTo(HEAD * .12, MID + side * H * .175); x.lineTo(HW, MID + side * H * .2); x.lineTo(HW, MID + side * H * .275); x.lineTo(HEAD * .12, MID + side * H * .245); x.fill();
          x.fillStyle = css(stripe); x.beginPath(); x.moveTo(eyeX + HEAD * .05, MID + side * H * .15); x.quadraticCurveTo(HEAD * .75, MID + side * H * .14, HW, MID + side * H * .175); x.lineTo(HW, MID + side * H * .205); x.quadraticCurveTo(HEAD * .75, MID + side * H * .19, eyeX + HEAD * .05, MID + side * H * .185); x.fill();
          x.fillStyle = css(stripe, .85); blob(x, HEAD * .2, MID + side * H * .16, HEAD * .06, H * .02, r, .3, 7);
        }
        if (!T.web && !T.pin && !T.solid) { x.fillStyle = css(P.rim || P.blotch, .7); blob(x, HEAD * .85, MID, HEAD * .1, H * .045, r); }
      }
      x.fillStyle = css(P.belly); x.fillRect(0, 0, HW, MID - H * .26); x.fillRect(0, MID + H * .26, HW, H);
      if (T.faceDots) { x.fillStyle = css(P.key, .8); for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(r() * HEAD * .7, MID + (r() - .5) * H * .4, 2.5 + r() * 2, 0, 7); x.fill(); } }
      if (T.solid) { x.fillStyle = css(T.solidCol, T.solid * .85); x.fillRect(0, MID - H * .27, HW, H * .54); }
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-in';
      const g = x.createLinearGradient(HEAD * .8 * SC, 0, HW * SC, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, hcv.width, hcv.height);
      }
      body.save(); body.setTransform(1, 0, 0, 1, 0, 0); body.drawImage(hcv, 0, 0); body.restore();
    }
    {
      // mouth line, heat pits along the upper lip, nostrils
      const line = mix(P.belly, [20, 16, 14], .55);
      x.strokeStyle = css(line, .8); x.lineWidth = 1.6;
      x.save(); x.strokeStyle = css(line, .35); x.lineWidth = 1;
      x.strokeStyle = css(line, .16); for (const side of [-1, 1]) for (let k = 0; k < 14; k++) { const lx = HEAD * (.04 + k * .065); x.beginPath(); x.moveTo(lx, MID + side * H * .262); x.lineTo(lx + 1, MID + side * H * .3); x.stroke(); }
      x.restore();
      for (const side of [-1, 1]) {
        x.beginPath(); x.moveTo(0, MID + side * H * .29); x.quadraticCurveTo(HEAD * .6, MID + side * H * .275, HEAD * .98, MID + side * H * .255); x.stroke();
        x.fillStyle = css(line, .75);
        for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(HEAD * (.1 + k * .13), MID + side * H * .265, 2.2, 1.4, 0, 0, 7); x.fill(); }
        x.fillStyle = css([18, 14, 12], .85); x.beginPath(); x.ellipse(HEAD * .045, MID + side * H * .07, 2.4, 3, 0, 0, 7); x.fill();
      }
    }

    // pied: per column, a coloured band around the back of varying width; everything outside it is white
    if (T.pied && !T.leu) {
      const img = x.getImageData(0, 0, W * SC, H * SC), d = img.data, WW = W * SC, HH = H * SC;
      const ph1 = r() * 6.3, ph2 = r() * 6.3, ph3 = r() * 6.3, f1 = 7 + r() * 5;
      const white = [248, 245, 239], want = .18 + r() * .32; // share of the body that keeps colour, varies a lot between animals
      const bandAt = (s, amt) => {
        let band = (.5 + .5 * (.5 * Math.sin(s * f1 + ph1) + .32 * Math.sin(s * 23 + ph2) + .18 * Math.sin(s * 53 + ph3)) - amt) * .9;
        if (s < .07 * hs) band = Math.max(band, .27);                         // head stays coloured
        else if (s < .13 * hs) band = Math.max(band, .27 * (1 - (s - .07 * hs) / (.06 * hs)));
        if (s > .8) band -= (s - .8) * 2;                                     // tails are usually white
        return Math.min(.38, band);
      };
      let lo = 0, hi = 1;
      for (let it = 0; it < 18; it++) { const amt = (lo + hi) / 2; let cov = 0; for (let q = 0; q < 200; q++) cov += Math.max(0, bandAt(q / 200, amt)) / .5; (cov / 200 > want) ? lo = amt : hi = amt; }
      const amt = lo;
      for (let X = 0; X < WW; X++) {
        const band = bandAt(X / WW, amt), lx = X / SC;
        for (let Y = 0; Y < HH; Y++) {
          const ly = Y / SC, dv = Math.abs(ly / H - .5), e = .022 * Math.sin(ly * .23 + lx * .061) + .015 * Math.sin(lx * .17 - ly * .11);
          if (dv > band + e) { const i = (Y * WW + X) * 4; d[i] = white[0]; d[i + 1] = white[1]; d[i + 2] = white[2]; }
        }
      }
      x.putImageData(img, 0, 0);
    }
    // scale relief: darker scale edges and belly plates, the same lattice the bump map uses
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'multiply'; x.globalAlpha = .32; x.drawImage(scaleCanvas(), 0, 0); x.restore();
    return c;
  }

  /* Scale lattice in skin coordinates: small overlapping dorsal scales, wide plates on the belly.
     Used twice: multiplied into the colour (edges darken) and as the bump map (scales stand out). */
  let scaleCv = null;
  function scaleCanvas() {
    if (scaleCv) return scaleCv;
    const c = document.createElement('canvas'); c.width = W * SC; c.height = H * SC; const x = c.getContext('2d');
    x.setTransform(SC, 0, 0, SC, 0, 0);
    x.fillStyle = '#8c8c8c'; x.fillRect(0, 0, W, H);
    const cw = 9.5, ch = 5.4, belly = H * .1;
    for (let row = 0; row * ch / 2 < H + ch; row++) {
      const cy = row * ch / 2; if (cy < belly - 2 || cy > H - belly + 2) continue;
      for (let cx = (row % 2) * cw / 2; cx < W + cw; cx += cw) {
        const g = x.createRadialGradient(cx - cw * .12, cy - ch * .08, .3, cx, cy, cw * .55);
        g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#ededed'); g.addColorStop(1, '#9a9a9a');
        x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, cw * .56, ch * .62, 0, 0, 7); x.fill();
      }
    }
    for (const [y0, y1] of [[0, belly], [H - belly, H]]) {
      for (let px = 0; px < W; px += 10) {
        const g = x.createLinearGradient(px, 0, px + 10, 0); g.addColorStop(0, '#a0a0a0'); g.addColorStop(.25, '#f4f4f4'); g.addColorStop(1, '#d8d8d8');
        x.fillStyle = g; x.fillRect(px, y0, 10, y1 - y0);
      }
    }
    return (scaleCv = c);
  }

  /* ---------- body shape ---------- */
  const NR = 200, MR = 32;
  /* [s along the body, half-width, half-height, top flatness] as fractions of the body radius.
     Ball python head: rounded snout, widest at the jaw angle, then a clearly narrower neck. */
  const PROF = [
    [0, .1, .085, 2.2], [.003, .2, .16, 2.3], [.009, .28, .22, 2.4], [.017, .34, .265, 2.5], [.027, .41, .295, 2.5], [.037, .47, .315, 2.4],
    [.045, .5, .325, 2.3], [.053, .44, .33, 2.2], [.061, .39, .345, 2.1], [.078, .43, .41, 2], [.1, .54, .52, 2], [.18, .8, .77, 2],
    [.3, .96, .93, 2], [.45, 1, .96, 2], [.62, .97, .94, 2], [.78, .8, .78, 2], [.86, .56, .55, 2], [.93, .28, .28, 2], [1, .03, .03, 2]];
  // hatchlings have proportionally bigger heads
  function profFor(hs) { const k = Math.pow(hs, 1.4); return PROF.map(([s, w, h, n]) => s < .07 ? [s * hs, w * k, h * k, n] : [s, w, h, n]); }
  function prof(pr, s) {
    let i = 1; while (i < pr.length - 1 && pr[i][0] < s) i++;
    const a = pr[i - 1], b = pr[i], k = Math.max(0, Math.min(1, (s - a[0]) / (b[0] - a[0] || 1))), e = (1 - Math.cos(Math.PI * k)) / 2;
    return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, a[3] + (b[3] - a[3]) * e];
  }
  /* point on a ring's cross-section: superellipse, flatter on top for the head and flat on the belly */
  function section(th, n) {
    const c = Math.cos(th), sn = Math.sin(th), m = sn < 0 ? 2.8 : n, f = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), 2 / e);
    return [f(c, m), f(sn, m) * (sn < 0 ? .8 : 1)];
  }
  const SI = Array.from({ length: NR + 1 }, (_, i) => { const u = i / NR; return u * (.45 + .55 * u); }); // denser rings at the head

  /* polyline helpers */
  function cumLen(p) { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2])); return c; }
  function at(p, c, d) {
    let lo = 0, hi = c.length - 1; d = Math.max(0, Math.min(c[hi], d));
    while (hi - lo > 1) { const m = (lo + hi) >> 1; c[m] <= d ? lo = m : hi = m; }
    const k = (d - c[lo]) / ((c[hi] - c[lo]) || 1), a = p[lo], b = p[hi];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }

  /* Poses return NR+1 spine points [x, lift, z], snout first. */
  // turn the head a little to the side, as if looking around
  function lookAround(sp, rm, amt) {
    for (let i = 0; i <= NR && SI[i] < .1; i++) {
      const a = sp[i], b = sp[Math.min(i + 1, NR)], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, k = amt * rm * Math.pow(1 - SI[i] / .1, 2);
      a[0] += -dz / l * k; a[2] += dx / l * k;
    }
    return sp;
  }
  // Move: a slow, mostly straight crawl (ball pythons creep rather than whip from side to side).
  function poseMove(len, rm, t) {
    const R = len * .34, wig = len * .022, pts = [];
    for (let i = 0; i <= 900; i++) { const a = -i / 900 * Math.PI * 2, rr = R * (1 + .12 * Math.sin(2 * a + .7)) + wig * Math.sin(6 * a); pts.push([rr * Math.cos(a), 0, rr * Math.sin(a)]); }
    const c = cumLen(pts), tot = c[c.length - 1], head = (t * .03 * len) % tot; // about 3–4 cm a second for an adult
    const sp = SI.map(s => {
      let d = head - s * len + len * .0035 * Math.sin(s * 95 - t * 2.2); // belly ripple of rectilinear creeping
      d = ((d % tot) + tot) % tot;
      const p = at(pts, c, d);
      return [p[0], s < .09 ? rm * (.55 + .2 * Math.sin(t * .7)) * Math.pow(1 - s / .09, 2) : 0, p[2]];
    });
    return lookAround(sp, rm, .5 * Math.sin(t * .45));
  }
  // Stay: a loose resting coil, head on top; it lifts its head now and then.
  function poseStay(len, rm, t) {
    const gap = rm * 2.05, rin = rm * 1.6, pts = [];
    let th = 0, r0 = rin, d = 0, prev = [rin, 0, 0];
    pts.push(prev);
    while (d < len * .86) { th += .03; r0 = rin + gap * th / (Math.PI * 2); const p = [r0 * Math.cos(th), 0, r0 * Math.sin(th)]; d += Math.hypot(p[0] - prev[0], p[2] - prev[2]); pts.push(p); prev = p; }
    const th0 = th, rout = r0;
    for (let k = 1; k <= 80; k++) { const u = k / 80, a = th0 + u * 1.5, rr = rout * (1 - .6 * u), y = rm * 1.75 * Math.min(1, u / .3); pts.push([rr * Math.cos(a), y, rr * Math.sin(a)]); }
    const br = 1 + .01 * Math.sin(t * 1.1), p2 = pts.map(([x, y, z]) => [x * br, y, z * br]);
    const c = cumLen(p2), tot = c[c.length - 1], raise = rm * .9 * Math.pow(Math.max(0, Math.sin(t * .21)), 6);
    const sp = SI.map(s => { const p = at(p2, c, tot - s * len); if (s < .07) p[1] += (rm * .15 + raise) * Math.pow(1 - s / .07, 2); return p; });
    return lookAround(sp, rm, .35 * Math.sin(t * .3));
  }
  // Ball up: coils stacked into a mound with the head tucked inside, the classic defensive ball.
  function poseBall(len, rm, t) {
    // coils wind upward and tilt, so the stack bulges into a rounded ball rather than a flat ring
    const turns = 2.35, rise = rm * 1.6, helix = (R0, n = 320) => {
      const p = [];
      for (let i = 0; i <= n; i++) {
        const f = i / n, th = f * turns * Math.PI * 2, R = R0 * (1 - .3 * Math.pow(f, 1.3)), tilt = rm * .55 * Math.sin(th * .5 + 1) * Math.min(1, f * 3);
        p.push([R * Math.cos(th), Math.max(0, f * turns * rise + tilt * Math.sin(th)), R * Math.sin(th)]);
      }
      return p;
    };
    let lo = rm, hi = len; // find the coil radius that uses ~86% of the body
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2, c = cumLen(helix(m, 120)); c[c.length - 1] > len * .88 ? hi = m : lo = m; }
    const pts = helix(lo), e = pts[pts.length - 1], th = turns * Math.PI * 2;
    for (let k = 1; k <= 60; k++) { const u = k / 60, a = th + u * 1.3, rr = lo * .7 * (1 - u); pts.push([rr * Math.cos(a), e[1] - u * rise * 1.1, rr * Math.sin(a)]); }
    const br = 1 + .008 * Math.sin(t * 1.2), p2 = pts.map(([x, y, z]) => [x * br, y, z * br]);
    const c = cumLen(p2), tot = c[c.length - 1];
    return SI.map(s => at(p2, c, tot - s * len));
  }
  function poseLine(len, rm, t) {
    const pts = [];
    for (let i = 0; i <= 400; i++) { const q = i / 400 * 1.1; pts.push([q * len, 0, len * .018 * Math.sin(q * Math.PI * 2.4 - t * .8) * Math.min(1, q * 4)]); }
    const c = cumLen(pts);
    return lookAround(SI.map(s => { const p = at(pts, c, s * len); if (s < .08) p[1] = rm * .5 * Math.pow(1 - s / .08, 2); return p; }), rm, .4 * Math.sin(t * .4));
  }
  const POSES = { move: poseMove, stay: poseStay, ball: poseBall, line: poseLine };

  /* ---------- three.js scene ---------- */
  let THREE = null, loading = null, renderer, scene, camera, hemi, key, ground, grid, ruler, rulerKey = '', bumpTex, raf = 0, last = 0, clock = 0, host = null, ro = null;
  const cam = { yaw: -.5, pitch: .78, zoom: 1, target: [0, 0, 0], dist: 2, cur: null };
  const snakes = [];

  function makeSnake() {
    const ringV = (NR + 1) * (MR + 1), total = ringV + 2;
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(total * 3), uv = new Float32Array(total * 2), idx = [];
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= MR; j++) { const v = i * (MR + 1) + j; uv[v * 2] = SI[i]; uv[v * 2 + 1] = j / MR; }
    uv[ringV * 2] = 0; uv[ringV * 2 + 1] = .5; uv[(ringV + 1) * 2] = 1; uv[(ringV + 1) * 2 + 1] = .5;
    for (let i = 0; i < NR; i++) for (let j = 0; j < MR; j++) { const a = i * (MR + 1) + j, b = a + MR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    for (let j = 0; j < MR; j++) { idx.push(ringV, j, j + 1); const a = NR * (MR + 1) + j; idx.push(ringV + 1, a + 1, a); }
    geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const cv = document.createElement('canvas'); cv.width = W * SC; cv.height = H * SC;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // satin skin: soft clearcoat plus a faint iridescent sheen, scales from the bump map
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, bumpMap: bumpTex, bumpScale: 1.6, roughness: .6, clearcoat: .3, clearcoatRoughness: .3, iridescence: .06, iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 500], sheen: 0, sheenRoughness: .6, sheenColor: 0xffffff });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    const ecv = document.createElement('canvas'); ecv.width = 128; ecv.height = 64;
    const eyeTex = new THREE.CanvasTexture(ecv); eyeTex.colorSpace = THREE.SRGBColorSpace;
    const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTex, roughness: .05, clearcoat: 1, clearcoatRoughness: .02 });
    const eyes = [0, 1].map(() => { const e = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), eyeMat); scene.add(e); return e; });
    const tMat = new THREE.MeshStandardMaterial({ color: 0x2a1e20, roughness: .5 });
    const tongue = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.BoxGeometry(1, .5, .6).translate(0, 0, .3), tMat); tongue.add(stem);
    for (const sd of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(.8, .4, .45).translate(0, 0, .22), tMat); f.position.z = .58; f.rotation.y = sd * .35; tongue.add(f); }
    scene.add(mesh, tongue);
    return { mesh, geo, tex, eyes, eyeMat, eyeTex, tMat, tongue, prev: null, blend: 1, pose: null, len: 0, rmax: 0, hs: 1, profile: null, offset: [0, 0, 0], skinKey: '' };
  }

  /* iris colour with a vertical pupil at +z of the sphere (u = .25) */
  function paintEye(cv, col) {
    const x = cv.getContext('2d'), dark = lum(col) < 60;
    x.fillStyle = css(col); x.fillRect(0, 0, 128, 64);
    const g = x.createRadialGradient(32, 32, 2, 32, 32, 26); g.addColorStop(0, css(mix(col, [255, 255, 255], .12))); g.addColorStop(1, css(mix(col, [0, 0, 0], .35)));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.fillStyle = css(dark ? [4, 3, 3] : mix(col, [0, 0, 0], .75)); x.beginPath(); x.ellipse(32, 32, 3.2, 13, 0, 0, 7); x.fill();
  }

  const V = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const N3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const X3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  function updateSnake(sn, spine, t) {
    const pos = sn.geo.attributes.position.array, rm = sn.rmax, pr = sn.profile, o = sn.offset;
    const centers = [], sides = [], ups = [], tans = [], hw = [];
    for (let i = 0; i <= NR; i++) {
      const T = N3(V(spine[Math.min(i + 1, NR)], spine[Math.max(i - 1, 0)]));
      const side = N3(X3(T, [0, 1, 0])), up = X3(side, T);
      const [w, h, n] = prof(pr, SI[i]), ww = w * rm, hh = h * rm;
      const C = [spine[i][0] + o[0], spine[i][1] + hh * .8 + o[1], spine[i][2] + o[2]];
      centers.push(C); sides.push(side); ups.push(up); tans.push(T); hw.push([ww, hh, n]);
      for (let j = 0; j <= MR; j++) {
        const [sx, sy] = section(j / MR * Math.PI * 2 - Math.PI / 2, n), v = (i * (MR + 1) + j) * 3;
        for (let q = 0; q < 3; q++) pos[v + q] = C[q] + side[q] * sx * ww + up[q] * sy * hh;
      }
    }
    const ringV = (NR + 1) * (MR + 1), T0 = tans[0], c0 = centers[0], cN = centers[NR], TN = tans[NR];
    for (let q = 0; q < 3; q++) { pos[ringV * 3 + q] = c0[q] - T0[q] * hw[0][0] * .35 - (q === 1 ? hw[0][1] * .15 : 0); pos[(ringV + 1) * 3 + q] = cN[q] + TN[q] * rm * .05; }
    sn.geo.attributes.position.needsUpdate = true; sn.geo.computeVertexNormals();

    // eyes
    const se = .019 * sn.hs; let ie = 0; while (ie < NR && SI[ie] < se) ie++;
    const [ew, eh, en] = hw[ie], er = rm * .105 * Math.pow(sn.hs, 1.3), [ex, ey] = section(.45, en);
    sn.headPos = centers[ie];
    sn.eyes.forEach((e, k) => {
      const sd = k ? 1 : -1, C = centers[ie], s = sides[ie], u = ups[ie], p = [0, 0, 0];
      for (let q = 0; q < 3; q++) p[q] = C[q] + s[q] * sd * (ex * ew - er * .62) + u[q] * ey * eh;
      e.position.set(p[0], p[1], p[2]); e.scale.set(er, er, er);
      e.lookAt(p[0] + s[0] * sd + tans[ie][0] * -.35, p[1] + s[1] * sd + .15, p[2] + s[2] * sd + tans[ie][2] * -.35);
    });
    // tongue flicks for half a second every few seconds
    const every = sn.pose === 'stay' ? 6.5 : 4.2, cyc = (t + sn.offset[2] * 3) % every;
    const ext = sn.pose === 'ball' ? 0 : cyc < .7 ? Math.sin(cyc / .7 * Math.PI) : 0;
    sn.tongue.visible = ext > .02;
    if (sn.tongue.visible) {
      const tip = [c0[0] - T0[0] * hw[0][0] * .5, c0[1] - hw[0][1] * .45, c0[2] - T0[2] * hw[0][0] * .5];
      sn.tongue.position.set(tip[0], tip[1], tip[2]);
      sn.tongue.lookAt(tip[0] - T0[0], tip[1] - T0[1] - .25, tip[2] - T0[2]);
      sn.tongue.scale.set(rm * .05, rm * .05, rm * .75 * ext);
      sn.tongue.children[1].rotation.y = -.35 - .25 * Math.sin(t * 24); sn.tongue.children[2].rotation.y = .35 + .25 * Math.sin(t * 24);
    }
    return centers[0];
  }

  function themeColors() {
    const light = document.documentElement.dataset.theme === 'light';
    return light ? { bg: 0xf2f0ec, ground: 0xe6e1d9, line: 0xc9c1b4, ink: '#3a342d', tick: '#8b8278' } : { bg: 0x0e0d0c, ground: 0x12110f, line: 0x34302b, ink: '#d9d3c8', tick: '#7d766c' };
  }
  function applyTheme() {
    if (!scene) return;
    const c = themeColors(); scene.background = new THREE.Color(c.bg); ground.material.color.set(c.ground);
    rulerKey = ''; layout();
  }

  function makeRuler(lenM) {
    const c = themeColors(), cv = document.createElement('canvas'), px = 2800, ph = 130;
    cv.width = px; cv.height = ph; const x = cv.getContext('2d'), ppc = px / (lenM * 100);
    x.fillStyle = c.tick; x.fillRect(0, 0, px, 3);
    for (let cm = 0; cm <= lenM * 100; cm++) {
      const X = Math.min(px - 2, cm * ppc), big = cm % 10 === 0, mid = cm % 5 === 0;
      x.fillRect(X, 0, big ? 3 : 1.5, big ? 40 : mid ? 26 : 14);
      if (big && cm && lenM * 100 - cm >= 5) { x.fillStyle = c.ink; x.font = `600 ${Math.round(Math.min(60, ppc * 3.6))}px Archivo, sans-serif`; x.textAlign = 'center'; x.fillText(cm + ' cm', X, 104); x.fillStyle = c.tick; }
    }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const depth = lenM * ph / px, m = new THREE.Mesh(new THREE.PlaneGeometry(lenM, depth), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.userData.depth = depth;
    return m;
  }

  async function ensureThree() {
    if (THREE) return true;
    if (!loading) loading = import(THREE_URL).then(m => { THREE = m; return true; }).catch(() => false);
    const ok = await loading;
    if (!ok) loading = null;
    return ok;
  }

  function initScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1.6, .01, 60);
    // soft studio reflections: a small room of light panels baked into an environment map
    const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x3a3632, side: THREE.BackSide })));
    for (const [px, py, pz, w, h, k] of [[0, 3.9, 0, 6, 6, 5], [-5.9, 1.5, 1, 3, 3, 2.2], [5.9, 1, -2, 2, 4, 1.4], [0, 1.2, -5.9, 5, 2, 1.2]]) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * .97, k * .92), side: THREE.DoubleSide }));
      panel.position.set(px, py, pz); panel.lookAt(0, 0, 0); env.add(panel);
    }
    scene.environment = pm.fromScene(env, .04).texture; scene.environmentIntensity = .38; pm.dispose();
    hemi = new THREE.HemisphereLight(0xfff3e2, 0x3b322a, .8); scene.add(hemi);
    key = new THREE.DirectionalLight(0xfff6ea, 2); key.position.set(1.2, 3, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .01; key.shadow.radius = 6; scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 1.1); rim.position.set(-2, 1.4, -2.5); scene.add(rim);
    ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: .95, envMapIntensity: .15 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    bumpTex = new THREE.CanvasTexture(scaleCanvas()); bumpTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    for (let i = 0; i < 3; i++) snakes.push(makeSnake());
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    applyTheme();
  }

  /* Decide what each snake shows (stage, pose, place) and where the camera and ruler go. */
  function layout() {
    if (!scene) return;
    const cmp = S.compare, c = themeColors();
    snakes.forEach((sn, k) => {
      const show = cmp || k === 0, st = STAGES[cmp ? ORDER[k] : S.stage];
      sn.mesh.visible = show; sn.eyes.forEach(e => (e.visible = show)); if (!show) sn.tongue.visible = false;
      sn.active = show;
      if (!show) return;
      sn.target = { len: st.len, rmax: st.len / st.girth, hs: st.head };
      if (sn.len === 0) Object.assign(sn, sn.target);
      const pose = cmp ? 'line' : S.pose;
      if (sn.pose !== pose) { sn.prev = sn.lastSpine || null; sn.blend = sn.prev ? 0 : 1; sn.pose = pose; }
      sn.offset = cmp ? [0, 0, [.3, 0, -.3][k]] : [0, 0, 0];
      const stageKey = cmp ? ORDER[k] : S.stage, skinKey = JSON.stringify([S.genes, S.seed, stageKey, L()]);
      if (sn.skinKey !== skinKey) {
        const ph = phenotype(S.genes, stageKey);
        paint(ph, S.seed, st.head, sn.tex.image); sn.tex.needsUpdate = true; sn.skinKey = skinKey;
        paintEye(sn.eyeTex.image, ph.P.eye); sn.eyeTex.needsUpdate = true;
        sn.tMat.color.setRGB(...ph.P.tongue.map(v => Math.pow(v / 255, 2.2)));
      }
    });
    // ruler + grid + camera
    const big = cmp ? 1.5 : Math.ceil(STAGES[S.stage].len * 10 + 1) / 10;
    const rk = big + '|' + cmp + '|' + c.bg;
    if (rk !== rulerKey) {
      if (ruler) { scene.remove(ruler); ruler.material.map.dispose(); ruler.material.dispose(); ruler.geometry.dispose(); }
      if (grid) { scene.remove(grid); grid.dispose?.(); }
      ruler = makeRuler(big); scene.add(ruler); rulerKey = rk;
      const gs = Math.ceil(big * 2.2 * 10) / 10 * (cmp ? 1.4 : 1);
      grid = new THREE.GridHelper(gs, Math.round(gs * 10), c.line, c.line); grid.material.transparent = true; grid.material.opacity = .45; grid.position.y = .0005; scene.add(grid);
    }
    const st = STAGES[S.stage];
    if (cmp) { ruler.position.set(.75, .002, .48); cam.target = [.75, 0, .1]; cam.fit = .82; grid.position.x = .75; }
    else {
      const ext = { move: st.len * .4, stay: st.len * .2, ball: st.len * .17 }[S.pose];
      ruler.position.set(0, .002, ext + st.len / st.girth + .03 + ruler.userData.depth / 2); cam.target = S.pose === 'ball' ? [0, st.len / st.girth * 2.2, 0] : S.pose === 'stay' ? [0, 0, 0] : [0, 0, .1 * st.len]; cam.fit = ext * .95 + .04; grid.position.x = 0;
    }
    key.shadow.camera.left = key.shadow.camera.bottom = -(cmp ? 1.2 : st.len); key.shadow.camera.right = key.shadow.camera.top = cmp ? 1.2 : st.len;
    key.position.set(cam.target[0] + 1.2, 3, cam.target[2] + 1.6); key.target.position.set(...cam.target); key.shadow.camera.updateProjectionMatrix();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (S.playing) clock += dt;
    if (!host || !renderer) return;
    // camera: ease toward the framed position
    const aspect = camera.aspect, vf = camera.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
    const hc = S.headCam && !S.compare && snakes[0]?.headPos, sn0 = snakes[0];
    const want = (hc ? sn0.rmax * Math.pow(sn0.hs, 1.4) * 1.5 : cam.fit) / Math.tan(Math.min(vf, hf) / 2) * cam.zoom, tgt = hc ? sn0.headPos : cam.target;
    if (!cam.cur) cam.cur = { d: want, t: cam.target.slice() };
    const e = 1 - Math.pow(.002, dt);
    cam.cur.d += (want - cam.cur.d) * e; for (let q = 0; q < 3; q++) cam.cur.t[q] += (tgt[q] - cam.cur.t[q]) * e;
    const d = cam.cur.d, tg = cam.cur.t;
    camera.position.set(tg[0] + d * Math.cos(cam.pitch) * Math.sin(cam.yaw), tg[1] + d * Math.sin(cam.pitch), tg[2] + d * Math.cos(cam.pitch) * Math.cos(cam.yaw));
    camera.lookAt(tg[0], tg[1], tg[2]);

    snakes.forEach((sn, k) => {
      if (!sn.active) return;
      for (const p of ['len', 'rmax', 'hs']) sn[p] += (sn.target[p] - sn[p]) * Math.min(1, dt * 3.2);
      sn.profile = profFor(sn.hs);
      let sp = POSES[sn.pose](sn.len, sn.rmax, clock + k * 1.3);
      if (sn.blend < 1 && sn.prev) {
        sn.blend = Math.min(1, sn.blend + dt * .55); const b = sn.blend * sn.blend * (3 - 2 * sn.blend);
        sp = sp.map((p, i) => [sn.prev[i][0] + (p[0] - sn.prev[i][0]) * b, sn.prev[i][1] + (p[1] - sn.prev[i][1]) * b, sn.prev[i][2] + (p[2] - sn.prev[i][2]) * b]);
      }
      sn.lastSpine = sp;
      const head = updateSnake(sn, sp, clock);
      const lab = host.querySelector(`[data-lab="${k}"]`);
      if (lab) {
        if (S.compare) { const v = new THREE.Vector3(head[0], head[1] + sn.rmax * 2.5, head[2]).project(camera); lab.style.transform = `translate(${(v.x * .5 + .5) * host.clientWidth}px, ${(-v.y * .5 + .5) * host.clientHeight}px) translate(-100%, -50%)`; lab.hidden = false; }
        else lab.hidden = true;
      }
    });
    renderer.render(scene, camera);
  }

  function resize() {
    if (!host || !renderer) return;
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
  }

  function bindOrbit(el) {
    const ptrs = new Map(); let pinch = 0;
    el.addEventListener('pointerdown', (e) => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const [px, py] = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], dd = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) cam.zoom = Math.max(.35, Math.min(2.5, cam.zoom * pinch / dd)); pinch = dd; return; }
      cam.yaw -= (e.clientX - px) * .008;
      if (e.pointerType === 'mouse') cam.pitch = Math.max(.12, Math.min(1.45, cam.pitch + (e.clientY - py) * .006));
    });
    const up = (e) => { ptrs.delete(e.pointerId); pinch = 0; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    // wheel zooms only with ctrl/⌘ (and trackpad pinch), so scrolling the page still works
    el.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); cam.zoom = Math.max(.35, Math.min(2.5, cam.zoom * Math.exp(e.deltaY * .002))); }, { passive: false });
    el.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: () => (cam.yaw += .15), ArrowRight: () => (cam.yaw -= .15), ArrowUp: () => (cam.pitch = Math.min(1.45, cam.pitch + .1)), ArrowDown: () => (cam.pitch = Math.max(.12, cam.pitch - .1)), '+': () => (cam.zoom = Math.max(.35, cam.zoom * .85)), '-': () => (cam.zoom = Math.min(2.5, cam.zoom / .85)) }[e.key];
      if (k) { e.preventDefault(); k(); }
    });
  }

  /* ---------- page ---------- */
  let root = null, whatsapp = '';

  function chip(id) {
    const [, name, type] = GENE[id], n = S.genes[id] || 0;
    const label = n === 2 ? `${tx('superW')} ${name}` : name;
    return `<button type="button" class="an-chip an-${type}${n ? ' is-on' : ''}${n === 2 ? ' is-super' : ''}" data-an-gene="${id}" aria-pressed="${!!n}">${esc(label)}${type === 'inc' ? `<span class="an-dots" aria-hidden="true"><i></i><i></i></span>` : ''}</button>`;
  }

  function html() {
    const st = (k) => STAGES[k][L()][0];
    return `
<div class="anim wrap">
  <header class="r-head">
    <h1>${tx('h')}</h1>
    <p class="r-lede">${tx('lede')}</p>
  </header>
  <div class="an-grid">
    <div class="an-stage-col">
      <div class="an-viewer" id="an-viewer" tabindex="0" role="img" aria-label="${tx('canvas')}">
        <p class="an-msg" id="an-msg">${tx('loading')}</p>
        <p class="an-vname" id="an-vname" aria-hidden="true"></p>
        ${ORDER.map((k, i) => `<span class="an-lab" data-lab="${i}" hidden>${esc(st(k))}</span>`).join('')}
        <button type="button" class="btn btn-ghost btn-sm an-headcam" data-headcam aria-pressed="false">${tx('headcam')}</button>
        <div class="an-zoom">
          <button type="button" class="icon-btn" data-zoom="in" aria-label="${tx('zoomIn')}">+</button>
          <button type="button" class="icon-btn" data-zoom="out" aria-label="${tx('zoomOut')}">−</button>
        </div>
      </div>
      <div class="an-controls">
        <div class="seg" role="group" aria-label="${tx('stage')}">
          ${ORDER.map(k => `<button type="button" data-stage="${k}">${esc(st(k))}</button>`).join('')}
          <button type="button" data-stage="compare">${tx('compare')}</button>
        </div>
        <div class="seg" role="group" aria-label="${tx('pose')}" id="an-pose">
          <button type="button" data-pose="move">${tx('move')}</button>
          <button type="button" data-pose="stay">${tx('stay')}</button>
          <button type="button" data-pose="ball">${tx('ball')}</button>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-play></button>
        <button type="button" class="btn btn-ghost btn-sm" data-reroll title="${tx('rerollTip')}">${tx('reroll')}</button>
      </div>
      <dl class="an-size" id="an-size"></dl>
      <figure class="an-skin">
        <canvas id="an-skin" width="${W}" height="${H}"></canvas>
        <figcaption class="muted small">${tx('skin')}</figcaption>
      </figure>
    </div>
    <aside class="an-panel">
      <p class="an-name" id="an-name" aria-live="polite"></p>
      <div class="an-cta">
        <a class="btn btn-primary btn-sm" id="an-ask" target="_blank" rel="noopener">${tx('ask')}</a>
        <button type="button" class="btn btn-ghost btn-sm" data-copylink>${tx('copy')}</button>
      </div>
      <h2 class="an-h">${tx('presets')}</h2>
      <div class="an-presets">${PRESETS.map(([n], i) => `<button type="button" class="an-preset" data-preset="${i}">${esc(n === 'Normal' ? tx('normal') : n)}</button>`).join('')}</div>
      <div class="an-h-row"><h2 class="an-h">${tx('genes')}</h2><button type="button" class="linkish" data-clear>${tx('clear')}</button></div>
      <div id="an-genes"></div>
      <h2 class="an-h">${tx('what')}</h2>
      <ul class="an-notes" id="an-notes"></ul>
      <p class="r-note">${tx('note')}</p>
    </aside>
  </div>
</div>`;
  }

  function renderGenes() {
    const grp = (type) => `<fieldset class="an-group"><legend>${tx(type)} <span class="muted small">${tx(type + 'Tip')}</span></legend>
      <div class="an-chips">${GENES.filter(g => g[2] === type).map(g => chip(g[0])).join('')}</div></fieldset>`;
    $('#an-genes', root).innerHTML = grp('rec') + grp('inc') + grp('dom');
  }

  function renderInfo() {
    const name = comboName(S.genes);
    $('#an-name', root).textContent = name; $('#an-vname', root).textContent = name;
    $('#an-ask', root).href = `https://wa.me/${String(whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(tx('wa').replace('{x}', name))}`;
    const ids = Object.keys(S.genes), lang = L();
    const notes = ids.map(id => { const g = GENE[id]; return `<li><b>${esc((S.genes[id] === 2 ? 'Super ' : '') + g[1])}</b> ${esc(lang === 'id' ? g[4] : g[3])}</li>`; });
    const bel = (S.genes.mojave || 0) + (S.genes.lesser || 0);
    if (S.genes.pied && (bel === 2 || S.genes.fire === 2)) notes.push(`<li class="an-warn">${tx('n_bel_pied')}</li>`);
    if (!ids.some(id => GENE[id][2] === 'rec')) notes.push(`<li class="muted">${tx('n_het')}</li>`);
    if (!ids.length) notes.unshift(`<li><b>${tx('normal')}</b> ${lang === 'id' ? 'Tanpa mutasi: cokelat gelap dengan bercak cokelat keemasan dan motif "alien head".' : 'No mutation: dark brown with golden-brown blotches and "alien head" marks.'}</li>`);
    $('#an-notes', root).innerHTML = notes.join('');
    const sz = (k) => STAGES[k][lang];
    $('#an-size', root).innerHTML = S.compare
      ? `<p class="muted small an-size-cap">${tx('sizeAll')}</p>` + ORDER.map(k => `<div><dt>${esc(sz(k)[0])} <span class="muted">· ${esc(sz(k)[1])}</span></dt><dd>${esc(sz(k)[2])} · ${esc(sz(k)[3])}</dd></div>`).join('')
      : `<div><dt>${tx('age')}</dt><dd>${esc(sz(S.stage)[1])}</dd></div><div><dt>${tx('len')}</dt><dd>${esc(sz(S.stage)[2])}</dd></div><div><dt>${tx('wt')}</dt><dd>${esc(sz(S.stage)[3])}</dd></div>`;
    root.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', S.compare ? b.dataset.stage === 'compare' : b.dataset.stage === S.stage));
    root.querySelectorAll('[data-pose]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.pose === S.pose); b.disabled = S.compare; });
    const hb = $('[data-headcam]', root); hb.setAttribute('aria-pressed', !!S.headCam && !S.compare); hb.hidden = S.compare;
    const pb = $('[data-play]', root); pb.textContent = S.playing ? tx('play') : tx('resume'); pb.setAttribute('aria-pressed', !S.playing);
    // flat skin preview (also the fallback when WebGL is unavailable)
    const ph = phenotype(S.genes, S.compare ? 'adult' : S.stage), sk = $('#an-skin', root);
    const tmp = paint(ph, S.seed, STAGES[S.compare ? 'adult' : S.stage].head);
    sk.getContext('2d').drawImage(tmp, 0, 0, W, H);
  }

  function update({ genes = true } = {}) {
    if (genes) { renderGenes(); history.replaceState(null, '', '#/animation' + (toHash() ? '/' + toHash() : '')); }
    renderInfo(); layout();
  }

  function toggleGene(id) {
    const type = GENE[id][2], n = S.genes[id] || 0;
    let next = type === 'inc' ? (n + 1) % 3 : n ? 0 : 1;
    const group = BEL.includes(id) ? BEL : BPC.includes(id) ? BPC : null;
    if (group && next) { // Mojave/Lesser and Cinnamon/Black Pastel share a locus: two copies at most between them
      const other = group.find(x => x !== id), left = 2 - next;
      if ((S.genes[other] || 0) > left) left ? (S.genes[other] = left) : delete S.genes[other];
    }
    next ? (S.genes[id] = next) : delete S.genes[id];
    update();
  }

  function onClick(e) {
    const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.dataset.anGene) return toggleGene(b.dataset.anGene);
    if (b.dataset.preset) { S.genes = { ...PRESETS[+b.dataset.preset][1] }; return update(); }
    if ('clear' in b.dataset) { S.genes = {}; return update(); }
    if (b.dataset.stage) { const was = S.compare; if (b.dataset.stage === 'compare') S.compare = true; else { S.compare = false; S.stage = b.dataset.stage; } cam.zoom = 1; if (was !== S.compare) Object.assign(cam, S.compare ? { yaw: 0, pitch: 1.05 } : { yaw: -.5, pitch: .78 }); return update({ genes: false }); }
    if (b.dataset.pose) { S.pose = b.dataset.pose; return update({ genes: false }); }
    if ('play' in b.dataset) { S.playing = !S.playing; return renderInfo(); }
    if ('reroll' in b.dataset) { S.seed = (S.seed * 48271 + 11) % 2147483647; return update({ genes: false }); }
    if ('headcam' in b.dataset) { S.headCam = !S.headCam; cam.zoom = 1; if (S.headCam) Object.assign(cam, { pitch: .32 }); return renderInfo(); }
    if (b.dataset.zoom) { cam.zoom = Math.max(.35, Math.min(2.5, cam.zoom * (b.dataset.zoom === 'in' ? .8 : 1.25))); return; }
    if ('copylink' in b.dataset) { b.dataset.copy = location.href; b.dataset.copyLabel = 'link'; }
  }

  async function build(el, wa, arg) {
    root = el; whatsapp = wa;
    if (arg) S.genes = fromHash(arg);
    else if (toHash()) history.replaceState(null, '', '#/animation/' + toHash());
    el.innerHTML = html();
    if (!el.dataset.bound) { el.addEventListener('click', onClick); el.dataset.bound = '1'; }
    renderGenes(); renderInfo();
    const viewer = $('#an-viewer', el);
    const ok = await ensureThree();
    if (root !== el || !el.isConnected || el.hidden) return;
    if (!ok || !(() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })()) { $('#an-msg', el).textContent = tx('nogl'); return; }
    try { if (!renderer) { initScene(); bindOrbit(renderer.domElement); } } catch { $('#an-msg', el).textContent = tx('nogl'); return; }
    $('#an-msg', el).remove();
    viewer.prepend(renderer.domElement); host = viewer;
    ro?.disconnect(); ro = new ResizeObserver(resize); ro.observe(viewer); resize();
    snakes.forEach(s => (s.skinKey = '')); layout();
    if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; host = null; ro?.disconnect(); }

  return { build, stop, phenotype, comboName, paint, GENES };
})();

// app.js routes before this file loads; handle a direct visit to #/animation.
if (/^#\/animation/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
