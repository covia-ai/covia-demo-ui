import type { CapBadgeProps } from '../../types';
import styles from './CapBadge.module.css';

/**
 * Renders a signed `{with, can}` capability document with a VALID/REVOKED badge.
 * The `revoked` boolean is modelled as a `state: 'valid' | 'revoked'` enum, with
 * optional `name`/`description` for consumers that need them. The badge label is
 * always text, never colour alone.
 */
export function CapBadge({
  cap,
  state = 'valid',
  name,
  description,
  dangerous = false,
}: CapBadgeProps) {
  const revoked = state === 'revoked';
  const classes = [styles.cap, dangerous && styles.dangerous, revoked && styles.revoked]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className={styles.head}>
        {name && <span className={styles.name}>{name}</span>}
        <span
          className={`${styles.badge} ${revoked ? styles.badgeRevoked : styles.badgeValid}`}
          aria-label={revoked ? 'capability revoked' : 'capability valid'}
        >
          {revoked ? 'REVOKED' : 'VALID'}
        </span>
      </div>
      <div className={styles.doc}>
        {'{'} with: {cap.with}, can: {cap.can} {'}'}
      </div>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}
