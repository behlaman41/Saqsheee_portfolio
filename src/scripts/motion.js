/**
 * All page interactivity, ported 1:1 from reference/index.html.
 * Plain vanilla — no framework, no runtime dependency.
 *
 * Timings, easings and thresholds are the reference's; do not retune them
 * without changing the reference too.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

/* iOS Safari can still allow pinch-zoom even with maximum-scale=1; block the
   gesture so the page can't be scaled out and leave empty margins. */
for (const evt of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(evt, (e) => e.preventDefault(), { passive: false })
}

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

/* ── reel marquee: continuous cruise, duplicated track, no page count ──
   Offset wraps at the first-copy width so the loop is invisible. Velocity
   eases toward cruise / rest so pause and resume don't hitch. */
function initReelCarousel() {
  const root = document.querySelector('[data-reel-carousel]')
  if (!root || root.dataset.carouselReady) return
  root.dataset.carouselReady = '1'
  const track = root.querySelector('.work-track')
  const originals = [...track.querySelectorAll('.reel:not([aria-hidden="true"])')]
  const count = originals.length
  if (count < 2) return

  if (reduce) {
    root.classList.add('is-static')
    return
  }

  let offset = 0
  let vel = 0
  let hovering = false
  let inView = false
  let dragging = false
  let locked = false
  let didSwipe = false
  let startX = 0
  let startY = 0
  let lastX = 0
  let lastT = performance.now()
  let raf = 0

  function loopW() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0
    return count * (originals[0].getBoundingClientRect().width + gap)
  }

  function wrap() {
    const w = loopW()
    if (w <= 0) return
    offset = ((offset % w) + w) % w
  }

  function apply() {
    wrap()
    track.style.transform = `translate3d(${-offset}px,0,0)`
  }

  function cruising() {
    return !hovering && inView && !dragging && !document.hidden
  }

  function tick(now) {
    const dt = Math.min(now - lastT, 40)
    lastT = now
    const box = root.getBoundingClientRect()
    inView = box.bottom > 60 && box.top < innerHeight - 40
    const w = loopW()
    const msPerReel = innerWidth < 640 ? 5600 : 7200
    const target = cruising() && w > 0 ? w / (count * msPerReel) : 0
    const settle = target === 0 ? 240 : 640
    vel += (target - vel) * (1 - Math.exp(-dt / settle))
    if (!dragging) offset += vel * dt
    apply()
    if (document.hidden) {
      raf = 0
      return
    }
    raf = requestAnimationFrame(tick)
  }

  function kick() {
    if (raf) return
    lastT = performance.now()
    raf = requestAnimationFrame(tick)
  }

  root.addEventListener('mouseenter', () => {
    hovering = true
    kick()
  })
  root.addEventListener('mouseleave', () => {
    hovering = false
    kick()
  })
  root.addEventListener('focusin', () => {
    hovering = true
    kick()
  })
  root.addEventListener('focusout', () => {
    if (!root.contains(document.activeElement)) {
      hovering = false
      kick()
    }
  })
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    vel += (loopW() / (count * 420)) * dir
    kick()
  })

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick()
  })

  apply()
  kick()

  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    dragging = true
    didSwipe = false
    locked = false
    startX = lastX = e.clientX
    startY = e.clientY
    vel = 0
    kick()
  })
  addEventListener('pointermove', (e) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    if (!locked) {
      const adx = Math.abs(e.clientX - startX)
      const ady = Math.abs(e.clientY - startY)
      if (adx < 8 && ady < 8) return
      locked = adx >= ady
      if (!locked) {
        dragging = false
        kick()
        return
      }
    }
    lastX = e.clientX
    offset -= dx
    if (Math.abs(e.clientX - startX) > 10) didSwipe = true
    const dt = Math.max(e.timeStamp - lastT, 8)
    vel = -dx / dt
    lastT = e.timeStamp
    apply()
  })
  function endPointer() {
    if (!dragging) return
    dragging = false
    kick()
  }
  addEventListener('pointerup', endPointer)
  addEventListener('pointercancel', endPointer)
  root.addEventListener(
    'click',
    (e) => {
      if (!didSwipe) return
      e.preventDefault()
      e.stopPropagation()
      didSwipe = false
    },
    true
  )

  addEventListener('resize', () => apply())
}

initReelCarousel()

/* ── reel posters: paint the cover frame just before the tile arrives ──
   The poster is held in data-poster because a real poster attribute is fetched
   eagerly regardless of preload="none", and the covers would compete with the
   hero image on first load. rootMargin gives the cover time to decode while
   the tile is still off-screen. */
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

/* ── reel videos: lazy-load + play in the carousel viewport, pause outside ── */
const carousel = document.querySelector('[data-reel-carousel]')
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
  { root: carousel, threshold: 0.4 }
)
document.querySelectorAll('.reel video').forEach((v) => {
  v.addEventListener('error', () => v.remove(), { once: true }) /* missing file → tile stays */
  pio.observe(v)
  vio.observe(v)
})
