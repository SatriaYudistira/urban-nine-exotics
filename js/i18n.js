/* Two languages: English and Bahasa Indonesia.
   - UI strings live in DICT; t('key', {vars}) returns the current language.
   - Static HTML uses data-i18n="key" (text) and data-i18n-attr="attr:key;attr:key".
   - Owner-written content (tagline, about, notes…) has optional Bahasa twins with an "Id" suffix;
     loc(obj, 'notes') returns notesId in Bahasa when it's filled in, otherwise the English text.
   Default: the visitor's saved choice, else Bahasa for Indonesian browsers, else English. */
window.UNEi18n = (() => {
  const DICT = {
    en: {
      'skip': 'Skip to animals',
      'theme': 'Switch colour theme',
      'lang.switch': 'Baca dalam Bahasa Indonesia',
      'nav.available': 'Available', 'nav.collection': 'Collection', 'nav.projects': 'Projects',
      'nav.research': 'Research', 'nav.about': 'About', 'nav.contact': 'Contact',
      'tab.available': 'Available', 'tab.collection': 'Collection', 'tab.sold': 'Sold', 'tabs': 'Animal lists',
      'search.label': 'Search by gene or ID', 'search.ph': 'Search genes, e.g. clown, het pied',
      'sex': 'Sex', 'sex.all': 'All', 'sex.F': 'Female', 'sex.M': 'Male', 'sex.U': 'Unsexed',
      'year.label': 'Hatch year', 'year.any': 'Any hatch year', 'year.opt': '{y} hatch',
      'sort.label': 'Sort', 'sort.featured': 'Featured first', 'sort.newest': 'Newest hatch',
      'sort.price-asc': 'Price, low to high', 'sort.price-desc': 'Price, high to low',
      'facets': 'Filter by gene', 'clear': 'Clear', 'clear.filters': 'Clear filters',
      'count.one': '1 animal', 'count.many': '{n} animals',
      'empty': 'No animals match these filters.',
      'hero.sub': '{n} available now. Every listing shows real genetics, weight and feeding.',
      'hero.sub.one': '1 animal available now. Every listing shows real genetics, weight and feeding.',
      'hero.none': 'Nothing is available right now. Follow us for the next clutch.',
      'hero.cta': 'See available animals', 'hero.how': 'How to buy',
      'hero.featured': 'Featured', 'hero.latest': 'Latest', 'hero.aria': 'Featured animal',
      'sb.aria': 'About the breeder', 'sb.based': 'Based in', 'sb.since': 'Breeding since',
      'sb.available': 'Available', 'sb.breeders': 'Breeders', 'sb.genes': 'Genes in the collection',
      'pill.breeder': 'Breeder', 'pill.holdback': 'Holdback', 'pill.hold': 'On hold', 'pill.sold': 'Sold',
      'pill.featured': 'Featured', 'pill.new': 'New', 'pill.proven': 'Proven',
      'price.nfs': 'Not for sale', 'price.ask': 'Ask for price',
      'photos.n': '{n} photos', 'photo.n': 'Photo {n}', 'close': 'Close',
      'detail.placeholder': 'Photos coming soon. The pattern shown is a placeholder.',
      'detail.genetics': 'Genetics', 'f.sex': 'Sex', 'f.hatched': 'Hatched', 'f.breeding': 'Breeding',
      'f.weight': 'Weight', 'f.feeding': 'Feeding', 'f.origin': 'Origin', 'origin': 'Captive bred by Urban Nine',
      'br.proven': 'Proven breeder', 'br.holdback': 'Holdback, not yet bred', 'br.unproven': 'Not yet proven',
      'wa.ask': "Hi Urban Nine, I'm interested in {id} ({genes}). Is it still available?",
      'wa.similar': 'Hi Urban Nine, I saw {id} on your site. Will you have anything similar?',
      'wa.general': 'Hi Urban Nine, I have a question about my ball python.',
      'btn.ask': 'Ask about {id} on WhatsApp', 'btn.similar': 'Ask about similar animals',
      'btn.copylink': 'Copy link', 'copy.linkto': 'link to {id}',
      'detail.other': 'Prefer Instagram or email?', 'detail.contacts': 'See all contacts',
      'related': 'Similar animals available',
      'copied': 'Copied {x}', 'copy.blocked': 'Copy is blocked here. Select the text instead.',
      'about.h': 'About Urban Nine', 'how.h': 'How to buy',
      'step.reserve': 'Reserve', 'step.ship': 'Ship or pick up', 'step.guarantee': 'Guarantee',
      'copy.x': 'Copy {k}', 'foot.ship': '{loc}. Shipping across Indonesia.',
      'proj.h': '{y} breeding season', 'proj.h0': 'Breeding season',
      'proj.sub': "What we're pairing this season. Ask to be told when a clutch hatches.",
      'ps.planned': 'Planned', 'ps.paired': 'Paired', 'ps.ovulated': 'Ovulated', 'ps.gravid': 'Gravid',
      'ps.laid': 'Eggs laid', 'ps.hatched': 'Hatched', 'paired.with': 'paired with',
      'title.research': 'Ball python care and breeding',
      'alt.about': 'A piebald ball python', 'photo': 'Photo'
    },
    id: {
      'skip': 'Langsung ke daftar hewan',
      'theme': 'Ganti tema warna',
      'lang.switch': 'Read in English',
      'nav.available': 'Tersedia', 'nav.collection': 'Koleksi', 'nav.projects': 'Proyek',
      'nav.research': 'Panduan', 'nav.about': 'Tentang', 'nav.contact': 'Kontak',
      'tab.available': 'Tersedia', 'tab.collection': 'Koleksi', 'tab.sold': 'Terjual', 'tabs': 'Daftar hewan',
      'search.label': 'Cari berdasarkan gen atau ID', 'search.ph': 'Cari gen, misalnya clown, het pied',
      'sex': 'Jenis kelamin', 'sex.all': 'Semua', 'sex.F': 'Betina', 'sex.M': 'Jantan', 'sex.U': 'Belum diketahui',
      'year.label': 'Tahun menetas', 'year.any': 'Semua tahun', 'year.opt': 'Menetas {y}',
      'sort.label': 'Urutkan', 'sort.featured': 'Unggulan dulu', 'sort.newest': 'Menetas terbaru',
      'sort.price-asc': 'Harga terendah', 'sort.price-desc': 'Harga tertinggi',
      'facets': 'Filter berdasarkan gen', 'clear': 'Hapus', 'clear.filters': 'Hapus filter',
      'count.one': '1 ekor', 'count.many': '{n} ekor',
      'empty': 'Belum ada yang cocok dengan filter ini.',
      'hero.sub': '{n} ekor siap adopsi sekarang. Setiap listing mencantumkan genetik asli, berat, dan catatan makan.',
      'hero.sub.one': '1 ekor siap adopsi sekarang. Setiap listing mencantumkan genetik asli, berat, dan catatan makan.',
      'hero.none': 'Saat ini sedang kosong. Follow kami supaya tidak ketinggalan clutch berikutnya.',
      'hero.cta': 'Lihat yang tersedia', 'hero.how': 'Cara beli',
      'hero.featured': 'Unggulan', 'hero.latest': 'Terbaru', 'hero.aria': 'Hewan unggulan',
      'sb.aria': 'Tentang breeder', 'sb.based': 'Lokasi', 'sb.since': 'Breeding sejak',
      'sb.available': 'Tersedia', 'sb.breeders': 'Indukan', 'sb.genes': 'Gen di koleksi',
      'pill.breeder': 'Indukan', 'pill.holdback': 'Holdback', 'pill.hold': 'Sudah di-booking', 'pill.sold': 'Terjual',
      'pill.featured': 'Unggulan', 'pill.new': 'Baru', 'pill.proven': 'Proven',
      'price.nfs': 'Tidak dijual', 'price.ask': 'Tanya harga',
      'photos.n': '{n} foto', 'photo.n': 'Foto {n}', 'close': 'Tutup',
      'detail.placeholder': 'Foto menyusul. Motif yang tampil hanya ilustrasi.',
      'detail.genetics': 'Genetik', 'f.sex': 'Kelamin', 'f.hatched': 'Menetas', 'f.breeding': 'Status breeding',
      'f.weight': 'Berat', 'f.feeding': 'Makan', 'f.origin': 'Asal', 'origin': 'Hasil breeding Urban Nine (captive bred)',
      'br.proven': 'Indukan proven', 'br.holdback': 'Holdback, belum pernah dikawinkan', 'br.unproven': 'Belum proven',
      'wa.ask': 'Halo Urban Nine, saya tertarik dengan {id} ({genes}). Masih tersedia?',
      'wa.similar': 'Halo Urban Nine, saya lihat {id} di website. Ada yang mirip?',
      'wa.general': 'Halo Urban Nine, saya mau tanya soal ball python saya.',
      'btn.ask': 'Tanya {id} via WhatsApp', 'btn.similar': 'Tanya yang mirip',
      'btn.copylink': 'Salin link', 'copy.linkto': 'link {id}',
      'detail.other': 'Lebih nyaman lewat Instagram atau email?', 'detail.contacts': 'Lihat semua kontak',
      'related': 'Mirip dan masih tersedia',
      'copied': '{x} disalin', 'copy.blocked': 'Tidak bisa menyalin di sini. Blok teksnya secara manual.',
      'about.h': 'Tentang Urban Nine', 'how.h': 'Cara beli',
      'step.reserve': 'Booking', 'step.ship': 'Kirim atau ambil sendiri', 'step.guarantee': 'Garansi',
      'copy.x': 'Salin {k}', 'foot.ship': '{loc}. Kirim ke seluruh Indonesia.',
      'proj.h': 'Musim breeding {y}', 'proj.h0': 'Musim breeding',
      'proj.sub': 'Pasangan yang sedang kami breeding musim ini. Kabari kami kalau mau dikasih tahu saat clutch-nya menetas.',
      'ps.planned': 'Rencana', 'ps.paired': 'Sudah dipasangkan', 'ps.ovulated': 'Ovulasi', 'ps.gravid': 'Gravid',
      'ps.laid': 'Sudah bertelur', 'ps.hatched': 'Menetas', 'paired.with': 'dipasangkan dengan',
      'title.research': 'Panduan perawatan & breeding ball python',
      'alt.about': 'Ball python piebald', 'photo': 'Foto'
    }
  };

  const KEY = 'une-lang';
  let lang;
  try { lang = localStorage.getItem(KEY); } catch {}
  if (lang !== 'en' && lang !== 'id') lang = /^id\b|^in\b/i.test(navigator.language || '') ? 'id' : 'en';
  const listeners = [];

  function t(key, vars) {
    let s = DICT[lang][key] ?? DICT.en[key] ?? key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  const loc = (obj, key) => (lang === 'id' && obj && String(obj[key + 'Id'] || '').trim()) ? obj[key + 'Id'] : (obj ? obj[key] : '');

  function apply(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':'); if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    }));
  }
  function set(next) {
    if (next === lang || !DICT[next]) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch {}
    apply();
    listeners.forEach(fn => fn(lang));
  }

  return { t, loc, apply, set, onChange: (fn) => listeners.push(fn), get lang() { return lang; } };
})();
