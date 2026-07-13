# covia-demo-ui

The shared design system and component library every Covia demo consumes as a package.
Tokens and components live here once; visual changes happen here, never forked per demo.

> Status: **v0 (pre-tag)**. First tag `v0.1` lands when TraceViewer, JobStateMachineDiagram,
> the design tokens, and the imported badges all pass their component tests.

## Install

While the repos are private, consume as a git dependency pinned to a tag (D001):

```bash
pnpm add github:covia-ai/covia-demo-ui#v0.1
```

```ts
import { JobStateBadge, CapBadge, SpendCapCounter } from '@covia/demo-ui';
import '@covia/demo-ui/style.css'; // compiled component styles, import once
import '@covia/demo-ui/tokens';    // design tokens (custom properties, both themes)
```

`tokens.css` is importable standalone even without the components. An `@covia/demo-ui`
npm publish is scheduled for the first public release.

## Design tokens (`tokens.css`)

OKLCH throughout, both themes (light default; dark on OS preference unless `[data-theme='light']`;
`[data-theme='dark']` forces dark). Palette anchors:

| Anchor | Hex | Role |
|--------|-----|------|
| Royal Purple | `#6B46C1` | primary, brand, active states (`--royal`, `--primary`) |
| Cerulean | `#4A90E2` | info, streaming, in-flight — STARTED (`--cerulean`, `--state-started`) |
| Midnight Navy | `#1E2642` | dark surfaces, header (`--navy`, `--header`) |
| Amber Gold | `#F2AE30` | waiting states — PENDING/INPUT_REQUIRED/PAUSED/AUTH_REQUIRED (`--amber`, `--state-waiting`) |
| Neutral Gray | `#E5E5E9` | borders, quiet surfaces (`--gray`, `--line`) |

Plus derived semantic state tokens (`--state-complete`, `--state-failed`, `--state-rejected`
as the loudest pair, `--state-muted` for cancelled/timeout), each with a `-soft` fill.
Typography: `--font-ui` (Inter), `--font-mono` (JetBrains Mono). Spacing on a 4px base
(`--space-1..6`). **Every semantic pair is AA-verified in both themes** by
`scripts/contrast.test.ts` — do not edit a token value without re-running `pnpm test`.

## Components (v0)

| Component | Owner | Props | Status |
|-----------|-------|-------|--------|
| `JobStateBadge` | migrated | `{ state: JobState }` | ✅ shipped |
| `CapBadge` | migrated | `{ cap, state?, name?, description?, dangerous? }` | ✅ shipped |
| `SpendCapCounter` | stub | `{ remaining, total, unit, source }` | ✅ stub (venue data wired in later) |
| `TraceViewer` | library | `{ events, highlightJobId?, onSelect? }` | ✅ shipped |
| `JobStateMachineDiagram` | library | `{ events, notToured?, activeStates? }` | ✅ shipped |
| `ContextInspector` | demo-local | — | stays out of the library at v0 (D003) |

Types (`JobState`, `JobEvent`, and all prop interfaces) are exported from the entry.

## Develop

```bash
pnpm install
pnpm test        # vitest: AA-contrast (both themes) + component tests
pnpm typecheck   # tsc --noEmit
pnpm build       # ESM + .d.ts + style.css + tokens.css → dist/
```

British English. No Tailwind anywhere in the dependency tree. Semantic CSS with CSS
Modules per component; the interface contracts live in `src/types.ts`.
