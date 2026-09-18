# UI Audit — Canopy v2

## Date: 2026-09-18

## Design Direction
Stonkbrokers-inspired dark DeFi hub + baseline-ui constraints.

## Key Sources
- **Stonkbrokers**: Dark backgrounds (#111, #161618), green accents (#39ff14, #e8ff00), glass cards, tabular nums, monospace data, subtle borders
- **baseline-ui**: No gradients, no glow, 14px minimum text, no underline links, focus-visible, prefers-reduced-motion, 8px grid, cn utility, motion/react

## Violations Found

### Critical (baseline-ui violations)
1. **Gradients everywhere**: `text-gradient` class, `bg-[radial-gradient(...)]`, `var(--canopy-gradient)` used in 15+ places
2. **Glow effects**: `drop-shadow-[0_0_45px...]`, `box-shadow: 0 0 32px...`, `filter: blur(110px)` orb effects
3. **Text below 14px**: `text-xs` (12px), `text-[11px]` used in ~30 places across all pages
4. **Hover underline links**: `hover:underline` on footer, explorer links, faucet links, etc.
5. **No focus-visible**: No keyboard focus styles on interactive elements
6. **No prefers-reduced-motion**: Animations play for all users
7. **Missing aria-labels**: Icon-only buttons lack accessible labels
8. **No tabular nums**: Financial data not using tabular-nums
9. **No cn utility**: Conditional classes use string concatenation

### Stonkbrokers-inspired changes
1. Dark background: #0b0b0c / #111111 (already have --canopy-ink: #0b0b0f)
2. Green accent: #14f195 (have), add #e8ff00 (volt) for highlights
3. Subtle borders: hsla(0,0%,100%,0.08-0.14)
4. Glass cards with backdrop-filter blur (already have `.glass`)
5. Monospace for data, tabular numbers for financial values
6. Strong typography hierarchy with clear visual weight

## Design Tokens to Update
- Add `--canopy-volt: #e8ff00` for primary highlights
- Remove gradient references (replace with solid colors)
- Add `--canopy-bg: #0b0b0c` for page backgrounds
- Add `--canopy-border: rgba(255,255,255,0.08)` for subtle borders
- Add tabular-nums utility class

## Typography Rules
- Body text: minimum 14px (text-sm)
- Financial data: font-mono + font-variant-numeric: tabular-nums
- Display: font-display (Space Grotesk)
- Kicker/label text: font-mono2, minimum 14px
- Line-height: minimum 1.5
- Letter-spacing: reduce from aggressive tracking

## Component Changes
- All buttons: remove gradient backgrounds, use solid colors
- All cards: remove gradient backgrounds, use dark solid + border
- All links: remove hover:underline, use color transition
- All section headers: increase text size, add clear hierarchy
- Progress bars: remove gradient fill, use solid accent color
