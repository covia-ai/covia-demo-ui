import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { TraceViewer, isLoud } from './TraceViewer/TraceViewer';
import { JobStateMachineDiagram } from './JobStateMachineDiagram/JobStateMachineDiagram';
import { JOB_STATES, type JobEvent, type JobState } from '../types';

afterEach(cleanup);

const ev = (jobId: string, state: JobState, extra: Partial<JobEvent> = {}): JobEvent => ({
  jobId,
  ts: 1,
  state,
  opName: 'glassbox:op',
  ...extra,
});

// one event per state, distinct jobs
const oneEach = JOB_STATES.map((s, i) => ev(`0xjob${i}`, s));

describe('TraceViewer', () => {
  it('renders the empty state', () => {
    render(<TraceViewer events={[]} />);
    expect(screen.getByText(/No jobs yet/)).toBeTruthy();
  });

  it('renders a row for every state with a JobStateBadge', () => {
    render(<TraceViewer events={oneEach} />);
    for (const s of JOB_STATES) expect(screen.getByLabelText(`job status ${s}`)).toBeTruthy();
  });

  it('calls onSelect with the jobId when a row is clicked', () => {
    const onSelect = vi.fn();
    render(<TraceViewer events={[ev('0xABCDEF1234', 'COMPLETE')]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('glassbox:op'));
    expect(onSelect).toHaveBeenCalledWith('0xABCDEF1234');
  });

  it('marks the highlighted row', () => {
    render(<TraceViewer events={[ev('0xAA', 'COMPLETE')]} highlightJobId="0xAA" />);
    expect(screen.getByRole('button', { pressed: true })).toBeTruthy();
  });

  it('expands and collapses a payload', () => {
    render(<TraceViewer events={[ev('0xAA', 'FAILED', { payload: { error: 'boom' } })]} />);
    const toggle = screen.getByLabelText('Expand payload');
    fireEvent.click(toggle);
    expect(screen.getByText(/"error": "boom"/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Collapse payload'));
    expect(screen.queryByText(/"error": "boom"/)).toBeNull();
  });

  it('treats REJECTED and FAILED-with-denial as loud (D004)', () => {
    expect(isLoud(ev('a', 'REJECTED'))).toBe(true);
    expect(isLoud(ev('a', 'FAILED', { payload: { error: 'Capability denied: ...' } }))).toBe(true);
    expect(isLoud(ev('a', 'FAILED', { payload: { error: 'network blip' } }))).toBe(false);
    expect(isLoud(ev('a', 'COMPLETE'))).toBe(false);
    render(<TraceViewer events={[ev('a', 'REJECTED')]} />);
    expect(screen.getByText('refused')).toBeTruthy();
  });

  it('handles a 500-row stream', () => {
    const many = Array.from({ length: 500 }, (_, i) => ev(`0xj${i}`, JOB_STATES[i % 10]));
    const { container } = render(<TraceViewer events={many} />);
    expect(container.querySelectorAll('li').length).toBe(500);
  });
});

describe('JobStateMachineDiagram', () => {
  it('renders all ten state labels with text (never colour alone)', () => {
    const { container } = render(<JobStateMachineDiagram events={[]} />);
    for (const s of JOB_STATES) {
      expect(container.querySelector(`[data-state="${s}"]`), s).toBeTruthy();
      expect(within(container.querySelector(`[data-state="${s}"]`) as HTMLElement).getByText(s)).toBeTruthy();
    }
  });

  it('shows per-state counters from the event stream', () => {
    const events = [ev('a', 'PENDING'), ev('a', 'STARTED'), ev('b', 'PENDING'), ev('b', 'STARTED'), ev('b', 'COMPLETE')];
    const { container } = render(<JobStateMachineDiagram events={events} />);
    const pending = container.querySelector('[data-state="PENDING"]') as HTMLElement;
    expect(within(pending).getByText('2')).toBeTruthy(); // two PENDING events
    const complete = container.querySelector('[data-state="COMPLETE"]') as HTMLElement;
    expect(within(complete).getByText('1')).toBeTruthy();
  });

  it('marks not-toured states with a marker', () => {
    const { container } = render(
      <JobStateMachineDiagram events={[]} notToured={['REJECTED', 'AUTH_REQUIRED', 'TIMEOUT']} />,
    );
    expect(container.querySelectorAll('text').length).toBeGreaterThan(10);
    expect(screen.getAllByText('not toured').length).toBe(3);
  });

  it('applies active treatment to active states', () => {
    const { container } = render(<JobStateMachineDiagram events={[]} activeStates={['STARTED']} />);
    const started = container.querySelector('[data-state="STARTED"]') as HTMLElement;
    expect(started.getAttribute('class')).toMatch(/active/);
  });

  it('handles a 200-event burst without error', () => {
    const burst = Array.from({ length: 200 }, (_, i) => ev(`0xj${i % 20}`, JOB_STATES[i % 10]));
    const { container } = render(<JobStateMachineDiagram events={burst} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('[data-state]').length).toBe(10);
  });
});
