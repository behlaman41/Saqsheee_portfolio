/**
 * All page interactivity, ported 1:1 from reference/index.html.
 * Plain vanilla — no framework, no runtime dependency.
 *
 * Timings, easings and thresholds are the reference's; do not retune them
 * without changing the reference too.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── scroll progress + parallax (one rAF loop) ── */
const bar = document.getElementById('progress')
const plx = [...document.querySelectorAll('[data-parallax]')]
let ticking = false
const skewEls = [...document.querySelectorAll('.marquee, .foot-marquee')]
let lastY = scrollY,
  vel = 0
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const h = document.documentElement
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%'
    if (!reduce) {
      for (const el of plx) {
        const r = el.getBoundingClientRect()
        const mid = r.top + r.height / 2 - innerHeight / 2
        el.style.transform = `translateY(${(-mid * +el.dataset.parallax).toFixed(1)}px)`
      }
      vel = vel * 0.82 + (scrollY - lastY) * 0.18
      lastY = scrollY
      const skew = Math.max(-3.2, Math.min(3.2, vel * 0.09))
      for (const el of skewEls) el.style.transform = `skewX(${skew.toFixed(2)}deg)`
      // keep ticking while the velocity settles, so the skew decays smoothly
      if (Math.abs(vel) > 0.08) {
        ticking = false
        onScroll()
        return
      }
    }
    ticking = false
  })
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ── reveals + counters ── */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries)
      if (e.isIntersecting) {
        e.target.classList.add('is-in')
        if (e.target.querySelector?.('.count')) runCounters(e.target)
        io.unobserve(e.target)
      }
  },
  { threshold: 0.18 }
)
document.querySelectorAll('.reveal, .ph').forEach((el) => io.observe(el))

function runCounters(scope) {
  scope.querySelectorAll('.count').forEach((el) => {
    const target = +el.dataset.target
    if (reduce) {
      el.textContent = target
      return
    }
    const t0 = performance.now(),
      dur = 1300
    ;(function tick(t) {
      const p = Math.min((t - t0) / dur, 1)
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)))
      if (p < 1) requestAnimationFrame(tick)
    })(t0)
  })
}

/* ── stats.json override (edit that one file to update the numbers) ── */
fetch('/stats.json')
  .then((r) => (r.ok ? r.json() : null))
  .then((s) => {
    if (!s) return
    document.querySelectorAll('.count').forEach((el) => {
      // data-key is emitted from src/data/site.ts, so the mapping is by name
      // rather than by DOM order.
      const v = s[el.dataset.key]
      if (v == null) return
      el.dataset.target = v
      if (el.closest('.is-in')) el.textContent = v
    })
    const foot = document.querySelector('.stats-foot')
    if (s.footnote && foot) foot.textContent = s.footnote
  })
  .catch(() => {})

/* ── reel posters: paint the cover frame just before the tile arrives ──
   The poster is held in data-poster because a real poster attribute is fetched
   eagerly regardless of preload="none", and four covers of it would compete
   with the hero image on first load. rootMargin gives the cover time to decode
   while the tile is still off-screen. */
const pio = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const v = e.target
      if (v.dataset.poster) v.poster = v.dataset.poster
      pio.unobserve(v)
    }
  },
  { rootMargin: '300px 0px' }
)

/* ── reel videos: lazy-load + play in view, pause out of view ── */
const vio = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const v = e.target
      if (e.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src
        v.play().catch(() => {})
      } else if (v.src) v.pause()
    }
  },
  { threshold: 0.35 }
)
document.querySelectorAll('.reel video').forEach((v) => {
  v.addEventListener('error', () => v.remove(), { once: true }) /* missing file → tile stays */
  pio.observe(v)
  vio.observe(v)
})
