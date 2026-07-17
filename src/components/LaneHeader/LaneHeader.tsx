import type { LaneHeaderProps } from '../../types';
import { JobStateBadge } from '../JobStateBadge/JobStateBadge';
import styles from './LaneHeader.module.css';

/**
 * Header for one lane in a side-by-side comparison of agent runs: a model chip, the
 * (truncated) agent identity, an optional lineage badge for a lane that was forked from
 * another, and an optional job-state pill. All information is carried by text, never by
 * colour alone.
 */
export function LaneHeader({ model, agentId, lineage, state }: LaneHeaderProps) {
  return (
    <header className={styles.head}>
      <span className={styles.model}>{model}</span>
      <span className={styles.agent} title={agentId}>
        {agentId}
      </span>
      {lineage && (
        <span className={styles.lineage} aria-label={`lineage: ${lineage}`}>
          {lineage}
        </span>
      )}
      {state && <JobStateBadge state={state} />}
    </header>
  );
}
