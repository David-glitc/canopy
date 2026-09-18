# UI Overhaul Implementation Plan

## Phase 1: Foundation (CSS & Tokens)
- [ ] Create `lib/utils.ts` with `cn` utility
- [ ] Rewrite `globals.css` — remove gradients, glow, add prefers-reduced-motion, focus-visible, tabular nums
- [ ] Update `tokens.css` — add volt accent, remove gradient tokens, add dark background tokens
- [ ] Add `@tailwindcss/typography` plugin

## Phase 2: Layout & Navigation
- [ ] Update `layout.tsx` — fix footer text sizes, remove hover:underline
- [ ] Update `Header.tsx` — fix text sizes, add focus-visible
- [ ] Update `WalletButton.tsx` — add aria-label

## Phase 3: Home Page
- [ ] Rewrite `page.tsx` — remove gradients, glow, fix text sizes to 14px+
- [ ] Remove orb glow effects
- [ ] Use solid dark backgrounds with subtle borders
- [ ] Replace gradient text with solid accent color

## Phase 4: Page Updates
- [ ] `sectors/page.tsx` — remove gradients, fix text sizes
- [ ] `instant/page.tsx` — remove gradients, fix text sizes
- [ ] `shop/page.tsx` — remove gradients, fix text sizes
- [ ] `people/page.tsx` — remove gradients, fix text sizes
- [ ] `leaderboard/page.tsx` — add tabular nums, fix text sizes
- [ ] `share/[mint]/page.tsx` — remove gradients, fix text sizes

## Phase 5: Component Updates
- [ ] `components/ProgramStatus.tsx` — fix text sizes, remove hover:underline
- [ ] `components/InstantMint.tsx` — fix text sizes, remove gradients
- [ ] `components/Rip.tsx` — remove gradients, glow, fix text sizes
- [ ] `components/SectorList.tsx` — fix text sizes, remove gradients
- [ ] `components/SectorDetail.tsx` — fix text sizes, remove gradients

## Phase 6: Sub-pages
- [ ] `sectors/[address]/page.tsx` — fix text sizes
- [ ] `people/[addr]/page.tsx` — fix text sizes

## Phase 7: Verification & Deploy
- [ ] Run build, fix any TypeScript errors
- [ ] Deploy to Vercel
- [ ] Verify visual quality
