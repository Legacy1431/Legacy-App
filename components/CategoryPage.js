'use client';
import { useState } from 'react';
import { RECURRING_ITEMS, itemApplies, statusOf, isoKey, FREQ_META, resolveFreq } from '@/lib/complianceLogic';
import TaskRow from './TaskRow';

const SUBS = {
  monthly: 'Filings that repeat every month across all clients — right now that\u2019s Oregon weight-mile tax for carriers running Oregon.',
  quarterly: 'IFTA returns, WA excise, and quarterly wage/labor reports — grouped so you can batch every client\u2019s quarter in one sitting.',
  yearly: 'Annual and biennial renewals — 2290, UCR, IFTA license, insurance, MCS-150, and WA annual reports — across every client.',
};

export default function CategoryPage({ freq, state, onToggleRecur }) {
  const [showRest, setShowRest] = useState(false);
  const meta = FREQ_META[freq];
  let rows = [];
  state.clients.forEach((c) => {
    const rs = state.recurStatus[c.id] || {};
    const hiddenSet = new Set(state.hidden[c.id] || []);
    RECURRING_ITEMS.forEach((it) => {
      if (resolveFreq(it, c) !== freq || !itemApplies(it.applies, c) || hiddenSet.has(it.key)) return;
      const due = it.due(c);
      const r = rs[it.key];
      const status = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
      rows.push({ client: c, item: it, due, status });
    });
  });
  const rank = { overdue: 0, setdate: 1, soon: 2, ok: 3, done: 4 };
  const cmp = (a, b) => rank[a.status] - rank[b.status] || ((a.due && b.due) ? a.due - b.due : 0);
  const urgent = rows.filter((r) => r.status === 'overdue' || r.status === 'soon' || r.status === 'setdate').sort(cmp);
  const rest = rows.filter((r) => r.status === 'ok' || r.status === 'done').sort(cmp);
  const overdueN = urgent.filter((r) => r.status === 'overdue').length;
  const soonN = urgent.filter((r) => r.status === 'soon').length;

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>{meta.title}</h1>
      <p className="sub">{SUBS[freq]}</p>
      <div className="stat-row">
        <div className="stat red"><div className="n">{overdueN}</div><div className="l">Overdue</div></div>
        <div className="stat amber"><div className="n">{soonN}</div><div className="l">Due in 30 days</div></div>
        <div className="stat green"><div className="n">{rows.length}</div><div className="l">Total filings tracked</div></div>
      </div>

      {rows.length === 0 ? (
        <div className="empty"><b>No {meta.label.toLowerCase()} filings apply yet.</b><br />Add clients or fill in their details to see items here.</div>
      ) : urgent.length === 0 ? (
        <div className="empty"><b>Nothing due right now.</b><br />Every {meta.label.toLowerCase()} filing across your clients is caught up.</div>
      ) : (
        <>
          <div className="section-title">Needs attention <span className="badge">{urgent.length}</span></div>
          <div className="task-list">
            {urgent.map((r) => (
              <TaskRow key={r.client.id + r.item.key} client={r.client} item={r.item} due={r.due} status={r.status}
                showCompany onToggle={() => onToggleRecur(r.client, r.item)} />
            ))}
          </div>
        </>
      )}

      {rest.length > 0 && (
        <>
          <button className="toggle-link" onClick={() => setShowRest((s) => !s)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11" style={{ transform: showRest ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
            {showRest ? 'Hide' : 'Show'} upcoming &amp; completed ({rest.length})
          </button>
          {showRest && (
            <div className="task-list">
              {rest.map((r) => (
                <TaskRow key={r.client.id + r.item.key} client={r.client} item={r.item} due={r.due} status={r.status}
                  showCompany onToggle={() => onToggleRecur(r.client, r.item)} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
