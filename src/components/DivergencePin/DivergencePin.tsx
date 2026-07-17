import type { DivergencePinProps, DivergenceKind } from '../../types';
import styles from './DivergencePin.module.css';

const KIND_LABEL: Record<DivergenceKind, string> = {
  toolChoice: 'tool choice',
  argument: 'argument',
  output: 'output',
  timing: 'timing',
};

/**
 * Marker pinned at a step where two execution records part ways. A real button: the
 * label carries the step and the divergence kind as text, and activating it opens the
 * two linked raw records via `onOpen(refA, refB)`.
 */
export function DivergencePin({ step, refA, refB, kind, onOpen }: DivergencePinProps) {
  return (
    <button
      type="button"
      className={styles.pin}
      aria-label={`divergence at step ${step}: ${KIND_LABEL[kind]}`}
      onClick={() => onOpen?.(refA, refB)}
    >
      <span className={styles.glyph} aria-hidden="true">
        ⑂
      </span>
      <span className={styles.step}>step {step}</span>
      <span className={styles.kind}>{KIND_LABEL[kind]}</span>
    </button>
  );
}
