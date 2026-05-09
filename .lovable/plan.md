## Diagnosis

The `/use-cases` route itself is fine and public:
- `App.tsx:140` registers `<Route path="/use-cases" element={<UseCasesPage />} />` outside any protected wrapper.
- `Navbar.tsx:10` correctly links to `/use-cases`.
- The page renders (your current route is `/use-cases`).

The "redirect to dashboard" happens because **each use-case card** in `src/pages/UseCasesPage.tsx` has a `route` field pointing into `/dashboard/*` (e.g. `/dashboard/reports?template=monthly-close`, `/dashboard/cash-flow`, `/dashboard/gst`, …). The card click handler at line 176 does `navigate(useCase.route)`, sending visitors straight into the dashboard.

## Fix

Make every use-case card route to `/waitlist`, matching the existing CTA pattern already used on the same page (`navigate('/waitlist')` at line 209).

### Change 1 — `src/pages/UseCasesPage.tsx`

Update the card click handler (line 176) to ignore the per-item `route` and always send users to the waitlist:

```tsx
<UseCaseCard3D
  key={useCase.id}
  useCase={useCase}
  delay={idx * 0.05}
  onClick={() => navigate('/waitlist')}
/>
```

We'll leave the `route` fields in the `USE_CASES` array in place (harmless, useful later when these become real deep-links post-launch).

### Out of scope

- No changes to `App.tsx`, `Navbar.tsx`, or any auth/protection logic — they're already correct.
- No changes to dashboard routes.

### Verification

After the edit, clicking any card on `/use-cases` should navigate to `/waitlist` instead of `/dashboard/*`. The "Use Cases" link in the navbar already works correctly.
