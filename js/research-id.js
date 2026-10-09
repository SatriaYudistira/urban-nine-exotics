/* Bahasa Indonesia version of the Research page (Panduan). Same structure as the English page in research.js.
   Morph, gene and hobby terms (het, holdback, hot spot, lock, gravid, clutch…) stay in English on purpose:
   that's how Indonesian keepers say them. */
window.UNEResearchID = (() => {
  const SECTIONS = [
    ['arrival', 'Saat ular baru datang'],
    ['setup', 'Setup kandang'],
    ['climate', 'Suhu dan kelembapan'],
    ['feeding', 'Jadwal makan'],
    ['fasting', 'Mogok makan'],
    ['health', 'Masalah kesehatan'],
    ['shedding', 'Ganti kulit (shedding)'],
    ['breeding', 'Breeding di Indonesia'],
    ['incubation', 'Telur dan anakan'],
    ['morphs', 'Morph yang umum']
  ];

  /* [photo key, name (not translated), inheritance, description] */
  const MORPHS = [
    ['normal', 'Normal', 'Wild type', 'Tanpa mutasi. Semua morph dibandingkan dengan motif cokelat-emas ini.'],
    ['pied', 'Piebald', 'Resesif', 'Bercak putih bersih. Banyaknya putih bisa beda-beda jauh, bahkan dalam satu clutch.'],
    ['albino', 'Albino', 'Resesif', 'Tanpa pigmen hitam: kuning dan putih dengan mata merah muda.'],
    ['hypo', 'Hypo (Ghost)', 'Resesif', 'Pigmen hitamnya berkurang, jadi warnanya lebih hangat dan pudar.'],
    ['blackpastel', 'Black Pastel', 'Incomplete dominant', 'Lebih gelap, lebih cokelat, motifnya berkurang. Satu salinan sudah terlihat; dua salinan jadi bentuk super.'],
    ['bumblebee', 'Citrus Bumblebee', 'Combo', 'Pastel ditambah Spider. Spider membawa wobble di kepala, makanya banyak breeder menghindarinya.'],
    ['lavender', 'Lavender Albino', 'Resesif', 'Albino dengan warna dasar lavender, bukan putih.'],
    ['mojaveenchi', 'Mojave Enchi', 'Combo', 'Dua gen incomplete dominant sekaligus. Mojave termasuk kompleks blue-eyed leucistic (BEL).'],
    ['lesser', 'Lesser dan Lesser Axanthic', 'Combo', 'Lesser membuat motif lebih terang; axanthic (resesif) menghilangkan warna kuning, jadi abu-abu dan perak.']
  ];

  const PREY_NAMES = ['tikus pinky', 'tikus fuzzy', 'tikus hopper', 'tikus weaner', 'tikus small', 'tikus medium', 'tikus large'];
  const STAGES = { Hatchling: 'Hatchling', Juvenile: 'Juvenile', 'Sub-adult': 'Sub-adult', Adult: 'Dewasa' };
  const pct = (n) => Number(n).toLocaleString('id-ID');

  const m = {
    toc: 'Di halaman ini',
    preyEmpty: 'Masukkan berat untuk melihat ukuran pakan dan jadwal yang pas.',
    preyResult: (stage, lo, hi, fits, every) => `<b>${STAGES[stage] || stage}.</b> Kasih pakan sekitar <b>${lo}–${hi} g</b>${fits.length ? ` (${fits.join(' atau ')})` : ''}, <b>tiap ${every.replace('days', 'hari')}</b>.`,
    or: ' atau ',
    flags: ['Bawa ke dokter hewan reptil', 'Satu atau lebih tanda bahaya berarti ini kemungkinan bukan sekadar mogok makan biasa. Jangan tunggu sampai beratnya turun.'],
    fastEmpty: 'Isi kedua berat dan berapa minggu sejak terakhir makan.',
    young: {
      vet: (l, wk) => ['Perlu ditangani sekarang', `Ular muda tidak punya banyak cadangan. Turun ${pct(l)}% setelah ${wk} minggu itu terlalu banyak: cek suhu dan hide hari ini, lalu hubungi dokter hewan atau breeder kamu minggu ini.`],
      watch: (l) => ['Pantau terus', `Sejauh ini turun ${pct(l)}%. Cek lagi daftar di atas, tawarkan makan tiap 7 hari, dan timbang lagi minggu depan.`],
      ok: (l) => ['Masih normal', `Turun ${pct(l)}%. Tetap tawarkan makan tiap 7 hari dan timbang tiap dua minggu.`]
    },
    adult: {
      vet: (l) => ['Bawa ke dokter hewan reptil', `Turun ${pct(l)}% sudah lebih dari puasa yang sehat. Jadwalkan cek ke dokter hewan, meskipun ularnya kelihatan baik-baik saja.`],
      watch: (l, wk) => ['Pantau terus', `Turun ${pct(l)}% setelah ${wk} minggu. Cek ulang suhu dan ukuran kandang, tawarkan makan tiap 10–14 hari, dan timbang tiap 2 minggu. Kalau sudah lebih dari 15%, saatnya ke dokter hewan.`],
      ok: (l, wk) => ['Puasa yang normal', `Turun ${pct(l)}% setelah ${wk} minggu masih wajar untuk ular dewasa${wk >= 26 ? ', walaupun sudah cukup lama' : ''}. Tetap tawarkan makan tiap 2–3 minggu dan timbang sebulan sekali. Puasa musiman dan saat musim kawin itu hal biasa.`]
    }
  };

  const html = ({ F, toc, morphList }) => `
    <article class="research wrap">
      <header class="r-head">
        <p class="muted">Panduan</p>
        <h1>Perawatan dan breeding ball python, khusus untuk kondisi Indonesia</h1>
        <p class="r-lede">Semua yang biasa kami jelaskan ke pemilik baru, dirangkum di satu tempat: persiapan sebelum ular datang, suhu yang pas untuk ruangan tropis, seberapa sering harus diberi makan, kapan mogok makan masih wajar dan kapan perlu waspada, sampai cara kami breeding dan menginkubasi telur.</p>
        <p class="r-note">Ini panduan umum dari pengalaman keeper, bukan saran dokter hewan. Kalau ular kamu menunjukkan salah satu tanda bahaya di bawah, segera bawa ke dokter hewan reptil.</p>
      </header>
      ${F('cover', { alt: 'Close-up kepala ball python', w: 1280, cls: 'r-cover', eager: true })}

      <div class="r-layout">
        ${toc}
        <div class="r-body">

<section id="r-arrival">
  <h2>Saat ular baru datang</h2>
  <p>Pindah tempat itu bikin stres. Ball python baru yang dibiarkan tenang di minggu pertama hampir selalu cepat beradaptasi dan mau makan. Sebaliknya, yang tiap hari dipegang dan disodori makan sering malah mogok berminggu-minggu.</p>
  ${F('juvenile', { caption: 'Ball python muda hasil captive breeding. Di ukuran ini, minggu pertama yang tenang paling penting.' })}
  <ol class="r-steps">
    <li><b>Sebelum ular datang.</b> Nyalakan kandang minimal 2–3 hari sebelumnya. Cek suhu hot spot dan sisi dingin pakai termometer probe, jangan cuma dirasa pakai tangan.</li>
    <li><b>Hari ke-1.</b> Buka kotak kiriman di atas kandang dan biarkan ular masuk ke hide sendiri. Kalau bisa cepat, timbang dan catat beratnya. Angka ini jadi patokan kamu ke depannya.</li>
    <li><b>Hari ke-1 sampai ke-7.</b> Jangan dipegang dulu. Cukup ganti air dan buang kotorannya. Kalau pakai kandang kaca, tutup tiga sisinya supaya ular merasa aman.</li>
    <li><b>Sekitar hari ke-7.</b> Kasih makan pertama dengan jenis dan ukuran pakan yang sama seperti di tempat kami (kami infokan saat pembelian). Kasih di malam hari, lalu tinggalkan.</li>
    <li><b>Setelah 2–3 kali makan lancar.</b> Mulai handling sebentar-sebentar, tapi jangan pernah dalam 48 jam setelah makan.</li>
  </ol>
  <div class="r-callout"><b>Sudah punya reptil lain?</b> Karantina hewan baru selama 60–90 hari: kalau bisa di ruangan terpisah, dengan peralatan sendiri, dan cuci tangan setiap pindah hewan. Di minggu pertama, cek ada tungau (mites) atau tidak, yaitu titik kecil hitam atau merah di sekitar mata dan dagu.</div>
</section>

<section id="r-setup">
  <h2>Setup kandang</h2>
  <p>Ball python merasa aman di ruang yang kecil dan sempit. Kandang yang terlalu besar dan terbuka justru bikin kebanyakan dari mereka gelisah dan malas makan.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Berat ular</th><th>Box rak (ukuran dalam)</th><th>Kandang buka depan</th></tr></thead>
    <tbody>
      <tr><td>Di bawah 300 g</td><td>Sekitar 6–15 liter</td><td>60 × 40 × 40 cm</td></tr>
      <tr><td>300–1.000 g</td><td>Sekitar 30–40 liter</td><td>90 × 45 × 45 cm</td></tr>
      <tr><td>Di atas 1.000 g</td><td>Sekitar 50–80 liter</td><td>120 × 60 × 60 cm</td></tr>
    </tbody>
  </table></div>
  ${F('setup', { caption: 'Wadah air yang cukup besar untuk berendam. Ular yang berendam terus berhari-hari bisa jadi kepanasan atau kena tungau.' })}
  <h3>Isi kandang</h3>
  <ul>
    <li><b>Dua hide</b>, satu di sisi hangat dan satu di sisi dingin, ukurannya pas sampai badan ular menyentuh dinding hide.</li>
    <li><b>Wadah air yang berat</b> supaya tidak gampang tumpah. Ganti airnya tiap 2–3 hari, dan langsung diganti kalau kotor.</li>
    <li><b>Substrat:</b> cypress mulch, coco husk, atau aspen. Tisu dapur juga oke untuk masa karantina dan anakan. Hindari serutan kayu pinus dan cedar.</li>
    <li><b>Termostat untuk setiap pemanas.</b> Heat mat dan heat tape tanpa termostat bisa bikin ular luka bakar. Ini satu-satunya alat yang tidak boleh di-skip.</li>
    <li><b>Termometer digital dengan probe</b>, ditambah thermo gun kalau ada, untuk cek suhu permukaan.</li>
  </ul>
  <h3>Khusus Indonesia</h3>
  <ul>
    <li><b>Semut</b> adalah ancaman lokal paling besar untuk anakan dan telur. Taruh kaki rak di wadah kecil berisi air atau oli, atau pakai penghalang semut, dan jauhkan sisa makanan dari ruangan.</li>
    <li><b>Mati listrik:</b> kebanyakan ruangan tetap cukup hangat untuk ular dewasa selama beberapa jam, tapi inkubator wajib pakai UPS atau baterai cadangan.</li>
    <li><b>Sirkulasi udara</b> lebih penting di sini daripada di negara yang kering. Udara lembap dan pengap bisa memicu infeksi kulit (lihat Masalah kesehatan).</li>
  </ul>
</section>

<section id="r-climate">
  <h2>Suhu dan kelembapan</h2>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Ukuran</th><th>Target</th><th>Jangan sampai</th></tr></thead>
    <tbody>
      <tr><td>Hot spot (lantai di bawah hide hangat)</td><td>31–32 °C</td><td>Di atas 34 °C</td></tr>
      <tr><td>Sisi dingin</td><td>26–28 °C</td><td>Di bawah 24 °C</td></tr>
      <tr><td>Malam hari, seluruh kandang</td><td>Boleh turun ke 25–26 °C</td><td>Di bawah 23 °C</td></tr>
      <tr><td>Kelembapan</td><td>55–70%</td><td>Substrat basah berhari-hari</td></tr>
      <tr><td>Kelembapan saat mau ganti kulit</td><td>70–80%</td><td></td></tr>
    </tbody>
  </table></div>
  ${F('rock', { caption: 'Batu dan dekorasi di dekat pemanas ikut menyimpan panas. Cek suhu permukaannya pakai thermo gun.' })}
  <p>Di sebagian besar Indonesia, suhu ruangan dalam rumah sudah 27–31 °C dengan sendirinya, dan itu sudah mendekati suhu sisi dingin yang dibutuhkan ball python. Jadi yang perlu kamu perhatikan agak berbeda:</p>
  <ul>
    <li><b>Ruangan tanpa AC:</b> banyak ular dewasa hampir tidak butuh pemanas tambahan. Risikonya justru <em>kepanasan</em> di hari-hari paling panas, apalagi kalau kandang dekat jendela atau di bawah atap. Kalau sisi dingin sudah lewat 32 °C, pindahkan kandang atau dinginkan ruangannya.</li>
    <li><b>Ruangan ber-AC</b> (biasanya 22–25 °C): kamu perlu heat tape atau heat mat dengan termostat supaya ada hot spot yang benar.</li>
    <li><b>Musim hujan:</b> kelembapan sering tembus 80% dengan sendirinya. Biarkan substrat kering dulu sebelum disemprot lagi, dan pastikan ada sirkulasi udara.</li>
    <li><b>Musim kemarau atau ruangan ber-AC:</b> kelembapan bisa turun di bawah 50%. Tambahkan humid hide (kotak berisi sphagnum moss lembap), jangan membasahi seluruh kandang.</li>
  </ul>
</section>

<section id="r-feeding">
  <h2>Jadwal makan</h2>
  <p>Sebisa mungkin kasih tikus frozen yang sudah dicairkan (frozen-thawed), karena tidak bisa menggigit atau melukai ular. Cairkan di kulkas atau dalam plastik tertutup yang direndam air hangat, jangan pakai microwave, lalu sodorkan dalam kondisi hangat pakai pinset. Timbang ular kamu tiap 2–4 minggu; catatan berat adalah rekam kesehatan terbaik yang kamu punya.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Tahap</th><th>Berat</th><th>Berat pakan</th><th>Seberapa sering</th></tr></thead>
    <tbody>
      <tr><td>Hatchling</td><td>Di bawah 300 g</td><td>10–15% dari berat badan</td><td>Tiap 5–7 hari</td></tr>
      <tr><td>Juvenile</td><td>300–700 g</td><td>10–12%</td><td>Tiap 7–10 hari</td></tr>
      <tr><td>Sub-adult</td><td>700–1.500 g</td><td>7–10%</td><td>Tiap 10–14 hari</td></tr>
      <tr><td>Dewasa</td><td>Di atas 1.500 g</td><td>5–8%</td><td>Tiap 14–21 hari</td></tr>
    </tbody>
  </table></div>
  <p class="muted small">Lebar pakan sebaiknya tidak lebih besar dari bagian badan ular yang paling lebar. Jantan dewasa biasanya paling cocok di batas bawah; betina yang mau di-breeding diberi makan lebih sering sebelum dan sesudah musim kawin.</p>

  <form class="r-tool" id="prey-tool" onsubmit="return false">
    <h3>Kalkulator ukuran pakan</h3>
    <label class="field"><span>Berat ular kamu (g)</span><input name="w" type="number" inputmode="numeric" min="30" max="5000" placeholder="mis. 420"></label>
    <output class="r-out" id="prey-out" aria-live="polite">${m.preyEmpty}</output>
  </form>

  <h3>Pakan hidup</h3>
  <p>Kalau ular kamu cuma mau tikus hidup, jangan pernah tinggalkan tikusnya di kandang tanpa diawasi. Tikus yang lapar bisa melukai ular dengan parah dalam semalam. Angkat tikusnya setelah 15–20 menit dan coba lagi minggu depan.</p>
</section>

<section id="r-fasting">
  <h2>Mogok makan</h2>
  <p>Ball python terkenal suka mogok makan. Ular dewasa yang sehat bisa tidak makan berbulan-bulan, dan ada catatan puasa yang jauh lebih lama lagi. Kebanyakan mogok makan itu normal. Pertanyaannya bukan "sudah berapa lama", tapi <b>"beratnya turun atau ada tanda sakit atau tidak?"</b></p>
  <h3>Alasan normal ular berhenti makan</h3>
  <ul>
    <li><b>Musim kawin.</b> Jantan dewasa sering berhenti makan berminggu-minggu sampai berbulan-bulan selama dipasangkan, dan betina berhenti saat ovulasi atau gravid.</li>
    <li><b>Mau ganti kulit.</b> Banyak yang menolak makan sejak matanya mulai biru sampai selesai ganti kulit.</li>
    <li><b>Rumah baru</b>, pindahan, atau terlalu sering dipegang.</li>
    <li><b>Musim dan suhu.</b> Sebagian ular dewasa makan lebih sedikit di bulan-bulan yang lebih sejuk atau saat suhu ruangan berubah.</li>
    <li><b>Pakan tidak cocok</b>: terlalu besar, jenis atau warnanya beda dari yang biasa, atau diberikan siang hari.</li>
  </ul>
  <h3>Yang bisa dicoba, berurutan</h3>
  <ol class="r-steps">
    <li>Cek suhu pakai termometer probe. Hot spot yang kurang hangat adalah penyebab paling umum.</li>
    <li>Bikin kandang lebih sempit: box lebih kecil, lebih banyak penutup, dan hide yang pas di badan.</li>
    <li>Stop handling sampai ular mau makan lagi.</li>
    <li>Tawarkan makan tiap 7–14 hari saja. Makin sering ditawari, biasanya malah makin menolak.</li>
    <li>Kasih makan malam hari dengan lampu mati, lalu tinggalkan pakannya di kandang beberapa jam.</li>
    <li>Ganti satu hal saja setiap kali mencoba: pakan lebih kecil, mencit sebagai ganti tikus, pakan yang baru saja dimatikan, atau hangatkan kepala pakan lebih lama.</li>
  </ol>

  <form class="r-tool" id="fast-tool" onsubmit="return false">
    <h3>Cek mogok makan</h3>
    <div class="r-tool-grid">
      <label class="field"><span>Berat sebelum mogok (g)</span><input name="w0" type="number" inputmode="numeric" min="30" placeholder="mis. 1600"></label>
      <label class="field"><span>Berat sekarang (g)</span><input name="w1" type="number" inputmode="numeric" min="30" placeholder="mis. 1520"></label>
      <label class="field"><span>Minggu sejak terakhir makan</span><input name="wk" type="number" inputmode="numeric" min="0" max="100" placeholder="mis. 10"></label>
    </div>
    <fieldset class="r-flags"><legend>Ada salah satu tanda ini?</legend>
      <label><input type="checkbox" name="f"> Napas berbunyi, ada gelembung atau lendir di hidung atau mulut</label>
      <label><input type="checkbox" name="f"> Baru-baru ini memuntahkan makanan (regurgitasi)</label>
      <label><input type="checkbox" name="f"> Tulang belakang atau rusuk kelihatan, kulit menggelambir</label>
      <label><input type="checkbox" name="f"> Mata cekung atau kulit keriput yang tidak kembali normal</label>
      <label><input type="checkbox" name="f"> Kepala miring, stargazing, atau berguling (bukan wobble bawaan gen spider)</label>
      <label><input type="checkbox" name="f"> Ada tungau, bengkak, luka terbuka, atau bau tidak sedap</label>
    </fieldset>
    <output class="r-out" id="fast-out" aria-live="polite">${m.fastEmpty}</output>
  </form>
</section>

<section id="r-health">
  <h2>Masalah kesehatan</h2>
  <div class="r-table-wrap"><table class="r-table r-table-health">
    <thead><tr><th>Masalah</th><th>Tanda-tanda</th><th>Penyebab umum</th><th>Yang harus dilakukan</th></tr></thead>
    <tbody>
      <tr><td><b>Infeksi saluran napas</b><span class="tag tag-vet">Dokter hewan</span></td><td>Napas berbunyi atau berdecak, gelembung di hidung, mulut terbuka</td><td>Terlalu dingin, atau udara lembap dan pengap</td><td>Benahi suhu dulu. Kalau gejalanya bertahan lebih dari beberapa hari, bawa ke dokter hewan; biasanya perlu antibiotik.</td></tr>
      <tr><td><b>Tungau (mites)</b><span class="tag tag-soon">Tangani sekarang</span></td><td>Titik kecil hitam atau merah, ular berendam terus berhari-hari, bintik putih di tangan setelah memegang</td><td>Terbawa dari hewan baru atau substrat</td><td>Obati ular dan seluruh kandang dengan obat tungau yang aman untuk reptil, ganti substrat, dan cek semua hewan lainnya.</td></tr>
      <tr><td><b>Scale rot / lepuh</b><span class="tag tag-vet">Dokter hewan kalau menyebar</span></td><td>Sisik perut cokelat atau kemerahan, lepuh</td><td>Substrat yang terus basah, kandang kotor</td><td>Pindahkan ke alas tisu kering, bersihkan setiap hari. Bawa ke dokter hewan kalau menyebar atau lepuhnya pecah.</td></tr>
      <tr><td><b>Ganti kulit tidak tuntas</b><span class="tag tag-ok">Rawat di rumah</span></td><td>Kulit lepas sepotong-sepotong, tersisa di ujung ekor atau mata</td><td>Kelembapan terlalu rendah</td><td>Pakai humid hide, atau rendam di air hangat kuku 15–20 menit, lalu biarkan ular merayap melewati handuk lembap. Jangan pernah mencabut eye cap sendiri.</td></tr>
      <tr><td><b>Regurgitasi (muntah)</b><span class="tag tag-soon">Pantau</span></td><td>Memuntahkan makanan yang sudah setengah dicerna</td><td>Dipegang terlalu cepat, pakan terlalu besar, kandang terlalu dingin</td><td>Jangan kasih makan 10–14 hari, lalu kasih pakan yang lebih kecil. Kalau terjadi dua kali berturut-turut, bawa ke dokter hewan.</td></tr>
      <tr><td><b>Mouth rot</b><span class="tag tag-vet">Dokter hewan</span></td><td>Gusi bengkak, ada nanah, mulut kemerahan</td><td>Luka ditambah kondisi kandang yang buruk</td><td>Bawa ke dokter hewan.</td></tr>
      <tr><td><b>Luka bakar</b><span class="tag tag-vet">Dokter hewan</span></td><td>Bercak di perut yang berubah warna, mengilap, atau melepuh</td><td>Pemanas tanpa termostat</td><td>Pasang termostat di pemanas dan bawa ke dokter hewan.</td></tr>
      <tr><td><b>Gangguan saraf</b><span class="tag tag-vet">Isolasi + dokter hewan</span></td><td>Stargazing, berguling, tidak bisa membalikkan badan</td><td>Bisa karena virus (mis. IBD, nidovirus)</td><td>Langsung isolasi dan bawa ke dokter hewan. Wobble ringan pada morph spider itu bawaan genetik, kasusnya berbeda.</td></tr>
    </tbody>
  </table></div>
  <p class="muted small">Dokter hewan reptil masih jarang di Indonesia. Cari tahu dari sekarang sebelum benar-benar butuh, dan tanya ke sesama keeper atau komunitas reptil di kotamu klinik mana yang bisa menangani ular.</p>
</section>

<section id="r-shedding">
  <h2>Ganti kulit (shedding)</h2>
  <p>Ular muda ganti kulit tiap 4–6 minggu, yang dewasa lebih jarang. Warna kulitnya jadi kusam, matanya berubah biru keruh selama beberapa hari, lalu jernih lagi sekitar seminggu sebelum kulitnya lepas.</p>
  <ul>
    <li>Naikkan kelembapan ke 70–80% sejak mata mulai biru.</li>
    <li>Jangan dipegang atau dikasih makan dulu selama masa ini. Kebanyakan ular juga akan menolak makan.</li>
    <li>Ganti kulit yang bagus lepas utuh satu lembar. Cek ujung ekor dan matanya.</li>
  </ul>
</section>

<section id="r-breeding">
  <h2>Breeding di Indonesia</h2>
  <p>Di tahap breeding, kesalahan paling sering berujung pada kesehatan hewan. Hanya breeding ular yang badannya sudah cukup besar dan makannya lancar.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th></th><th>Berat minimum</th><th>Umur umumnya</th></tr></thead>
    <tbody>
      <tr><td>Betina</td><td>1.500 g; 1.800 g ke atas lebih aman</td><td>2½–3 tahun</td></tr>
      <tr><td>Jantan</td><td>700–800 g</td><td>Mulai sekitar 1 tahun</td></tr>
    </tbody>
  </table></div>
  <h3>Iklim dan waktu</h3>
  <p>Breeder di negara empat musim menurunkan suhu ruangan selama beberapa bulan untuk memicu musim kawin. Di Indonesia yang hangat sepanjang tahun, banyak ular tetap bisa siklus tanpa itu, tapi penurunan suhu malam yang ringan ke sekitar 25–26 °C (misalnya di ruangan ber-AC) selama 6–8 minggu sebelum dan selama pairing sering membantu. Tetap sediakan hot spot supaya ular bisa mencerna makanan. Banyak breeder lokal mulai pairing sekitar paruh kedua tahun sampai masuk musim hujan, tapi tetap perhatikan kondisi ular kamu sendiri, jangan cuma berpatokan pada kalender.</p>
  <h3>Tahapan musim breeding</h3>
  <ol class="r-steps">
    <li><b>Pairing.</b> Masukkan betina ke box jantan (atau jantan ke box betina) selama beberapa hari, istirahatkan jantannya beberapa hari, lalu ulangi. Perhatikan lock, yaitu saat ekor keduanya menyatu; satu kali lock bisa sudah cukup.</li>
    <li><b>Folikel berkembang.</b> Selama beberapa minggu, sepertiga bagian bawah tubuh betina terasa makin padat, dan ia mungkin berjemur terbalik (perut menghadap ke atas) di hot spot.</li>
    <li><b>Ovulasi.</b> Bagian tengah tubuh betina membengkak besar selama sekitar 24–48 jam. Catat tanggalnya, karena ini jadi patokan waktu kamu.</li>
    <li><b>Pre-lay shed.</b> Sekitar 2–3 minggu setelah ovulasi. Mulai saat ini, pisahkan betina dari jantan.</li>
    <li><b>Bertelur.</b> Sekitar 28–35 hari setelah pre-lay shed. Sediakan laying box berisi sphagnum moss lembap dan biarkan ia tenang.</li>
  </ol>
  <div class="r-fig-row">
    ${F('mating', { caption: 'Lock: ekor sepasang ular yang menyatu.', w: 500 })}
    ${F('basking', { caption: 'Berjemur terbalik saat folikel berkembang.', w: 500 })}
    ${F('gravid', { caption: 'Gravid, kurang dari seminggu sebelum bertelur.', w: 500 })}
  </div>
  <div class="r-callout"><b>Setelah bertelur:</b> badannya akan kurus. Tawarkan makanan kecil dalam seminggu, lalu beri makan tiap 5–7 hari sampai beratnya kembali seperti sebelum musim kawin. Jangan pasangkan betina dua musim berturut-turut kecuali kondisinya sudah benar-benar pulih.</div>
</section>

<section id="r-incubation">
  <h2>Telur dan anakan</h2>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Inkubasi</th><th>Target</th></tr></thead>
    <tbody>
      <tr><td>Suhu</td><td>31,5–32 °C, stabil</td></tr>
      <tr><td>Kelembapan di sekitar telur</td><td>90–100%, tanpa air menyentuh telur</td></tr>
      <tr><td>Lama sampai menetas</td><td>Sekitar 55–60 hari</td></tr>
      <tr><td>Jumlah telur per clutch</td><td>Biasanya 4–8 butir</td></tr>
    </tbody>
  </table></div>
  ${F('eggs', { caption: 'Satu clutch di dalam inkubator. Jaga kelembapan tetap tinggi, tapi jangan sampai air menyentuh cangkang.' })}
  <ul>
    <li>Jangan membalik telur. Tandai bagian atasnya pakai pensil saat dipindahkan, dan pastikan sisi itu tetap di atas.</li>
    <li><b>Indonesia:</b> di musim panas, suhu ruangan sendiri bisa mencapai suhu inkubasi. Pakai inkubator yang bisa <em>mendinginkan</em> sekaligus menghangatkan, atau taruh di ruangan ber-AC, dan sambungkan ke UPS untuk jaga-jaga kalau mati listrik.</li>
    <li>Telur yang menguning, kempis parah, dan berjamur biasanya tidak fertil. Biarkan saja kecuali menempel ke telur yang bagus.</li>
    <li>Setelah telur pertama pipping (cangkangnya robek), sabar dulu. Anakan bisa tetap di dalam telur 24–48 jam untuk menyerap sisa kuning telur. Jangan ditarik keluar.</li>
    <li>Anakan ganti kulit pertama kali 7–10 hari setelah menetas. Tawarkan makan pertama setelah itu: tikus pinky atau fuzzy seberat sekitar 10–15% dari berat badannya.</li>
  </ul>
</section>

<section id="r-morphs">
  <h2>Morph yang umum</h2>
  <p>Morph adalah mutasi genetik yang mengubah warna atau motif. Cara gen itu diturunkan menentukan hasil pairing: gen <b>resesif</b> baru terlihat kalau ular punya dua salinan (satu salinan saja disebut "het"), sedangkan gen <b>incomplete dominant</b> sudah terlihat dengan satu salinan, dan dua salinan menghasilkan bentuk "super".</p>
  ${morphList(MORPHS)}
  <p class="muted small">Foto-foto ini adalah contoh hewan milik keeper lain, bukan stok Urban Nine. Kredit tiap foto ada di bawahnya.</p>
</section>

          <aside class="r-cta">
            <p><b>Masih ragu?</b> Setiap hewan yang kami jual dapat pendampingan dari kami seumur hidupnya. Kirim foto dan riwayat beratnya, nanti kami bantu cek.</p>
            <a class="btn btn-primary" id="r-wa" href="#contact" target="_blank" rel="noopener">Tanya kami via WhatsApp</a>
          </aside>
        </div>
      </div>
    </article>`;

  return { SECTIONS, MORPHS, PREY_NAMES, m, html };
})();
