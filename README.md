# Sakshi Behl — link-in-bio media kit

A one-page media kit for [@saqsheee](https://www.instagram.com/saqsheee/) — fashion,
hair and beauty creator, Delhi NCR. Built with [Astro](https://astro.build), fully
static, no client-side framework. The only JavaScript that ships is ~2 kB of vanilla
scroll and video behaviour.

The page is a port of the approved design in [`reference/index.html`](reference/) — that
file stays in the repo as the visual source of truth. Colours, type, spacing, copy and
animation timings all come from it; if you change something here, change it there too
(or accept that the reference is now historical).

---

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/ locally
npm run check    # Astro + TypeScript diagnostics
```

Node 18+ (developed on 22).

Every binary in the repo — the reference bundle, the photos, the reels and their
posters, the woff2 files — is derived from the originals in `media/`.
[`scripts/rebuild-assets.sh`](scripts/rebuild-assets.sh) regenerates all of them and is
the written-down provenance of each:

```bash
npm install && bash scripts/rebuild-assets.sh && npm run build
```

It needs `ffmpeg` for the reels and skips that step with a note if it is missing. Re-run
it any time; it overwrites in place and reproduces the committed files byte-for-byte.

---

## Deploy — Cloudflare Pages

Connect the repo in the Cloudflare dashboard (**Workers & Pages → Create → Pages →
Connect to Git**) and use:

| Setting | Value |
| --- | --- |
| Framework preset | Astro (or None) |
| Build command | `astro build` |
| Build output directory | `dist` |
| Root directory | *(leave blank)* |
| Node version | `20` or newer — set `NODE_VERSION=20` under environment variables |

Every push to the default branch redeploys. Pull requests get preview URLs.

**One thing to change after the first deploy:** `site` in
[`astro.config.mjs`](astro.config.mjs) is set to a placeholder
(`https://sakshibehl.pages.dev`). Point it at the real origin — the `*.pages.dev`
subdomain Cloudflare assigns, or the custom domain once one is attached. It is what
makes `og:image` and `<link rel="canonical">` absolute, so link previews on Instagram,
WhatsApp and iMessage resolve correctly.

Caching and security headers live in [`public/_headers`](public/_headers). Hashed build
assets and fonts are immutable for a year; `stats.json` is deliberately short-lived so a
monthly edit shows up the same day.

---

## Updating the monthly numbers

Edit [`public/stats.json`](public/stats.json) — nothing else:

```json
{
  "views": 912,
  "reached": 728,
  "saves": 10,
  "growth": 17,
  "footnote": "9.5K+ followers · 20 reels a month · content reaching ~75× her follower base"
}
```

Numbers only — no `K` or `%`, those are fixed in the page. The four keys map to the four
counters in order: reel views, accounts reached, saves, follower growth. `footnote`
replaces the line under the stats.

The page fetches this file at runtime, so a change is live as soon as Cloudflare
redeploys — no rebuild logic to think about. If the file is missing or malformed the
page quietly keeps the numbers baked in at build time.

---

## Replacing the reels

The Recent Work section plays four self-hosted clips. To swap one:

1. Drop the new video in as `public/reels/reel-N.mp4` (N = 1–4, left to right).
2. Re-cut a poster frame: `ffmpeg -i public/reels/reel-N.mp4 -frames:v 1 -q:v 4 public/reels/cover-N.jpg`
3. Update the matching Instagram permalink in `work.reels[]` in
   [`src/data/site.ts`](src/data/site.ts) — the whole tile links there.

Compression used for the current set (720p, no audio track since the tiles are muted):

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p \
  -crf 26 -preset slow -g 60 -an -movflags +faststart \
  public/reels/reel-N.mp4
```

If a file is missing or fails to decode, that tile falls back to its numbered
placeholder — the page never shows a broken video.

---

## Replacing the photos

Photos live in [`src/assets/`](src/assets/) and are processed at build time by
`astro:assets` into AVIF/WebP/JPEG at 480/800/1200 wide. Replace the file, keep the
name, and rebuild. Alt text and framing (`object-position`) are set per photo in
[`src/data/site.ts`](src/data/site.ts).

One constraint on the hero: it is composited with `mix-blend-mode: multiply` and a soft
radial mask so it dissolves into the page background. It needs to be **shot against a
light, plain wall** or the blend will look muddy. The other photos have no such
requirement.

---

## Where things live

```
src/
  data/site.ts        all copy, links, stat targets, reel URLs — no strings in markup
  layouts/Base.astro  <head>, topbar, footer, background layers
  components/         Hero, Stats, About, Gallery, Brands, Work, Services, Contact, FooterMarquee
  scripts/motion.js   scroll progress, reveals, counters, parallax, marquee skew, reel observers
  styles/
    tokens.css        the design-token block — every colour, font and spacing value
    fonts.css         self-hosted @font-face + metric-matched fallbacks
    global.css        everything else, ported from the reference
  assets/             source photos
public/
  fonts/              woff2 vendored from @fontsource
  reels/              reel-1..4.mp4 + cover-1..4.jpg
  stats.json          the monthly numbers
  og.jpg              social share image
  _headers            Cloudflare Pages caching + security headers
reference/            the approved design this port is measured against
media/                original source archive (not part of the build)
```

**To change a colour, size or easing curve**, edit `src/styles/tokens.css`.
**To change wording**, edit `src/data/site.ts`.

---

## Notes

- Fonts are self-hosted (Fraunces variable, IBM Plex Sans, IBM Plex Mono) — no Google
  Fonts CDN, no third-party requests anywhere on the page. No analytics, no cookies, so
  no cookie banner.
- `prefers-reduced-motion: reduce` disables every animation, parallax and count-up.
- Targets Safari/iOS 15+ so it behaves inside Instagram's in-app browser; `color-mix`,
  `backdrop-filter` and `mask-image` all ship with fallbacks or prefixes.
