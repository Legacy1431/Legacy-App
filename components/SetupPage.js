'use client';
import { titleCase } from '@/lib/complianceLogic';
import SetupChecklist, { computeSetupProgress } from './SetupChecklist';

export default function SetupPage({ state, onToggleDone, onToggleNA }) {
  const withSetup = state.clients.map((c) => {
    const { total, done } = computeSetupProgress(c, state.setupStatus);
    return { client: c, total, done };
  }).filter((x) => x.total > 0);
  const incomplete = withSetup.filter((x) => x.done < x.total);
  const complete = withSetup.filter((x) => x.done === x.total);

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>New Company Setup</h1>
      <p className="sub">One-time onboarding checklist for every client, in filing order. Click a company to work through its steps — done and N/A both count as finished.</p>
      <div className="stat-row">
        <div className="stat amber"><div className="n">{incomplete.length}</div><div className="l">In progress</div></div>
        <div className="stat green"><div className="n">{complete.length}</div><div className="l">Fully set up</div></div>
      </div>

      {withSetup.length === 0 ? (
        <div className="empty">No companies yet. <b>Add a company</b> from the sidebar to generate its setup checklist automatically.</div>
      ) : (
        [...incomplete, ...complete].map((x) => {
          const pct = (x.done / x.total * 100).toFixed(0);
          return (
            <details className={`co-card ${x.done === x.total ? 'complete' : ''}`} open={x.done < x.total} key={x.client.id}>
              <summary className="co-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" className="chev"><polyline points="6 9 12 15 18 9" /></svg>
                <div className="name">{titleCase(x.client.name)}<span className="ty">{x.client.type}</span></div>
                <div className="mini-bar"><div className="mini-fill" style={{ width: `${pct}%` }} /></div>
                <div className="mini-txt">{x.done}/{x.total}</div>
              </summary>
              <div className="co-card-body">
                <SetupChecklist client={x.client} setupStatus={state.setupStatus} onToggleDone={onToggleDone} onToggleNA={onToggleNA} />
              </div>
            </details>
          );
        })
      )}
    </>
  );
}
