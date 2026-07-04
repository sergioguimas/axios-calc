# Axios Calc — Design QA

- source visual truth path: `docs/design/axios-calc-reference.png`
- implementation screenshot path: `docs/design/axios-calc-implementation.png`
- viewport: 1440 × 1024, desktop, dark theme
- state: new quote screen; the source mock contains illustrative values while the implementation shows the real seeded empty-form state
- full-view comparison evidence: `docs/design/axios-calc-comparison.png`
- focused region comparison evidence: `docs/design/axios-calc-comparison-focused.png` (sticky cost composition and primary actions)

**Findings**

- No actionable P0, P1, or P2 differences remain.
- The implementation preserves the source hierarchy: compact fixed navigation, inline page title/status, three-step strip, two-column technical form, sticky cost rail, amber primary action, graphite surfaces, fine borders, and teal numerical support accents.
- Fonts and typography: Roboto Condensed Variable reproduces the narrow operational headings; Inter Variable keeps form labels and numbers legible. Weight, wrapping, and tabular financial hierarchy are consistent with the source intent.
- Spacing and layout rhythm: the header was compacted and the usable content width expanded after the first comparison. Panel tracks, gutters, field density, and right-rail dimensions now follow the reference closely at the target viewport.
- Colors and visual tokens: near-black base, graphite panels, restrained amber, teal support state, muted labels, and hairline borders are consistently tokenized. Contrast remains readable without glow or gradients.
- Image quality and asset fidelity: the selected screen contains no photographic or illustrative assets. Interface icons use one consistent Tabler family; no custom SVG, CSS illustration, placeholder image, or emoji substitutes are present.
- Copy and content: source-only concepts outside the approved product scope (labor, consumables, customers, reports, and freight catalogs) were intentionally replaced with the exact Axios Calc fields from the product brief.
- Responsive and accessibility checks: the desktop grid collapses at smaller breakpoints, navigation becomes a modal sidebar, tables scroll horizontally, controls keep labels/focus rings, and destructive actions require confirmation.

**Open Questions**

- None blocking. The source uses populated sample data and the implementation screenshot uses the first-run empty state, so numerical bar fill and totals were not treated as visual mismatches.

**Implementation Checklist**

- [x] Compact page header and status treatment aligned to the selected direction.
- [x] Cost rail dimensions, hierarchy, bars, margin mode, final price, and actions aligned.
- [x] Product-required form sections implemented without source-mock feature leakage.
- [x] Desktop and responsive layout rules implemented.
- [x] Build, typecheck, lint, migration, seed, and pure calculation checks completed.

**Patches made since the previous QA pass**

- Removed the oversized descriptive header from the new-quote screen.
- Added the compact status badge beside the title.
- Reduced sidebar width and tightened navigation typography.
- Expanded the main work surface while keeping the 340px sticky cost rail.
- Removed the decorative background gradient to match the matte source surface.

**Follow-up Polish**

- P3: a future iteration could add a compact collapsed-sidebar preference for very dense desktop workflows, but it is not present in the selected source and is not required for acceptance.

final result: passed
