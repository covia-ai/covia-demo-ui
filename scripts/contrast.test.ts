import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseThemes, contrastRatio, type ThemeTokens } from './contrast';

const css = readFileSync(resolve(__dirname, '../src/tokens/tokens.css'), 'utf8');
const themes = parseThemes(css);

// Semantic pairs that carry text (foreground, background). AA normal text = 4.5.
const TEXT_PAIRS: Array<[string, string]> = [
  ['--ink', '--bg'],
  ['--ink', '--panel'],
  ['--ink', '--panel-2'],
  ['--ink-soft', '--panel'],
  ['--muted', '--panel'],
  ['--header-ink', '--header'],
  ['--state-complete', '--state-complete-soft'],
  ['--state-started', '--state-started-soft'],
  ['--state-failed', '--state-failed-soft'],
  ['--state-waiting', '--state-waiting-soft'],
  ['--state-muted', '--state-muted-soft'],
  ['--state-rejected-ink', '--state-rejected'], // solid loud badge
  ['--primary-ink', '--primary'], // solid button
  // migrated-component aliases (must resolve identically)
  ['--success', '--success-soft'],
  ['--danger', '--danger-soft'],
];

const AA_TEXT = 4.5;

function check(theme: ThemeTokens, fg: string, bg: string): number {
  expect(theme[fg], `token ${fg} missing / not a colour`).toBeDefined();
  expect(theme[bg], `token ${bg} missing / not a colour`).toBeDefined();
  return contrastRatio(theme[fg], theme[bg]);
}

describe('design tokens — AA contrast, both themes', () => {
  for (const themeName of ['light', 'dark'] as const) {
    describe(themeName, () => {
      for (const [fg, bg] of TEXT_PAIRS) {
        it(`${fg} on ${bg} ≥ ${AA_TEXT}:1`, () => {
          const ratio = check(themes[themeName], fg, bg);
          expect(
            ratio,
            `${themeName}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (need ${AA_TEXT})`,
          ).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    });
  }

  it('parses both themes with the expected token set', () => {
    expect(Object.keys(themes.light).length).toBeGreaterThan(10);
    expect(Object.keys(themes.dark).length).toBeGreaterThan(10);
    // dark overrides bg (sanity that theme resolution differs)
    expect(themes.dark['--bg']).not.toEqual(themes.light['--bg']);
  });
});
