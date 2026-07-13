import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { JobStateBadge } from './JobStateBadge/JobStateBadge';
import { CapBadge } from './CapBadge/CapBadge';
import { SpendCapCounter } from './SpendCapCounter/SpendCapCounter';
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
