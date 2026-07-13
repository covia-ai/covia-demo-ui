import { useMemo } from 'react';
import type { JobEvent, JobState, JobStateMachineDiagramProps } from '../../types';
import styles from './JobStateMachineDiagram.module.css';

/**
 * The ten-state lifecycle graph — the demo's screenshot artefact. Layout is
 * hand-tuned (never auto-graphviz): the happy path runs left→right across the
 * top, waiting states cluster in the middle, terminal states line the bottom,
 * REJECTED loudest. Nodes show a per-state counter from the JobEvent stream;
 * traversed edges get a token-flow animation (collapsed under reduced-motion);
 * `notToured` states render dimmed + dashed with a marker (never faked).
 */

interface Node {
  state: JobState;
  x: number;
  y: number;
  group: 'happy' | 'started' | 'complete' | 'waiting' | 'failed' | 'rejected' | 'muted';
}

const W = 122;
const H = 46;

// Hand-placed geometry (node centres) on a 780×450 canvas.
const NODES: Node[] = [
  { state: 'PENDING', x: 95, y: 66, group: 'waiting' },
  { state: 'STARTED', x: 340, y: 66, group: 'started' },
  { state: 'COMPLETE', x: 620, y: 66, group: 'complete' },
  { state: 'PAUSED', x: 235, y: 220, group: 'waiting' },
  { state: 'INPUT_REQUIRED', x: 400, y: 220, group: 'waiting' },
  { state: 'AUTH_REQUIRED', x: 565, y: 220, group: 'waiting' },
  { state: 'FAILED', x: 150, y: 372, group: 'failed' },
  { state: 'CANCELLED', x: 320, y: 372, group: 'muted' },
  { state: 'TIMEOUT', x: 490, y: 372, group: 'muted' },
  { state: 'REJECTED', x: 655, y: 372, group: 'rejected' },
];
const NODE = Object.fromEntries(NODES.map((n) => [n.state, n])) as Record<JobState, Node>;

// Directed edges of the lifecycle (the hand-tuned graph).
const EDGES: Array<[JobState, JobState]> = [
  ['PENDING', 'STARTED'],
  ['STARTED', 'COMPLETE'],
  ['STARTED', 'PAUSED'],
  ['STARTED', 'INPUT_REQUIRED'],
  ['STARTED', 'AUTH_REQUIRED'],
  ['STARTED', 'FAILED'],
  ['STARTED', 'CANCELLED'],
  ['STARTED', 'TIMEOUT'],
  ['STARTED', 'REJECTED'],
  ['PAUSED', 'STARTED'],
  ['INPUT_REQUIRED', 'STARTED'],
];

/** A gentle quadratic path between two node borders. */
function edgePath(a: Node, b: Node): string {
  const x1 = a.x;
  const y1 = a.y + (b.y > a.y ? H / 2 : b.y < a.y ? -H / 2 : 0);
  const x2 = b.x;
  const y2 = b.y + (b.y > a.y ? -H / 2 : b.y < a.y ? H / 2 : 0);
  const sameRow = a.y === b.y;
  const mx = (x1 + x2) / 2;
  const my = sameRow ? y1 : (y1 + y2) / 2 + (x2 > x1 ? -14 : 14);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

const edgeKey = (a: JobState, b: JobState) => `${a}->${b}`;

export function JobStateMachineDiagram({
  events,
  notToured = [],
  activeStates = [],
}: JobStateMachineDiagramProps) {
  const { counts, traversed } = useMemo(() => computeFlow(events), [events]);
  const notTouredSet = new Set(notToured);
  const activeSet = new Set(activeStates);

  return (
    <svg
      className={styles.diagram}
      viewBox="0 0 780 450"
      role="img"
      aria-label="Job lifecycle state machine"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className={styles.edges}>
        {EDGES.map(([a, b]) => {
          const on = traversed.has(edgeKey(a, b));
          return (
            <path
              key={edgeKey(a, b)}
              d={edgePath(NODE[a], NODE[b])}
              className={`${styles.edge} ${on ? styles.edgeOn : ''}`}
              fill="none"
              data-edge={edgeKey(a, b)}
            />
          );
        })}
      </g>

      <g className={styles.nodes}>
        {NODES.map((n) => {
          const count = counts[n.state] ?? 0;
          const isNotToured = notTouredSet.has(n.state);
          const isActive = activeSet.has(n.state);
          const cls = [
            styles.node,
            styles[`g_${n.group}`],
            isActive && styles.active,
            isNotToured && styles.notToured,
            count > 0 && !isNotToured && styles.visited,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <g key={n.state} className={cls} data-state={n.state} transform={`translate(${n.x - W / 2}, ${n.y - H / 2})`}>
              <rect className={styles.box} width={W} height={H} rx="10" />
              <text className={styles.label} x={W / 2} y={H / 2} dominantBaseline="central" textAnchor="middle">
                {n.state}
              </text>
              {count > 0 && (
                <g className={styles.counter} transform={`translate(${W - 8}, 8)`}>
                  <circle r="10" />
                  <text dominantBaseline="central" textAnchor="middle">
                    {count}
                  </text>
                </g>
              )}
              {isNotToured && (
                <text className={styles.marker} x={W / 2} y={H + 12} textAnchor="middle">
                  not toured
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Per-state counts + the set of edges the event stream traversed (per job). */
function computeFlow(events: JobEvent[]): {
  counts: Partial<Record<JobState, number>>;
  traversed: Set<string>;
} {
  const counts: Partial<Record<JobState, number>> = {};
  const traversed = new Set<string>();
  const lastByJob = new Map<string, JobState>();
  for (const e of events) {
    counts[e.state] = (counts[e.state] ?? 0) + 1;
    const prev = lastByJob.get(e.jobId);
    if (prev && prev !== e.state) traversed.add(edgeKey(prev, e.state));
    lastByJob.set(e.jobId, e.state);
  }
  return { counts, traversed };
}
