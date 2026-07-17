/**
 * covia-demo-ui — public entry.
 *
 * Import the compiled component styles once in your app:  import '@covia/demo-ui/style.css';
 * Import the design tokens (standalone):                  import '@covia/demo-ui/tokens';
 *
 * v0 components: JobStateBadge, CapBadge, SpendCapCounter (stub), TraceViewer,
 * and JobStateMachineDiagram. (ContextInspector stays demo-local at v0.)
 */

export { JobStateBadge } from './components/JobStateBadge/JobStateBadge';
export { CapBadge } from './components/CapBadge/CapBadge';
export { SpendCapCounter } from './components/SpendCapCounter/SpendCapCounter';
export { TraceViewer, isLoud } from './components/TraceViewer/TraceViewer';
export { JobStateMachineDiagram } from './components/JobStateMachineDiagram/JobStateMachineDiagram';
export { LaneHeader } from './components/LaneHeader/LaneHeader';
export { DivergencePin } from './components/DivergencePin/DivergencePin';

export { JOB_STATES } from './types';
export type {
  JobState,
  JobEvent,
  Cap,
  TraceViewerProps,
  JobStateMachineDiagramProps,
  JobStateBadgeProps,
  CapBadgeProps,
  SpendCapCounterProps,
  LaneHeaderProps,
  DivergencePinProps,
  DivergenceKind,
} from './types';
