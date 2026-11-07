---
name: site-layout
description: Use when changing layout, spacing, typography, colours or components on the portfolio site.
---

# Layout rules

## Tokens (assets/css/style.css :root)
- Point colour --point #0cbcb0. Fonts: Figtree (display), Instrument Sans (body).
- Reuse existing CSS variables. Do not hard-code new colours.

## Spacing
- Image to its own caption: 40px.
- Between different blocks of information: 120px.
- Chapter title to first image: 40px.
- Same values on mobile.

## Type
- Section titles: Header 2, 37px (30px on mobile). Title to body: 20px.
- Body column width: 560px.
- Line height for H1, H2, H5: 110%.

## Components (reuse, do not invent new ones)
- .chapter: chapter title block (label, title, body)
- .media + .caption / .captions: image with caption
- .stats / .stat: results numbers
- .carousel: catalogue and quote carousels (assets/js/main.js)

## Check
- Test at desktop and 390px mobile width. No horizontal scroll.