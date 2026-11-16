/* Poster engine: draws a finished poster from words and choices.

   The theme is the Big O: one thick orange ring is the hero of every sheet. Three colours only
   (warm white, charcoal, orange), two typefaces, no icons, no drawn people, no label pills.
   Every layout is built from a move found in real poster work; the notes are in designs/NOTES.md.
   The type is measured in the browser and fitted to the sheet, so the sizes are decided here,
   not left to a chat assistant. An assistant (or a person) supplies only the words.

   Two promises every layout keeps: every word that was given is on the sheet, and no two pieces
   of type touch. A layout that cannot keep them returns null and the next one is tried.

   makePoster({ kind, headline, line, points[], layout, style, format, when, time, where })
     -> { html, layout, style, asked, why }   one complete HTML file                              */
(function () {
  'use strict'
  const PAPER = '#faf8f2', INK = '#3d3c38', ORANGE = '#ff612b'
  const STYLES = {
    light: { name: 'Warm white', ground: PAPER, ink: INK },
    dark: { name: 'Charcoal', ground: INK, ink: PAPER },
  }
  const LAYOUTS = {
    letters: 'The O in the headline', counter: 'Inside the O', record: 'Headline over the O', arcs: 'Rings from the full stop',
    numeral: 'The date as the picture', rings: 'Words round the O', burst: 'Burst', steps: 'Three rings',
  }
  const KINDS = {
    'Team building': { tag: 'Team building', layouts: ['counter', 'rings', 'letters', 'burst', 'record', 'arcs', 'numeral', 'steps'] },
    'Town hall': { tag: 'Town hall', layouts: ['numeral', 'arcs', 'counter', 'letters', 'record', 'rings', 'burst', 'steps'] },
    'Call habit': { tag: 'Every call', layouts: ['steps', 'letters', 'record', 'counter', 'arcs', 'burst', 'rings', 'numeral'] },
    Privacy: { tag: 'Privacy', layouts: ['letters', 'steps', 'record', 'counter', 'arcs', 'burst', 'rings', 'numeral'] },
    Recognition: { tag: 'Recognition', layouts: ['burst', 'counter', 'letters', 'record', 'rings', 'arcs', 'numeral', 'steps'] },
    Wellbeing: { tag: 'Wellbeing', layouts: ['record', 'counter', 'burst', 'letters', 'arcs', 'rings', 'steps', 'numeral'] },
    Notice: { tag: 'Notice', layouts: ['numeral', 'letters', 'record', 'counter', 'arcs', 'steps', 'burst', 'rings'] },
  }
  const FORMATS = { a3: [1123, 1587], a4: [794, 1123], landscape: [1920, 1080], 'ig-portrait': [1080, 1350], 'ig-square': [1080, 1080], story: [1080, 1920] }
  /* why a layout could not be used, said in the Studio */
  const WHY = {
    letters: 'needs a letter O in the headline', numeral: 'needs a day of the month in When, like 12 December',
    steps: 'needs two or three points', rings: 'needs a tall size and a headline short enough to run round the O',
    arcs: 'needs a headline that ends in a full stop',
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const n2 = (v) => (Math.round(v * 1000) / 1000).toString()
  const at = (x, y) => `left:calc(${n2(x)}*var(--u));top:calc(${n2(y)}*var(--u))`
  const size = (fs) => `font-size:calc(${n2(fs)}*var(--u))`
  const MINHEAD = 6                         // a headline smaller than 6 percent of the short side is not a headline

  /* ---------- measuring type (in em) ---------- */
  let c2d = null
  const cache = new Map()
  function meas(text, weight, o) {
    o = o || {}
    const key = weight + (o.italic ? 'i' : '') + (o.serif ? 's' : '') + '|' + text
    let m = cache.get(key)
    if (!m) {
      if (!c2d) c2d = document.createElement('canvas').getContext('2d')
      c2d.font = (o.italic ? 'italic ' : '') + weight + ' 200px ' + (o.serif ? "Newsreader, Georgia, serif" : "Figtree, 'Segoe UI', Arial, sans-serif")
      const t = c2d.measureText(text)
      m = { w: t.width / 200, asc: t.actualBoundingBoxAscent / 200, desc: Math.max(0, t.actualBoundingBoxDescent / 200),
        left: -t.actualBoundingBoxLeft / 200, right: t.actualBoundingBoxRight / 200,
        fa: (t.fontBoundingBoxAscent || 190) / 200, fd: (t.fontBoundingBoxDescent || 50) / 200 }
      cache.set(key, m)
    }
    return o.ls ? Object.assign({}, m, { w: m.w + o.ls * text.length }) : m
  }
  /* where the baseline sits in a line box of height lh (em), from the top of the box */
  const baseOf = (lh, weight, o) => { const f = meas('H', weight, o); return (lh - (f.fa + f.fd)) / 2 + f.fa }
  function ready() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve()
    const need = ['900 40px Figtree', '800 40px Figtree', '700 40px Figtree', '600 40px Figtree', 'italic 400 40px Newsreader']
    return Promise.all(need.map((f) => document.fonts.load(f).catch(() => {}))).then(() => { cache.clear() })
  }

  /* ---------- breaking text ---------- */
  function wrapPlain(text, maxW, W) {
    const out = []
    let line = ''
    for (const w of String(text).trim().split(/\s+/)) {
      const t = line ? line + ' ' + w : w
      if (line && W(t) > maxW) { out.push(line); line = w } else line = t
    }
    if (line) out.push(line)
    return out
  }
  /* small text: on one line if it fits; else one sentence per line, else broken after commas, else as even as it can be */
  function wrap(text, maxW, fs, weight, o, upper) {
    const W = (t) => meas(upper ? t.toUpperCase() : t, weight, o).w * fs
    text = String(text).trim()
    if (W(text) <= maxW) return [text]
    const sents = text.split(/(?<=[.!?])\s+/)
    if (sents.length > 1 && sents.length <= 3 && sents.every((x) => W(x) <= maxW)) return sents
    let out = wrapPlain(text, maxW, W)
    const parts = text.split(/(?<=[,;])\s+/)
    if (parts.length > 1 && parts.every((x) => W(x) <= maxW)) {
      const lines = []
      let cur = ''
      for (const p of parts) { if (cur && W(cur + ' ' + p) > maxW) { lines.push(cur); cur = p } else cur = cur ? cur + ' ' + p : p }
      lines.push(cur)
      if (lines.length <= out.length) return lines
    }
    if (out.length < 2) return out
    let lo = maxW * 0.4, hi = maxW
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2
      const t = wrapPlain(text, mid, W)
      if (t.length <= out.length && t.every((l) => W(l) <= maxW)) { out = t; hi = mid } else lo = mid
    }
    return out
  }
  /* every way of setting the words on up to maxLines lines, in order */
  function partitions(words, maxLines) {
    const n = words.length, out = []
    if (n > 10) {
      const seen = new Set()
      for (let chars = 5; chars <= 40; chars++) {
        const lines = []
        let cur = ''
        for (const w of words) { if (cur && (cur + ' ' + w).length > chars) { lines.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w }
        lines.push(cur)
        const k = lines.join('|')
        if (lines.length <= maxLines && !seen.has(k)) { seen.add(k); out.push(lines) }
      }
      if (!out.length) out.push([words.join(' ')])
      return out
    }
    for (let mask = 0; mask < (1 << (n - 1)); mask++) {
      const lines = []
      let cur = [words[0]]
      for (let i = 1; i < n; i++) { if (mask & (1 << (i - 1))) { lines.push(cur.join(' ')); cur = [words[i]] } else cur.push(words[i]) }
      lines.push(cur.join(' '))
      if (lines.length <= maxLines) out.push(lines)
    }
    return out
  }
  const WEAK = /^(a|an|the|to|of|in|on|at|for|with|and|or|your|our|my|from|by)$/i
  const SMALL = /^(a|an|the|to|of|in|on|at|for|with|and|or|your|our|my|from|by|it|is|be|as|so|do|if)$/i
  const bare = (w) => w.replace(/[^\p{L}\p{N}]/gu, '')
  function breakPenalty(lines) {
    let p = 1
    for (let i = 0; i < lines.length - 1; i++) {
      const last = lines[i].split(' ').pop()
      if (WEAK.test(bare(last))) p *= 0.86                                    // a line never ends on a joining word
      if (/[,;:]$/.test(last)) p *= 1.06                                      // a comma is a good place to break
    }
    for (const l of lines) if (/[.!?]\s+\S/.test(l)) p *= 0.84                // one sentence per line
    if (lines.length > 1 && bare(lines[lines.length - 1]).length <= 2) p *= 0.86   // no stranded particle
    if (lines.length > 1 && lines.every((l) => /[.!?]$/.test(l))) p *= 1.14   // each line a whole sentence
    const count = lines.join(' ').split(' ').length
    for (let i = 0; i < lines.length; i++) if (count >= 4 && lines.length > 2 && lines[i].split(' ').length === 1) p *= 0.9   // no one-word lines in a long headline
    for (let i = 0; i < lines.length - 1; i++) {                              // two capitalised words in a row are a name: keep them together
      const a = lines[i].split(' '), b = lines[i + 1].split(' ')[0]
      const last = a[a.length - 1], startsSentence = a.length === 1 && (i === 0 || /[.!?]$/.test(lines[i - 1]))
      if (/^\p{Lu}\p{Ll}/u.test(last) && /^\p{Lu}\p{Ll}/u.test(b) && !/[.!?,;:]$/.test(last) && !startsSentence) p *= 0.78
    }
    for (let i = 0; i < lines.length - 1; i++) {                              // a two-word sentence is never split
      const a = lines[i].split(' '), b = lines[i + 1].split(' ')
      if (!/[.!?]$/.test(lines[i]) && a.length === 1 && /[.!?]$/.test(b[0]) && (i === 0 || /[.!?]$/.test(lines[i - 1]))) p *= 0.9
    }
    return p
  }
  /* leading that keeps a descender clear of the line below it: the same for every line of one headline */
  function leadOf(lines, weight, min) {
    let lh = min
    for (let i = 0; i < lines.length - 1; i++) lh = Math.max(lh, meas(lines[i], weight).desc + meas(lines[i + 1], weight).asc + 0.09)
    return Math.min(lh, 1.32)
  }
  /* the largest setting of the headline that fits a box (measured on the ink), or null if it would be too small */
  function fitHead(head, o) {
    const words = head.split(/\s+/).filter(Boolean)
    const ls = o.ls === undefined ? -0.035 : o.ls
    let best = null
    for (const lines of partitions(words, o.maxLines || 4)) {
      const ws = lines.map((l) => meas(l, o.weight, { ls }).w)
      const wmax = Math.max.apply(null, ws), wmin = Math.min.apply(null, ws)
      const lh = leadOf(lines, o.weight, o.lh || 0.86)
      const a0 = meas(lines[0], o.weight).asc, dN = meas(lines[lines.length - 1], o.weight).desc
      const inkEm = (lines.length - 1) * lh + a0 + dN
      const fs = Math.min(o.cap, o.maxW / wmax, o.maxH / inkEm)
      const score = fs * breakPenalty(lines) * (0.84 + 0.16 * wmin / wmax) * (o.lastWide ? 0.7 + 0.3 * ws[ws.length - 1] / wmax : 1)
      if (!best || score > best.score) best = { lines, ws, fs, lh, score, a0, inkEm }
    }
    if (!best || best.fs < (o.min === undefined ? MINHEAD : o.min)) return null
    best.weight = o.weight; best.ls = ls
    best.H = best.inkEm * best.fs                                              // ink height: top of the first line to the foot of the last
    best.w = Math.max.apply(null, best.ws) * best.fs
    best.off = (baseOf(best.lh, o.weight) - best.a0) * best.fs                 // from the top of the box to the top of the ink
    return best
  }
  /* a headline placed by the top of its ink */
  let lastHead = 0
  const headHtml = (h, x, yInk, extra, tail) => (lastHead = h.fs, `<h1 class="head" style="${at(x - 0.045 * h.fs, yInk - h.off)};${size(h.fs)};line-height:${n2(h.lh)};font-weight:${h.weight};letter-spacing:${h.ls}em${extra || ''}">${h.lines.map((l, i) => `<span class="l">${esc(l)}${tail && i === h.lines.length - 1 ? tail : ''}</span>`).join('')}</h1>`)
  /* the ink boxes of each headline line, from the top of the first line's ink */
  const headRows = (lines, ws, fs, lh, weight, a0) => lines.map((l, i) => { const M = meas(l, weight); return { y: (i * lh + a0 - M.asc) * fs, h: (M.asc + M.desc) * fs, w: ws[i] * fs } })

  /* ---------- the smaller text: facts in bold, the line in serif italic, points ---------- */
  const TIER = {
    fact: { cls: 'fact', w: 800, fs: 3.4, lh: 1.2, o: { ls: -0.012 } },
    say: { cls: 'say', w: 400, fs: 3, lh: 1.18, o: { serif: true, italic: true } },
    point: { cls: 'pt', w: 600, fs: 2.7, lh: 1.26, o: {} },
    kick: { cls: 'kick', w: 700, fs: 1.7, lh: 1.2, o: { ls: 0.14 }, upper: true },
  }
  const FLOOR = { fact: 2.9, say: 2.5, point: 2.4 }                          // percent of the short side: the smallest each level may be set
  function stack(c, maxW, k, order, o) {
    o = o || {}
    const groups = []
    for (const key of order) {
      const t = TIER[(o.as && o.as[key]) || key]
      const quiet = key === 'kick' ? 1 : key === 'fact' ? Math.max(c.k || 1, 0.86) : (c.k || 1)      // a small headline brings the small text down with it
      const fs = Math.max(FLOOR[key] || 0, t.fs * (key === 'kick' ? 1 : k) * ((o.scale && o.scale[key]) || 1) * quiet)
      const lay = (text) => (o.oneLine && key !== 'say') ? [text] : wrap(text, maxW, fs, t.w, t.o, t.upper)
      if (key === 'fact' && c.facts.length) groups.push({ t, fs, lines: [].concat.apply([], c.facts.map(lay)), gap: 2.2 })
      if (key === 'say' && c.say) groups.push({ t, fs, lines: lay(c.say), gap: 2.2 })
      if (key === 'point') c.points.forEach((p, i) => groups.push({ t, fs, lines: lay(p), gap: i ? 1.3 : 2.2 }))
      if (key === 'kick' && c.tag) groups.push({ t, fs, lines: [c.tag], gap: 2.6 })
    }
    let y = 0, w = 0
    const rows = [], html = []
    groups.forEach((g, gi) => {
      const gap = gi ? g.gap * Math.max(1, k * 0.85) : 0
      y += gap
      html.push(`<p class="${g.t.cls}" style="${size(g.fs)}${gi ? `;margin-top:calc(${n2(gap)}*var(--u))` : ''}">${g.lines.map((l) => `<span class="l">${esc(l)}</span>`).join('')}</p>`)
      for (const l of g.lines) {
        const lw = meas(g.t.upper ? l.toUpperCase() : l, g.t.w, g.t.o).w * g.fs
        rows.push({ y, h: g.fs * g.t.lh, w: lw })
        w = Math.max(w, lw)
        y += g.fs * g.t.lh
      }
    })
    return { html: html.join(''), w, h: y, rows }
  }
  const block = (b, x, y, cls) => b && b.h ? `<div class="info${cls ? ' ' + cls : ''}" style="${at(x, y)}">${b.html}</div>` : ''

  /* the small text at the foot of a sheet: two columns when both are short, else one full-width column */
  function foot(c, k, asFact) {
    const m = c.m, fullW = c.W - 2 * m, colW = (fullW - 5) / 2
    const o = asFact ? { as: { point: 'fact' } } : {}
    const kb = Math.min(k, 1.25)
    const lead = c.facts.length ? ['fact'] : asFact ? ['point'] : ['say']
    const rest = c.facts.length ? ['say', 'point', 'kick'] : asFact ? ['say', 'kick'] : ['point', 'kick']
    let A = stack(c, colW, k, lead, o), B = stack(c, colW, kb, rest, o)
    if (!A.h && !B.h) return { h: 0, parts: [] }
    if (!A.h || !B.h) {
      const one = A.h ? stack(c, fullW, k, lead, o) : stack(c, fullW, kb, rest, o)
      return { h: one.h, parts: [[one, m, 0]] }
    }
    if (A.rows.length <= 4 && B.rows.length <= 4 && A.w <= colW && B.w <= colW) {
      const h = Math.max(A.h, B.h)
      return { h, parts: [[A, m, h - A.h], [B, m + colW + 5, h - B.h]] }
    }
    A = stack(c, fullW, k, lead, o); B = stack(c, fullW, kb, rest, o)
    return { h: A.h + 2.8 + B.h, parts: [[A, m, 0], [B, m, A.h + 2.8]] }
  }
  const footHtml = (F, yTop) => F.parts.map((p) => block(p[0], p[1], yTop + p[2])).join('')

  /* where a stack of rows fits inside a circle and the sheet margins: flush left, or centred on the circle */
  function tuck(c, rows, total, circ, rad, centred) {
    const lo = Math.max(circ.cy - rad, c.m), hi = Math.min(circ.cy + rad, c.H - c.m)
    const want = (lo + hi) / 2 - total / 2
    let best = null
    for (let yT = lo; yT + total <= hi + 1e-6; yT += 0.5) {
      let L = -1e9, R = 1e9, ok = true
      for (const r of rows) {
        const ya = yT + r.y, yb = ya + r.h
        const dy = Math.max(Math.abs(ya - circ.cy), Math.abs(yb - circ.cy))
        if (dy >= rad) { ok = false; break }
        const hw = Math.sqrt(rad * rad - dy * dy)
        if (centred) { if (r.w / 2 > Math.min(hw, c.W - c.m - circ.cx, circ.cx - c.m)) { ok = false; break } }
        else { L = Math.max(L, circ.cx - hw, c.m); R = Math.min(R, Math.min(circ.cx + hw, c.W - c.m) - r.w) }
      }
      if (!ok || (!centred && L > R)) continue
      const d = Math.abs(yT - want)
      if (!best || d < best.d) best = { y: yT, x: centred ? circ.cx : L + (R - L) * 0.4, d }
    }
    return best
  }
  /* the largest scale at which a stack fits a circle: each fact on one line if that works at full size, else wrapped */
  function tuckStack(c, circ, rad, order, maxW, kMin, kMax, centred, o) {
    const run = (opt, width) => {
      let lo = kMin, hi = kMax, got = null
      for (let i = 0; i < 9; i++) {
        const k = (lo + hi) / 2
        const b = stack(c, width, k, order, opt)
        const p = b.h ? tuck(c, b.rows, b.h, circ, rad, centred) : null
        if (p) { got = { b, p, k }; lo = k } else hi = k
      }
      if (!got) { const b = stack(c, width, kMin, order, opt); const p = b.h ? tuck(c, b.rows, b.h, circ, rad, centred) : null; if (p) got = { b, p, k: kMin } }
      return got
    }
    const one = o && o.wrapOnly ? null : run(Object.assign({}, o, { oneLine: true }), maxW)
    if (one) return one
    return run(Object.assign({}, o, { oneLine: false }), maxW)
  }
  const ringDiv = (cx, cy, R, band) => `<div class="ring" data-decor style="${at(cx - R, cy - R)};width:calc(${n2(2 * R)}*var(--u));height:calc(${n2(2 * R)}*var(--u));border-width:calc(${n2(band)}*var(--u))"></div>`
  const RING_CSS = `.ring{border-radius:50%;border-style:solid;border-color:var(--orange)}`
  const kicker = (c) => c.tag ? `<p class="kick" style="${at(c.m, c.m)};${size(1.7)}">${esc(c.tag)}</p>` : ''
  const kickH = (c) => c.tag ? 5 : 0

  /* ================= layouts ================= */

  /* 1. The headline is the sheet: capitals fitted line by line to the full width, and one O is the orange ring */
  function letters(c) {
    if (!/o/i.test(c.head)) return null
    const ls = -0.01, g = 2.2, top = c.story ? c.m : 2.8
    const cap = meas('H', 900).asc
    const F1 = foot(c, 1, true)
    const room = (F1.h ? c.H - c.m - F1.h - 4.5 : c.H - 2.8) - top
    const words = c.head.toUpperCase().split(/\s+/).filter(Boolean)
    let best = null
    for (const lines of partitions(words, 7)) {
      const M = lines.map((l) => meas(l, 900, { ls }))
      const fss = M.map((x, i) => c.W / (x.w - (/[,;:]$/.test(lines[i]) ? -0.02 : 0.1)))      // a line that ends in a comma keeps the whole mark on the sheet
      const total = fss.reduce((s, f, i) => s + f * (Math.max(M[i].asc, cap) + M[i].desc + (/[,;]$/.test(lines[i]) ? 0.06 : 0)), 0) + g * (lines.length - 1)
      const big = Math.max.apply(null, fss), small = Math.min.apply(null, fss)
      const bigLine = lines[fss.indexOf(big)]
      const weak = lines.length > 1 && bigLine.split(' ').every((w) => SMALL.test(bare(w)))      // the largest line is not a filler word
      const score = (total <= room ? total / room : (room / total) * 0.55) * breakPenalty(lines) * (big / small > 3.4 ? 0.72 : 1) * (big > 64 ? 0.7 : 1) * (weak ? 0.45 : 1)
      if (!best || score > best.score) best = { lines, fss, M, total, score }
    }
    const k = best.total > room ? room / best.total : 1
    if (Math.max.apply(null, best.fss) * k < 12) return null
    /* when the headline leaves room, the smaller text grows into it */
    let F = F1
    const spare = room - best.total * k
    for (const kf of [2, 1.7, 1.45, 1.2]) {
      const F2 = foot(c, kf, true)
      if (F2.h - F1.h <= spare - 5) { F = F2; break }
    }
    const base = baseOf(1, 900)
    /* the mark: an O in the largest line that has one, in a word that carries meaning if there is one */
    let mark = null
    for (const strong of [true, false]) {
      best.lines.forEach((l, i) => {
        let at = 0
        for (const w of l.split(' ')) {
          const j = w.indexOf('O')
          if (j >= 0 && (!strong || !SMALL.test(bare(w))) && (!mark || best.fss[i] > best.fss[mark.i] + 0.01)) mark = { i, j: at + j }
          at += w.length + 1
        }
      })
      if (mark) break
    }
    const src = c.head.split(/\s+/).filter(Boolean)
    let used = 0, y = top
    const spans = best.lines.map((l, i) => {
      const fs = best.fss[i] * k, asc = Math.max(best.M[i].asc, cap)
      const count = l.split(' ').length
      const text = src.slice(used, used + count).join(' ')
      used += count
      let over = ''
      if (mark && mark.i === i) {
        const G = meas('O', 900)
        const ox = meas(l.slice(0, mark.j) + 'O', 900, { ls }).w - meas('O', 900, { ls }).w
        const d = G.asc + G.desc, inkW = G.right - G.left
        const cx = ox + (G.left + G.right) / 2
        over = `<i class="cover" data-decor style="left:${n2(ox + G.left - 0.008)}em;top:${n2(base - G.asc - 0.008)}em;width:${n2(inkW + 0.016)}em;height:${n2(d + 0.016)}em"></i>`
          + `<i class="o" data-decor style="left:${n2(cx - d / 2)}em;top:${n2(base - G.asc)}em;width:${n2(d)}em;height:${n2(d)}em"></i>`
      }
      const s = `<span class="ln" style="${at(-0.05 * fs, y - (base - asc) * fs)};${size(fs)}">${esc(text)}${over}</span>`
      y += (asc + best.M[i].desc + (/[,;]$/.test(l) ? 0.06 : 0)) * fs + g
      return s
    })
    const css = `.caps{left:0;top:0;font-weight:900;text-transform:uppercase}
.ln{position:absolute;display:block;white-space:nowrap;line-height:1;letter-spacing:${ls}em}
.cover{position:absolute;background:var(--paper);border-radius:50%}
.o{position:absolute;box-sizing:border-box;border-radius:50%;border:.19em solid var(--orange)}`
    return { css, body: `<h1 class="caps" data-bleed>${spans.join('')}</h1>${footHtml(F, c.H - c.m - F.h)}` }
  }

  /* 2. One letter is the whole poster: a giant O leaves the sheet, and the words stand in its counter */
  function counter(c) {
    const g = c.land ? { r: 43, R: 72, cx: c.W - 56, cy: 54 }
      : c.H > 160 ? { r: 56, R: 88, cx: 62, cy: c.H - 48 }
        : c.H > 105 ? { r: 50, R: 80, cx: 61, cy: c.H - 40.3 }
          : { r: 44, R: 63, cx: 57, cy: 57 }
    const rad = g.r - 3.4
    const info = stack(c, Math.min(g.r * 1.3, 46), 1, ['kick', 'fact', 'say', 'point'])
    let best = null
    for (const lines of partitions(c.head.split(/\s+/).filter(Boolean), 5)) {
      const ws = lines.map((l) => meas(l, 900, { ls: -0.035 }).w)
      const lh = leadOf(lines, 900, 0.86), a0 = meas(lines[0], 900).asc, dN = meas(lines[lines.length - 1], 900).desc
      const make = (hs) => {
        const rows = headRows(lines, ws, hs, lh, 900, a0)
        const headH = ((lines.length - 1) * lh + a0 + dN) * hs
        let total = headH
        if (info.h) { info.rows.forEach((r) => rows.push({ y: headH + 2.8 + r.y, h: r.h, w: r.w })); total += 2.8 + info.h }
        return { rows, total, headH }
      }
      let lo = MINHEAD, hi = 30, got = null
      for (let i = 0; i < 11; i++) {
        const hs = (lo + hi) / 2, R = make(hs), p = tuck(c, R.rows, R.total, g, rad, false)
        if (p) { got = { hs, p, R }; lo = hs } else hi = hs
      }
      if (!got) { const R = make(MINHEAD), p = tuck(c, R.rows, R.total, g, rad, false); if (p) got = { hs: MINHEAD, p, R } }
      if (!got) continue
      const score = got.hs * breakPenalty(lines) * (0.84 + 0.16 * Math.min.apply(null, ws) / Math.max.apply(null, ws))
      if (!best || score > best.score) best = Object.assign({ lines, ws, lh, a0, score }, got)
    }
    if (!best) return null
    const h = { lines: best.lines, fs: best.hs, lh: best.lh, weight: 900, ls: -0.035, off: (baseOf(best.lh, 900) - best.a0) * best.hs }
    return { css: RING_CSS, body: ringDiv(g.cx, g.cy, g.R, g.R - g.r) + headHtml(h, best.p.x, best.p.y) + block(info, best.p.x, best.p.y + best.R.headH + 2.8) }
  }

  /* 3. A heavy ring cropped by two edges; the headline stands over it and the facts sit in its counter */
  function record(c) {
    const m = c.m, top = m + kickH(c)
    const facty = c.facts.length || c.points.length
    const inHole = facty ? ['fact', 'point'] : ['say']                      // with no facts the quiet line takes the hole
    const under = facty ? ['say'] : []
    const scale = facty ? {} : { scale: { say: 1.3 } }
    for (const shrink of [1, 0.84, 0.7, 0.58, 0.48]) {
      let maxW, maxH, R, cx, cy
      if (c.land) { R = 60; cx = c.W - 40; cy = 58; maxW = cx - R - 4 - m; maxH = 0.66 * c.H * shrink } else { maxW = c.W - 2 * m; maxH = clamp(0.36 * c.H, 30, 64) * shrink }
      const sayB = stack(c, Math.min(maxW, 62), c.land ? 1.1 : 1, under)
      const sayH = sayB.h ? sayB.h + 2.6 : 0
      const head = fitHead(c.head, { maxW, maxH: maxH - kickH(c) - sayH, weight: 900, cap: 26, maxLines: 4 })
      if (!head) continue
      const textBottom = top + head.H + sayH
      if (!c.land) { R = Math.min((c.H - textBottom - 4) / 1.5, 0.72 * c.W); cx = c.W - 0.55 * R; cy = c.H - 0.5 * R }
      if (R < 18) continue
      const band = 0.42 * R, r = R - band
      let inside = null
      if (facty || c.say) {
        inside = tuckStack(c, { cx, cy }, r - 3, inHole, r * 1.7, facty ? 0.8 : 0.62, facty ? 1.7 : clamp(head.fs / (3.1 * 3.9), 0.62, 1.7), false, scale)
        if (!inside) continue                                              // never draw without the facts: give the ring more room and try again
      }
      return { css: RING_CSS, body: ringDiv(cx, cy, R, band) + kicker(c) + headHtml(head, m, top) + block(sayB, m, top + head.H + 2.6) + (inside ? block(inside.b, inside.p.x, inside.p.y) : '') }
    }
    return null
  }

  /* 4. Rings grow from the full stop of the headline and open round the words */
  function arcs(c) {
    if (!/[^.]\.$/.test(c.head)) return null                                // the full stop is the centre, so there has to be one
    const m = c.m
    const maxW = c.land ? 0.36 * c.W : 0.6 * c.W
    const info = stack(c, maxW, 1, ['say', 'fact', 'point', 'kick'])
    const head = fitHead(c.head.replace(/\.$/, ''), { maxW: maxW - 0.5, maxH: Math.min(c.land ? 0.5 * c.H : 0.34 * c.H, c.H - 2 * m - (info.h ? info.h + 3 : 0)), lh: 0.9, weight: 800, cap: 13.5, maxLines: 4, lastWide: true })
    if (!head) return null
    const fs = head.fs, lh = head.lh
    const total = head.H + (info.h ? 3 + info.h : 0)
    const lastBase = ((head.lines.length - 1) * lh + head.a0) * fs         // from the top of the ink to the last baseline
    const sr = 0.15 * fs                                                   // the stop: a disc on the baseline
    const top = clamp((c.land ? 0.5 : 0.52) * c.H - (lastBase - sr), m, c.H - m - total)
    const sx = m + head.ws[head.ws.length - 1] * fs + 0.06 * fs + sr, sy = top + lastBase - sr
    /* what the rings must stay clear of: every line of type */
    const rects = headRows(head.lines, head.ws, fs, lh, 800, head.a0).map((r) => ({ x1: m - 2, x2: m + r.w, y1: top + r.y, y2: top + r.y + r.h }))
    rects[rects.length - 1].x2 = sx - sr - 0.02 * fs
    if (info.h) info.rows.forEach((r) => rects.push({ x1: m - 2, x2: m + r.w, y1: top + head.H + 3 + r.y, y2: top + head.H + 3 + r.y + r.h }))
    const dist = (px, py, q) => Math.hypot(Math.max(q.x1 - px, 0, px - q.x2), Math.max(q.y1 - py, 0, py - q.y2))
    const far = Math.max(Math.hypot(sx, sy), Math.hypot(c.W - sx, sy), Math.hypot(sx, c.H - sy), Math.hypot(c.W - sx, c.H - sy))
    const paths = []
    let smallRings = 0
    for (let k = 0, rho = 3.4 * sr; rho * 0.8 < far && k < 9; k++, rho *= 2) {
      const sw = 0.4 * rho, clear = sw / 2 + 1.4
      const pt = (a) => { const t = (a / 2) * Math.PI / 180; return [sx + rho * Math.cos(t), sy + rho * Math.sin(t)] }
      const free = []
      for (let a = 0; a < 720; a++) { const p = pt(a); free.push(rects.every((q) => dist(p[0], p[1], q) >= clear)) }
      const seen = (a) => { const p = pt(a); return p[0] > 0 && p[0] < c.W && p[1] > 0 && p[1] < c.H }
      const need = k < 3 ? 300 : 190                                       // a small ring sweeps at least 150 degrees; a large one shows at least 95 on the sheet
      if (free.every(Boolean)) {
        let vis = 0
        for (let a = 0; a < 720; a++) if (seen(a)) vis++
        if (vis >= need) { paths.push(`<circle cx="${n2(sx)}" cy="${n2(sy)}" r="${n2(rho)}" stroke-width="${n2(sw)}"/>`); if (k < 3) smallRings++ }
        continue
      }
      const start = free.findIndex((f, i) => f && !free[(i + 719) % 720])
      if (start < 0) continue
      let longest = null                                                   // each ring is one clean arc: the longest that clears the words
      for (let i = 0; i < 720;) {
        const a = (start + i) % 720
        if (!free[a]) { i++; continue }
        let len = 0, vis = 0
        while (len < 720 && free[(a + len) % 720]) { if (seen(a + len)) vis++; len++ }
        if (!longest || vis > longest.vis) longest = { a, len, vis }
        i += len
      }
      if (longest && longest.vis >= need) {                                // anything shorter is a stray chip
        if (k < 3) smallRings++
        const p1 = pt(longest.a), p2 = pt(longest.a + longest.len - 1)
        paths.push(`<path d="M${n2(p1[0])} ${n2(p1[1])}A${n2(rho)} ${n2(rho)} 0 ${longest.len > 360 ? 1 : 0} 1 ${n2(p2[0])} ${n2(p2[1])}" stroke-width="${n2(sw)}"/>`)
      }
    }
    if (paths.length < 3 || smallRings < 2) return null                    // the rings must be seen to grow from the stop
    const css = `.art *{fill:none;stroke:var(--orange);stroke-linecap:butt}
.stop{display:inline-block;vertical-align:baseline;width:.3em;height:.3em;margin-left:.06em;border-radius:50%;background:var(--orange)}`
    const body = `<svg class="art" data-decor aria-hidden="true" viewBox="0 0 ${n2(c.W)} ${n2(c.H)}" preserveAspectRatio="none">${paths.join('')}</svg>`
      + headHtml(head, m + 0.005 * fs, top, '', '<i class="stop" data-decor></i>')
      + block(info, m, top + head.H + 3)
    return { css, body }
  }

  /* 5. The date is the picture: the day of the month as big as the sheet allows, standing in the O */
  function numeral(c) {
    const num = c.number
    if (!num) return null
    const m = c.m, ls = -0.045
    const G = meas(num, 900)
    const inkW = G.right - G.left + ls * (num.length - 1), asc = G.asc
    const base = baseOf(1, 900)
    let fs, x0
    if (c.land) { fs = Math.min(((c.H - 2 * m) * 0.9) / asc, (0.42 * c.W) / inkW); x0 = c.W - m - inkW * fs }
    else { fs = Math.min((c.W - 2 * m) / inkW, ((c.H < 105 ? 0.5 : c.H < 130 ? 0.48 : 0.52) * c.H) / asc); x0 = m }
    const h = asc * fs, w = inkW * fs, yTop = c.H - m - h
    const square = !c.land && c.H < 105
    if (square) x0 = (c.W - w) / 2
    const R = Math.max(0.66 * Math.max(h, 0.8 * w), square ? 0.4 * c.W : 0), cx = x0 + w / 2, cy = yTop + h / 2
    const zoneW = c.land ? cx - R - 5 - m : c.W - 2 * m
    const zoneH = c.land ? c.H - 2 * m : Math.min(yTop, cy - R) - 4 - m
    if (zoneW < 30 || zoneH < 14) return null
    const top = m + kickH(c)
    let pick = null
    for (const side of (c.land || zoneH >= 36 ? [false] : [false, true])) {     // on a short sheet the facts may stand beside the headline
      for (const k of [1, 0.9, 0.8]) {
        const info = stack(c, side ? zoneW * 0.46 : zoneW, k, ['fact', 'say', 'point'])
        const head = fitHead(c.head, side
          ? { maxW: zoneW - info.w - 5, maxH: zoneH - kickH(c), lh: 0.9, weight: 800, ls: -0.03, cap: 13, maxLines: 4 }
          : { maxW: zoneW, maxH: zoneH - kickH(c) - (info.h ? info.h + 3 : 0), lh: 0.9, weight: 800, ls: -0.03, cap: c.land ? 13 : 12, maxLines: 4 })
        if (!head || (side && info.h > zoneH - kickH(c))) continue
        if (!pick || head.fs > pick.head.fs + 0.4) pick = { head, info, side, k }
        if (head.fs >= 3.4 * k * 2) break
      }
    }
    if (!pick || pick.head.fs < Math.max(7, 3.4 * pick.k * 1.6)) return null    // the headline must stay well above the facts
    const { head, info, side } = pick
    const css = RING_CSS + `\n.num{font-weight:900;line-height:1;letter-spacing:${ls}em;white-space:nowrap}`
    const body = ringDiv(cx, cy, R, 0.3 * R)
      + `<p class="num" data-bleed style="${at(x0 - G.left * fs, c.H - m - base * fs)};${size(fs)}">${esc(num)}</p>`
      + kicker(c) + headHtml(head, m + 0.005 * head.fs, top)
      + (side ? block(info, c.W - m - info.w, top) : block(info, m, top + head.H + 3))
    return { css, body }
  }

  /* 6. Words set round the O: the headline runs on rings of type outside it, the facts stand in its counter */
  function rings(c) {
    if (c.land || c.H < 1.2 * c.W) return null
    const k = c.H > 135 ? Math.min(1.18, c.H / 141.4) : 1
    const R = 55 * k, r = 37.5 * k, cx = c.W / 2
    let phrases = c.head.split(/(?<=[.!?])\s+/).filter(Boolean)
    if (phrases.length < 2 || phrases.length > 3) {
      phrases = [c.head]
      const words = c.head.split(/\s+/).filter(Boolean)
      if (words.length >= 4) {                                              // one long sentence goes on two rings, broken where it reads best
        let best = null
        for (let i = 1; i < words.length; i++) {
          const two = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
          const wa = meas(two[0].toUpperCase(), 900).w, wb = meas(two[1].toUpperCase(), 900).w
          const score = breakPenalty(two) * Math.min(wa, wb) / Math.max(wa, wb)
          if (!best || score > best.score) best = { two, score }
        }
        phrases = best.two
      }
    }
    const order = phrases.slice().reverse()                                 // the first sentence runs on the outer ring
    const sets = []
    let inner = R + 2.9
    for (let i = 0; i < order.length; i++) {
      const up = order[i].toUpperCase()
      const sep = !/[.!?]$/.test(up)                                        // no full stop: an orange dot parts the copies
      const w = meas(up, 900).w + (sep ? 0.9 : 0.42)
      const target = (order.length === 1 ? 12.5 : [11.4, 11, 9.6][i]) * k
      let N = Math.max(2, Math.round((2 * Math.PI * inner) / (w * target))), fs = 0
      for (; N < 30; N++) {
        fs = (2 * Math.PI * inner) / (N * w)
        const half = (meas(up, 900).w * fs) / 2 / inner
        if (half < Math.PI / 2 && (inner + 0.74 * fs) * Math.sin(half) <= c.W / 2 - c.m - 0.5) break
      }
      if (N >= 30 || fs < 4.6) return null
      sets.push({ text: order[i], rho: inner, fs, N, sep })
      inner = inner + 0.72 * fs + 3.1 + (i + 1 < order.length && /[,;QJ]/.test(order[i + 1].toUpperCase()) ? 1.4 : 0)
    }
    const out = sets[sets.length - 1]
    const cy = Math.max(c.m + out.rho + 0.74 * out.fs + 0.6, c.H - 50 * k)
    if (cy > c.H - 26) return null
    const defs = [], texts = []
    sets.forEach((s, si) => {
      const q = n2(s.rho)
      defs.push(`<path id="tr${si}" d="M0,-${q} A${q},${q} 0 1 1 0,${q} A${q},${q} 0 1 1 0,-${q} A${q},${q} 0 1 1 0,${q} A${q},${q} 0 1 1 0,-${q}"/>`)
      for (let j = 0; j < s.N; j++) {
        const step = (j <= s.N / 2 ? j : j - s.N)
        texts.push(`<text style="${size(s.fs)}"${j ? ' aria-hidden="true" data-bleed' : ''}><textPath href="#tr${si}" startOffset="${n2(50 + (step * 50) / s.N)}%">${esc(s.text)}</textPath></text>`)
        if (s.sep) texts.push(`<text class="sep" aria-hidden="true" data-decor style="${size(s.fs)}"><textPath href="#tr${si}" startOffset="${n2(50 + ((step + 0.5) * 50) / s.N)}%">&#8226;</textPath></text>`)
      }
    })
    const fsMin = Math.min.apply(null, sets.map((s) => s.fs))
    let inside = null
    if (c.facts.length || c.say || c.points.length) {
      const fsBig = Math.max.apply(null, sets.map((s) => s.fs))
      const kMax = clamp((0.5 * fsMin) / 3.4, 0.9, 1.9)                     // the facts never out-shout the words on the rings
      const sayK = c.facts.length ? Math.min(0.74, fsBig / (9.5 * kMax)) : 1.25
      inside = tuckStack(c, { cx, cy }, r - 4, ['fact', 'say', 'point'], r * 1.45, 0.86, c.facts.length ? kMax : clamp(fsBig / (3.1 * 3 * 1.25), 0.86, 1.5), true, { wrapOnly: true, scale: { say: sayK, point: c.facts.length ? 1 : 1.1 } })
      if (!inside) return null
      const quietFs = Math.max(c.say ? Math.max(FLOOR.say, 3 * inside.k * sayK) : 0, c.points.length ? Math.max(FLOOR.point, 2.7 * inside.k * (c.facts.length ? 1 : 1.1)) : 0)
      if (quietFs && fsBig < 3.05 * quietFs) return null                    // the ring type must stand well above the quiet text
    }
    const css = `.disc{border-radius:50%;background:var(--orange)}
.hole{border-radius:50%;background:var(--paper)}
.type{left:0;top:0;width:100%;height:100%;overflow:visible;--n:tan(atan2(var(--u),1px))}
.type path{transform:translate(calc(${n2(cx)}*var(--u)),calc(${n2(cy)}*var(--u))) scale(var(--n))}
.type text{font-family:'Figtree','Segoe UI',Arial,sans-serif;font-weight:900;text-transform:uppercase;text-anchor:middle;fill:var(--ink)}
.type .sep{fill:var(--orange)}
.info.mid{transform:translateX(-50%);text-align:center}`
    const circle = (rad, cls) => `<div class="${cls}" data-decor style="${at(cx - rad, cy - rad)};width:calc(${n2(2 * rad)}*var(--u));height:calc(${n2(2 * rad)}*var(--u))"></div>`
    const body = circle(R, 'disc') + circle(r, 'hole')
      + `<svg class="type" xmlns="http://www.w3.org/2000/svg"><defs>${defs.join('')}</defs>${texts.join('')}</svg>`
      + kicker(c) + (inside ? block(inside.b, inside.p.x, inside.p.y, 'mid') : '')
    return { css, body }
  }

  /* 7. Sixty strokes round an empty O, each longer than the last; the longest leave the sheet */
  function burst(c) {
    const m = c.m
    let ri, cx, cy, body
    if (c.land) {
      ri = 24; cx = c.W - 50; cy = 52
      const maxW = cx - ri - 9 - m
      const info = stack(c, maxW, 1.1, ['say', 'fact', 'point'])
      const head = fitHead(c.head, { maxW, maxH: c.H - 2 * m - kickH(c) - (info.h ? info.h + 5 : 0), weight: 900, cap: 22, maxLines: 4 })
      if (!head) return null
      body = kicker(c) + headHtml(head, m, m + kickH(c)) + block(info, m, c.H - m - info.h)
    } else {
      const ri0 = c.H < 105 ? 20 : 25
      cx = 0.62 * c.W
      let done = null
      for (const kf of [1, 0.85]) {
        const F = foot(c, kf, false)
        for (const frac of [0.4, 0.33, 0.27, 0.22, 0.18]) {
          const head = fitHead(c.head, { maxW: c.W - 2 * m, maxH: frac * c.H, weight: 900, cap: 24, maxLines: 4 })
          if (!head) continue
          const headTop = c.H - m - (F.h ? F.h + 4 : 0) - head.H
          const r2 = Math.min(ri0, (headTop - 4 - m - 1) / 2.5)             // the O, its strokes below it and a gap must fit above the headline
          if (r2 < 12) continue
          done = { F, head, headTop, ri: r2 }
          break
        }
        if (done) break
      }
      if (!done) return null
      ri = done.ri
      const want = c.H < 105 ? 0.33 * c.H : c.H < 130 ? 0.365 * c.H : c.H > 160 ? 0.36 * c.H : 0.4 * c.H
      cy = clamp(want, ri + m + 1, done.headTop - 4 - ri * 1.5)
      body = kicker(c) + headHtml(done.head, m, done.headTop) + footHtml(done.F, c.H - m - done.F.h)
    }
    const s = ri / 25, q = Math.pow(95 / 1.6, 1 / 59)
    const lines = []
    for (let k = 0; k < 60; k++) {
      const a = ((-120 - 6 * k) * Math.PI) / 180, L = 1.6 * s * Math.pow(q, k)
      lines.push(`<line x1="${n2(cx + ri * Math.cos(a))}" y1="${n2(cy + ri * Math.sin(a))}" x2="${n2(cx + (ri + L) * Math.cos(a))}" y2="${n2(cy + (ri + L) * Math.sin(a))}"/>`)
    }
    const css = `.art line{stroke:var(--orange);stroke-width:${n2(1.6 * Math.max(0.7, s))};stroke-linecap:butt}`
    return { css, body: `<svg class="art" data-decor aria-hidden="true" viewBox="0 0 ${n2(c.W)} ${n2(c.H)}" preserveAspectRatio="none">${lines.join('')}</svg>` + body }
  }

  /* 8. Three rings, each smaller than the last, hung from one axis: one ring for each thing to do */
  function steps(c) {
    const m = c.m, n = c.points.length
    if (n < 2 || n > 3) return null
    const ratios = [1, 0.62, 0.38].slice(0, n), sum = ratios.reduce((a, b) => a + b, 0)
    let head, zt, zb, body = kicker(c), left
    if (c.land) {
      const maxW = 0.43 * c.W - m
      const info = stack(c, maxW, 1.05, ['say', 'fact'])
      head = fitHead(c.head, { maxW, maxH: c.H - 2 * m - kickH(c) - (info.h ? info.h + 5 : 0), weight: 900, cap: 20, maxLines: 4 })
      if (!head) return null
      body += headHtml(head, m, m + kickH(c)) + block(info, m, c.H - m - info.h)
      zt = m; zb = c.H - m; left = 0.47 * c.W
    } else {
      const sayB = stack(c, c.W - 2 * m, 1, ['say']), facts = stack(c, c.W - 2 * m, 1, ['fact'])
      head = fitHead(c.head, { maxW: c.W - 2 * m, maxH: 0.24 * c.H, weight: 900, cap: 20, maxLines: 3 })
      if (!head) return null
      const top = m + kickH(c)
      body += headHtml(head, m, top) + block(sayB, m, top + head.H + 2.8) + block(facts, m, c.H - m - facts.h)
      zt = top + head.H + (sayB.h ? sayB.h + 2.8 : 0) + 5
      zb = c.H - m - (facts.h ? facts.h + 5 : 0)
      left = 0
    }
    /* the rings give way until every step's words fit beside its ring, on three lines at most */
    let plan = null
    for (let d1 = Math.min((zb - zt - 3 * (n - 1)) / sum, c.land ? 44 : 0.64 * c.W); d1 >= 15; d1 -= 1) {
      const ax = c.land ? left + d1 : 0.72 * d1, xt = ax + 4.5, tw = c.W - m - xt
      const rowsOut = []
      let total = 0, ok = true
      for (let i = 0; i < n; i++) {
        const d = d1 * ratios[i]
        let fs = Math.min(clamp(d1 * ratios[Math.min(i, 1)] * 0.17, 3, 7.4), head.fs * 0.45), ls = null
        for (; fs >= 2.7; fs -= 0.3) { ls = wrap(c.points[i], tw, fs, 800, { ls: -0.02 }); if (ls.length <= 3 && ls.every((l) => meas(l, 800, { ls: -0.02 }).w * fs <= tw)) break; ls = null }
        if (!ls) { ok = false; break }
        const th = ls.length * fs * 1.1, rowH = Math.max(d, th)
        rowsOut.push({ d, fs, ls, th, rowH })
        total += rowH + (i ? 3 : 0)
      }
      if (ok && total <= zb - zt + 0.01) { plan = { d1, ax, xt, rowsOut, total }; break }
    }
    if (!plan) return null
    let y = zt + (c.land ? (zb - zt - plan.total) / 2 : 0)
    plan.rowsOut.forEach((r) => {
      body += ringDiv(plan.ax - r.d / 2, y + r.rowH / 2, r.d / 2, 0.24 * r.d)
        + `<p class="step" style="${at(plan.xt, y + r.rowH / 2 - r.th / 2)};${size(r.fs)}">${r.ls.map((l) => `<span class="l">${esc(l)}</span>`).join('')}</p>`
      y += r.rowH + 3
    })
    return { css: RING_CSS + `\n.step{font-weight:800;line-height:1.1;letter-spacing:-.02em}`, body }
  }

  /* The last resort: everything in one column, the ring in whatever room is left. It always holds every word. */
  function plain(c) {
    const m = c.m, fullW = c.W - 2 * m, top = m + kickH(c)
    let head = null, info = null
    for (const k of [1, 0.85, 0.72, 0.6, 0.5, 0.42]) {
      info = stack(c, fullW, k, ['fact', 'say', 'point'])
      head = fitHead(c.head, { maxW: fullW, maxH: Math.max(4, Math.min(0.42 * c.H, c.H - m - top - (info.h ? info.h + 3 : 0))), weight: 900, cap: 22, maxLines: 6, min: 0 })
      if (head.fs >= 3.4 * k * 1.3) break
    }
    const bottom = top + head.H + (info.h ? 3 + info.h : 0)
    const R = Math.min(0.6 * c.W, (c.H - bottom - 4) / 1.3)
    return { css: RING_CSS, body: (R >= 10 ? ringDiv(c.W - 0.35 * R, c.H - 0.3 * R, R, 0.42 * R) : '') + kicker(c) + headHtml(head, m, top) + block(info, m, top + head.H + 3) }
  }

  const DRAW = { letters, counter, record, arcs, numeral, rings, burst, steps }

  /* the day of the month in a date as written, or nothing: never an hour, a year or a quarter */
  function dayOf(when) {
    const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|enero|pebrero|marso|abril|mayo|hunyo|hulyo|agosto|setyembre|oktubre|nobyembre|disyembre)[a-z]*\\.?'
    const DAY = '(?:ika-?)?([0-3]?\\d)(?:st|nd|rd|th)?'
    const WEEKDAY = '(?:mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sun|lunes|martes|miyerkules|huwebes|biyernes|sabado|linggo)[a-z]*'
    const JOIN = '\\s*(?:to|until|through|and|&|,|-|\u2013|\u2014)\\s*'
    const m = when.match(new RegExp('(?<![\\d:/.])\\b' + DAY + JOIN + '(?:' + WEEKDAY + '\\.?,?\\s+)?' + DAY + '\\s+(?:of\\s+|ng\\s+)?' + MONTH + '(?![a-z])', 'i'))     // 3 to 5 June: the first day
      || when.match(new RegExp('(?<![\\d:/.-])\\b' + DAY + '\\s+(?:of\\s+|ng\\s+)?' + MONTH + '(?![a-z])', 'i'))                                              // 12 December
      || when.match(new RegExp('\\b' + MONTH + '\\s+' + DAY + '\\b(?![\\d:/.]|\\s*(?:am|pm|a\\.m|p\\.m))', 'i'))                                            // December 12
      || when.match(new RegExp('\\b' + WEEKDAY + '\\.?,?\\s+(?:the\\s+)?([0-3]?\\d)(?:st|nd|rd|th)\\b(?!\\s+(?:' + WEEKDAY + '|week|quarter|floor|shift))', 'i'))  // Friday the 13th
      || when.match(new RegExp('^\\s*(?:on\\s+)?(?:the\\s+)?([0-3]?\\d)(?:st|nd|rd|th)\\s*(?:$|[,.;]|at\\b|from\\b)', 'i'))                                  // the 12th
      || when.match(/\b\d{4}-\d{2}-([0-3]\d)\b/)                                                                                                             // 2026-12-12
    const n = m ? parseInt(m[1], 10) : 0
    return n >= 1 && n <= 31 ? String(n) : ''
  }
  const plainWords = (s) => String(s).toLowerCase().replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean)

  /* ================= the sheet ================= */
  function makePoster(d) {
    const kind = KINDS[d.kind] ? d.kind : 'Notice'
    const K = KINDS[kind]
    const fmt = FORMATS[d.format] || FORMATS['ig-portrait']
    const short = Math.min(fmt[0], fmt[1])
    const styleKey = STYLES[d.style] ? d.style : 'light'
    const T = STYLES[styleKey]
    const clean = (v) => String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim()
    const head = clean(String(d.headline || '').replace(/\*/g, '')) || K.tag
    const W = (fmt[0] / short) * 100, Hfull = (fmt[1] / short) * 100
    /* a story keeps clear of what the app draws over it: about 250 px at the top and 340 px at the foot */
    const story = Hfull > 170
    const padTop = story ? 16 : 0, padBottom = story ? 25.5 : 0
    const c = {
      W, H: Hfull - padTop - padBottom, m: 7, land: fmt[0] > fmt[1] * 1.1,
      head, say: clean(d.line), tag: clean(d.tag),
      facts: [d.when, d.time, d.where].map(clean).filter(Boolean),
      points: (d.points || []).map(clean).filter(Boolean).slice(0, 6), story,
      number: dayOf(clean(d.when)),
    }
    const given = plainWords([c.head, c.say].concat(c.facts, c.points).join(' '))
    const whole = (body) => { const on = new Set(plainWords(body.replace(/<[^>]*>/g, ' '))); return given.every((w) => on.has(w)) }
    const asked = LAYOUTS[d.layout] ? d.layout : ''
    const order = (asked ? [asked] : []).concat(K.layouts.filter((l) => l !== asked))
    let layout = null, res = null
    for (const l of order) {
      lastHead = 0; c.k = 1
      let r = DRAW[l](c)
      if (r && lastHead && lastHead < 9.6) {           // a headline this small needs quieter text under it: draw it again one step down
        c.k = Math.max(0.68, lastHead / 9.6)
        const again = DRAW[l](c)
        if (again) r = again
      }
      c.k = 1
      if (r && lastHead && lastHead < 3.08 * FLOOR.say && (c.say || (c.points.length && l !== 'steps'))) r = null
      if (r && whole(r.body)) { layout = l; res = r; break }
    }
    if (!res) { layout = 'record'; res = plain(c) }
    let why = ''
    if (asked && asked !== layout) {
      const unmet = (asked === 'letters' && !/o/i.test(head)) || (asked === 'numeral' && !c.number) || (asked === 'steps' && c.points.length < 2)
        || (asked === 'arcs' && !/[^.]\.$/.test(head)) || (asked === 'rings' && (c.land || c.H < 1.2 * c.W))
      const brief = asked === 'rings' && head.split(/\s+/).length <= 3
      why = unmet ? WHY[asked] : asked === 'steps' && c.points.length > 3 ? 'holds three points at most' : brief ? 'needs sentences long enough to run round the O' : 'cannot hold these words at a readable size'
    }
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(head)}</title>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&family=Newsreader:ital,opsz,wght@1,6..72,300..700&display=swap" rel="stylesheet">
<style>
:root{--u:1vmin;--margin:calc(7*var(--u));--cols:12;--paper:${T.ground};--ink:${T.ink};--orange:${ORANGE}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100vw;height:100vh;overflow:hidden;background:var(--paper)}
.poster{position:relative;width:100vw;height:100vh;overflow:hidden;background:var(--paper);color:var(--ink);font-family:'Figtree','Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased}
.stage{position:absolute;left:0;top:calc(${n2(padTop)}*var(--u));width:100vw;height:calc(${n2(c.H)}*var(--u))}
.stage>*{position:absolute}
.l{display:block;white-space:nowrap}
.head{white-space:nowrap}
.fact{font-weight:800;line-height:1.2;letter-spacing:-.012em}
.say{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:400;line-height:1.18}
.pt{font-weight:600;line-height:1.26}
.kick{font-weight:700;line-height:1.2;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
.art{left:0;top:0;width:100%;height:100%;display:block;overflow:visible}
${res.css}
</style>
</head>
<body>
<main class="poster L-${layout}">
<div class="stage">
${res.body}
</div>
</main>
</body>
</html>`
    return { html, layout, style: styleKey, asked, why }
  }

  window.PosterEngine = { makePoster, ready, dayOf, KINDS, LAYOUTS, STYLES, FORMATS }
})()
