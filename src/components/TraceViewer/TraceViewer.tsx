import { useState } from 'react';
import type { JobEvent, TraceViewerProps } from '../../types';
import { JobStateBadge } from '../JobStateBadge/JobStateBadge';
import styles from './TraceViewer.module.css';

/**
 * The library's flagship: a streaming trace list, one row per job event. Rows
 * carry a JobStateBadge, the (shortened) job id, the performing agent (— when
 * the caller was not an agent), the op name, and a relative
 * timestamp; a row with a payload expands to the raw JSON. REJECTED — and a
 * FAILED job carrying a denial payload render loudest. Selecting a row
 * calls onSelect(jobId); highlightJobId marks the decisive row.
 */
function shortId(id: string): string {
  const hex = id.startsWith('0x') ? id.slice(2) : id;
  return hex.length > 10 ? `${hex.slice(0, 6)}…${hex.slice(-4)}` : hex;
}

function isDenial(payload: unknown): boolean {
  const err = (payload as { error?: unknown })?.error;
  return typeof err === 'string' && /denied|refused|capabilit/i.test(err);
}

/** REJECTED, or a FAILED job carrying a denial payload: the decisive rows. */
export function isLoud(event: JobEvent): boolean {
  return event.state === 'REJECTED' || (event.state === 'FAILED' && isDenial(event.payload));
}

export function TraceViewer({ events, highlightJobId, onSelect }: TraceViewerProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className={styles.viewer} role="log" aria-live="polite" aria-label="Job trace">
      <div className={styles.header} aria-hidden="true">
        <span>State</span>
        <span>Job</span>
        <span>Agent</span>
        <span>Operation</span>
        <span className={styles.right}>+</span>
      </div>
      <ul className={styles.rows}>
        {events.length === 0 && <li className={styles.empty}>No jobs yet. Start the run.</li>}
        {events.map((event, i) => {
          const loud = isLoud(event);
          const highlighted = highlightJobId != null && event.jobId === highlightJobId;
          const hasPayload = event.payload != null;
          const rowClasses = [
            styles.row,
            loud && styles.loud,
            highlighted && styles.highlight,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={i} className={rowClasses}>
              <button
                type="button"
                className={styles.rowMain}
                aria-pressed={highlighted}
                onClick={() => onSelect?.(event.jobId)}
              >
                <JobStateBadge state={event.state} />
                <span className={styles.jobId} title={event.jobId}>
                  {shortId(event.jobId)}
                </span>
                <span className={styles.agent}>{event.agentId ?? '—'}</span>
                <span className={styles.op}>{event.opName}</span>
                {loud && <span className={styles.loudTag}>refused</span>}
              </button>
              {hasPayload && (
                <button
                  type="button"
                  className={styles.expand}
                  aria-expanded={expanded === i}
                  aria-label={expanded === i ? 'Collapse payload' : 'Expand payload'}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {expanded === i ? '–' : '+'}
                </button>
              )}
              {hasPayload && expanded === i && (
                <pre className={styles.payload}>{JSON.stringify(event.payload, null, 2)}</pre>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
