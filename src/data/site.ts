/**
 * Single source of truth for every piece of copy, link and asset on the page.
 * Components read from here — no strings are hardcoded in markup.
 *
 * Monthly numbers are NOT edited here: the stat values ship as fallbacks and
 * are overridden at runtime from /stats.json (see public/stats.json).
 */

import type { ImageMetadata } from 'astro'

import heroImg from '../assets/hero.jpg'
import aboutImg from '../assets/about-saree.jpg'
import galCorridor from '../assets/gal-corridor.jpg'
import galDreamy from '../assets/gal-dreamy.jpg'
import galLivingroom from '../assets/gal-livingroom.jpg'

/* ── types ───────────────────────────────────────────────── */

export interface Photo {
  src: ImageMetadata
  alt: string
  /** CSS object-position; the reference tunes framing per photo. */
  objectPosition?: string
  /** Aspect-ratio helper class from global.css. */
  ratio?: 'r45' | 'r34'
  /** Parallax factor read by motion.js via [data-parallax]. */
  parallax?: number
}

export interface Stat {
  /** Key in stats.json — order here must match the key order there. */
  key: 'views' | 'reached' | 'saves' | 'growth'
  /** Fallback value, used until /stats.json resolves. */
  target: number
  /** Rendered before the counter, outside the animated span. */
  prefix?: string
  /** Rendered as <sup> after the counter. */
  unit: string
  label: string
}

export interface Reel {
  /** Zero-padded tile number, shown when the video is missing. */
  idx: string
  href: string
  src: string
  poster: string
  label: string
}

export interface Service {
  idx: string
  title: string
  copy: string
}

export interface SectionHead {
  eyebrow: string
  num: string
}

/* ── identity ────────────────────────────────────────────── */

export const site = {
  name: 'Sakshi Behl',
  handle: '@saqsheee',
  instagram: 'https://www.instagram.com/saqsheee/',
  email: 'collabwithsaqsheee@gmail.com',
  emailSubject: 'Collaboration enquiry — via sakshibehl site',
  location: 'Delhi NCR',
  niche: 'Fashion · Hair · Beauty',
  year: '2026',
} as const

/** mailto: with the subject pre-filled, exactly as the reference encodes it. */
export const mailto =
  `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}`

/* ── <head> ──────────────────────────────────────────────── */

export const meta = {
  title: 'Sakshi Behl — Fashion, Hair & Beauty Creator',
  description:
    'Sakshi Behl (@saqsheee) — fashion, hair & beauty creator in Delhi NCR. 912K monthly reel views. Available for brand collaborations, dedicated reels, product integrations and UGC.',
  ogTitle: 'Sakshi Behl — Fashion, Hair & Beauty Creator',
  ogDescription:
    '912K monthly reel views · Delhi NCR. Dedicated reels, product integrations and UGC for brands.',
  ogType: 'profile',
  ogImage: '/og.jpg',
  twitterCard: 'summary_large_image',
  themeColor: '#FAF7F2',
} as const

/* ── topbar ──────────────────────────────────────────────── */

export const topbar = {
  home: site.name,
  niche: site.niche,
  cta: 'Work with me ↗',
} as const

/* ── hero ────────────────────────────────────────────────── */

export const hero = {
  eyebrow: `Creator · ${site.location}`,
  /** Rendered as "Sakshi" / <em>Behl</em> across two lines. */
  titleTop: 'Sakshi',
  titleBottom: 'Behl',
  sub: 'Fashion, hair & beauty content that reaches far beyond its following — 912K reel views in the last 30 days.',
  handleLink: `${site.handle} ↗`,
  followers: '10.9K+ followers',
  ctaPrimary: 'Work with me',
  ctaSecondary: 'See recent work',
  scrollHint: 'Scroll',
  caption: 'SAKSHI BEHL — 2026',
  photo: {
    src: heroImg,
    alt: 'Sakshi Behl seated on an ivory sofa in an embroidered champagne suit',
    parallax: 0.05,
  } satisfies Photo,
} as const

/* ── 01 · stats ──────────────────────────────────────────── */

export const statsSection = {
  head: { eyebrow: 'Last 30 days', num: '01' } satisfies SectionHead,
  ghost: 'Reach',
  ghostStyle: 'top:-70px; right:-4%',
  /** <em> splits the accent-coloured italic clause. */
  titleLead: 'Small following. ',
  titleAccent: 'Outsized reach.',
  footnote:
    '10.9K+ followers · 20 reels a month · content reaching ~75× my follower base',
  items: [
    { key: 'views', target: 912, unit: 'K', label: 'Reel views' },
    { key: 'reached', target: 728, unit: 'K', label: 'Accounts reached' },
    { key: 'saves', target: 10, unit: 'K', label: 'Saves' },
    { key: 'growth', target: 17, prefix: '+', unit: '%', label: 'Follower growth' },
  ] satisfies Stat[],
} as const

/* ── 02 · about ──────────────────────────────────────────── */

export const about = {
  head: { eyebrow: 'About me', num: '02' } satisfies SectionHead,
  pullLead: "I make content people don't just watch — ",
  pullAccent: 'they save.',
  paragraphs: [
    'I create hair styling, outfit and beauty content from Delhi NCR — the kind viewers bookmark to try themselves. 10K saves in the last month alone.',
    "I've worked with brands across haircare, jewellery, skincare and ethnic wear — and the ones who come once tend to come back.",
  ],
  photo: {
    src: aboutImg,
    alt: 'Sakshi in a red silk saree, smiling',
    objectPosition: '50% 26%',
    ratio: 'r45',
    parallax: 0.03,
  } satisfies Photo,
} as const

/* ── 03 · gallery ────────────────────────────────────────── */

export const gallery = {
  head: { eyebrow: 'In frame', num: '03' } satisfies SectionHead,
  photos: [
    {
      src: galCorridor,
      alt: 'Sakshi in a blush lehenga in a candlelit corridor',
      objectPosition: '50% 30%',
      ratio: 'r45',
      parallax: 0.035,
    },
    {
      src: galDreamy,
      alt: 'Sakshi twirling in a white embroidered lehenga in a candlelit hallway',
      objectPosition: '50% 28%',
      ratio: 'r34',
      parallax: 0.02,
    },
    {
      src: galLivingroom,
      alt: 'Sakshi in a pink suit in a bright living room',
      objectPosition: '50% 45%',
      ratio: 'r45',
      parallax: 0.05,
    },
  ] satisfies Photo[],
} as const

/* ── 04 · brands ─────────────────────────────────────────── */

export const brands = {
  head: { eyebrow: 'Successful collaborations', num: '04' } satisfies SectionHead,
  marqueeLabel: 'Brands I have successfully collaborated with',
  names: ['BBLUNT', 'Zeraki Jewels', 'Seodre', 'Skince', 'Koskii', 'Ghumar Trend'],
} as const

/* ── 05 · work ───────────────────────────────────────────── */

export const work = {
  head: { eyebrow: 'Recent work', num: '05' } satisfies SectionHead,
  titleLead: 'Reels that ',
  titleAccent: 'travel.',
  tileCaption: 'Tap to watch ↗',
  footLink: 'View all on Instagram ↗',
  carouselLabel: 'Recent reels',
  reels: [
    {
      idx: '01',
      href: site.instagram,
      src: '/reels/reel-5.mp4',
      poster: '/reels/cover-5.jpg',
      label: 'Watch reel 1 on Instagram',
    },
    {
      idx: '02',
      href: site.instagram,
      src: '/reels/reel-6.mp4',
      poster: '/reels/cover-6.jpg',
      label: 'Watch reel 2 on Instagram',
    },
    {
      idx: '03',
      href: site.instagram,
      src: '/reels/reel-7.mp4',
      poster: '/reels/cover-7.jpg',
      label: 'Watch reel 3 on Instagram',
    },
    {
      idx: '04',
      href: 'https://www.instagram.com/reel/DXKDqctAHn6/',
      src: '/reels/reel-1.mp4',
      poster: '/reels/cover-1.jpg',
      label: 'Watch reel 4 on Instagram',
    },
    {
      idx: '05',
      href: 'https://www.instagram.com/reel/DXT7A5UgHin/',
      src: '/reels/reel-2.mp4',
      poster: '/reels/cover-2.jpg',
      label: 'Watch reel 5 on Instagram',
    },
    {
      idx: '06',
      href: 'https://www.instagram.com/reel/DXrkvoVArfO/',
      src: '/reels/reel-3.mp4',
      poster: '/reels/cover-3.jpg',
      label: 'Watch reel 6 on Instagram',
    },
    {
      idx: '07',
      href: 'https://www.instagram.com/reel/DZzjS6JgP-0/',
      src: '/reels/reel-4.mp4',
      poster: '/reels/cover-4.jpg',
      label: 'Watch reel 7 on Instagram',
    },
  ] satisfies Reel[],
} as const

/* ── 06 · services ───────────────────────────────────────── */

export const services = {
  head: { eyebrow: 'What I offer', num: '06' } satisfies SectionHead,
  ghost: 'Create',
  ghostStyle: 'top:-60px; left:-3%',
  titleLead: 'Three ways to ',
  titleAccent: 'work together.',
  footnote: `Available for shoots across ${site.location}.`,
  items: [
    {
      idx: '(A)',
      title: 'Dedicated Reels',
      copy: 'Full concept-to-post branded content on my page — scripted, shot and styled around your product.',
    },
    {
      idx: '(B)',
      title: 'Product Integration',
      copy: 'Your product woven naturally into my hair and fashion styling content, where my audience already is.',
    },
    {
      idx: '(C)',
      title: 'UGC Content',
      copy: "Ready-to-use video content for your brand's own channels and ads — no posting on my page required.",
    },
  ] satisfies Service[],
} as const

/* ── 07 · contact ────────────────────────────────────────── */

export const contact = {
  head: { eyebrow: "Let's collaborate", num: '07' } satisfies SectionHead,
  ghost: 'Hello',
  ghostStyle: 'top:-50px; right:-2%',
  titleLead: 'Have a product my audience ',
  titleAccent: 'should see?',
  lede: 'For partnerships, campaigns and UGC briefs, reach me directly — I reply within a day.',
  cta: 'Work with me',
  dmLink: 'DM on Instagram ↗',
} as const

/* ── footer ──────────────────────────────────────────────── */

export const footer = {
  marqueeWord: 'Saqsheee',
  copyright: `© ${site.year} ${site.name}`,
  tagline: `${site.niche} — ${site.location}`,
} as const
