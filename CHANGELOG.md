# Changelog

## [Unreleased]

- LaneHeader: header for one lane in a side-by-side comparison of agent runs - model
  chip, truncated agent identity, optional lineage badge for forked lanes, optional
  job-state pill. Text-first, both themes.
- DivergencePin: a real-button marker pinned at a step where two execution records part
  ways (tool choice / argument / output / timing), opening the two linked records on
  activation. Step and kind always carried as text.
 — covia-demo-ui

All notable changes to the shared component library. British English.

## [0.1.0] — 2026-07-13

First release. Ships:

- **OKLCH design tokens** (`tokens.css`, importable standalone), light + dark themes, every
  semantic pair AA-verified.
- **Shared type contracts** (`src/types.ts`): `JobState`, `JobEvent`, and the component prop
  contracts.
- **Components:** JobStateBadge, CapBadge, SpendCapCounter (stub), TraceViewer,
  JobStateMachineDiagram.
- **Build:** Vite library mode → ESM + `.d.ts` + one compiled `style.css` + standalone
  `tokens.css`. A `prepare` hook builds `dist` on install so a git-tag pin resolves.

52 tests, typecheck, and the library build green.
