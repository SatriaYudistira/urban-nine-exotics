/* Gene parsing and placeholder "skin" art for animals without photos. */
window.UNEGenes = (() => {
  /* "Pastel, Clown, 66% het Pied" -> [{kind:'visual',gene:'Pastel'}, …, {kind:'het',gene:'Pied',label:'66% het'}] */
  function parse(str = '') {
    return String(str).split(/[,;\n]+/).map(t => t.trim()).filter(Boolean).map(t => {
      const m = t.match(/^(?:(\d{1,3})\s*%\s*)?(pos(?:sible)?\.?\s+)?het\s+(.+)$/i);
      if (!m) return { kind: 'visual', gene: t };
      const label = m[1] ? `${m[1]}% het` : m[2] ? 'pos het' : 'het';
      return { kind: 'het', gene: m[3].trim(), label };
    });
  }

  function split(str) {
    const all = parse(str);
    const visual = all.filter(g => g.kind === 'visual' && !/^normal$/i.test(g.gene));
    const het = all.filter(g => g.kind === 'het');
    return {
      all, visual, het,
      visualText: visual.length ? visual.map(g => g.gene).join(' ') : 'Normal',
      hetText: het.map(g => `${g.label} ${g.gene}`).join(', ')
    };
  }

  /* Distinct gene names across animals, for the hero line. */
  function morphCount(animals) {
    const s = new Set();
    animals.forEach(a => parse(a.genes).forEach(g => s.add(g.gene.toLowerCase().replace(/\s*\(.*\)/, ''))));
    s.delete('normal');
    return s.size;
  }

  /* ---- placeholder art: a seeded swatch of python pattern tinted by visual genes ---- */
  function seed(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function look(visualGenes) {
    const g = visualGenes.map(x => x.gene.toLowerCase()).join(' ');
    const blueEye = ['lesser', 'mojave', 'butter', 'russo', 'phantom', 'special'].filter(k => g.includes(k)).length >= 2 || /\bbel\b|blue.?eyed|super (lesser|mojave|butter|russo)/.test(g);
    let dark = '#3d2a19', light = '#b4864a', ground = '#7a5530';
    if (/pastel|enchi|yellow ?belly|lemon|fire|vanilla|cinnamon/.test(g)) { dark = '#5a3d17'; light = '#e1b33f'; ground = '#a8792c'; }
    if (/cinnamon|black ?pastel/.test(g) && !/pastel,/.test(g)) { dark = '#2e2018'; }
    if (/banana|coral glow/.test(g)) { dark = '#a98aa6'; light = '#f1d58e'; ground = '#e3bf7c'; }
    if (/axanthic|ghost|hypo|black ?head/.test(g)) { dark = '#2a2b2c'; light = '#a7a7a2'; ground = '#6d6e6b'; }
    if (/albino|candy|toffee/.test(g)) { dark = '#f3ead6'; light = '#f2c348'; ground = '#f7e2a8'; }
    return { dark, light, ground, blueEye, clown: /clown/.test(g), pied: /pied/.test(g), pin: /pinstripe/.test(g) };
  }

  function art(id, genesStr) {
    const r = rng(seed(id || 'x'));
    const L = look(split(genesStr).visual);
    const p = [];
    if (L.blueEye) {
      p.push(`<rect width="400" height="400" fill="#f2efe8"/><g opacity=".08" fill="#8a7f6a">`);
      for (let i = 0; i < 18; i++) p.push(`<ellipse cx="${r() * 400}" cy="${r() * 400}" rx="${40 + r() * 60}" ry="${20 + r() * 30}"/>`);
      p.push('</g>');
    } else {
      p.push(`<rect width="400" height="400" fill="${L.ground}"/>`);
      p.push('<g transform="rotate(-24 200 200)">');
      if (L.clown) {
        p.push(`<rect x="-200" y="-200" width="800" height="800" fill="${L.light}"/>`);
        p.push(`<rect x="172" y="-200" width="56" height="800" fill="${L.dark}"/>`);
        for (let i = 0; i < 6; i++) p.push(`<ellipse cx="${60 + r() * 60}" cy="${-60 + i * 100 + r() * 30}" rx="${8 + r() * 10}" ry="${16 + r() * 12}" fill="${L.dark}" opacity=".7"/><ellipse cx="${280 + r() * 60}" cy="${-30 + i * 100 + r() * 30}" rx="${8 + r() * 10}" ry="${16 + r() * 12}" fill="${L.dark}" opacity=".7"/>`);
      } else {
        p.push(`<rect x="-200" y="-200" width="800" height="800" fill="${L.dark}"/>`);
        for (let row = -1; row < 9; row++) {
          for (let col = -1; col < 5; col++) {
            const cx = col * 110 + (row % 2) * 55 + r() * 24, cy = row * 62 + r() * 18;
            const rx = 34 + r() * 22, ry = 20 + r() * 10;
            p.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${L.light}"/>`);
            if (!L.pin) p.push(`<ellipse cx="${cx + r() * 6}" cy="${cy}" rx="${rx * .32}" ry="${ry * .38}" fill="${L.dark}" opacity=".85"/>`);
          }
        }
        if (L.pin) p.push(`<rect x="196" y="-200" width="8" height="800" fill="${L.dark}"/>`);
      }
      p.push('</g>');
      if (L.pied) {
        p.push('<g fill="#f6f3ec">');
        for (let i = 0; i < 5; i++) p.push(`<path d="M${r() * 400} ${-20} C ${r() * 400} ${100 + r() * 60}, ${r() * 400} ${220 + r() * 60}, ${r() * 400} 420 L ${300 + r() * 120} 420 C ${300 + r() * 100} 300, ${260 + r() * 140} 140, ${280 + r() * 120} -20 Z" opacity="${.9 + r() * .1}"/>`);
        p.push('</g>');
      }
    }
    // scale texture
    p.push('<defs><pattern id="s" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 Q5 -1 10 4 Q5 9 0 4Z" fill="none" stroke="#000" stroke-width=".6" opacity=".18"/></pattern></defs><rect width="400" height="400" fill="url(#s)"/>');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">${p.join('')}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  return { parse, split, morphCount, art };
})();
