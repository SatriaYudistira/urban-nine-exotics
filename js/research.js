/* Research page: ball python care and breeding guide for Indonesian keepers,
   with a prey-size calculator and a hunger-strike checker. Rendered on first visit to #/research. */
window.UNEResearch = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SECTIONS = [
    ['arrival', 'When your snake arrives'],
    ['setup', 'Enclosure setup'],
    ['climate', 'Temperature and humidity'],
    ['feeding', 'Feeding schedule'],
    ['fasting', 'Hunger strikes'],
    ['health', 'Health problems'],
    ['shedding', 'Shedding'],
    ['breeding', 'Breeding in Indonesia'],
    ['incubation', 'Eggs and hatchlings'],
    ['morphs', 'Common morphs']
  ];
  const F = (...a) => window.UNEPhotos ? UNEPhotos.figure(...a) : '';

  /* Morph primer: [photo key, name, inheritance, what it does] */
  const MORPHS = [
    ['normal', 'Normal', 'Wild type', 'No mutation. Every morph is measured against this brown and gold pattern.'],
    ['pied', 'Piebald', 'Recessive', 'Patches of pure white. The amount of white varies a lot, even within one clutch.'],
    ['albino', 'Albino', 'Recessive', 'No black pigment: yellow and white with pink eyes.'],
    ['hypo', 'Hypo (Ghost)', 'Recessive', 'Reduced black pigment, giving warmer, washed-out colours.'],
    ['blackpastel', 'Black Pastel', 'Incomplete dominant', 'Darker, browner and reduced pattern. One copy shows; two copies make a super form.'],
    ['bumblebee', 'Citrus Bumblebee', 'Combo', 'Pastel plus Spider. Spider carries a head wobble, which is why many breeders avoid it.'],
    ['lavender', 'Lavender Albino', 'Recessive', 'An albino with a lavender ground colour instead of white.'],
    ['mojaveenchi', 'Mojave Enchi', 'Combo', 'Two incomplete dominant genes together. Mojave is part of the blue-eyed leucistic complex.'],
    ['lesser', 'Lesser and Lesser Axanthic', 'Combo', 'Lesser lightens the pattern; axanthic (recessive) removes yellow, turning it grey and silver.']
  ];

  /* Approximate frozen-thawed rat sizes as sold in Indonesia. */
  const PREY = [
    ['Rat pinky', 5, 9], ['Rat fuzzy', 10, 20], ['Rat pup (hopper)', 20, 35], ['Rat weaner', 35, 60],
    ['Small rat', 60, 100], ['Medium rat', 100, 200], ['Large rat', 200, 300]
  ];
  function stage(w) {
    if (w < 300) return { name: 'Hatchling', pct: [10, 15], every: '5–7 days' };
    if (w < 700) return { name: 'Juvenile', pct: [10, 12], every: '7–10 days' };
    if (w < 1500) return { name: 'Sub-adult', pct: [7, 10], every: '10–14 days' };
    return { name: 'Adult', pct: [5, 8], every: '14–21 days' };
  }

  const html = () => `
    <article class="research wrap">
      <header class="r-head">
        <p class="muted">Research</p>
        <h1>Ball python care and breeding, written for Indonesia</h1>
        <p class="r-lede">Everything we tell new owners, in one place: how to set up before your snake arrives, the temperatures that work in a tropical room, how often to feed, when a hunger strike is normal and when it isn't, and how we breed and incubate.</p>
        <p class="r-note">This is general keeper guidance, not veterinary advice. If your snake shows any red-flag sign below, see a reptile vet.</p>
      </header>
      ${F('cover', { alt: 'Close-up of a ball python head', w: 1280, cls: 'r-cover', eager: true })}

      <div class="r-layout">
        <nav class="r-toc" aria-label="On this page">
          <p class="r-toc-h">On this page</p>
          <ol>${SECTIONS.map(([id, t]) => `<li><a href="#/research/${id}" data-sec="${id}">${t}</a></li>`).join('')}</ol>
        </nav>

        <div class="r-body">

<section id="r-arrival">
  <h2>When your snake arrives</h2>
  <p>Moving is stressful. A new ball python that is left alone for its first week almost always settles and eats; one that is handled and offered food every day often refuses for weeks.</p>
  ${F('juvenile', { caption: 'A young captive-bred ball python. At this size, a quiet first week matters most.' })}
  <ol class="r-steps">
    <li><b>Before it arrives.</b> Run the enclosure for at least 2–3 days. Check the hot spot and cool side with a probe thermometer, not by hand.</li>
    <li><b>Day 1.</b> Open the box over the enclosure and let the snake go into its hide. Weigh it if you can do it quickly, and write the number down; it becomes your baseline.</li>
    <li><b>Days 1–7.</b> No handling. Change water and spot-clean only. Cover three sides of a glass tank so it feels hidden.</li>
    <li><b>Around day 7.</b> Offer the first meal: the same prey type and size it ate here (we tell you on the sale). Offer at night, then leave it alone.</li>
    <li><b>After 2–3 good meals.</b> Start short handling sessions, never within 48 hours after a meal.</li>
  </ol>
  <div class="r-callout"><b>Already keep other reptiles?</b> Quarantine the new animal for 60–90 days: a separate room if possible, its own tools, and wash your hands between animals. Check it for mites (tiny black or red dots around the eyes and chin) in the first week.</div>
</section>

<section id="r-setup">
  <h2>Enclosure setup</h2>
  <p>Ball pythons feel safe in small, tight spaces. A huge open tank makes most of them nervous and less likely to eat.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Snake weight</th><th>Rack tub (inside size)</th><th>Front-opening enclosure</th></tr></thead>
    <tbody>
      <tr><td>Under 300 g</td><td>About 6–15 litres</td><td>60 × 40 × 40 cm</td></tr>
      <tr><td>300–1,000 g</td><td>About 30–40 litres</td><td>90 × 45 × 45 cm</td></tr>
      <tr><td>Over 1,000 g</td><td>About 50–80 litres</td><td>120 × 60 × 60 cm</td></tr>
    </tbody>
  </table></div>
  ${F('setup', { caption: 'A water bowl big enough to soak in. A snake that soaks for days can be too hot or have mites.' })}
  <h3>What goes inside</h3>
  <ul>
    <li><b>Two hides</b>, one on the warm side and one on the cool side, just big enough for the snake to touch the walls.</li>
    <li><b>A heavy water bowl</b> it can't tip over. Change the water every 2–3 days, and the same day if it's soiled.</li>
    <li><b>Substrate:</b> cypress mulch, coco husk or aspen. Paper towel is fine for quarantine and hatchlings. Avoid pine and cedar shavings.</li>
    <li><b>A thermostat on every heat source.</b> Unregulated heat mats and heat tape cause burns. This is the one item you can't skip.</li>
    <li><b>A digital thermometer with a probe</b>, plus an infrared gun if you can, to read surface temperatures.</li>
  </ul>
  <h3>Indonesia-specific</h3>
  <ul>
    <li><b>Ants</b> are the biggest local danger to hatchlings and eggs. Stand rack legs in small cups of water or oil, or use an ant barrier, and keep food waste away from the room.</li>
    <li><b>Power cuts:</b> most rooms stay warm enough for an adult for a few hours, but an incubator needs a UPS or battery backup.</li>
    <li><b>Ventilation matters</b> more than in dry countries. Wet, stale air causes skin infections (see Health problems).</li>
  </ul>
</section>

<section id="r-climate">
  <h2>Temperature and humidity</h2>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Measure</th><th>Target</th><th>Never</th></tr></thead>
    <tbody>
      <tr><td>Hot spot (floor under the warm hide)</td><td>31–32 °C</td><td>Above 34 °C</td></tr>
      <tr><td>Cool side</td><td>26–28 °C</td><td>Below 24 °C</td></tr>
      <tr><td>Night, whole enclosure</td><td>Can drop to 25–26 °C</td><td>Below 23 °C</td></tr>
      <tr><td>Humidity</td><td>55–70%</td><td>Wet substrate for days</td></tr>
      <tr><td>Humidity while in shed</td><td>70–80%</td><td></td></tr>
    </tbody>
  </table></div>
  ${F('rock', { caption: 'Rocks and décor near the heat hold warmth. Check their surface with an infrared thermometer.' })}
  <p>Indoor rooms in most of Indonesia sit at 27–31 °C on their own, which is already close to the cool side ball pythons need. That changes what you have to watch:</p>
  <ul>
    <li><b>Room without AC:</b> many adults need little or no extra heat. The risk is <em>overheating</em> on the hottest days, especially in a tank near a window or under a roof. If the cool side goes over 32 °C, move the enclosure or cool the room.</li>
    <li><b>Room with AC</b> (often 22–25 °C): you do need heat tape or a heat mat on a thermostat to give a proper hot spot.</li>
    <li><b>Rainy season:</b> humidity often goes above 80% by itself. Let the substrate dry out between mistings and make sure there's airflow.</li>
    <li><b>Dry season or AC rooms:</b> humidity can fall below 50%. Add a humid hide (a box with damp sphagnum moss) instead of soaking the whole enclosure.</li>
  </ul>
</section>

<section id="r-feeding">
  <h2>Feeding schedule</h2>
  <p>Feed frozen-thawed rats where possible: they can't bite or injure the snake. Thaw in the fridge or in a sealed bag in warm water, never in a microwave, and offer it warm with tongs. Weigh your snake every 2–4 weeks; weight is the best health record you have.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Stage</th><th>Weight</th><th>Prey weight</th><th>How often</th></tr></thead>
    <tbody>
      <tr><td>Hatchling</td><td>Under 300 g</td><td>10–15% of body weight</td><td>Every 5–7 days</td></tr>
      <tr><td>Juvenile</td><td>300–700 g</td><td>10–12%</td><td>Every 7–10 days</td></tr>
      <tr><td>Sub-adult</td><td>700–1,500 g</td><td>7–10%</td><td>Every 10–14 days</td></tr>
      <tr><td>Adult</td><td>Over 1,500 g</td><td>5–8%</td><td>Every 14–21 days</td></tr>
    </tbody>
  </table></div>
  <p class="muted small">A prey item should be no wider than the widest part of the snake's body. Adult males often do best at the lower end; breeding females are fed more often before and after the season.</p>

  <form class="r-tool" id="prey-tool" onsubmit="return false">
    <h3>Prey size calculator</h3>
    <label class="field"><span>Your snake's weight (g)</span><input name="w" type="number" inputmode="numeric" min="30" max="5000" placeholder="e.g. 420"></label>
    <output class="r-out" id="prey-out" aria-live="polite">Enter a weight to see the right prey size and schedule.</output>
  </form>

  <h3>Live prey</h3>
  <p>If your snake only takes live rats, never leave a live rat in the enclosure unattended. A hungry rat can badly injure a snake overnight. Remove it after 15–20 minutes and try again in a week.</p>
</section>

<section id="r-fasting">
  <h2>Hunger strikes</h2>
  <p>Ball pythons are famous for refusing food. A healthy adult can go months without eating; fasts of several months, and occasionally longer, are on record. Most fasts are normal. The question is never "how long", it's <b>"is it losing weight or showing signs of illness?"</b></p>
  <h3>Normal reasons to stop eating</h3>
  <ul>
    <li><b>Breeding season.</b> Adult males often stop for weeks or months while paired, and females stop when they ovulate or are gravid.</li>
    <li><b>In shed.</b> Many refuse from the time their eyes go blue until the shed is done.</li>
    <li><b>A new home</b>, a move or a lot of handling.</li>
    <li><b>Season and temperature.</b> Some adults eat less during cooler months or when the room temperature changes.</li>
    <li><b>Wrong prey</b>: too big, a different type or colour from what it knows, or offered during the day.</li>
  </ul>
  <h3>What to try, in this order</h3>
  <ol class="r-steps">
    <li>Check temperatures with a probe. A cool hot spot is the most common cause.</li>
    <li>Make the enclosure tighter: smaller tub, more cover, hides that fit snugly.</li>
    <li>Stop handling until it eats again.</li>
    <li>Offer only every 7–14 days. Offering more often makes it worse.</li>
    <li>Offer at night, with the lights off, and leave it in the enclosure for a few hours.</li>
    <li>Change one thing at a time: smaller prey, a mouse instead of a rat, a freshly killed prey item, or warming the prey's head more.</li>
  </ol>

  <form class="r-tool" id="fast-tool" onsubmit="return false">
    <h3>Hunger strike checker</h3>
    <div class="r-tool-grid">
      <label class="field"><span>Weight before the fast (g)</span><input name="w0" type="number" inputmode="numeric" min="30" placeholder="e.g. 1600"></label>
      <label class="field"><span>Weight now (g)</span><input name="w1" type="number" inputmode="numeric" min="30" placeholder="e.g. 1520"></label>
      <label class="field"><span>Weeks since last meal</span><input name="wk" type="number" inputmode="numeric" min="0" max="100" placeholder="e.g. 10"></label>
    </div>
    <fieldset class="r-flags"><legend>Any of these signs?</legend>
      <label><input type="checkbox" name="f"> Wheezing, bubbles or mucus at the nose or mouth</label>
      <label><input type="checkbox" name="f"> Regurgitated a meal recently</label>
      <label><input type="checkbox" name="f"> Spine or ribs visible, skin hanging in folds</label>
      <label><input type="checkbox" name="f"> Sunken eyes or wrinkled skin that stays wrinkled</label>
      <label><input type="checkbox" name="f"> Head tilt, stargazing or rolling over (not a known spider-gene wobble)</label>
      <label><input type="checkbox" name="f"> Mites, swelling, open wounds or a bad smell</label>
    </fieldset>
    <output class="r-out" id="fast-out" aria-live="polite">Enter both weights and the weeks since its last meal.</output>
  </form>
</section>

<section id="r-health">
  <h2>Health problems</h2>
  <div class="r-table-wrap"><table class="r-table r-table-health">
    <thead><tr><th>Problem</th><th>Signs</th><th>Usual cause</th><th>What to do</th></tr></thead>
    <tbody>
      <tr><td><b>Respiratory infection</b><span class="tag tag-vet">Vet</span></td><td>Wheezing, clicking, bubbles at the nose, mouth open</td><td>Too cold, or humid and stale air</td><td>Fix temperatures first. If signs last more than a few days, see a vet; it usually needs antibiotics.</td></tr>
      <tr><td><b>Mites</b><span class="tag tag-soon">Act now</span></td><td>Tiny black or red dots, soaking in the water bowl for days, white flecks on your hands</td><td>Brought in on a new animal or bedding</td><td>Treat the snake and the whole enclosure with a reptile-safe mite product, replace substrate, and check every other animal.</td></tr>
      <tr><td><b>Scale rot / blisters</b><span class="tag tag-vet">Vet if spreading</span></td><td>Brown or red belly scales, blisters</td><td>Substrate that stays wet, dirty enclosure</td><td>Move to dry paper towel, clean daily. See a vet if it spreads or blisters open.</td></tr>
      <tr><td><b>Stuck shed</b><span class="tag tag-ok">Home care</span></td><td>Shed in pieces, skin left on the tail tip or eyes</td><td>Humidity too low</td><td>Humid hide, or a 15–20 minute soak in lukewarm water, then let it crawl through a damp towel. Never pull off eye caps yourself.</td></tr>
      <tr><td><b>Regurgitation</b><span class="tag tag-soon">Watch</span></td><td>Brings up a partly digested meal</td><td>Handled too soon, prey too big, too cold</td><td>Don't feed for 10–14 days, then offer a smaller meal. Twice in a row: see a vet.</td></tr>
      <tr><td><b>Mouth rot</b><span class="tag tag-vet">Vet</span></td><td>Swollen gums, pus, red mouth</td><td>Injury plus poor conditions</td><td>See a vet.</td></tr>
      <tr><td><b>Burns</b><span class="tag tag-vet">Vet</span></td><td>Discoloured, shiny or blistered patches on the belly</td><td>Heat source without a thermostat</td><td>Put a thermostat on the heat source and see a vet.</td></tr>
      <tr><td><b>Neurological signs</b><span class="tag tag-vet">Isolate + vet</span></td><td>Stargazing, rolling, can't right itself</td><td>Can be viral (e.g. IBD, nidovirus)</td><td>Isolate immediately and see a vet. A mild wobble in spider-gene animals is genetic and different.</td></tr>
    </tbody>
  </table></div>
  <p class="muted small">Reptile vets are still rare in Indonesia. Find one before you need one, and ask other keepers or your local reptile community which clinics treat snakes.</p>
</section>

<section id="r-shedding">
  <h2>Shedding</h2>
  <p>Young snakes shed every 4–6 weeks, adults less often. The skin goes dull, the eyes turn milky blue for a few days, then clear again about a week before the shed comes off.</p>
  <ul>
    <li>Raise humidity to 70–80% from the time the eyes go blue.</li>
    <li>Don't handle or feed during this time. Most snakes refuse anyway.</li>
    <li>A good shed comes off in one piece. Check the tail tip and eyes.</li>
  </ul>
</section>

<section id="r-breeding">
  <h2>Breeding in Indonesia</h2>
  <p>Breeding is the part where most mistakes cost an animal its health. Only breed snakes that are well grown and eating reliably.</p>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th></th><th>Minimum weight</th><th>Typical age</th></tr></thead>
    <tbody>
      <tr><td>Female</td><td>1,500 g; 1,800 g+ is safer</td><td>2½–3 years</td></tr>
      <tr><td>Male</td><td>700–800 g</td><td>From about 1 year</td></tr>
    </tbody>
  </table></div>
  <h3>Climate and timing</h3>
  <p>Breeders in temperate countries drop their room temperature for a few months to trigger the season. In Indonesia's steady warmth, many animals cycle without this, but a gentle night drop to around 25–26 °C (for example in an AC room) for 6–8 weeks before and during pairing often helps. Keep the hot spot available so the snakes can digest. Many local breeders pair from roughly the second half of the year into the rainy season; watch your own animals more than the calendar.</p>
  <h3>The season, step by step</h3>
  <ol class="r-steps">
    <li><b>Pairing.</b> Put the female in with the male (or the male in her tub) for a few days, rest him a few days, repeat. Watch for locks, where their tails are joined; one lock can be enough.</li>
    <li><b>Follicles grow.</b> Over weeks the female's lower third gets firm and she may bask on her back or belly-up on the hot spot.</li>
    <li><b>Ovulation.</b> A big swelling in the middle of her body for about 24–48 hours. Write the date down; this is your clock.</li>
    <li><b>Pre-lay shed.</b> About 2–3 weeks after ovulation. Separate her from males now.</li>
    <li><b>Laying.</b> About 28–35 days after the pre-lay shed. Give her a laying box with damp sphagnum moss and leave her alone.</li>
  </ol>
  <div class="r-fig-row">
    ${F('mating', { caption: 'A lock: the pair joined at the tail.', w: 500 })}
    ${F('basking', { caption: 'Inverted basking while follicles grow.', w: 500 })}
    ${F('gravid', { caption: 'Gravid, within a week of laying.', w: 500 })}
  </div>
  <div class="r-callout"><b>After laying:</b> she will be thin. Offer a small meal within a week and feed her every 5–7 days until she's back to her pre-season weight. Don't pair a female two seasons in a row unless she has fully recovered.</div>
</section>

<section id="r-incubation">
  <h2>Eggs and hatchlings</h2>
  <div class="r-table-wrap"><table class="r-table">
    <thead><tr><th>Incubation</th><th>Target</th></tr></thead>
    <tbody>
      <tr><td>Temperature</td><td>31.5–32 °C, held steady</td></tr>
      <tr><td>Humidity around the eggs</td><td>90–100%, without water touching the eggs</td></tr>
      <tr><td>Time to hatch</td><td>About 55–60 days</td></tr>
      <tr><td>Clutch size</td><td>Usually 4–8 eggs</td></tr>
    </tbody>
  </table></div>
  ${F('eggs', { caption: 'A clutch in an incubator. Keep humidity high, but never let water touch the shells.' })}
  <ul>
    <li>Don't turn the eggs. Mark the top with a pencil when you move them, and keep that side up.</li>
    <li><b>Indonesia:</b> the room itself can reach the incubation temperature in the hot season. Use an incubator that can <em>cool</em> as well as heat, or keep it in an air-conditioned room, and put it on a UPS for power cuts.</li>
    <li>Eggs that turn yellow, collapse badly and grow mould are usually infertile. Leave them unless they touch good eggs.</li>
    <li>After the first egg pips (slits open), wait. Babies stay inside 24–48 hours absorbing yolk. Don't pull them out.</li>
    <li>Hatchlings shed for the first time 7–10 days after hatching. Offer the first meal after that shed: a rat pinky or fuzzy of about 10–15% of their weight.</li>
  </ul>
</section>

<section id="r-morphs">
  <h2>Common morphs</h2>
  <p>A morph is a genetic mutation that changes colour or pattern. How it is inherited decides what a pairing produces: <b>recessive</b> genes only show when a snake has two copies (one copy makes it a "het"), while <b>incomplete dominant</b> genes show with one copy and make a "super" form with two.</p>
  <ul class="morphs">
    ${MORPHS.map(([k, name, type, text]) => `<li class="morph">${F(k, { alt: name + ' ball python', w: 500, cls: 'morph-fig' })}<div class="morph-txt"><p class="morph-name">${name} <span class="morph-type">${type}</span></p><p>${text}</p></div></li>`).join('')}
  </ul>
  <p class="muted small">These photos show example animals from other keepers, not Urban Nine stock. Each is credited under its photo.</p>
</section>

          <aside class="r-cta">
            <p><b>Still not sure?</b> Every animal we sell comes with help from us for its whole life. Send a photo and its weight history and we'll look.</p>
            <a class="btn btn-primary" id="r-wa" href="#contact" target="_blank" rel="noopener">Ask us on WhatsApp</a>
          </aside>
        </div>
      </div>
    </article>`;

  /* ---------- tools ---------- */
  function preyTool() {
    const f = $('#prey-tool'), out = $('#prey-out');
    f.w.addEventListener('input', () => {
      const w = parseFloat(f.w.value);
      if (!(w >= 30 && w <= 5000)) { out.innerHTML = 'Enter a weight to see the right prey size and schedule.'; return; }
      const s = stage(w), lo = Math.round(w * s.pct[0] / 100), hi = Math.round(w * s.pct[1] / 100);
      const fits = PREY.filter(([, a, b]) => b >= lo && a <= hi).map(p => p[0]);
      out.innerHTML = `<b>${s.name}.</b> Offer prey of about <b>${lo}–${hi} g</b>${fits.length ? ` (${esc(fits.join(' or ').toLowerCase())})` : ''}, <b>every ${s.every}</b>.`;
    });
  }

  function fastTool() {
    const f = $('#fast-tool'), out = $('#fast-out');
    const run = () => {
      const w0 = parseFloat(f.w0.value), w1 = parseFloat(f.w1.value), wk = parseFloat(f.wk.value);
      const flags = [...f.querySelectorAll('[name=f]')].filter(c => c.checked).length;
      if (flags) return show('vet', 'See a reptile vet', 'One or more red-flag signs means this is likely more than a normal fast. Don\'t wait for the weight to drop.');
      if (!(w0 > 0 && w1 > 0) || isNaN(wk)) return show('', '', 'Enter both weights and the weeks since its last meal.');
      const loss = (w0 - w1) / w0 * 100, l = Math.max(0, Math.round(loss * 10) / 10);
      const young = w0 < 700;
      let level, title, text;
      if (young) {
        if (loss >= 10 || wk >= 6) { level = 'vet'; title = 'Needs attention now'; text = `Young snakes have little reserve. ${l}% weight loss after ${wk} weeks is too much: check temperatures and hides today, and contact a vet or your breeder this week.`; }
        else if (loss >= 5 || wk >= 3) { level = 'watch'; title = 'Watch closely'; text = `${l}% loss so far. Go through the checklist above, offer every 7 days, and weigh again in a week.`; }
        else { level = 'ok'; title = 'Normal so far'; text = `${l}% loss. Keep offering every 7 days and weigh every two weeks.`; }
      } else {
        if (loss >= 15) { level = 'vet'; title = 'See a reptile vet'; text = `${l}% weight loss is more than a healthy fast. Book a vet check even if the snake looks fine.`; }
        else if (loss >= 10) { level = 'watch'; title = 'Watch closely'; text = `${l}% loss after ${wk} weeks. Re-check temperatures and enclosure size, offer every 10–14 days, and weigh every 2 weeks. Over 15% means a vet visit.`; }
        else { level = 'ok'; title = 'Normal fast'; text = `${l}% loss after ${wk} weeks is fine for an adult${wk >= 26 ? ', even though it has been a long time' : ''}. Keep offering every 2–3 weeks and weighing once a month. Seasonal and breeding fasts are common.`; }
      }
      show(level, title, text);
    };
    const show = (level, title, text) => {
      out.className = 'r-out' + (level ? ` r-out-${level}` : '');
      out.innerHTML = title ? `<b>${esc(title)}.</b> ${esc(text)}` : esc(text);
    };
    f.addEventListener('input', run);
  }

  let built = false;
  function build(root, whatsapp) {
    if (!built) { root.innerHTML = html(); preyTool(); fastTool(); built = true; }
    const wa = String(whatsapp || '').replace(/\D/g, '');
    $('#r-wa').href = wa ? `https://wa.me/${wa}?text=${encodeURIComponent('Hi Urban Nine, I have a question about my ball python.')}` : '#contact';
  }

  /* Highlight the section in view in the table of contents. */
  let io;
  function watch() {
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.id.replace(/^r-/, '');
        document.querySelectorAll('.r-toc a').forEach(a => a.toggleAttribute('aria-current', a.dataset.sec === id));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    SECTIONS.forEach(([id]) => { const s = document.getElementById('r-' + id); if (s) io.observe(s); });
  }

  return { build, watch, sections: SECTIONS };
})();

// app.js routes before this file loads; handle a direct visit to #/research.
if (/^#\/research/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
