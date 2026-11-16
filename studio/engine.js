/* Poster engine: draws a finished poster from words and choices.
   The layouts and pictures here are designed and checked by hand, so the result does not
   depend on a chat assistant's drawing. An assistant (or a person) supplies only the words.

   makePoster({ kind, headline, line, points[], picture, layout, format, when, time, where, tag })
     -> one complete HTML file, in the house look.                                              */
(function () {
  const INK = '#3d3c38', GROUND = '#faf8f2', ORANGE = '#ff612b'

  /* ---------- pictures: solid charcoal, round ends ---------- */
  const arm = (sx, sy, ex, ey, wx, wy) => {
    const len = Math.hypot(wx - ex, wy - ey), dx = (wx - ex) / len, dy = (wy - ey) / len
    const f = (v) => v.toFixed(1)
    return `<path d="M${f(sx)} ${f(sy)} L${f(ex)} ${f(ey)} L${f(wx)} ${f(wy)}" stroke="${INK}" stroke-width="5.6" fill="none"/>`
      + `<path d="M${f(wx + dx * 1.2)} ${f(wy + dy * 1.2)} L${f(wx + dx * 5.4)} ${f(wy + dy * 5.4)}" stroke="${INK}" stroke-width="6.9" fill="none"/>`
  }
  /* one standing figure: c = centre x, dy = how much shorter, arms = [elbow x, elbow y, wrist x, wrist y] from the centre */
  const person = (c, dy, armL, armR) => {
    const y = (v) => v + dy
    let s = ''
    if (armL) s += arm(c - 9.6, y(76), c + armL[0], y(armL[1]), c + armL[2], y(armL[3]))
    if (armR) s += arm(c + 9.6, y(76), c + armR[0], y(armR[1]), c + armR[2], y(armR[3]))
    s += `<path d="M${c - 13.4} 113 L${c - 14} ${y(80)} C${c - 14} ${y(73.4)} ${c - 10.4} ${y(69.6)} ${c - 4} ${y(69.6)} H${c + 4} C${c + 10.4} ${y(69.6)} ${c + 14} ${y(73.4)} ${c + 14} ${y(80)} L${c + 13.4} 113 Z" fill="${INK}"/>`
    s += `<circle cx="${c}" cy="${y(58.4)}" r="7.2" fill="${INK}"/>`
    return s
  }
  const headsetOn = (c, dy) => `<path d="M${c - 5.8} ${73.4 + dy} C${c - 5.2} ${80.6 + dy} ${c + 5.2} ${80.6 + dy} ${c + 5.8} ${73.4 + dy}" stroke="${GROUND}" stroke-width="1.7" fill="none"/><rect x="${c - 8.4}" y="${69.8 + dy}" width="5" height="7.2" rx="2.5" fill="${GROUND}"/><rect x="${c + 3.4}" y="${69.8 + dy}" width="5" height="7.2" rx="2.5" fill="${GROUND}"/>`
  const sparks = (x, yy) => `<path d="M${x} ${yy} v-3.6 M${x - 4.6} ${yy + 1.4} l-1.8 -2.8 M${x + 4.6} ${yy + 1.4} l1.8 -2.8" stroke="${INK}" stroke-width="1.2" fill="none"/>`

  const PICTURES = {
    /* people stand on the band; the viewBox is in the scene's own units */
    highfive: { stand: true, vb: '40 26 80 87', right: -20, w: 80, h: 87, name: 'High five',
      svg: person(60, 0, null, [5.6, 61.2, 18.2, 47.6]) + headsetOn(60, 0) + `<path d="M51.6 83 L52 113" stroke="${GROUND}" stroke-width="1.1"/>`
        + person(101, 0, [-13, 61.2, -15.4, 47.6], null) + sparks(82.3, 33.6) },
    team: { stand: true, vb: '22 26 88 87', right: -2, w: 64, h: 63.3, name: 'Team of three',
      svg: person(45, 6, [-15, 62, -17.6, 48], null) + person(87, 6, null, [15, 62, 17.6, 48])
        + `<g stroke="${GROUND}" stroke-width="1.6" paint-order="stroke">` + person(66, 0, [-13.6, 61, -12.6, 46], [13.6, 61, 12.6, 46]) + `</g>`
        + headsetOn(66, 0) + sparks(66, 31.6) },
    headset: { vb: '0 0 200 200', name: 'Headset',
      svg: `<path d="M38 118 V98 a62 62 0 0 1 124 0 v20" fill="none" stroke="${INK}" stroke-width="14"/><rect x="22" y="104" width="32" height="54" rx="15" fill="${INK}"/><rect x="146" y="104" width="32" height="54" rx="15" fill="${INK}"/><path d="M163 156 v8 a28 28 0 0 1 -28 28 h-20" fill="none" stroke="${INK}" stroke-width="10"/><rect x="92" y="183" width="26" height="15" rx="7.5" fill="${INK}"/>` },
    lock: { vb: '-20 -4 240 248', name: 'Padlock',
      svg: `<path d="M52 108 V78 a48 48 0 0 1 96 0 v30" fill="none" stroke="${INK}" stroke-width="22"/><rect x="18" y="104" width="164" height="128" rx="26" fill="${INK}"/><circle cx="100" cy="158" r="15" fill="${ORANGE}"/><rect x="92" y="160" width="16" height="38" rx="8" fill="${ORANGE}"/>` },
    megaphone: { vb: '0 0 200 200', name: 'Megaphone',
      svg: `<g transform="rotate(-14 100 100)"><rect x="54" y="112" width="22" height="56" rx="10" fill="${INK}"/><path d="M36 84 h34 l72 -38 v108 l-72 -38 h-34 z" fill="${INK}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><rect x="140" y="34" width="15" height="132" rx="7.5" fill="${INK}"/><path d="M172 80 q13 20 0 40 M186 64 q24 36 0 72" fill="none" stroke="${INK}" stroke-width="8"/></g>` },
    question: { vb: '0 0 200 200', name: 'Question mark',
      svg: `<text x="104" y="176" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-weight="500" font-size="232" fill="${INK}">?</text>` },
    trophy: { vb: '0 0 200 200', name: 'Trophy',
      svg: `<path d="M62 50 h-15 c-4 27 7 41 22 45 M138 50 h15 c4 27 -7 41 -22 45" fill="none" stroke="${INK}" stroke-width="9"/><path d="M60 36 h80 v42 c0 29 -17 47 -40 47 s-40 -18 -40 -47 z" fill="${INK}"/><rect x="52" y="27" width="96" height="15" rx="7.5" fill="${INK}"/><rect x="91" y="120" width="18" height="30" fill="${INK}"/><rect x="66" y="146" width="68" height="20" rx="8" fill="${INK}"/><rect x="54" y="163" width="92" height="16" rx="7" fill="${INK}"/><path d="M100 57 L103.7 66.9 L114.3 67.4 L106 73.9 L108.8 84.1 L100 78.3 L91.2 84.1 L94 73.9 L85.7 67.4 L96.3 66.9 Z" fill="${GROUND}"/>` },
    calendar: { vb: '0 0 200 200', name: 'Calendar',
      svg: `<rect x="30" y="44" width="140" height="134" rx="20" fill="${INK}"/><rect x="60" y="24" width="16" height="40" rx="8" fill="${INK}" stroke="${GROUND}" stroke-width="4"/><rect x="124" y="24" width="16" height="40" rx="8" fill="${INK}" stroke="${GROUND}" stroke-width="4"/><rect x="45" y="86" width="110" height="78" rx="9" fill="${GROUND}"/><g fill="${INK}"><circle cx="68" cy="108" r="7.5"/><circle cx="100" cy="108" r="7.5"/><circle cx="132" cy="108" r="7.5"/><circle cx="68" cy="140" r="7.5"/><circle cx="100" cy="140" r="7.5"/></g><path d="M122 140 l7.5 7.5 l13 -15" fill="none" stroke="${INK}" stroke-width="6.5"/>` },
    cup: { vb: '0 0 200 200', name: 'Cup',
      svg: `<path d="M76 26 q-9 12 0 24 t0 24 M100 20 q-9 13 0 26 t0 26 M124 26 q-9 12 0 24 t0 24" fill="none" stroke="${INK}" stroke-width="7"/><path d="M146 106 h12 c20 0 20 46 0 46 h-14" fill="none" stroke="${INK}" stroke-width="11"/><path d="M48 92 h100 v46 c0 28 -19 42 -50 42 s-50 -14 -50 -42 z" fill="${INK}"/><rect x="36" y="182" width="124" height="11" rx="5.5" fill="${INK}"/>` },
    clock: { vb: '0 0 200 200', name: 'Clock',
      svg: `<circle cx="100" cy="104" r="84" fill="${INK}"/><circle cx="100" cy="104" r="64" fill="${GROUND}"/><path d="M100 104 V60 M100 104 L130 121" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="100" cy="104" r="8" fill="${INK}"/><rect x="88" y="6" width="24" height="18" rx="6" fill="${INK}"/>` },
  }

  const KINDS = {
    'Team building': { tag: 'Team building', pictures: ['highfive', 'team'], layouts: ['ring', 'split', 'sun', 'badge', 'arc', 'column', 'disc'] },
    'Town hall': { tag: 'Town hall', pictures: ['megaphone', 'question', 'team'], layouts: ['ring', 'number', 'arc', 'split', 'column', 'disc', 'badge'] },
    'Call habit': { tag: 'Every call', pictures: ['headset'], layouts: ['disc', 'steps', 'split', 'word', 'ring', 'column', 'arc'] },
    Privacy: { tag: 'Privacy', pictures: ['lock'], layouts: ['disc', 'steps', 'badge', 'split', 'ring', 'arc', 'word'] },
    Recognition: { tag: 'Recognition', pictures: ['trophy', 'highfive'], layouts: ['badge', 'sun', 'split', 'ring', 'arc', 'disc'] },
    Wellbeing: { tag: 'Wellbeing', pictures: ['cup', 'clock'], layouts: ['ring', 'split', 'badge', 'arc', 'disc', 'sun', 'column'] },
    Notice: { tag: 'Notice', pictures: ['calendar', 'clock', 'megaphone'], layouts: ['disc', 'number', 'column', 'split', 'arc', 'ring', 'steps'] },
  }
  /* each style gives every colour a job; the orange shape never changes */
  const STYLES = {
    light: { name: 'Light', ground: GROUND, ink: INK, tint: '#dff3f9', link: '#095f87', band: '#dff3f9', bandInk: INK, bandLink: '#095f87' },
    dark: { name: 'Dark', ground: INK, ink: GROUND, tint: '#55534d', link: '#a9dcec', band: '#dff3f9', bandInk: INK, bandLink: '#095f87' },
    sky: { name: 'Sky', ground: '#dff3f9', ink: INK, tint: GROUND, link: '#095f87', band: GROUND, bandInk: INK, bandLink: '#095f87' },
  }
  const LAYOUTS = { ring: 'Ring right', disc: 'Corner disc', sun: 'Rising disc', word: 'Big word', number: 'Big number',
    split: 'Split panel', column: 'Side column', badge: 'Centre badge', steps: 'Numbered steps', arc: 'Corner arc' }
  const FORMATS = { a3: [1123, 1587], a4: [794, 1123], landscape: [1920, 1080], 'ig-portrait': [1080, 1350], 'ig-square': [1080, 1080], story: [1080, 1920] }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  /* headline into lines: sentences first, then by words to a width */
  function breakLines(text, max) {
    const out = []
    for (const sentence of text.trim().split(/(?<=[.!?])\s+/)) {
      let line = ''
      for (const w of sentence.split(/\s+/)) {
        if (line && (line + ' ' + w).replace(/\*/g, '').length > max) { out.push(line); line = w } else line = line ? line + ' ' + w : w
      }
      if (line) out.push(line)
    }
    // never leave one short word alone on the last line
    if (out.length > 1 && out[out.length - 1].replace(/\*/g, '').length <= 3) { const last = out.pop(); out[out.length - 1] += ' ' + last }
    return out
  }
  const emph = (line) => esc(line).replace(/\*([^*]+)\*/g, '<em>$1</em>')

  function makePoster(d) {
    const kind = KINDS[d.kind] ? d.kind : 'Notice'
    const K = KINDS[kind]
    const [pw, ph] = FORMATS[d.format] || FORMATS.a3
    const short = Math.min(pw, ph), W = (pw / short) * 100, H = (ph / short) * 100   // sheet in u
    const land = pw > ph * 1.1
    let layout = LAYOUTS[d.layout] ? d.layout : K.layouts[0]
    let picKey = d.picture === 'none' ? null : (PICTURES[d.picture] ? d.picture : K.pictures[0])
    const number = ((d.when || '').match(/\d{1,2}/) || [])[0]
    const points = (d.points || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 3)
    if (layout === 'number' && !number) layout = K.layouts[0] === 'number' ? 'ring' : K.layouts[0]
    if (layout === 'steps' && points.length < 2) layout = 'word'
    if (land) layout = { column: 'ring', badge: 'ring', steps: 'word', arc: 'disc' }[layout] || layout   // wide screens have their own versions
    if (layout === 'word' || layout === 'number' || layout === 'steps') picKey = null
    const pic = picKey ? PICTURES[picKey] : null
    const styleKey = STYLES[d.style] ? d.style : 'light'
    const T = STYLES[styleKey]
    /* pictures are drawn in charcoal with warm-white details; on a dark sheet the two swap */
    const paint = (svg) => styleKey === 'dark' ? svg.split(INK).join('@@').split(GROUND).join(INK).split('@@').join(GROUND) : styleKey === 'sky' ? svg.split(GROUND).join(T.ground) : svg

    /* ---- headline ---- */
    let head = (d.headline || '').trim() || K.tag
    if (!/\*/.test(head) && d.emphasis !== 'none') {       // one word in the serif italic: the last one
      head = head.replace(/(\S+)\s*$/, '*$1*')
    }
    const band = (land || layout === 'column') ? 0 : H < 115 ? 21 : H < 135 ? 24 : 27
    const PH = Math.max(30, Math.min(70, H - band - 64))                 // split: height of the orange panel
    /* per layout: width for the headline, height it may take, largest size, characters per line */
    const M = land
      ? { w: layout === 'word' ? 120 : layout === 'split' ? 88 : 100, room: layout === 'word' ? 52 : 44, cap: layout === 'word' ? 19 : 15, max: 16 }
      : ({
        ring: { w: 86, room: 31, cap: 15.5, max: 13 }, disc: { w: 86, room: 31, cap: 15.5, max: 13 }, number: { w: 86, room: 31, cap: 15.5, max: 13 },
        sun: { w: 86, room: 33, cap: 15.5, max: 13 }, word: { w: 90, room: H - band - 62, cap: 25, max: 11 },
        split: { w: 86, room: H - band - PH - 34, cap: 13.5, max: 15 }, column: { w: 50, room: 46, cap: 11.5, max: 10 },
        badge: { w: 86, room: 24, cap: 12.5, max: 16 }, steps: { w: 86, room: 35, cap: 14.5, max: 13 }, arc: { w: 86, room: 34, cap: 15.5, max: 13 },
      })[layout]
    const lines = breakLines(head, M.max)
    const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length))
    const hs = Math.max(6, Math.min(M.cap, M.w / (0.5 * longest), M.room / (lines.length * 0.92)))

    /* ---- scene ---- */
    let sc = land ? 1 : Math.max(0.58, Math.min(1.3, (H - band - 40) / 73))
    if (layout === 'column') sc = Math.min(sc, points.length ? 0.8 : 1)
    if (d.style === 'dark' && !land) sc *= 0.9                           // white type on orange is hard to read, so the shape steps back
    const k = Math.max(0.5, Math.min(1.05, (H - band - 46) / 92))         // badge: the size of the centred ring
    const standBox = pic && pic.stand
      ? `<span class="hole"><svg class="pic stand" viewBox="${pic.vb}" preserveAspectRatio="xMidYMax meet" style="--pr:${pic.right};--pw:${pic.w};--pp:${pic.h}" stroke-linecap="round" stroke-linejoin="round">${paint(pic.svg)}</svg></span>` : ''
    const objBox = pic && !pic.stand
      ? `<svg class="pic obj" viewBox="${pic.vb}" preserveAspectRatio="xMidYMid meet" stroke-linecap="round" stroke-linejoin="round">${paint(pic.svg)}</svg>` : ''
    const numBox = layout === 'number' ? `<div class="num" data-bleed aria-hidden="true">${esc(number)}</div>` : ''
    const scene = `<div class="scene" data-decor style="--sc:${sc.toFixed(3)};--k:${k.toFixed(3)};--ph:${PH.toFixed(1)}"><span class="sky"></span><span class="halo"></span><span class="shape"></span>${standBox}${objBox}</div>${numBox}`

    /* ---- words ---- */
    const facts = [['When', d.when], ['Time', d.time], ['Where', d.where]]
    const tag = (d.tag || K.tag).trim()
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(head.replace(/\*/g, ''))}</title>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;700;800&family=Newsreader:ital,wght@1,500&display=swap" rel="stylesheet">
<style>
:root{--u:1vmin;--margin:calc(7*var(--u));--cols:12;--ground:${T.ground};--ink:${T.ink};--accent:${ORANGE};--tint:${T.tint};--link:${T.link};--bandbg:${T.band};--bandink:${T.bandInk};--bandlink:${T.bandLink};--band:calc(${band}*var(--u));--hs:calc(${hs.toFixed(2)}*var(--u))}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100vw;height:100vh;overflow:hidden;background:var(--ground)}
body{font-family:'Figtree','Segoe UI',Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
.poster{position:relative;width:100vw;height:100vh;overflow:hidden}
.band{position:absolute;left:0;right:0;bottom:0;height:var(--band);background:var(--bandbg);z-index:2}
/* the scene: one coordinate system in u, standing on the band, anchored bottom right */
.scene{position:absolute;right:0;bottom:var(--band);width:calc(100*var(--u));height:calc(120*var(--u));transform:scale(var(--sc));transform-origin:100% 100%;z-index:1}
.scene>*{position:absolute}
.shape{border-radius:50%}
.halo{border-radius:50%;border:calc(.3*var(--u)) solid var(--ink);opacity:.55}
.sky{border-radius:50%;background:var(--tint);display:none}
.pic{position:absolute;display:block;overflow:visible}
.hole{display:contents}
.pic.stand{bottom:0;right:calc(var(--pr)*var(--u));width:calc(var(--pw)*var(--u));height:calc(var(--pp)*var(--u))}
.num{position:absolute;z-index:1;font-weight:800;letter-spacing:-.06em;line-height:.8;color:var(--ink)}
/* words */
.text{position:absolute;z-index:3;left:var(--margin);right:var(--margin);top:var(--margin);bottom:calc(var(--band) + 5*var(--u));display:flex;flex-direction:column;align-items:flex-start}
.tag{font-size:calc(1.9*var(--u));font-weight:700;letter-spacing:.13em;text-transform:uppercase;border:calc(.34*var(--u)) solid var(--ink);border-radius:calc(9*var(--u));padding:calc(.95*var(--u)) calc(2.3*var(--u)) calc(.85*var(--u))}
.head{margin-top:calc(4.2*var(--u));font-size:var(--hs);font-weight:800;line-height:.92;letter-spacing:-.04em;white-space:nowrap}
.head em{font-family:'Newsreader',Georgia,serif;font-weight:500;font-style:italic;letter-spacing:-.02em}
.support{font-size:calc(3.2*var(--u));font-weight:500;line-height:1.3;max-width:calc(var(--sw)*var(--u))}
.points{list-style:none;counter-reset:n;max-width:calc(var(--sw)*var(--u));width:100%}
.points li{counter-increment:n;display:grid;grid-template-columns:calc(5.4*var(--u)) 1fr;align-items:baseline;border-top:calc(.36*var(--u)) solid var(--ink);padding:calc(1.35*var(--u)) 0;font-size:calc(2.75*var(--u));font-weight:700;line-height:1.15}
.points li:last-child{border-bottom:calc(.36*var(--u)) solid var(--ink)}
.points li::before{content:"0" counter(n);font-size:calc(1.8*var(--u));font-weight:800;letter-spacing:.1em;color:var(--link)}
.low{margin-top:auto;display:flex;flex-direction:column;gap:calc(2.6*var(--u));width:100%}
.facts{--fi:var(--bandink);--fl:var(--bandlink);position:absolute;z-index:3;left:var(--margin);right:var(--margin);bottom:calc(4.6*var(--u));list-style:none;display:grid;grid-template-columns:1.25fr .9fr 1.25fr;column-gap:calc(3*var(--u))}
.facts li{color:var(--fi);border-top:calc(.4*var(--u)) solid var(--fi);padding-top:calc(1.3*var(--u));min-height:calc(var(--band) - 11.5*var(--u));font-size:calc(3.1*var(--u));font-weight:700;line-height:1.12}
.facts b{display:block;font-size:calc(1.85*var(--u));font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--fl);margin-bottom:calc(.7*var(--u))}
${LAYOUT_CSS[layout]}
${land ? LAND_CSS[layout] || LAND_CSS.ring : ''}
</style>
</head>
<body>
<main class="poster L-${layout}${land ? ' land' : ''}${pic && pic.stand ? ' stand' : ''}">
${band || layout === 'column' ? '<div class="band" data-decor></div>' : ''}
${scene}
<div class="text" style="--ph:${PH.toFixed(1)};--k:${k.toFixed(3)}">
<p class="tag">${esc(tag)}</p>
<h1 class="head">${lines.map(emph).join('<br>')}</h1>
<div class="low">
${d.line ? `<p class="support">${esc(d.line.trim())}</p>` : ''}
${points.length ? `<ol class="points">${points.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
</div>
</div>
<ul class="facts">${facts.map(([k, v]) => `<li><b>${k}</b>${v && v.trim() ? esc(v.trim()) : ''}</li>`).join('')}</ul>
</main>
</body>
</html>`
    return { html, layout, picture: picKey, style: styleKey, lines }
  }

  /* ---------- layouts (portrait and square) ---------- */
  const LAYOUT_CSS = {
    /* a thick ring cropped by the right edge; people stand in it, objects sit in it */
    ring: `
.shape{width:calc(92*var(--u));height:calc(92*var(--u));border:calc(13*var(--u)) solid var(--accent);right:calc(-28*var(--u));bottom:calc(-13*var(--u))}
.halo{width:calc(102*var(--u));height:calc(102*var(--u));right:calc(-33*var(--u));bottom:calc(-18*var(--u))}
.pic.obj{width:calc(42*var(--u));height:calc(42*var(--u));right:calc(5*var(--u));bottom:calc(12*var(--u))}
.text{--sw:25}`,
    /* a solid disc cropped by the corner, the picture on it */
    disc: `
.shape{width:calc(96*var(--u));height:calc(96*var(--u));background:var(--accent);right:calc(-34*var(--u));bottom:calc(-26*var(--u))}
.halo{width:calc(106*var(--u));height:calc(106*var(--u));right:calc(-39*var(--u));bottom:calc(-31*var(--u))}
.pic.obj{width:calc(40*var(--u));height:calc(40*var(--u));right:calc(7*var(--u));bottom:calc(11*var(--u))}
.text{--sw:27}`,
    /* half a disc rising from the band like a sun, the picture standing on it */
    sun: `
.shape{width:calc(116*var(--u));height:calc(116*var(--u));background:var(--accent);right:calc(-16*var(--u));bottom:calc(-70*var(--u))}
.halo{width:calc(126*var(--u));height:calc(126*var(--u));right:calc(-21*var(--u));bottom:calc(-75*var(--u))}
.sky{display:block;width:calc(20*var(--u));height:calc(20*var(--u));right:calc(8*var(--u));bottom:calc(66*var(--u))}
.pic.stand{right:calc(4*var(--u)) !important;height:calc(70*var(--u));width:calc(64*var(--u))}
.pic.obj{width:calc(38*var(--u));height:calc(38*var(--u));right:calc(16*var(--u));bottom:calc(27*var(--u))}
.low{margin-top:calc(3.4*var(--u))}
.text{--sw:36}`,
    /* no picture: the headline is the picture, with the ring behind its end */
    word: `
.shape{width:calc(76*var(--u));height:calc(76*var(--u));border:calc(12*var(--u)) solid var(--accent);right:calc(-34*var(--u));bottom:calc(-24*var(--u))}
.halo{width:calc(86*var(--u));height:calc(86*var(--u));right:calc(-39*var(--u));bottom:calc(-29*var(--u))}
.text{--sw:38}`,
    /* the date as the picture */
    number: `
.shape{width:calc(88*var(--u));height:calc(88*var(--u));background:var(--accent);right:calc(-24*var(--u));bottom:calc(-12*var(--u))}
.halo{width:calc(98*var(--u));height:calc(98*var(--u));right:calc(-29*var(--u));bottom:calc(-17*var(--u))}
.num{right:calc(2*var(--u));bottom:calc(var(--band) + 1*var(--u));font-size:calc(66*var(--u))}
.text{--sw:27}`,
    /* the top of the sheet is one orange panel with the picture on it; the words sit below */
    split: `
.scene{left:0;right:0;top:0;bottom:auto;width:auto;height:calc(var(--ph)*var(--u));transform:none;overflow:hidden;background:var(--accent);border-radius:0 0 0 calc(18*var(--u))}
.shape{display:none}
.halo{width:calc(84*var(--u));height:calc(84*var(--u));right:calc(-30*var(--u));top:calc(-44*var(--u));border-color:var(--ground);opacity:.7}
.pic.stand{right:auto !important;left:50%;transform:translateX(-50%);bottom:0;height:90%;width:auto;aspect-ratio:80/87}
.pic.obj{left:50%;top:50%;transform:translate(-50%,-50%);height:64%;width:auto;aspect-ratio:1}
.text{top:calc(var(--ph)*var(--u) + 5*var(--u));--sw:62}
.low{margin-top:calc(3*var(--u))}`,
    /* a full-height column on the left holds the label and the facts; the ring sits bottom right */
    column: `
.band{top:0;bottom:0;right:auto;width:calc(34*var(--u));height:auto}
.scene{bottom:0}
.shape{width:calc(92*var(--u));height:calc(92*var(--u));border:calc(13*var(--u)) solid var(--accent);right:calc(-28*var(--u));bottom:calc(-13*var(--u))}
.halo{width:calc(102*var(--u));height:calc(102*var(--u));right:calc(-33*var(--u));bottom:calc(-18*var(--u))}
.pic.obj{width:calc(42*var(--u));height:calc(42*var(--u));right:calc(5*var(--u));bottom:calc(12*var(--u))}
.text{left:calc(41*var(--u));bottom:var(--margin);--sw:34}
.tag{position:absolute;left:calc(-34*var(--u));top:0;color:var(--bandink);border-color:var(--bandink)}
.head{margin-top:0}
.low{margin-top:calc(3.4*var(--u))}
.facts{right:auto;width:calc(21*var(--u));bottom:var(--margin);grid-template-columns:1fr;row-gap:calc(3.2*var(--u))}
.facts li{min-height:calc(8.6*var(--u));font-size:calc(2.9*var(--u))}`,
    /* the whole ring, centred, with the picture inside it; everything else centred under it */
    badge: `
.scene{left:0;right:0;top:calc(15*var(--u));bottom:auto;width:auto;height:calc(72*var(--u)*var(--k));transform:none}
.shape{left:50%;top:0;width:calc(68*var(--u)*var(--k));height:calc(68*var(--u)*var(--k));margin-left:calc(-34*var(--u)*var(--k));border:calc(10.5*var(--u)*var(--k)) solid var(--accent)}
.halo{left:50%;top:calc(-5*var(--u)*var(--k));width:calc(78*var(--u)*var(--k));height:calc(78*var(--u)*var(--k));margin-left:calc(-39*var(--u)*var(--k))}
.hole{display:block;position:absolute;left:50%;top:calc(10.5*var(--u)*var(--k));width:calc(47*var(--u)*var(--k));height:calc(47*var(--u)*var(--k));margin-left:calc(-23.5*var(--u)*var(--k));border-radius:50%;overflow:hidden}
.hole .pic.stand{right:auto !important;left:50%;transform:translateX(-50%);bottom:calc(-2*var(--u)*var(--k));height:calc(45*var(--u)*var(--k));width:calc(41.4*var(--u)*var(--k))}
.pic.obj{left:50%;top:calc(17*var(--u)*var(--k));width:calc(34*var(--u)*var(--k));height:calc(34*var(--u)*var(--k));margin-left:calc(-17*var(--u)*var(--k))}
.text{align-items:center;text-align:center;--sw:70}
.head{margin-top:calc(83*var(--u)*var(--k))}
.low{margin-top:calc(3*var(--u));align-items:center}
.points{text-align:left}`,
    /* no picture: three numbered steps are the poster, with the ring in the top corner */
    steps: `
.scene{top:0;bottom:auto;height:calc(60*var(--u));transform:none}
.shape{width:calc(58*var(--u));height:calc(58*var(--u));border:calc(9.5*var(--u)) solid var(--accent);right:calc(-20*var(--u));top:calc(-28*var(--u))}
.halo{width:calc(68*var(--u));height:calc(68*var(--u));right:calc(-25*var(--u));top:calc(-33*var(--u))}
.head{margin-top:calc(21*var(--u))}
.text{--sw:86}
.support{max-width:calc(60*var(--u))}
.points{max-width:none}
.points li{grid-template-columns:calc(14*var(--u)) 1fr;align-items:center;font-size:calc(3.6*var(--u));padding:calc(2.2*var(--u)) 0;line-height:1.1}
.points li::before{font-size:calc(8.6*var(--u));letter-spacing:-.05em;color:var(--ink);line-height:1}`,
    /* a disc in the top corner holds the picture; the headline sits at the foot */
    arc: `
.scene{top:0;bottom:auto;transform-origin:100% 0}
.shape{width:calc(96*var(--u));height:calc(96*var(--u));background:var(--accent);right:calc(-30*var(--u));top:calc(-34*var(--u))}
.halo{width:calc(106*var(--u));height:calc(106*var(--u));right:calc(-35*var(--u));top:calc(-39*var(--u))}
.hole{display:block;position:absolute;right:calc(-30*var(--u));top:calc(-34*var(--u));width:calc(96*var(--u));height:calc(96*var(--u));border-radius:50%;overflow:hidden}
.hole .pic.stand{right:auto !important;left:calc(8*var(--u));bottom:calc(-3*var(--u));height:calc(58*var(--u));width:calc(53*var(--u))}
.pic.obj{right:calc(9*var(--u));top:calc(9*var(--u));width:calc(38*var(--u));height:calc(38*var(--u))}
.tag{margin-bottom:auto}
.head{margin-top:0}
.low{margin-top:calc(3*var(--u))}
.text{--sw:60}`,
  }

  /* ---------- wide screens (16:9): the ring fills the right, no band, facts along the foot ---------- */
  const wide = (shape, obj, extra) => `
.scene{bottom:0;width:calc(100*var(--u));height:calc(100*var(--u));transform:none}
${shape}
.pic.obj{${obj}}
.pic.stand{right:calc(6*var(--u)) !important;bottom:0;height:calc(70*var(--u));width:calc(64*var(--u))}
.text{bottom:calc(27*var(--u));right:calc(86*var(--u));--sw:66}
.low{margin-top:calc(3.6*var(--u))}
.facts{--fi:var(--ink);--fl:var(--link);right:auto;width:calc(98*var(--u));bottom:var(--margin)}
.facts li{min-height:calc(11*var(--u))}
${extra || ''}`
  const LAND_CSS = {
    split: `
.scene{left:auto;right:0;top:0;bottom:0;width:42vw;height:auto;transform:none;overflow:hidden;background:var(--accent);border-radius:calc(18*var(--u)) 0 0 calc(18*var(--u))}
.shape{display:none}
.halo{width:calc(84*var(--u));height:calc(84*var(--u));right:calc(-30*var(--u));top:calc(-44*var(--u));border-color:var(--ground);opacity:.7}
.pic.stand{right:auto !important;left:50%;transform:translateX(-50%);bottom:0;height:78%;width:auto;aspect-ratio:80/87}
.pic.obj{left:50%;top:50%;transform:translate(-50%,-50%);height:50%;width:auto;aspect-ratio:1}
.text{top:var(--margin);bottom:calc(27*var(--u));right:calc(42vw + 6*var(--u));--sw:66}
.low{margin-top:calc(3.6*var(--u))}
.facts{--fi:var(--ink);--fl:var(--link);right:auto;width:calc(92*var(--u));bottom:var(--margin)}
.facts li{min-height:calc(11*var(--u))}`,
    ring: wide(`.shape{width:calc(112*var(--u));height:calc(112*var(--u));border:calc(15*var(--u)) solid var(--accent);right:calc(-36*var(--u));bottom:calc(-4*var(--u))}
.halo{width:calc(132*var(--u));height:calc(132*var(--u));right:calc(-46*var(--u));bottom:calc(-14*var(--u))}`, 'width:calc(44*var(--u));height:calc(44*var(--u));right:calc(8*var(--u));bottom:calc(30*var(--u))'),
    disc: wide(`.shape{width:calc(108*var(--u));height:calc(108*var(--u));background:var(--accent);right:calc(-34*var(--u));bottom:calc(-30*var(--u))}
.halo{width:calc(128*var(--u));height:calc(128*var(--u));right:calc(-44*var(--u));bottom:calc(-40*var(--u))}`, 'width:calc(44*var(--u));height:calc(44*var(--u));right:calc(10*var(--u));bottom:calc(14*var(--u))'),
    sun: wide(`.shape{width:calc(104*var(--u));height:calc(104*var(--u));background:var(--accent);right:calc(-10*var(--u));bottom:calc(-58*var(--u))}
.halo{width:calc(124*var(--u));height:calc(124*var(--u));right:calc(-20*var(--u));bottom:calc(-68*var(--u))}
.sky{width:calc(20*var(--u));height:calc(20*var(--u));right:calc(8*var(--u));bottom:calc(66*var(--u))}`, 'width:calc(40*var(--u));height:calc(40*var(--u));right:calc(22*var(--u));bottom:calc(34*var(--u))'),
    word: wide(`.shape{width:calc(96*var(--u));height:calc(96*var(--u));border:calc(14*var(--u)) solid var(--accent);right:calc(-30*var(--u));bottom:calc(6*var(--u))}
.halo{width:calc(116*var(--u));height:calc(116*var(--u));right:calc(-40*var(--u));bottom:calc(-4*var(--u))}
.sky{display:none}`, '', '.text{right:calc(40*var(--u))}'),
    number: wide(`.shape{width:calc(100*var(--u));height:calc(100*var(--u));background:var(--accent);right:calc(-26*var(--u));bottom:calc(-22*var(--u))}
.halo{width:calc(120*var(--u));height:calc(120*var(--u));right:calc(-36*var(--u));bottom:calc(-32*var(--u))}`, '', '.num{right:calc(4*var(--u));bottom:calc(2*var(--u));font-size:calc(70*var(--u))}'),
  }

  window.PosterEngine = { makePoster, PICTURES, KINDS, LAYOUTS, STYLES, FORMATS }
})()
