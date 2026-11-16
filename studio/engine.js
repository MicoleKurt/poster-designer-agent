/* Poster engine: draws a finished poster from words and choices.

   The theme is the Big O: one thick orange ring is the hero of every sheet. Three colours only
   (warm white, charcoal, orange), two typefaces, no icons, no drawn people, no label pills.
   Every layout is built from a move found in real poster work; the notes are in designs/NOTES.md.
   The type is measured in the browser and fitted to the sheet, so the sizes are decided here,
   not left to a chat assistant. An assistant (or a person) supplies only the words.

   makePoster({ kind, headline, line, points[], layout, style, format, when, time, where, tag })
     -> { html, layout, style }   one complete HTML file                                        */
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

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const n2 = (v) => (Math.round(v * 1000) / 1000).toString()
  const at = (x, y) => `left:calc(${n2(x)}*var(--u));top:calc(${n2(y)}*var(--u))`
  const size = (fs) => `font-size:calc(${n2(fs)}*var(--u))`

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
      m = { w: t.width / 200, asc: t.actualBoundingBoxAscent / 200, desc: t.actualBoundingBoxDescent / 200,
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
  function wrapPlain(text, maxW, fs, weight, o, upper) {
    const out = []
    let line = ''
    for (const w of String(text).trim().split(/\s+/)) {
      const t = line ? line + ' ' + w : w
      if (line && meas(upper ? t.toUpperCase() : t, weight, o).w * fs > maxW) { out.push(line); line = w } else line = t
    }
    if (line) out.push(line)
    return out
  }
  /* the same number of lines as a plain wrap, but as even as they can be: no short last line */
  function wrap(text, maxW, fs, weight, o, upper) {
    let out = wrapPlain(text, maxW, fs, weight, o, upper)
    if (out.length < 2) return out
    let lo = maxW * 0.4, hi = maxW
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2
      const t = wrapPlain(text, mid, fs, weight, o, upper)
      if (t.length <= out.length && t.every((l) => meas(upper ? l.toUpperCase() : l, weight, o).w * fs <= maxW)) { out = t; hi = mid } else lo = mid
    }
    return out
  }
  /* every way of setting the words on up to maxLines lines, in order */
  function partitions(words, maxLines) {
    const n = words.length, out = []
    if (n > 10) {
      const seen = new Set()
      for (let chars = 5; chars <= 34; chars++) {
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
  function breakPenalty(lines) {
    let p = 1
    for (let i = 0; i < lines.length - 1; i++) if (WEAK.test(lines[i].split(' ').pop().replace(/[^\w]/g, ''))) p *= 0.86   // a line never ends on a joining word
    for (const l of lines) if (/[.!?]\s+\S/.test(l)) p *= 0.84                                                              // one sentence per line
    if (lines.length > 1 && lines[lines.length - 1].replace(/[^\w]/g, '').length <= 2) p *= 0.86                            // no stranded particle
    if (lines.length > 1 && lines.every((l) => /[.!?]$/.test(l))) p *= 1.14                                                  // each line a whole sentence
    for (let i = 0; i < lines.length - 1; i++) {                                                                             // a two-word sentence is never split
      const a = lines[i].split(' '), b = lines[i + 1].split(' ')
      if (!/[.!?]$/.test(lines[i]) && a.length === 1 && /[.!?]$/.test(b[0]) && (i === 0 || /[.!?]$/.test(lines[i - 1]))) p *= 0.9
    }
    return p
  }
  /* the largest setting of the headline that fits a box */
  function fitHead(head, o) {
    const words = (o.upper ? head.toUpperCase() : head).split(/\s+/).filter(Boolean)
    let best = null
    for (const lines of partitions(words, o.maxLines || 4)) {
      const ws = lines.map((l) => meas(l, o.weight, { ls: o.ls }).w)
      const wmax = Math.max.apply(null, ws), wmin = Math.min.apply(null, ws)
      const fs = Math.min(o.cap, o.maxW / wmax, o.maxH / (lines.length * o.lh))
      const score = fs * breakPenalty(lines) * (0.84 + 0.16 * wmin / wmax)
      if (!best || score > best.score) best = { lines, ws, fs, score }
    }
    best.h = best.lines.length * o.lh * best.fs
    best.w = Math.max.apply(null, best.ws) * best.fs
    return best
  }
  const headHtml = (h, lh, style, extra) => `<h1 class="head" style="${style};${size(h.fs)};line-height:${lh}">${h.lines.map((l, i) => `<span class="l">${esc(l)}${extra && i === h.lines.length - 1 ? extra : ''}</span>`).join('')}</h1>`

  /* ---------- the smaller text: facts in bold, the line in serif italic, points, the label ---------- */
  const TIER = {
    fact: { cls: 'fact', w: 800, fs: 3.4, lh: 1.2, o: { ls: -0.012 } },
    say: { cls: 'say', w: 400, fs: 3, lh: 1.18, o: { serif: true, italic: true } },
    point: { cls: 'pt', w: 600, fs: 2.7, lh: 1.26, o: {} },
    kick: { cls: 'kick', w: 700, fs: 1.55, lh: 1.2, o: { ls: 0.14 }, upper: true },
  }
  function stack(c, maxW, k, order, o) {
    o = o || {}
    const groups = []
    for (const key of order) {
      const t = TIER[(o.as && o.as[key]) || key]
      const fs = t.fs * (key === 'kick' ? 1 : k) * ((o.scale && o.scale[key]) || 1)
      const lay = (text) => (key === 'fact' && o.oneLine) ? [text] : wrap(text, maxW, fs, t.w, t.o, t.upper)
      if (key === 'fact' && c.facts.length) groups.push({ t, fs, lines: [].concat.apply([], c.facts.map(lay)), gap: 2.2 })
      if (key === 'say' && c.say) groups.push({ t, fs, lines: lay(c.say), gap: 2.2 })
      if (key === 'point') c.points.forEach((p, i) => groups.push({ t, fs, lines: lay(p), gap: i ? 0.9 : 2.2 }))
      if (key === 'kick' && c.tag) groups.push({ t, fs, lines: [c.tag], gap: 2.4 })
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
  const block = (b, x, y, cls) => b.h ? `<div class="info${cls ? ' ' + cls : ''}" style="${at(x, y)}">${b.html}</div>` : ''

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
  /* the largest scale at which a stack fits a circle */
  function tuckStack(c, circ, rad, order, maxW, kMin, kMax, centred, o) {
    let lo = kMin, hi = kMax, got = null
    for (let i = 0; i < 9; i++) {
      const k = (lo + hi) / 2
      const b = stack(c, maxW, k, order, o)
      const p = b.h ? tuck(c, b.rows, b.h, circ, rad, centred) : null
      if (p) { got = { b, p, k }; lo = k } else hi = k
    }
    if (!got) { const b = stack(c, maxW, kMin, order, o); const p = b.h ? tuck(c, b.rows, b.h, circ, rad, centred) : null; if (p) got = { b, p, k: kMin } }
    return got
  }
  const ringDiv = (cx, cy, R, band, extra) => `<div class="ring" data-decor style="${at(cx - R, cy - R)};width:calc(${n2(2 * R)}*var(--u));height:calc(${n2(2 * R)}*var(--u));border-width:calc(${n2(band)}*var(--u))${extra || ''}"></div>`

  /* ================= layouts ================= */

  /* 1. The headline is the sheet: capitals fitted line by line to the full width, and one O is the orange ring */
  function letters(c) {
    const ls = -0.01, g = 2.2, top = 2.8
    const cap = meas('H', 900).asc
    const hasFoot = c.facts.length || c.say || c.points.length || c.tag
    const colW = (c.W - 2 * c.m - 5) / 2
    const footA = (k) => { let b = null; for (let i = 0; i < 6; i++) { b = stack(c, colW, k, c.facts.length ? ['fact'] : ['point'], { as: { point: 'fact' }, oneLine: true }); if (b.w <= colW) break; k *= 0.92 } return b }
    const A = footA(c.land ? 1.1 : 1)
    const B = stack(c, colW, 1, c.facts.length ? ['kick', 'say', 'point'] : ['kick', 'say'])
    const fh = Math.max(A.h, B.h)
    const room = (hasFoot ? c.H - c.m - fh - 4.5 : c.H - top) - top
    const words = c.head.toUpperCase().split(/\s+/).filter(Boolean)
    let best = null
    for (const lines of partitions(words, 7)) {
      const fss = lines.map((l) => c.W / (meas(l, 900, { ls }).w - 0.1))
      const total = fss.reduce((s, f) => s + f * cap, 0) + g * (lines.length - 1)
      const big = Math.max.apply(null, fss), small = Math.min.apply(null, fss)
      const score = (total <= room ? total / room : (room / total) * 0.55) * breakPenalty(lines) * (big / small > 3.4 ? 0.72 : 1) * (big > 64 ? 0.7 : 1)
      if (!best || score > best.score) best = { lines, fss, total, score }
    }
    const k = best.total > room ? room / best.total : 1
    const spare = room - best.total * k
    if (spare > 10 && hasFoot) {
      const kf = clamp(1 + spare / 55, 1, 1.7)
      const A2 = footA((c.land ? 1.1 : 1) * kf)
      const B2 = stack(c, colW, kf, c.facts.length ? ['kick', 'say', 'point'] : ['kick', 'say'])
      if (Math.max(A2.h, B2.h) - fh < spare - 6) { A.html = A2.html; A.h = A2.h; B.html = B2.html; B.h = B2.h }
    }
    const base = baseOf(1, 900)
    /* the mark: the first O of the largest line that has one; if there is no O, the last full stop */
    let mark = null
    best.lines.forEach((l, i) => { const j = l.indexOf('O'); if (j >= 0 && (!mark || best.fss[i] > best.fss[mark.i] + 0.01)) mark = { i, j, ch: 'O' } })
    if (!mark) { const i = best.lines.length - 1, j = best.lines[i].lastIndexOf('.'); if (j >= 0) mark = { i, j, ch: '.' } }
    const src = c.head.split(/\s+/).filter(Boolean)
    let used = 0, y = top
    const spans = best.lines.map((l, i) => {
      const fs = best.fss[i] * k
      const count = l.split(' ').length
      const text = src.slice(used, used + count).join(' ')
      used += count
      let over = ''
      if (mark && mark.i === i) {
        const G = meas(mark.ch, 900)
        const ox = meas(l.slice(0, mark.j) + mark.ch, 900, { ls }).w - meas(mark.ch, 900, { ls }).w
        const d = G.asc + G.desc, inkW = G.right - G.left
        const cx = ox + (G.left + G.right) / 2
        over = `<i class="cover" data-decor style="left:${n2(ox + G.left - 0.006)}em;top:${n2(base - G.asc - 0.006)}em;width:${n2(inkW + 0.012)}em;height:${n2(d + 0.012)}em"></i>`
          + (mark.ch === 'O'
            ? `<i class="o" data-decor style="left:${n2(cx - d / 2)}em;top:${n2(base - G.asc)}em;width:${n2(d)}em;height:${n2(d)}em"></i>`
            : `<i class="o dot" data-decor style="left:${n2(cx - inkW / 2)}em;top:${n2(base - G.asc)}em;width:${n2(inkW)}em;height:${n2(inkW)}em"></i>`)
      }
      const s = `<span class="ln" style="${at(-0.05 * fs, y - (base - cap) * fs)};${size(fs)}">${esc(text)}${over}</span>`
      y += cap * fs + g
      return s
    })
    const css = `.caps{left:0;top:0;font-weight:900;text-transform:uppercase;letter-spacing:${ls}em}
.ln{position:absolute;display:block;white-space:nowrap;line-height:1}
.cover{position:absolute;background:var(--paper)}
.o{position:absolute;box-sizing:border-box;border-radius:50%;border:.19em solid var(--orange)}
.o.dot{border:0;background:var(--orange)}`
    const body = `<h1 class="caps" data-bleed>${spans.join('')}</h1>${block(A, c.m, c.H - c.m - A.h)}${block(B, A.h ? c.m + colW + 5 : c.m, c.H - c.m - B.h)}`
    return { css, body }
  }

  /* 2. One letter is the whole poster: a giant O leaves the sheet, and the words stand in its counter */
  function counter(c) {
    const g = c.land ? { r: 43, R: 80, cx: c.W - 56, cy: 54 }
      : c.H > 160 ? { r: 56, R: 100, cx: 62, cy: c.H - 48 }
        : c.H > 130 ? { r: 50, R: 90, cx: 61, cy: c.H - 40.3 }
          : c.H > 105 ? { r: 50, R: 95, cx: 61, cy: c.H - 40.3 }
            : { r: 45, R: 88, cx: 57, cy: 57 }
    const rad = g.r - 3.4
    const kickIn = Math.hypot(g.cx - c.m, g.cy - c.m) < g.R + 4
    const kickW = c.tag ? meas(c.tag.toUpperCase(), 700, { ls: 0.14 }).w * 1.55 : 0
    const info = stack(c, Math.min(g.r * 1.3, 46), 1, ['fact', 'say', 'point'])
    const lh = 0.86
    function rowsFor(ws, hs) {
      const rows = []
      let y = 0
      if (kickIn && c.tag) { rows.push({ y, h: 1.9, w: kickW }); y += 1.9 + 2.6 }
      const headY = y
      ws.forEach((w) => { rows.push({ y: y + 0.07 * hs, h: 0.75 * hs, w: w * hs }); y += lh * hs })
      let infoY = y
      if (info.h) { y += 2.4; infoY = y; info.rows.forEach((r) => rows.push({ y: y + r.y, h: r.h, w: r.w })); y += info.h }
      return { rows, total: y, headY, infoY }
    }
    let best = null
    for (const lines of partitions(c.head.split(/\s+/).filter(Boolean), 5)) {
      const ws = lines.map((l) => meas(l, 900, { ls: -0.035 }).w)
      let lo = 4, hi = 30, got = null
      for (let i = 0; i < 11; i++) {
        const hs = (lo + hi) / 2
        const R = rowsFor(ws, hs)
        const p = tuck(c, R.rows, R.total, g, rad, false)
        if (p) { got = { hs, p, R }; lo = hs } else hi = hs
      }
      if (!got) continue
      const score = got.hs * breakPenalty(lines) * (0.84 + 0.16 * Math.min.apply(null, ws) / Math.max.apply(null, ws))
      if (!best || score > best.score) best = Object.assign({ lines, score }, got)
    }
    if (!best) return record(c)
    const x = best.p.x, y0 = best.p.y
    const css = `.ring{border-radius:50%;border-style:solid;border-color:var(--orange)}`
    const body = ringDiv(g.cx, g.cy, g.R, g.R - g.r)
      + (c.tag ? `<p class="kick" style="${kickIn ? at(x, y0) : at(c.m, c.m)};${size(1.55)}">${esc(c.tag)}</p>` : '')
      + headHtml({ lines: best.lines, fs: best.hs }, lh, at(x - 0.045 * best.hs, y0 + best.R.headY))
      + block(info, x, y0 + best.R.infoY)
    return { css, body }
  }

  /* 3. A heavy ring cropped by two edges; the headline stands over it and the facts sit in its counter */
  function record(c) {
    const m = c.m, lh = 0.86
    const kickH = c.tag ? 4.8 : 0
    let hz, maxW, R, cx, cy
    if (c.land) { R = 60; cx = c.W - 40; cy = 58; maxW = cx - R - 4 - m; hz = c.H - 2 * m } else { hz = clamp(0.36 * c.H, 30, 64); maxW = c.W - 2 * m }
    const sayB = stack(c, Math.min(maxW, 62), (c.land ? 1.1 : 1) * (c.facts.length || c.points.length ? 1 : 1.35), ['say'])
    const sayH = sayB.h ? sayB.h + 2.4 : 0
    const head = fitHead(c.head, { maxW, maxH: (c.land ? 0.66 * c.H : hz) - kickH - sayH, lh, weight: 900, ls: -0.035, cap: 26, maxLines: 4 })
    const headTop = m + kickH
    const textBottom = headTop + head.h + sayH
    if (!c.land) { R = Math.min((c.H - textBottom - 3.5) / 1.5, 0.72 * c.W); cx = c.W - 0.55 * R; cy = c.H - 0.5 * R }
    const band = 0.42 * R, r = R - band
    let inside = tuckStack(c, { cx, cy }, r - 3, ['fact', 'point'], 1e6, 0.7, 1.7, false, { oneLine: true })
    if (!inside || inside.k < 1) { const alt = tuckStack(c, { cx, cy }, r - 3, ['fact', 'point'], r * 1.35, 0.7, 1.7, false, { oneLine: true }); if (alt && (!inside || alt.k > inside.k)) inside = alt }
    const css = `.ring{border-radius:50%;border-style:solid;border-color:var(--orange)}`
    const body = ringDiv(cx, cy, R, band)
      + (c.tag ? `<p class="kick" style="${at(m, m)};${size(1.55)}">${esc(c.tag)}</p>` : '')
      + headHtml(head, lh, at(m - 0.045 * head.fs, headTop - (baseOf(lh, 900) - meas('H', 900).asc) * head.fs * 0.5))
      + block(sayB, m, headTop + head.h + 2.4)
      + (inside ? block(inside.b, inside.p.x, inside.p.y) : '')
    return { css, body }
  }

  /* 4. Rings grow from the full stop of the headline and open round the words */
  function arcs(c) {
    const m = c.m, lh = 0.9
    const maxW = c.land ? 0.36 * c.W : 0.6 * c.W
    const text = c.head.replace(/[.!]\s*$/, '')
    const head = fitHead(text, { maxW: maxW - 0.5, maxH: c.land ? 0.5 * c.H : 0.34 * c.H, lh, weight: 800, ls: -0.035, cap: 13.5, maxLines: 4 })
    const fs = head.fs
    const info = stack(c, maxW, 1, ['say', 'fact', 'kick'])
    const total = head.h + (info.h ? 2.8 + info.h : 0)
    const base = baseOf(lh, 800)
    const lastTop = (head.lines.length - 1) * lh * fs
    const sr = 0.15 * fs                                               // the stop: a disc on the baseline
    const top = clamp((c.land ? 0.5 : 0.52) * c.H - (lastTop + base * fs - sr), m, c.H - m - total)
    const sx = m + head.ws[head.ws.length - 1] * fs + 0.06 * fs + sr, sy = top + lastTop + base * fs - sr
    /* what the rings must stay clear of: every line of type */
    const rects = head.lines.map((l, i) => ({ x1: m - 2, x2: m + head.ws[i] * fs, y1: top + i * lh * fs + 0.04 * fs, y2: top + (i + 1) * lh * fs - 0.02 * fs }))
    rects[rects.length - 1].x2 = sx - sr - 0.02 * fs
    if (info.h) info.rows.forEach((r) => rects.push({ x1: m - 2, x2: m + r.w, y1: top + head.h + 2.8 + r.y, y2: top + head.h + 2.8 + r.y + r.h }))
    const dist = (px, py, q) => Math.hypot(Math.max(q.x1 - px, 0, px - q.x2), Math.max(q.y1 - py, 0, py - q.y2))
    const far = Math.max(Math.hypot(sx, sy), Math.hypot(c.W - sx, sy), Math.hypot(sx, c.H - sy), Math.hypot(c.W - sx, c.H - sy))
    const paths = []
    for (let k = 0, rho = 3.4 * sr; rho * 0.8 < far && k < 9; k++, rho *= 2) {
      const sw = 0.4 * rho, clear = sw / 2 + 1.3
      const free = []
      for (let a = 0; a < 720; a++) {
        const t = (a / 2) * Math.PI / 180
        const px = sx + rho * Math.cos(t), py = sy + rho * Math.sin(t)
        free.push(rects.every((q) => dist(px, py, q) >= clear))
      }
      if (free.every(Boolean)) { paths.push(`<circle cx="${n2(sx)}" cy="${n2(sy)}" r="${n2(rho)}" stroke-width="${n2(sw)}"/>`); continue }
      const start = free.findIndex((f, i) => f && !free[(i + 719) % 720])
      if (start < 0) continue
      let longest = null
      for (let i = 0; i < 720;) {
        const a = (start + i) % 720
        if (!free[a]) { i++; continue }
        let len = 0
        while (len < 720 && free[(a + len) % 720]) len++
        if (!longest || len > longest.len) longest = { a, len }
        i += len
      }
      if (longest && longest.len > 40) {
        const t1 = (longest.a / 2) * Math.PI / 180, t2 = ((longest.a + longest.len - 1) / 2) * Math.PI / 180
        paths.push(`<path d="M${n2(sx + rho * Math.cos(t1))} ${n2(sy + rho * Math.sin(t1))}A${n2(rho)} ${n2(rho)} 0 ${longest.len > 360 ? 1 : 0} 1 ${n2(sx + rho * Math.cos(t2))} ${n2(sy + rho * Math.sin(t2))}" stroke-width="${n2(sw)}"/>`)
      }
    }
    const css = `.art *{fill:none;stroke:var(--orange);stroke-linecap:butt}
.stop{display:inline-block;vertical-align:baseline;width:.3em;height:.3em;margin-left:.06em;border-radius:50%;background:var(--orange)}`
    const body = `<svg class="art" data-decor aria-hidden="true" viewBox="0 0 ${n2(c.W)} ${n2(c.H)}" preserveAspectRatio="none">${paths.join('')}</svg>`
      + headHtml(head, lh, at(m - 0.04 * fs, top) + ';font-weight:800', '<i class="stop" data-decor></i>')
      + block(info, m, top + head.h + 2.8)
    return { css, body }
  }

  /* 5. The date is the picture: a numeral as big as the sheet allows, with the ring passing behind it */
  function numeral(c) {
    const m = c.m, num = c.number
    const G = meas(num, 900, { ls: -0.045 })
    const inkW = G.right - G.left + (num.length - 1) * -0.045, asc = G.asc
    const base = baseOf(1, 900)
    let fs, inkLeft, R, cx, cy, zoneW, zoneH
    if (c.land) {
      fs = Math.min((0.9 * c.H) / asc, (0.52 * c.W) / inkW)
      inkLeft = c.W - (num.length > 1 ? -2 : m) - inkW * fs
      R = 0.3 * c.H; cx = inkLeft + 0.06 * fs; cy = c.H - m - asc * fs + 0.1 * fs
      zoneW = cx - R - 4 - m; zoneH = c.H - 2 * m
    } else {
      const share = c.H < 105 ? 0.46 : c.H < 130 ? 0.5 : 0.54
      fs = num.length > 1 ? Math.min((c.W - m + 3) / inkW, (share * c.H) / asc) : Math.min((0.8 * c.W) / inkW, (share * c.H) / asc)
      inkLeft = m - 0.6
      R = 0.25 * c.W; cx = c.W - 0.17 * c.W; cy = c.H - m - asc * fs + 0.02 * fs
      zoneW = cx - R - 3.5 - m; zoneH = c.H - m - asc * fs - 3.5 - m
    }
    const numTop = c.H - m - asc * fs
    const kickH = c.tag ? 4.8 : 0
    const lh = 0.9
    let info, head
    for (const k of [1, 0.9, 0.8]) {
      info = stack(c, zoneW, k, ['fact', 'say'])
      head = fitHead(c.head, { maxW: zoneW, maxH: Math.max(6, zoneH - kickH - (info.h ? info.h + 2.6 : 0)), lh, weight: 800, ls: -0.03, cap: c.land ? 13 : 11.5, maxLines: 4 })
      if (head.fs >= 7.5) break
    }
    const css = `.ring{border-radius:50%;border-style:solid;border-color:var(--orange)}
.num{font-weight:900;line-height:1;letter-spacing:-.045em;white-space:nowrap}`
    const body = ringDiv(cx, cy, R, 0.36 * R)
      + `<p class="num" data-bleed style="${at(inkLeft - G.left * fs, c.H - m - base * fs)};${size(fs)}">${esc(num)}</p>`
      + (c.tag ? `<p class="kick" style="${at(m, m)};${size(1.55)}">${esc(c.tag)}</p>` : '')
      + headHtml(head, lh, at(m - 0.04 * head.fs, m + kickH) + ';font-weight:800;letter-spacing:-.03em')
      + block(info, m, m + kickH + head.h + 2.6)
    return { css, body, numTop }
  }

  /* 6. Words set round the O: the headline runs on rings of type outside it, the facts stand in its counter */
  function rings(c) {
    if (c.land || c.H < 1.2 * c.W) return null
    const k = c.H > 160 ? 1.18 : 1
    const R = 55 * k, r = 37.5 * k, cx = c.W / 2
    let phrases = c.head.split(/(?<=[.!?])\s+/).filter(Boolean)
    if (phrases.length !== 2) {
      phrases = [c.head]
      const words = c.head.split(/\s+/).filter(Boolean)
      if (words.length >= 4) {
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
    const order = phrases.slice().reverse()                       // the first sentence runs on the outer ring
    const sets = []
    let inner = R + 2.7
    for (let i = 0; i < order.length; i++) {
      const w = meas(order[i].toUpperCase(), 900).w + 0.42
      const target = (order.length === 1 ? 12.5 : i === 0 ? 12.4 : 10.5) * k
      let N = Math.max(2, Math.round((2 * Math.PI * inner) / (w * target))), fs = 0
      for (; N < 14; N++) {
        fs = (2 * Math.PI * inner) / (N * w)
        const half = ((w - 0.42) * fs) / 2 / inner
        if (half < Math.PI / 2 && (inner + 0.74 * fs) * Math.sin(half) <= c.W / 2 - c.m - 0.5) break
      }
      if (N >= 14 || fs < 4.2) return null
      sets.push({ text: order[i], rho: inner, fs, N })
      inner = inner + 0.72 * fs + 2.6
    }
    const topOut = sets[sets.length - 1].rho + 0.74 * sets[sets.length - 1].fs
    const cy = Math.max(c.m + topOut + 0.6, c.H - 50 * k)
    const defs = [], texts = []
    sets.forEach((s, si) => {
      const q = n2(s.rho)
      defs.push(`<path id="tr${si}" d="M0,-${q} A${q},${q} 0 1 1 0,${q} A${q},${q} 0 1 1 0,-${q} A${q},${q} 0 1 1 0,${q} A${q},${q} 0 1 1 0,-${q}"/>`)
      for (let j = 0; j < s.N; j++) {
        const off = 50 + ((j <= s.N / 2 ? j : j - s.N) * 50) / s.N
        texts.push(`<text style="${size(s.fs)}"${j ? ' aria-hidden="true" data-bleed' : ''}><textPath href="#tr${si}" startOffset="${n2(off)}%">${esc(s.text)}</textPath></text>`)
      }
    })
    const circ = { cx, cy }
    const inside = tuckStack(c, circ, r - 4, c.facts.length ? ['kick', 'fact', 'say'] : ['kick', 'say', 'point'], r * 1.5, 0.75, c.facts.length ? 1.9 : 1.5, true, { oneLine: true, scale: { say: c.facts.length ? 0.7 : 1.25 } })
    const css = `.disc{border-radius:50%;background:var(--orange)}
.hole{border-radius:50%;background:var(--paper)}
.type{left:0;top:0;width:100vw;height:100vh;overflow:visible;--n:tan(atan2(var(--u),1px))}
.type path{transform:translate(calc(${n2(cx)}*var(--u)),calc(${n2(cy)}*var(--u))) scale(var(--n))}
.type text{font-family:'Figtree','Segoe UI',Arial,sans-serif;font-weight:900;text-transform:uppercase;text-anchor:middle;fill:var(--ink)}
.info.mid{transform:translateX(-50%);text-align:center}`
    const circle = (rad, cls) => `<div class="${cls}" data-decor style="${at(cx - rad, cy - rad)};width:calc(${n2(2 * rad)}*var(--u));height:calc(${n2(2 * rad)}*var(--u))"></div>`
    const body = circle(R, 'disc') + circle(r, 'hole')
      + `<svg class="type" xmlns="http://www.w3.org/2000/svg"><defs>${defs.join('')}</defs>${texts.join('')}</svg>`
      + (inside ? block(inside.b, inside.p.x, inside.p.y, 'mid') : '')
    return { css, body }
  }

  /* 7. Sixty strokes round an empty O, each longer than the last; the longest leave the sheet */
  function burst(c) {
    const m = c.m
    let ri = c.land ? 24 : c.H < 105 ? 20 : 25
    const cx = c.land ? c.W - 50 : 0.62 * c.W
    let cy = c.land ? 52 : c.H < 105 ? 0.33 * c.H : c.H < 130 ? 0.365 * c.H : c.H > 160 ? 0.36 * c.H : 0.4 * c.H
    const lh = 0.86
    let head, body
    const kick = c.tag ? `<p class="kick" style="${at(m, m)};${size(1.55)}">${esc(c.tag)}</p>` : ''
    if (c.land) {
      const maxW = cx - ri - 9 - m
      const info = stack(c, maxW, 1.1, ['say', 'fact'])
      head = fitHead(c.head, { maxW, maxH: c.H - 2 * m - 4.8 - (info.h ? info.h + 5 : 0), lh, weight: 900, ls: -0.035, cap: 22, maxLines: 4 })
      body = kick + headHtml(head, lh, at(m - 0.045 * head.fs, m + 4.8)) + block(info, m, c.H - m - info.h)
    } else {
      const colW = (c.W - 2 * m - 5) / 2
      const A = stack(c, colW, 1, c.facts.length ? ['fact'] : ['say'])
      const B = stack(c, colW, 1, c.facts.length ? ['say', 'point'] : ['point'])
      const fh = Math.max(A.h, B.h)
      const need = c.H - m - (fh ? fh + 4 : 0) - 19                    // the headline keeps room for two good lines
      for (; ri > 12 && cy + ri + 11.5 > need; ri -= 1) cy = Math.max(ri + 8, cy - 1.2)
      const zoneTop = cy + ri + 11.5
      head = fitHead(c.head, { maxW: c.W - 2 * m, maxH: c.H - m - zoneTop - (fh ? fh + 4 : 0), lh, weight: 900, ls: -0.035, cap: 24, maxLines: 3 })
      const headTop = c.H - m - (fh ? fh + 4 : 0) - head.h
      body = kick + headHtml(head, lh, at(m - 0.045 * head.fs, headTop)) + block(A, m, c.H - m - A.h) + block(B, m + colW + 5, c.H - m - B.h)
    }
    const q = Math.pow(95 / 1.6, 1 / 59), sw = 1.6 * Math.max(0.7, ri / 25)
    const lines = []
    for (let k = 0; k < 60; k++) {
      const a = ((-120 - 6 * k) * Math.PI) / 180, L = 1.6 * Math.pow(q, k)
      lines.push(`<line x1="${n2(cx + ri * Math.cos(a))}" y1="${n2(cy + ri * Math.sin(a))}" x2="${n2(cx + (ri + L) * Math.cos(a))}" y2="${n2(cy + (ri + L) * Math.sin(a))}"/>`)
    }
    const css = `.art line{stroke:var(--orange);stroke-width:${n2(sw)};stroke-linecap:butt}`
    return { css, body: `<svg class="art" data-decor aria-hidden="true" viewBox="0 0 ${n2(c.W)} ${n2(c.H)}" preserveAspectRatio="none">${lines.join('')}</svg>` + body }
  }

  /* 8. Three rings, each smaller than the last, hung from one axis: one ring for each thing to do */
  function steps(c) {
    const m = c.m, lh = 0.86, n = Math.min(3, c.points.length)
    if (n < 2) return null
    const ratios = [1, 0.62, 0.38].slice(0, n), sum = ratios.reduce((a, b) => a + b, 0)
    const kick = c.tag ? `<p class="kick" style="${at(m, m)};${size(1.55)}">${esc(c.tag)}</p>` : ''
    const kickH = c.tag ? 4.8 : 0
    let head, zt, zb, ax, xt, tw, body = kick
    if (c.land) {
      const maxW = 0.43 * c.W - m
      const info = stack(c, maxW, 1.05, ['say', 'fact'])
      head = fitHead(c.head, { maxW, maxH: c.H - 2 * m - kickH - (info.h ? info.h + 5 : 0), lh, weight: 900, ls: -0.035, cap: 20, maxLines: 4 })
      body += headHtml(head, lh, at(m - 0.045 * head.fs, m + kickH)) + block(info, m, c.H - m - info.h)
      zt = m; zb = c.H - m
      const d1 = (zb - zt - 3 * (n - 1)) / sum
      ax = 0.47 * c.W + d1; xt = ax + 4.5; tw = c.W - m - xt
    } else {
      const sayB = stack(c, c.W - 2 * m, 1, ['say'])
      const facts = stack(c, c.W - 2 * m, 1, ['fact'])
      head = fitHead(c.head, { maxW: c.W - 2 * m, maxH: 0.24 * c.H, lh, weight: 900, ls: -0.035, cap: 20, maxLines: 3 })
      body += headHtml(head, lh, at(m - 0.045 * head.fs, m + kickH)) + block(sayB, m, m + kickH + head.h + 2.2) + block(facts, m, c.H - m - facts.h)
      zt = m + kickH + head.h + (sayB.h ? sayB.h + 2.2 : 0) + 4.5
      zb = c.H - m - (facts.h ? facts.h + 4.5 : 0)
      const d1 = Math.min((zb - zt - 3 * (n - 1)) / sum, 0.64 * c.W)
      ax = clamp(0.72 * d1, 26, 0.46 * c.W); xt = ax + 4.5; tw = c.W - m - xt
    }
    const d1 = Math.min((zb - zt - 3 * (n - 1)) / sum, c.land ? 1e9 : 0.64 * c.W)
    const used = d1 * sum + 3 * (n - 1)
    let y = zt + (c.land ? (zb - zt - used) / 2 : 0)
    for (let i = 0; i < n; i++) {
      const d = d1 * ratios[i]
      const fs = clamp(d1 * ratios[Math.min(i, 1)] * 0.17, 3, 7.4)
      const ls = wrap(c.points[i], tw, fs, 800, { ls: -0.02 })
      const th = ls.length * fs * 1.08
      body += ringDiv(ax - d / 2, y + d / 2, d / 2, 0.24 * d)
        + `<p class="step" style="${at(xt, y + d / 2 - th / 2)};${size(fs)}">${ls.map((l) => `<span class="l">${esc(l)}</span>`).join('')}</p>`
      y += d + 3
    }
    const css = `.ring{border-radius:50%;border-style:solid;border-color:var(--orange)}
.step{font-weight:800;line-height:1.08;letter-spacing:-.02em}`
    return { css, body }
  }

  const DRAW = { letters, counter, record, arcs, numeral, rings, burst, steps }

  /* ================= the sheet ================= */
  function makePoster(d) {
    const kind = KINDS[d.kind] ? d.kind : 'Notice'
    const K = KINDS[kind]
    const fmt = FORMATS[d.format] || FORMATS.a3
    const short = Math.min(fmt[0], fmt[1])
    const T = STYLES[d.style] || STYLES.light
    const styleKey = STYLES[d.style] ? d.style : 'light'
    const head = String(d.headline || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim() || K.tag
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim()
    const c = {
      W: (fmt[0] / short) * 100, H: (fmt[1] / short) * 100, m: 7, land: fmt[0] > fmt[1] * 1.1,
      head, say: clean(d.line), tag: clean(d.tag || K.tag),
      facts: [d.when, d.time, d.where].map(clean).filter(Boolean),
      points: (d.points || []).map(clean).filter(Boolean).slice(0, 3),
      number: (clean(d.when).match(/\d{1,2}/) || [''])[0],
    }
    const can = (l) => (l !== 'numeral' || c.number) && (l !== 'steps' || c.points.length > 1) && (l !== 'rings' || (!c.land && c.H >= 1.2 * c.W))
    const order = (LAYOUTS[d.layout] ? [d.layout] : []).concat(K.layouts)
    let layout = null, res = null
    for (const l of order) {
      if (!can(l)) continue
      res = DRAW[l](c)
      if (res) { layout = l; break }
    }
    if (!res) { layout = 'record'; res = record(c) }
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
.poster>*{position:absolute}
.l{display:block;white-space:nowrap}
.head{font-weight:900;letter-spacing:-.035em;white-space:nowrap}
.fact{font-weight:800;line-height:1.2;letter-spacing:-.012em}
.say{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:400;line-height:1.18}
.pt{font-weight:600;line-height:1.26}
.kick{font-weight:700;line-height:1.2;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
.art{left:0;top:0;width:100vw;height:100vh;display:block}
${res.css}
</style>
</head>
<body>
<main class="poster L-${layout}">
${res.body}
</main>
</body>
</html>`
    return { html, layout, style: styleKey, picture: null }
  }

  window.PosterEngine = { makePoster, ready, can: null, KINDS, LAYOUTS, STYLES, FORMATS }
})()
