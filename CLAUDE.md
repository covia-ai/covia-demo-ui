# covia-demo-ui

Shared design system + component library for Covia demos (`@covia/demo-ui`): OKLCH tokens,
TraceViewer, JobStateMachineDiagram, JobStateBadge, CapBadge, SpendCapCounter.

## Public / private (MANDATORY — see top-level `CLAUDE.md`)

- **This repo contains only shippable + public-facing material.** It must stay safe to expose.
- **All internal planning lives in the private `covia-ai/covia-demo-ui-workspace` repo** —
  decisions, status, roadmap, test plan, and the agent working-rules. Do not add planning,
  decision logs, PRDs, asks, or process docs here; put them in the workspace repo.
- **The library ships via `npm publish`** (only the built `dist` + `README` + `LICENSE`).
  The repo itself is not made public; visibility changes are a human action.
- Before any publish or visibility change, run `scripts/scan-before-public.sh` (a `pre-push`
  hook runs the guard). New clones: `git config core.hooksPath .githooks`.

## Working notes
- British English; semantic CSS + CSS Modules per component; no Tailwind.
- Build: `pnpm build` (Vite library mode → ESM + `.d.ts` + `style.css` + standalone
  `tokens.css`; a `prepare` hook builds `dist` on install so a git-tag pin resolves).
- Interface contracts live in `src/types.ts`.
