---
title: "Image Optimization Strategy: How We Hit LCP Under 2 Seconds at $0/Month"
description: "Explains how the project optimizes images using Sanity's CDN, LQIP blur placeholders, and native loading attributes to meet performance targets without any paid image processing infrastructure."
date: 2026-03-01
---

# Image Optimization Strategy: How We Hit LCP Under 2 Seconds at $0/Month

Images are the heaviest assets on any web page. A single unoptimized hero image can push page load times past 5 seconds, tank your Lighthouse score, and drive visitors away. This page covers how the project optimizes every image — from the 1920px hero banner down to a 48px project logo — using Sanity's free image CDN, zero paid infrastructure, and zero client-side JavaScript.

## The Performance Targets

Two hard requirements drive every image decision:

| Metric | Target | Why it matters |
|:-------|:-------|:---------------|
| **Largest Contentful Paint (LCP)** | Under 2 seconds | Google's Core Web Vital for perceived load speed. LCP above 2.5s triggers a "Needs Improvement" flag in Search Console. |
| **Lighthouse Performance score** | 89 or higher | The composite score that stakeholders check. Image problems are the most common reason it drops below 90. |

Both targets must hold on mobile over a 4G connection — the slowest realistic scenario for the site's audience.

## Why Sanity CDN Instead of Astro's Built-In Image Optimization

Astro ships with Sharp, an image processing library that resizes and compresses images at build time. The project does not use it for Sanity images. Here is why:

| Factor | Astro Sharp | Sanity CDN |
|:-------|:------------|:-----------|
| **Where processing runs** | During `astro build` on the deploy server | On Sanity's edge CDN, at request time |
| **Build CPU cost** | Significant — each image is decoded, resized, and re-encoded | Zero — URLs point directly to the CDN |
| **Format negotiation** | You pick a format at build time (WebP or AVIF) | CDN reads the browser's `Accept` header and serves the best format automatically |
| **Cost** | Free locally, but burns Cloudflare Workers build minutes | Free (included with every Sanity project) |
| **Resize on demand** | No — you bake sizes into the build | Yes — `?w=800&h=600` generates the exact size on the fly |

The Sanity CDN approach costs nothing, adds nothing to build time, and delivers format negotiation (AVIF for Chrome, WebP for Safari, JPEG as fallback) that Sharp cannot do without multiple output files.

## The Three-Part Optimization Pattern

Every image in the project goes through three layers of optimization. Think of them as a stack:

```text
┌─────────────────────────────────────────────┐
│  Layer 3: Loading Attributes                │
│  fetchpriority, loading, decoding           │
│  Controls WHEN the browser fetches          │
├─────────────────────────────────────────────┤
│  Layer 2: LQIP Blur Placeholder             │
│  Inline base64 micro-image (~300 bytes)     │
│  Controls WHAT the user sees while waiting  │
├─────────────────────────────────────────────┤
│  Layer 1: URL Optimization                  │
│  urlFor() with width, height, auto=format   │
│  Controls WHAT the browser downloads        │
└─────────────────────────────────────────────┘
```

### Layer 1: URL Optimization with `urlFor()`

The `urlFor()` helper in `astro-app/src/lib/image.ts` is the single entry point for all Sanity image URLs:

```typescript
export function urlFor(source: Image) {
  return builder.image(source).auto("format");
}
```

Every call chains `.auto("format")` by default. This tells Sanity's CDN to negotiate the best image format based on the browser's `Accept` header — AVIF for browsers that support it, WebP as a fallback, and JPEG for everything else.

Components then chain `.width()`, `.height()`, and `.fit()` to request exactly the pixels they need:

```astro
<!-- HeroBanner.astro — full-width hero at 1920x1080 -->
const optimizedUrl = urlFor(image as unknown as Image)
  .width(1920).height(1080).fit('crop').url();

<!-- TextWithImage.astro — side content at 800x600 -->
const imgSrc = safeUrlFor(image)
  ?.width(800).height(600).fit('crop').url() ?? null;

<!-- SponsorCard.astro — small logo at 112x112 -->
urlFor(logo as unknown as Parameters<typeof urlFor>[0])
  .width(112).height(112).url();
```

The resulting CDN URL looks like this:

```text
https://cdn.sanity.io/images/{projectId}/{dataset}/{assetId}.jpg
  ?w=1920&h=1080&fit=crop&auto=format
```

Sanity's edge CDN receives this URL, resizes the original asset server-side, applies format negotiation, and caches the result globally. The browser never downloads the 4000px original.

**The rule:** Never use raw `asset.url`. Always go through `urlFor()`.

### Layer 2: LQIP Blur Placeholders

LQIP (Low-Quality Image Placeholder) is a tiny base64-encoded JPEG — roughly 300 bytes — that Sanity generates automatically for every uploaded image. The GROQ queries already fetch it as `asset.metadata.lqip`.

The pattern wraps the real `<img>` inside a `<div>` whose background is the LQIP string:

```astro
<!-- From TextWithImage.astro -->
{imgSrc && lqip ? (
  <div style={`background-image: url(${lqip}); background-size: cover;`}>
    <img
      src={imgSrc}
      alt={image?.alt || heading || ''}
      width={800}
      height={600}
      class="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
    />
  </div>
) : imgSrc ? (
  <img src={imgSrc} alt={image?.alt || heading || ''} ... />
) : null}
```

Because the LQIP string is inline in the HTML (no network request), the blur placeholder appears instantly. When the full image finishes loading, it paints on top and covers the blur. No JavaScript required.

The `SanityImage` component in `astro-app/src/components/ui/sanity-image.astro` encapsulates this pattern for reuse:

```astro
{lqip ? (
  <div style={`background-image: url(${lqip}); background-size: cover;`}>
    <img src={optimizedUrl} alt={alt} width={width} height={height}
         loading={loading} fetchpriority={fetchpriority} decoding={decoding} />
  </div>
) : (
  <img src={optimizedUrl} alt={alt} width={width} height={height}
       loading={loading} fetchpriority={fetchpriority} decoding={decoding} />
)}
```

### Layer 3: Loading Attributes

HTML loading attributes tell the browser *when* to fetch each image. Getting this right is the difference between LCP under 2 seconds and LCP over 4 seconds.

| Attribute | Above the fold (hero) | Below the fold (everything else) |
|:----------|:----------------------|:---------------------------------|
| `loading` | `eager` | `lazy` |
| `fetchpriority` | `high` | (omitted — browser default) |
| `decoding` | `async` | `async` |

In the HeroBanner component, the first slide gets priority loading while remaining slides load lazily:

```astro
<!-- From HeroBanner.astro -->
<img
  src={optimizedUrl}
  alt={image.alt || `Slide ${index + 1}`}
  width={1920}
  height={1080}
  loading={isFirst ? 'eager' : 'lazy'}
  fetchpriority={isFirst ? 'high' : undefined}
  decoding="async"
  class="w-full h-full object-cover"
/>
```

`loading="eager"` tells the browser to start downloading immediately (instead of waiting for the image to scroll into view). `fetchpriority="high"` bumps it above other resources (stylesheets, fonts) in the download queue. Together, they ensure the hero image — the LCP element — starts downloading as early as possible.

Everything below the fold uses `loading="lazy"`, which defers the download until the user scrolls near the image. This keeps the initial page load focused on what the user actually sees first.

## The Preload Link: Starting Even Earlier

Loading attributes work after the browser parses the HTML and reaches the `<img>` tag. For the hero image, that is not fast enough — the browser has to download the HTML, parse the `<head>`, load CSS, then discover the `<img>` deep in the `<body>`.

A `<link rel="preload">` in the `<head>` tells the browser to start downloading the image *before* it even knows the image exists in the page body:

```astro
<!-- From Layout.astro -->
{preloadImage && (
  <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />
)}
```

Pages wire this up by extracting the first hero image URL and passing it to Layout:

```astro
<!-- From index.astro -->
const heroImage = firstBlock?._type === 'heroBanner'
  ? firstBlock.backgroundImages?.[0]
  : null;
const preloadImageUrl = heroImage?.asset
  ? urlFor(heroImage as unknown as Image).width(1920).height(1080).fit('crop').url()
  : undefined;

<Layout title={page?.title} seo={page?.seo} preloadImage={preloadImageUrl}>
```

The preload link fires immediately when the browser parses the `<head>` — often hundreds of milliseconds before it reaches the `<img>` tag. For the hero image, this is the single biggest LCP improvement.

## How It All Fits Together

Here is the full sequence for a visitor loading the homepage:

```text
Browser parses <head>
    │
    ├─ Finds <link rel="preload" as="image" href="...hero.jpg?w=1920&auto=format">
    │  └─ Starts downloading hero image immediately
    │
    ├─ Loads CSS, fonts, other <head> resources
    │
Browser parses <body>
    │
    ├─ Reaches HeroBanner <div>
    │  ├─ LQIP blur background renders instantly (inline base64, no network)
    │  └─ <img loading="eager" fetchpriority="high"> — already downloading from preload
    │
    ├─ Reaches TextWithImage, cards, footer
    │  ├─ LQIP blur backgrounds render instantly
    │  └─ <img loading="lazy"> — browser defers download until scroll
    │
Hero image download completes
    │
    └─ Full hero image paints over blur → LCP fires (target: under 2 seconds)
```

## Common Mistakes to Avoid

### Using raw `asset.url`

```astro
<!-- Wrong — downloads the full-resolution original, no format negotiation -->
<img src={image.asset?.url} />

<!-- Correct — resized, format-negotiated, CDN-cached -->
<img src={urlFor(image).width(800).height(600).fit('crop').url()} />
```

The raw URL downloads the original upload (often 3000-4000px wide, always JPEG). `urlFor()` generates a URL that tells the CDN to resize and convert on the fly.

### Missing `loading="lazy"` on below-fold images

Every image that is not the hero must have `loading="lazy"`. Without it, the browser downloads all images at once, competing with the hero image for bandwidth and pushing LCP later.

### Stacking `loading="eager"` on multiple images

Only the first hero slide gets `loading="eager"` and `fetchpriority="high"`. If you mark multiple images as eager, the browser tries to download them all at highest priority simultaneously — defeating the purpose and slowing down the one image that actually matters for LCP.

### Forgetting `width` and `height` attributes

Without explicit dimensions, the browser cannot reserve space for the image before it loads. This causes Cumulative Layout Shift (CLS) — visible content jumping around as images pop in. Every `<img>` in the project includes `width` and `height` matching the requested CDN dimensions.

## How This Connects to the $0/Month Constraint

The project runs entirely on Cloudflare's free tier. Image optimization is one of the places where this constraint shapes the architecture:

| Approach | Cost | Build impact | Used here |
|:---------|:-----|:-------------|:----------|
| Sanity CDN (`urlFor()` with `auto=format`) | Free (included with Sanity) | Zero — URLs generated at build time | Yes |
| Astro Sharp processing | Free locally, but consumes build CPU on Cloudflare | Significant — decodes, resizes, re-encodes every image | No |
| Third-party image CDN (Cloudinary, imgix) | Paid after free tier | Zero | No |
| Self-hosted image proxy | Requires a server | N/A | No |

Sanity includes its image CDN with every project at no additional cost. It handles resizing, format negotiation, and global caching — the same capabilities that paid services like Cloudinary charge for. By using `urlFor()` consistently, the project gets production-grade image optimization without adding a line item to the budget.

## Summary

Three layers of optimization — URL generation, blur placeholders, and loading attributes — combine to deliver fast image loading with no paid infrastructure and no client-side JavaScript.

| Layer | What it does | Key implementation |
|:------|:-------------|:-------------------|
| **URL optimization** | Requests exact dimensions and auto-negotiates AVIF/WebP/JPEG | `urlFor(image).width(w).height(h).auto('format')` in `lib/image.ts` |
| **LQIP blur** | Shows an instant placeholder while the full image downloads | Inline `background-image: url(${lqip})` from Sanity metadata |
| **Loading attributes** | Prioritizes the hero image, defers everything else | `fetchpriority="high"` + `loading="eager"` on hero; `loading="lazy"` on the rest |
| **Preload link** | Starts hero image download before the browser reaches `<body>` | `<link rel="preload" as="image">` in `Layout.astro` `<head>` |

The rule is simple: every image goes through `urlFor()`, every image below the fold is lazy, and only the hero gets priority loading. Follow this pattern and LCP stays under 2 seconds.
