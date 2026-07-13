import type { SpendCapCounterProps } from '../../types';
import styles from './SpendCapCounter.module.css';

/**
 * SpendCapCounter — stub interface; the venue-side data source is wired in once
 * available. The interface is frozen so every demo consumes it once. Behaviour:
 *   - source: 'hidden' → renders nothing (repo tier / FEATURE_HOSTED=false)
 *   - source: 'proxy'  → renders the counter, marked as a backend estimate
 *   - source: 'venue'  → renders the counter as a venue-authoritative figure
 *
 * Numbers here are display-only until the data source lands; a low-remaining
 * fraction gets a warning treatment so the exhaustion beat reads.
 */
export function SpendCapCounter({ remaining, total, unit, source }: SpendCapCounterProps) {
  if (source === 'hidden') return null;

  const safeTotal = total > 0 ? total : 1;
  const fraction = Math.max(0, Math.min(1, remaining / safeTotal));
  const low = fraction <= 0.15;

  return (
    <div
      className={`${styles.counter} ${low ? styles.low : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`spend remaining ${remaining} of ${total} ${unit} (${source})`}
      data-source={source}
    >
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${fraction * 100}%` }} />
      </div>
      <div className={styles.readout}>
        <span className={styles.figure}>
          {remaining}
          <span className={styles.slash}> / {total}</span> {unit}
        </span>
        <span className={styles.tag}>{source === 'proxy' ? 'estimate' : 'remaining'}</span>
      </div>
    </div>
  );
}
