/**
 * Shared interface contracts for covia-demo-ui.
 *
 * The venue-facing contract (`JobState`, `JobEvent`) mirrors the venue job
 * lifecycle; the component prop contracts are the stable API every Covia demo
 * consumes.
 */

/** The ten job states of the venue lifecycle. */
export type JobState =
  | 'PENDING'
  | 'STARTED'
  | 'COMPLETE'
  | 'FAILED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'INPUT_REQUIRED'
  | 'AUTH_REQUIRED'
  | 'PAUSED'
  | 'TIMEOUT';

/** All ten states in canonical order (for diagrams, iteration, tests). */
export const JOB_STATES: readonly JobState[] = [
  'PENDING',
  'STARTED',
  'COMPLETE',
  'FAILED',
  'CANCELLED',
  'REJECTED',
  'INPUT_REQUIRED',
  'AUTH_REQUIRED',
  'PAUSED',
  'TIMEOUT',
];

/**
 * One observed job transition — the unit TraceViewer and JobStateMachineDiagram
 * both render. Consumers whose venue frame differs (e.g. `status`/`operation`)
 * adapt at their own boundary.
 */
export interface JobEvent {
  jobId: string;
  ts: number; // epoch ms, server-side
  state: JobState;
  opName: string;
  agentId?: string;
  durationMs?: number;
  payload?: unknown; // expandable raw event payload (incl. denial payloads)
}

export interface TraceViewerProps {
  events: JobEvent[];
  highlightJobId?: string;
  onSelect?: (jobId: string) => void;
}

export interface JobStateMachineDiagramProps {
  events: JobEvent[];
  /** States to render as reachable-but-not-toured (e.g. REJECTED on this venue). */
  notToured?: JobState[];
  activeStates?: JobState[];
}

/** A signed UCAN grant as it appears in an agent's caps array. */
export interface Cap {
  with: string;
  can: string;
}

/**
 * JobStateBadge — colour-coded pill, text label always rendered (never colour
 * alone). The prop is `{ state }`.
 */
export interface JobStateBadgeProps {
  state: JobState;
}

/**
 * CapBadge — renders a `{with, can}` grant as a compact card with a VALID/REVOKED
 * badge. The prop is `{ cap, state, dangerous? }`, with optional `name`/`description`
 * for consumers that render them. Grant validity is a `state: 'valid' | 'revoked'`
 * enum; a consumer holding a `revoked` boolean passes `state={revoked ? 'revoked' : 'valid'}`.
 */
export interface CapBadgeProps {
  cap: Cap;
  /** Grant validity; defaults to 'valid'. */
  state?: 'valid' | 'revoked';
  /** Human-legible capability name (rendered when present). */
  name?: string;
  /** One-line description. */
  description?: string;
  /** Marks a money-moving / high-blast-radius grant. */
  dangerous?: boolean;
}

/**
 * SpendCapCounter — stub interface; the venue-side data source is wired in once
 * available. Frozen so every demo consumes it once. Hidden when
 * `source: 'hidden'` (repo tier / `FEATURE_HOSTED=false`).
 */
export interface SpendCapCounterProps {
  remaining: number;
  total: number;
  unit: string; // e.g. 'GBP', 'tokens'
  source: 'hidden' | 'proxy' | 'venue';
}

/** The ways two execution records can part company at an aligned step. */
export type DivergenceKind = 'toolChoice' | 'argument' | 'output' | 'timing';

/**
 * LaneHeader — header for one lane in a side-by-side comparison of agent runs: a model
 * chip, the (truncated) agent identity, an optional lineage badge for a forked lane, and
 * an optional job-state pill.
 */
export interface LaneHeaderProps {
  model: string;
  agentId: string;
  /** Lineage note for a forked lane (e.g. "forked from worker-1"). Rendered as a badge. */
  lineage?: string;
  /** Optional job state rendered as a JobStateBadge at the end of the header. */
  state?: JobState;
}

/**
 * DivergencePin — marker pinned at a step where two execution records part ways.
 * Activating it opens the two linked raw records.
 */
export interface DivergencePinProps {
  step: number;
  /** Reference into record A (opaque to the component; e.g. a job id or timeline ref). */
  refA: string;
  /** Reference into record B. */
  refB: string;
  kind: DivergenceKind;
  onOpen?: (refA: string, refB: string) => void;
}
