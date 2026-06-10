# Landing Page Redesign Plan

## Current state (v2 — just pushed)

- Full-width layout, no more `max-w-sm` column constraint
- Amber gradient headline, ambient glow orbs
- Portfolio card with glass-morphism
- All sections visible (no opacity:0 on scroll)
- Mobile viewport 390px, dark theme, Manrope font

## What needs improvement

### 1. Hero — level it up

**Problem:** CTA buttons look generic (flat amber block). Portfolio card is good but feels a bit plain.

**To do:**
- CTA primary button: add subtle inner gradient + very faint inset shadow
- Portfolio card: add a very subtle noise texture on the card background (CSS `url("data:image/svg+xml...")`)
- Above headline: replace the pill badge with a ticker-style animated badge (like "Axiom made 47 decisions today · last 2 hours ago")
- Add floating stat chips around the portfolio card on desktop ("+$38.20 this week", "94/100 health") — skip on mobile
- Consider a faint grid pattern on the hero background (CSS `background-image: repeating-linear-gradient(...)`)

### 2. Marquee — more visual weight

**Problem:** Text is too small and washed out (rgba 0.4 opacity).

**To do:**
- Make the marquee amber-tinted border color stronger
- Increase font size to `text-xs`
- Add alternating amber dots between items (already there but make them pop)
- Consider a double-row marquee: top row scrolls left, bottom row scrolls right

### 3. Stats section — bolder numbers

**Problem:** The 4-stat grid is good but number sizes could be larger and more impactful.

**To do:**
- Make stat numbers bigger: `text-5xl` instead of `text-[2.4rem]`
- Add a subtle unit label separately (like a superscript or separate row)
- Add a micro chart/sparkline illustration inside one of the stat cards (SVG path — not real data)
- Consider full-bleed background with a subtle amber gradient top-to-bottom for this section

### 4. How It Works — timeline visual

**Problem:** Step list is clean but feels static — no visual differentiation between steps.

**To do:**
- Add a vertical line connecting the 3 steps (left-aligned, through the step numbers)
- Step numbers: make them larger and amber-colored circles (not just text)
- Add a small icon for each step (lock, arrow down, lightning bolt — simple SVG)
- After step 3, add a small "preview" showing what Chronicle looks like (mini chapter card)

### 5. Pillars — horizontal scroll on mobile

**Problem:** 3 stacked cards take a lot of vertical space.

**To do:**
- Change to horizontal scroll (`flex overflow-x-auto snap-x snap-mandatory`)
- Each card: fixed width ~`w-72`, full height
- Add dot pagination indicators below the scroll area
- Fade edges with a gradient mask (`-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)`)

### 6. Signal Feed — make it feel "live"

**Problem:** Feed looks static. Nothing feels real-time.

**To do:**
- Add a blinking dot animation to each signal row's value (as if it just updated)
- Add "last updated X min ago" per row
- Show a mini confidence bar (0–100%) per signal
- Consider a scrollable table for 6–8 signals instead of just 4

### 7. Social proof / trust section (NEW)

**Problem:** No trust signals on the page.

**To do:**
- Add a section between Pillars and Signal Feed:
  - "Built for the Mantle Turing Test Hackathon 2026" with hackathon badge
  - 3 audit/trust badges: "Non-custodial", "Open source", "Auditable on-chain"
  - Maybe a quote: "The first AI vault that writes its own story" — Axiom, June 2026

### 8. Footer CTA — more urgency

**Problem:** CTA is nice but could have more pull.

**To do:**
- Add a countdown: "Hackathon ends in X days" or "Testnet now open"
- Show a live stat: "4 vaults activated · $12,400 protected" (hardcoded for demo)
- Make the amber gradient on "Axiom handles it." more vivid (higher contrast)

---

## Design System Refinements

### Colors to use consistently
- Primary text: `foreground` (white/98%)
- Secondary: `muted-foreground` (55% lightness)
- Amber accent: `hsl(var(--accent))` = `hsl(45 100% 88%)`
- Positive: `hsl(var(--positive))` = `hsl(142 72% 55%)`
- Protective (blue): `hsl(var(--protective))` = `hsl(213 94% 68%)`
- Warning: `hsl(var(--warning))` = `hsl(25 95% 60%)`

### Spacing rhythm
- Section padding: `py-16` (vertical) or `pb-16 pt-0`
- Card internal: `px-5 py-5` or `px-5 py-4`
- Between cards: `gap-2` (tight) or `gap-3` (comfortable)

### Card glass style (standard)
```css
background: rgba(255,255,255,0.02) to 0.04
border: rgba(255,255,255,0.07) to 0.10
border-radius: 16px (rounded-2xl)
```

### Accent card style (amber tint)
```css
background: rgba(255,239,197,0.04) to 0.06
border: rgba(255,239,197,0.12) to 0.20
```

---

## Priority order

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Hero: better CTA button + animated badge | 1 hr |
| P0 | HowItWorks: timeline with connecting line + icons | 1 hr |
| P0 | Pillars: horizontal scroll | 45 min |
| P1 | Signal Feed: confidence bars + "last updated" | 1 hr |
| P1 | Social proof / trust section | 30 min |
| P2 | Stats: bigger numbers + sparkline | 1 hr |
| P2 | Marquee: double-row | 30 min |
| P2 | Footer: countdown + live stats | 30 min |
| P3 | Hero: grid background + noise texture | 45 min |

**Total estimated effort: ~7 hours**

---

## Reference design feel to aim for

- **Mercury** (mercury.com) — clean dark, confident typography, lots of breathing room
- **Linear** (linear.app) — subtle grid patterns, excellent motion, tight color palette
- **Uniswap** — DeFi aesthetic, glow effects, bold product showcase
- **Stripe** — trust through detail density, data presentation

The a-MANT landing should feel like if Linear built a DeFi product.
