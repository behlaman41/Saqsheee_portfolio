// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  // Live Worker origin — used for <link rel="canonical"> and og:image.
  // Update again when a custom domain (e.g. saqsheee.com) is attached.
  site: 'https://saqsheee-portfolio.behlaman41.workers.dev',

  // Static output bakes <Picture> variants into /_astro/* at build time.
  // Do not switch to server/hybrid without a Worker that serves /_image —
  // that is what broke photos on the first Cloudflare deploy.
  output: 'static',
  trailingSlash: 'ignore',

  build: {
    // One page, one stylesheet, ~16kB over the wire — inlining it removes the
    // render-blocking round trip entirely. The usual argument against (the CSS
    // can't be cached across navigations) doesn't apply to a single-page site,
    // and it stops the stylesheet competing with the preloaded serif for
    // bandwidth on first paint.
    inlineStylesheets: 'always',
  },

  image: {
    // Sharp handles AVIF/WebP/JPEG at build time; nothing is optimised at runtime.
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    responsiveStyles: false,
  },

  vite: {
    css: {
      // Lightning CSS treats `backdrop-filter` and `-webkit-backdrop-filter` as
      // one property and keeps only whichever is written last, no matter what
      // `targets` or `exclude: Features.VendorPrefixes` say. On .topbar that
      // left the -webkit- alias alone — Blink ignores it, so the frosted topbar
      // rendered flat in Chrome and Android. esbuild minifies without touching
      // vendor prefixes, so the reference's prefixed/unprefixed pairs and its
      // color-mix fallback survive verbatim — which is also what keeps the page
      // working in Instagram's in-app WebKit.
      transformer: 'postcss',
    },
    build: { cssMinify: 'esbuild' },
  },

  devToolbar: { enabled: false },
})
