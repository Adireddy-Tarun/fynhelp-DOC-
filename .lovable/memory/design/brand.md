---
name: Brand identity
description: FynHelp visual brand — beige intelligence theme, color palette, typography rules
type: design
---
# FynHelp Brand — Beige Intelligence Theme

The dashboard and demo surfaces use a warm, light "beige intelligence" theme (Bloomberg-meets-Indian-fintech, light variant). Marketing pages keep their existing styles.

## Colors (locked)
- Page background: `#EFE8D8` (`--background`, hsl 40 38% 89%)
- Card surface: `#FFFFFF` (`--card`)
- Card border: `rgba(26, 16, 8, 0.08)`
- Card shadow: `0 2px 8px rgba(26, 16, 8, 0.06)`
- Text primary: `#1A1008` ink
- Text secondary: `#6B6B6B`
- Accent red (CTAs, alerts): `#A93838` (`--primary`, NOT the old `#C41E1E`)
- Accent gold: `#8B6914` (`--accent`)
- Status green: `#10B981` (paid, healthy)
- Status amber: `#F59E0B` (warning)
- Chart red gradient: `#A93838 → #C94848` (defs id `redGrad`)
- Chart gold gradient: `#8B6914 → #D4AF37` (defs id `goldGrad`)

## Typography
- Headings: Space Grotesk / Playfair / Georgia serif
- Body: DM Sans / Inter
- Data: monospace, tabular-nums

## Hard rules
- Dashboard + demo MUST look identical. Same shared components, only data source differs.
- Never re-introduce dark `#1A1008` page background or `#C41E1E` red on dashboard/demo surfaces.
- Marketing pages (`/`, `/pricing`, `/about`, `/login`, `/signup`) stay on their existing theme — don't touch.
