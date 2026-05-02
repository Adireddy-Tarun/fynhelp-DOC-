# Roadmap Scene Rebuild Plan

Replace `src/components/roadmap/Roadmap.tsx` with a single self-contained React/TypeScript component implementing the full animated mountain scene. No new dependencies — pure SVG + CSS keyframes + inline styles, with a small `<style>` block for keyframes.

`src/pages/RoadmapPage.tsx` already renders `<Roadmap />`; no other files need to change. Existing helper files (`Climber.tsx`, `MountainScene.tsx`, `HairpinScene.tsx`, `IconGraphics.tsx`, `roadmapData.ts`, `hairpinStops.ts`) stay untouched — the new component is standalone and does not import them.

## Component structure

Single file: `src/components/roadmap/Roadmap.tsx`

```text
<section .roadmap-root>
  <header>  Roadmap / Your Journey... / description
  <div .scene aspect-ratio wrapper>
    <div .sky-bg>           ← animated gradient (dawn→day→dusk→night)
    <svg viewBox="0 0 1200 1000" .scene-svg>
      <defs> gradients, glow filters (green/orange/gold), cloud blur
      <g .clouds-back>      ← parallax slow clouds (behind mountain)
      <g .bg-mountains>     ← 2-3 faded silhouettes
      <g .main-mountain>    ← 20-30 low-poly facets + snow cap
      <g .small-hill>       ← left hill + grass + pines
      <g .ground>           ← brown strip + grass + tufts
      <g .trees>            ← 8-12 swaying pines
      <g .path-segments>    ← 4 bezier segments, alternating opacity for "behind mountain"
      <g .waypoints>        ← 5 dots, live ones with pulsing ring
      <g .summit-flag>      ← waving flag + "Enterprise System"
      <g .climber>          ← inline climber SVG at Stop 1 + "START HERE"
      <g .clouds-front>     ← parallax fast clouds (in front of mountain)
      <g .birds>            ← 4-6 V-shapes drifting
      <g .sun-moon>         ← sun with rotating rays + moon, arc animation
    </svg>
    <div .chip-overlays>    ← absolutely positioned HTML chips per stop (interactive)
  </div>
  <div .legend>             ← Live / Beta / Soon dots
</section>
```

Using HTML overlays (not `foreignObject`) for chips because they need hover/tooltip and crisp text. Position with percentages matching SVG waypoint coords (1200×1000 viewBox → percent of container).

## Data model (in-file constants)

```ts
type Status = 'live' | 'beta' | 'soon';
const STATUS_COLOR = { live:'#34C759', beta:'#FF9F0A', soon:'#C9A84C' };

const STOPS = [
  { id:1, x:180,  y:750, status:'live', side:'right', products:[
      {name:'Liquidity Intelligence', emoji:'💧', bg:'#3B82F6', desc:'...'},
      {name:'AI CFO Nidhi',          emoji:'🤖', bg:'#8B6914', desc:'...'}]},
  { id:2, x:504,  y:620, status:'beta', side:'left',  products:[
      {name:'Revenue Intelligence',  emoji:'📊', bg:'#10B981', desc:'...'},
      {name:'Cost Intelligence',     emoji:'💰', bg:'#F59E0B', desc:'...'}]},
  { id:3, x:696,  y:480, status:'soon', side:'right', products:[
      {name:'GST & Tax Intelligence',emoji:'🏛️', bg:'#C41E1E', desc:'...'},
      {name:'CA Partner Ecosystem',  emoji:'🤝', bg:'#8B6914', desc:'...'}]},
  { id:4, x:540,  y:320, status:'soon', side:'left',  products:[
      {name:'HR Intelligence',       emoji:'👥', bg:'#6366F1', desc:'...'},
      {name:'Market & Growth',       emoji:'🌍', bg:'#0EA5E9', desc:'...'}]},
];
const SUMMIT = { x:624, y:120 };
```

## The wrapping path

Four cubic bezier segments between consecutive waypoints, each rendered as a separate `<path>` so we can:
- color them per-status (Stop1→2 green, 2→3 orange, 3→4 and 4→Summit gold),
- mask the "behind mountain" middle by splitting any segment whose midpoint x lies in `[540, 720]` (mountain center band) into two sub-paths with a gap, OR by drawing a single path with `stroke-dasharray` plus an overlay rect of the mountain redrawn over the path. **Chosen approach:** draw each segment as two curves (visible-in / visible-out) with a gap across the mountain center band. Simpler and deterministic.

All path segments: `stroke-linecap=round`, `stroke-dasharray="8 5"`, glow via `filter: url(#glow-{color})`. A traveling dot per live/beta segment uses `<animateMotion>` along the same path.

## Day/night cycle (≈24s loop)

Single CSS keyframe on `.sky-bg` background-image cycling through 4 gradient stops (dawn, day, dusk, night) at 0/33/66/100%. Sun and moon are positioned with their own keyframes:

- `@keyframes sun-arc`: `translate(-200px, 800px)` → `translate(600px, 80px)` → `translate(1400px, 800px)`, opacity `0→1→1→0` over 24s.
- `@keyframes moon-arc`: same shape, offset by `animation-delay: -12s`, opacity inverse.
- `@keyframes ray-spin`: `rotate(360deg)` 8s linear infinite on a `<g>` of 10 ray lines.
- `@keyframes ray-pulse`: opacity `0.6↔1` 2s.

Clouds: 8 cloud `<g>` elements, half in `.clouds-back` (z behind mountain in SVG draw order) and half in `.clouds-front`. Each gets `@keyframes drift` (`translateX(-200px)` → `translateX(1400px)`) with per-cloud `animation-duration` 40-90s and staggered delays. Optional `scale 1↔1.05` via second animation. Night dimming: a `.scene-svg .clouds *` opacity reduction tied to the same 24s cycle via a separate keyframe.

## Interactivity

- `useState<number|null>` for `hoveredChipId` (one chip = `${stopId}-${productIdx}`).
- Chip wrapper has `onMouseEnter/Leave`; tooltip is a sibling div shown when matching id.
- `onClick` calls a no-op handler with a `// TODO: open product modal` comment.
- All transitions: `transition: transform .2s, border-color .2s, box-shadow .2s`.
- Live waypoint dots: pulsing `<circle>` with `<animate>` on `r` and `opacity`.

## Styling

Inline `<style>{`...`}</style>` block inside the component holds:
- `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@600;900&display=swap');`
- All keyframes (sky, sun-arc, moon-arc, ray-spin, ray-pulse, drift-slow, drift-fast, cloud-pulse, tree-sway, climber-bob, flag-wave, dot-pulse, bird-fly, wing-flap, path-dash).
- Chip hover styles, tooltip animation, legend.

CSS variables at root: `--gold:#C9A84C; --green:#34C759; --orange:#FF9F0A; --ink:#1A1008; --beige:#F4EDDA;`.

## Responsiveness

- Outer `.scene` uses `aspect-ratio: 1200 / 1000; width: 100%; max-width: 1400px; margin: 0 auto`.
- SVG uses `preserveAspectRatio="xMidYMid meet"` so all SVG elements scale together.
- Chip overlays positioned via `left: calc(x/1200 * 100%)`, `top: calc(y/1000 * 100%)` so they track waypoints at any size.
- Below 768px: hide secondary decoration (birds, back clouds), shrink chip font, stack legend vertically (media query in inline style block).

## Brand alignment

The user's spec uses #34C759 / #FF9F0A which are not the FynHelp palette. Per the spec ("use exact code/colors"), the new scene uses the requested colors for path/status. Brand ink (#1A1008), gold (#8B6914 / #C9A84C), beige (#F4EDDA) are still used for mountain rocks, ground, climber, and header text so the page doesn't clash with the rest of the site.

## Out of scope

- No new routes, no data fetching, no Supabase changes.
- No modal — `onClick` is a stub.
- Existing `MountainScene`/`HairpinScene` files left in place (unused by the page now); can be deleted in a follow-up if desired.

## Acceptance checks (after switch to build mode)

1. `/roadmap` renders the new scene with no console errors.
2. Sun visibly arcs and rays rotate; moon appears in the dark phase.
3. At least 4 clouds drift across; some pass in front of the mountain, some behind.
4. Path is visibly green from Stop 1→2, orange 2→3, gold 3→Summit, with a clear gap across the mountain center giving the wrap-around look.
5. All 5 waypoints render; live dot pulses.
6. 8 product chips render in 4 stacked pairs, each shows status badge; hover lifts chip, gold border, tooltip with description appears.
7. Climber sits at Stop 1 with "START HERE" label and bobs.
8. Flag at summit waves; "Enterprise System" label visible.
9. Legend shows three colored dots with labels.
10. Layout holds at 1411px (current viewport) and at ≤768px without overlap.
