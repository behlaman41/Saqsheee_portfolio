#!/usr/bin/env bash
#
# Regenerate every binary asset in the repo from the originals in media/.
#
# Nothing here is creative — it is the exact provenance of the files that are
# already committed, written down so they can be rebuilt from scratch:
#
#   reference/, src/assets/, public/og.jpg   <- media/files/sakshi-behl-site.zip
#   public/reels/reel-N.mp4 + cover-N.jpg    <- media/videos/clip-0N.mp4
#   public/fonts/*.woff2                     <- node_modules/@fontsource*
#
# Safe to re-run; every step overwrites in place.
#
#   npm install && bash scripts/rebuild-assets.sh && npm run build
#
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\nerror: %s\n' "$*" >&2; exit 1; }

[ -f media/files/sakshi-behl-site.zip ] || die "media/files/sakshi-behl-site.zip is missing — it is the design source of truth."
command -v unzip >/dev/null || die "unzip not found"

# ── 1. the approved reference bundle ────────────────────────────────────────
say "1/4  Unpacking the reference design"
mkdir -p reference
unzip -oq media/files/sakshi-behl-site.zip -d reference/
ls reference/index.html >/dev/null || die "zip did not contain index.html"

# ── 2. photos the site actually renders ─────────────────────────────────────
say "2/4  Copying photos into src/assets and public/"
mkdir -p src/assets public
cp reference/hero.jpg reference/about-saree.jpg reference/gal-corridor.jpg \
   reference/gal-dreamy.jpg reference/gal-livingroom.jpg src/assets/
cp reference/og.jpg reference/stats.json public/

# ── 3. reels ────────────────────────────────────────────────────────────────
# 720p H.264, CRF 26, faststart. Audio is dropped: the tiles are muted, so the
# track is pure weight. Poster = frame 0 of the encoded file, so the still and
# the first video frame match exactly.
say "3/4  Encoding reels + posters"
if ! command -v ffmpeg >/dev/null; then
  echo "  ffmpeg not found — skipping. Install it and re-run to rebuild public/reels/."
else
  mkdir -p public/reels
  i=1
  for src in media/videos/clip-01.mp4 media/videos/clip-02.mp4 \
             media/videos/clip-03.mp4 media/videos/clip-04.mp4 \
             media/videos/clip-05.mp4 media/videos/clip-06.mp4 \
             media/videos/clip-07.mp4; do
    [ -f "$src" ] || die "$src is missing"
    echo "  [$i] $src -> public/reels/reel-$i.mp4"
    # clip-06 opens on Instagram's in-app music picker; skip that overlay.
    extra=()
    if [ "$src" = "media/videos/clip-06.mp4" ]; then extra=(-ss 2.8); fi
    ffmpeg -y -loglevel error "${extra[@]}" -i "$src" \
      -vf "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)':flags=lanczos" \
      -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p \
      -crf 26 -preset slow -g 60 \
      -an -movflags +faststart \
      "public/reels/reel-$i.mp4"
    ffmpeg -y -loglevel error -i "public/reels/reel-$i.mp4" \
      -frames:v 1 -q:v 4 "public/reels/cover-$i.jpg"
    i=$((i + 1))
  done
fi

# ── 4. fonts ────────────────────────────────────────────────────────────────
# Vendored rather than imported so the <link rel="preload"> in Base.astro can
# point at a stable, unhashed path. Latin subset only — the page is all Latin.
# Fraunces uses the opsz axis build: the reference loaded Google Fonts with
# opsz 9..144, and font-optical-sizing:auto is what shapes the 148px hero.
say "4/4  Vendoring fonts from node_modules"
if [ ! -d node_modules/@fontsource-variable/fraunces ]; then
  echo "  node_modules missing — run 'npm install' first, then re-run this script."
else
  mkdir -p public/fonts
  cp node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2 public/fonts/
  cp node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2 public/fonts/
  cp node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2 public/fonts/
  cp node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2 public/fonts/
  cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2 public/fonts/
  cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2 public/fonts/
fi

say "Done. Next: npm run build"
