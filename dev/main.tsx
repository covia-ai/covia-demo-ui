import { createRoot } from 'react-dom/client';
import '../src/tokens/tokens.css';
import { TraceViewer, JobStateMachineDiagram, LaneHeader, DivergencePin } from '../src/index';
import type { JobEvent, JobState } from '../src/types';

// A realistic week-close tour, for the visual harness (not shipped).
const ev = (jobId: string, state: JobState, opName: string, payload?: unknown): JobEvent => ({
  jobId,
  ts: 1,
  state,
  opName,
  payload,
});

const events: JobEvent[] = [
  ev('0xM1', 'PENDING', 'glassbox:match-invoice'),
  ev('0xM1', 'STARTED', 'glassbox:match-invoice'),
  ev('0xM1', 'COMPLETE', 'glassbox:match-invoice'),
  ev('0xF1', 'PENDING', 'glassbox:fetch-upstream'),
  ev('0xF1', 'STARTED', 'glassbox:fetch-upstream'),
  ev('0xF1', 'FAILED', 'glassbox:fetch-upstream', { error: 'upstream 503 (flaky first call)' }),
  ev('0xR1', 'INPUT_REQUIRED', 'refund-approval'),
  ev('0xQ1', 'STARTED', 'glassbox:summarise'),
  ev('0xQ1', 'PAUSED', 'glassbox:summarise'),
  ev('0xC1', 'STARTED', 'glassbox:summarise'),
  ev('0xC1', 'CANCELLED', 'glassbox:summarise'),
  ev('0xBH', 'PENDING', 'glassbox:pay-invoice'),
  ev('0xBH', 'STARTED', 'glassbox:pay-invoice'),
  ev('0xBH', 'FAILED', 'glassbox:pay-invoice', {
    error: 'Payment refused by policy: BH-0091 is GBP 4820 (over the GBP 2000 cap) and a duplicate of BH-0088. Capability denied.',
  }),
];

function Harness() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, display: 'grid', gap: 28 }}>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
          JobStateMachineDiagram
        </p>
        <JobStateMachineDiagram
          events={events}
          activeStates={['STARTED']}
          notToured={['REJECTED', 'AUTH_REQUIRED', 'TIMEOUT']}
        />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
          TraceViewer
        </p>
        <TraceViewer events={events} highlightJobId="0xBH" onSelect={(id) => console.log('select', id)} />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
          LaneHeader
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <LaneHeader model="Qwen2.5 (local)" agentId="worker-analyst" state="STARTED" />
          <LaneHeader
            model="Claude"
            agentId="worker-analyst-fork-b"
            lineage="forked from worker-analyst"
            state="COMPLETE"
          />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
          DivergencePin
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <DivergencePin step={2} refA="0xa2" refB="0xb2" kind="toolChoice" onOpen={(a, b) => console.log('open', a, b)} />
          <DivergencePin step={4} refA="0xa4" refB="0xb4" kind="argument" />
          <DivergencePin step={5} refA="0xa5" refB="0xb5" kind="output" />
          <DivergencePin step={7} refA="0xa7" refB="0xb7" kind="timing" />
        </div>
      </div>
    </div>
  );
}

document.body.style.background = 'var(--bg)';
document.body.style.color = 'var(--ink)';
document.body.style.margin = '0';
createRoot(document.getElementById('root')!).render(<Harness />);
