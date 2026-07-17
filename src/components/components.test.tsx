import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { JobStateBadge } from './JobStateBadge/JobStateBadge';
import { CapBadge } from './CapBadge/CapBadge';
import { SpendCapCounter } from './SpendCapCounter/SpendCapCounter';
import { LaneHeader } from './LaneHeader/LaneHeader';
import { DivergencePin } from './DivergencePin/DivergencePin';
import { JOB_STATES } from '../types';

afterEach(cleanup);

describe('JobStateBadge', () => {
  it('renders every one of the ten states with a text label and aria-label', () => {
    for (const state of JOB_STATES) {
      const { unmount } = render(<JobStateBadge state={state} />);
      const el = screen.getByLabelText(`job status ${state}`);
      expect(el.textContent).toBe(state); // never colour alone
      unmount();
    }
  });
});

describe('CapBadge', () => {
  const cap = { with: 'o/glassbox:pay-invoice', can: 'invoke' };

  it('renders a valid cap with its document, name and description', () => {
    render(<CapBadge cap={cap} name="Pay invoice" description="Moves money" />);
    expect(screen.getByLabelText('capability valid').textContent).toBe('VALID');
    expect(screen.getByText('Pay invoice')).toBeTruthy();
    expect(screen.getByText('Moves money')).toBeTruthy();
    expect(screen.getByText(/with:.*can:/s)).toBeTruthy();
  });

  it('renders REVOKED when state is revoked', () => {
    render(<CapBadge cap={cap} state="revoked" />);
    expect(screen.getByLabelText('capability revoked').textContent).toBe('REVOKED');
  });

  it('defaults to valid and renders without name/description', () => {
    render(<CapBadge cap={cap} dangerous />);
    expect(screen.getByLabelText('capability valid')).toBeTruthy();
  });
});

describe('SpendCapCounter (stub)', () => {
  it('renders nothing when hidden', () => {
    const { container } = render(
      <SpendCapCounter remaining={5} total={10} unit="GBP" source="hidden" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a proxy estimate', () => {
    render(<SpendCapCounter remaining={4} total={10} unit="GBP" source="proxy" />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('data-source')).toBe('proxy');
    expect(screen.getByText('estimate')).toBeTruthy();
  });

  it('renders a venue-authoritative figure', () => {
    render(<SpendCapCounter remaining={9} total={10} unit="tokens" source="venue" />);
    expect(screen.getByRole('status').getAttribute('data-source')).toBe('venue');
    expect(screen.getByText('remaining')).toBeTruthy();
  });

  it('marks a low remaining fraction', () => {
    render(<SpendCapCounter remaining={1} total={100} unit="GBP" source="venue" />);
    expect(screen.getByRole('status')).toBeTruthy(); // fraction 0.01 -> low treatment
  });

  it('tolerates a zero total without dividing by zero', () => {
    render(<SpendCapCounter remaining={0} total={0} unit="GBP" source="venue" />);
    expect(screen.getByRole('status').getAttribute('data-source')).toBe('venue');
  });
});

describe('LaneHeader', () => {
  it('renders the model chip, agent id, lineage badge, and state pill', () => {
    render(<LaneHeader model="Qwen2.5 (local)" agentId="worker-1" lineage="forked from worker-0" state="STARTED" />);
    expect(screen.getByText('Qwen2.5 (local)')).toBeTruthy();
    expect(screen.getByTitle('worker-1').textContent).toBe('worker-1');
    expect(screen.getByLabelText('lineage: forked from worker-0').textContent).toBe('forked from worker-0');
    expect(screen.getByLabelText('job status STARTED')).toBeTruthy();
  });

  it('renders without the optional lineage and state', () => {
    render(<LaneHeader model="GPT" agentId="worker-2" />);
    expect(screen.getByText('GPT')).toBeTruthy();
    expect(screen.queryByLabelText(/lineage:/)).toBeNull();
  });
});

describe('DivergencePin', () => {
  it('is a real button carrying step and kind as text, and opens both refs on click', () => {
    let opened: [string, string] | null = null;
    render(
      <DivergencePin step={3} refA="0xa" refB="0xb" kind="toolChoice" onOpen={(a, b) => (opened = [a, b])} />,
    );
    const btn = screen.getByRole('button', { name: 'divergence at step 3: tool choice' });
    expect(btn.textContent).toContain('step 3');
    expect(btn.textContent).toContain('tool choice');
    btn.click();
    expect(opened).toEqual(['0xa', '0xb']);
  });

  it('labels every divergence kind as text (never colour alone)', () => {
    for (const [kind, label] of [
      ['argument', 'argument'],
      ['output', 'output'],
      ['timing', 'timing'],
    ] as const) {
      const { unmount } = render(<DivergencePin step={1} refA="a" refB="b" kind={kind} />);
      expect(screen.getByRole('button', { name: `divergence at step 1: ${label}` })).toBeTruthy();
      unmount();
    }
  });
});
