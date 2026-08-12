'use client';
import { SETUP_ITEMS, RECURRING_ITEMS, SERVICES, itemApplies, statusOf, isoKey, titleCase, resolveFreq, customTaskStatus } from '@/lib/complianceLogic';

const NAV_ICONS = {
  overview: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  setup: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  monthly: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  quarterly: <><path d="M21 12a9 9 0 1 1-3.5-7.1" /><path d="M21 3v6h-6" /></>,
  yearly: <path d="M12 2l2.6 6.6L21 9l-5 4.6L17.4 21 12 17.3 6.6 21 8 13.6 3 9l6.4-.4z" />,
  other: <><path d="M9 12h6M9 16h6M9 8h6" /><path d="M5 4h10l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /></>,
  trucking: <><rect x="1" y="8" width="14" height="8" rx="1" /><path d="M15 10h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  bookkeeping: <><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
  payroll: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
  excise: <><path d="M3 12h18" /><path d="M7 6l-4 6 4 6M17 6l4 6-4 6" /></>,
  immigration: <><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></>,
};
function Icon({ k }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">{NAV_ICONS[k]}</svg>;
}

function clientUrgency(client, state) {
  let red = 0, amber = 0;
  const st = state.setupStatus[client.id] || {};
  SETUP_ITEMS.forEach((it) => {
    if (!itemApplies(it.applies, client)) return;
    const s = st[it.key];
    if (!s || (!s.done && !s.na)) red++;
  });
  const rs = state.recurStatus[client.id] || {};
  const hiddenSet = new Set(state.hidden[client.id] || []);
  RECURRING_ITEMS.forEach((it) => {
    if (!itemApplies(it.applies, client) || hiddenSet.has(it.key)) return;
    const due = it.due(client);
    const r = rs[it.key];
    const st2 = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
    if (st2 === 'overdue') red++;
    else if (st2 === 'soon' || st2 === 'setdate') amber++;
  });
  return { red, amber };
}

function countFreqActionable(freq, state) {
  let n = 0;
  state.clients.forEach((c) => {
    const rs = state.recurStatus[c.id] || {};
    const hiddenSet = new Set(state.hidden[c.id] || []);
    RECURRING_ITEMS.forEach((it) => {
      if (resolveFreq(it, c) !== freq || !itemApplies(it.applies, c) || hiddenSet.has(it.key)) return;
      const due = it.due(c);
      const r = rs[it.key];
      const s = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
      if (s === 'overdue' || s === 'soon' || s === 'setdate') n++;
    });
  });
  return n;
}
function countServiceActionable(service, state) {
  let n = 0;
  state.clients.forEach((c) => {
    if (!Array.isArray(c.services) || !c.services.includes(service)) return;
    const st = state.setupStatus[c.id] || {};
    SETUP_ITEMS.forEach((it) => {
      if (it.service !== service || !itemApplies(it.applies, c)) return;
      const s = st[it.key];
      if (!s || (!s.done && !s.na)) n++;
    });
    const rs = state.recurStatus[c.id] || {};
    const hiddenSet = new Set(state.hidden[c.id] || []);
    RECURRING_ITEMS.forEach((it) => {
      if (it.service !== service || !itemApplies(it.applies, c) || hiddenSet.has(it.key)) return;
      const due = it.due(c);
      const r = rs[it.key];
      const s = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
      if (s === 'overdue' || s === 'soon' || s === 'setdate') n++;
    });
  });
  return n;
}
function countOtherTasksActionable(state) {
  let n = 0;
  Object.values(state.customTasks || {}).forEach((tasks) => {
    (tasks || []).forEach((t) => {
      const s = customTaskStatus(t);
      if (s === 'overdue' || s === 'soon' || s === 'setdate') n++;
    });
  });
  return n;
}
function countSetupIncomplete(state) {
  let n = 0;
  state.clients.forEach((c) => {
    const st = state.setupStatus[c.id] || {};
    const applicable = SETUP_ITEMS.filter((it) => itemApplies(it.applies, c));
    if (applicable.length === 0) return;
    const done = applicable.filter((it) => { const s = st[it.key]; return s && (s.done || s.na); }).length;
    if (done < applicable.length) n++;
  });
  return n;
}

export default function Sidebar({ state, currentView, setCurrentView, onAddCompany, onBackup, onSignOut }) {
  const overviewUrgent = state.clients.reduce((sum, c) => sum + clientUrgency(c, state).red, 0);
  const setupCount = countSetupIncomplete(state);
  const monthlyCount = countFreqActionable('monthly', state);
  const quarterlyCount = countFreqActionable('quarterly', state);
  const yearlyCount = countFreqActionable('yearly', state);
  const otherCount = countOtherTasksActionable(state);

  function Item({ view, iconKey, label, count, urgent }) {
    return (
      <button className={`nav-item ${currentView === view ? 'active' : ''}`} onClick={() => setCurrentView(view)}>
        <Icon k={iconKey} />
        <span className="nav-label">{label}</span>
        {count > 0 && <span className={`nav-count ${urgent ? 'hot' : ''}`}>{count}</span>}
      </button>
    );
  }

  return (
    <div className="sidebar">
      <div className="brand">Legacy<br />Compliance<small>Legacy Business Services LLC</small></div>
      <div className="nav">
        <Item view="overview" iconKey="overview" label="Overview" count={overviewUrgent} urgent={overviewUrgent > 0} />
        <div className="nav-sep" />
        <Item view="setup" iconKey="setup" label="New Company Setup" count={setupCount} urgent={false} />
        <div className="nav-group-label">By deadline</div>
        <Item view="monthly" iconKey="monthly" label="Monthly" count={monthlyCount} urgent={monthlyCount > 0} />
        <Item view="quarterly" iconKey="quarterly" label="Quarterly" count={quarterlyCount} urgent={quarterlyCount > 0} />
        <Item view="yearly" iconKey="yearly" label="Yearly" count={yearlyCount} urgent={yearlyCount > 0} />
        <div className="nav-group-label">By service</div>
        {SERVICES.map((s) => {
          const count = countServiceActionable(s.key, state);
          return <Item key={s.key} view={s.key} iconKey={s.key} label={s.label} count={count} urgent={count > 0} />;
        })}
        <div className="nav-sep" />
        <Item view="other" iconKey="other" label="Other Tasks" count={otherCount} urgent={otherCount > 0} />
        <div className="nav-sep" />
        <div className="nav-group-label">Clients</div>
        {state.clients.map((c) => {
          const u = clientUrgency(c, state);
          const dot = u.red > 0 ? 'red' : u.amber > 0 ? 'amber' : 'clear';
          const count = u.red > 0 ? u.red : u.amber > 0 ? u.amber : '';
          return (
            <button key={c.id} className={`nav-item ${currentView === c.id ? 'active' : ''}`} onClick={() => setCurrentView(c.id)}>
              <span className={`nav-dot ${dot}`} />
              <span className="nav-label">{titleCase(c.name)}</span>
              {count !== '' && <span className="nav-count">{count}</span>}
            </button>
          );
        })}
      </div>
      <button className="add-btn" onClick={onAddCompany}>+ Add company</button>
      <button className="signout-btn" onClick={onBackup}>⤓ Backup &amp; restore data</button>
      <button className="signout-btn" onClick={onSignOut}>Sign out</button>
    </div>
  );
}
