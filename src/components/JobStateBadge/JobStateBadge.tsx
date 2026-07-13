import type { JobState, JobStateBadgeProps } from '../../types';
import styles from './JobStateBadge.module.css';

/**
 * Colour-coded pill for a job state. The state text is always rendered; state is
 * never conveyed by colour alone.
 */
const GROUP: Record<JobState, string> = {
  COMPLETE: 'complete',
  STARTED: 'started',
  FAILED: 'failed',
  REJECTED: 'rejected',
  PENDING: 'waiting',
  INPUT_REQUIRED: 'waiting',
  AUTH_REQUIRED: 'waiting',
  PAUSED: 'waiting',
  CANCELLED: 'muted',
  TIMEOUT: 'muted',
};

export function JobStateBadge({ state }: JobStateBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[GROUP[state]]}`}
      aria-label={`job status ${state}`}
    >
      {state}
    </span>
  );
}
