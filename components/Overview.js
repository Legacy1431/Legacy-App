'use client';
import { RECURRING_ITEMS, itemApplies, statusOf, isoKey, titleCase, customTaskStatus, fmtDate, computeDriverAlerts } from '@/lib/complianceLogic';
import { computeSetupProgress } from './SetupChecklist';
import TaskRow from './TaskRow';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NO DATE'],
};

export default function Overview({ state, onToggleRecur, onToggleTask, onSetExpiry, goToClient }) {
  let allTasks = [];
  state.clients.forEach((c) => {
    const rs = state.recurStatus[c.id] || {};
    const hiddenSet = new Set(state.hidden[c.id] || []);
    RECURRING_ITEMS.forEach((it) => {
      if (!itemApplies(it.applies, c) || hiddenSet.has(it.key)) return;
      const due = it.due(c);
      const r = rs[it.key];
      const curKey = due ? isoKey(due) : null;
      const status = statusOf(due, r && r.doneKey, curKey);
      if (status === 'overdue' || status === 'soon' || status === 'setdate') allTasks.push({ kind: 'recur', client: c, item: it, due, status });
    });
    (state.customTasks[c.id] || []).forEach((t) => {
      const status = customTaskStatus(t);
      if (status === 'overdue' || status === 'soon' || status === 'setdate') allTasks.push({ kind: 'custom', client: c, task: t, status });
    });
  });
  computeDriverAlerts(state.clients).forEach((a) => {
    allTasks.push({ kind: 'driver', client: a.client, driver: a.driver, field: a.field, fieldLabel: a.fieldLabel, due: a.due, status: a.status });
  });
  const rank = { overdue: 0, setdate: 1, soon: 2 };
  allTasks.sort((a, b) => rank[a.status] - rank[b.status]);

  const setupGaps = state.clients.map((c) => {
    const { total, done } = computeSetupProgress(c, state.setupStatus);
    return { client: c, total, done };
  }).filter((x) => x.total > 0 && x.done < x.total);

  const overdueCount = allTasks.filter((t) => t.status === 'overdue').length;
  const soonCount = allTasks.filter((t) => t.status === 'soon').length;
  const setdateCount = allTasks.filter((t) => t.status === 'setdate').length;

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>Overview</h1>
      <p className="sub">Everything across all clients that needs attention — compliance filings and one-off tasks together. Nothing else — the rest is upcoming and quietly waiting its turn.</p>
      <div className="stat-row">
        <div className="stat red"><div className="n">{overdueCount}</div><div className="l">Overdue</div></div>
        <div className="stat amber"><div className="n">{soonCount}</div><div className="l">Due in 30 days</div></div>
        <div className="stat"><div className="n">{setdateCount}</div><div className="l">Missing a date</div></div>
        <div className="stat green"><div className="n">{state.clients.length}</div><div className="l">Clients tracked</div></div>
      </div>

      {allTasks.length === 0 ? (
        <div className="empty"><b>Nothing urgent right now.</b><br />Everything due soon or overdue will show up here the moment it needs you.</div>
      ) : (
        <>
          <div className="section-title">Needs attention <span className="badge">{allTasks.length}</span></div>
          <div className="task-list">
            {allTasks.map((t) => t.kind === 'recur' ? (
              <TaskRow key={t.client.id + t.item.key} client={t.client} item={t.item} due={t.due} status={t.status}
                showCompany onToggle={() => onToggleRecur(t.client, t.item)}
                completion={(state.recurStatus[t.client.id] || {})[t.item.key]}
                onSetExpiry={(val) => onSetExpiry(t.client.id, t.item.key, val)} />
            ) : t.kind === 'driver' ? (
              <div className="task" key={t.client.id + t.driver.id + t.field} style={{ cursor: 'pointer' }} onClick={() => goToClient(t.client.id)}>
                <div className="task-main">
                  <div className="task-co">{titleCase(t.client.name)}</div>
                  <div className="task-label"><span className={`pill ${PILL_MAP[t.status][0]}`}>{PILL_MAP[t.status][1]}</span>{t.driver.name} — {t.fieldLabel}<span className="freq-tag">Driver</span></div>
                  <div className="task-due">{t.due ? `Expires ${fmtDate(new Date(t.due + 'T00:00:00'))}` : 'No date set'}</div>
                </div>
              </div>
            ) : (
              <div className={`task`} key={t.task.id}>
                <button className="chk" onClick={() => onToggleTask(t.client.id, t.task)} aria-label={`Mark ${t.task.label} done`}>
                  <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
                </button>
                <div className="task-main">
                  <div className="task-co">{titleCase(t.client.name)}</div>
                  <div className="task-label"><span className={`pill ${PILL_MAP[t.status][0]}`}>{PILL_MAP[t.status][1]}</span>{t.task.label}<span className="freq-tag">Other task</span></div>
                  <div className="task-due">{t.task.due ? `Due ${fmtDate(new Date(t.task.due + 'T00:00:00'))}` : 'No date set'}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {setupGaps.length > 0 && (
        <>
          <div className="section-title">New company setup in progress</div>
          <div className="task-list">
            {setupGaps.map((g) => (
              <div className="task" key={g.client.id} style={{ cursor: 'pointer' }} onClick={() => goToClient(g.client.id)}>
                <div className="task-main">
                  <div className="task-co">{titleCase(g.client.name)}</div>
                  <div className="task-label">{g.done} of {g.total} setup steps done</div>
                </div>
                <div style={{ alignSelf: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>open →</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
