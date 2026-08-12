'use client';
import { useState } from 'react';
import { SETUP_ITEMS, RECURRING_ITEMS, itemApplies, statusOf, isoKey, titleCase } from '@/lib/complianceLogic';
import SetupChecklist, { computeSetupProgress } from './SetupChecklist';
import TaskRow from './TaskRow';

const SERVICE_INTRO = {
  trucking: 'Everything for your trucking clients — setup, and every recurring filing — in one place.',
  bookkeeping: 'Bookkeeping clients: onboarding steps plus monthly close and review work.',
  payroll: 'Payroll clients: onboarding steps plus every federal and WA payroll filing.',
  excise: 'WA excise tax accounts and filings, at whatever frequency each client is assigned.',
  immigration: 'Immigration, Indian passport, and OCI clients. This checklist is the repeatable intake process — track each specific case (whose passport, due when) on that client\u2019s Other Tasks list.',
};

export default function ServicePage({ service, serviceLabel, state, onToggleRecur, onToggleSetupDone, onToggleSetupNA, onSetExpiry }) {
  const clients = state.clients.filter((c) => Array.isArray(c.services) && c.services.includes(service));

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>{serviceLabel}</h1>
      <p className="sub">{SERVICE_INTRO[service] || ''}</p>

      {clients.length === 0 ? (
        <div className="empty">No clients have <b>{serviceLabel}</b> turned on yet. Add or edit a client and check this service on their profile.</div>
      ) : (
        clients.map((c) => <ClientServiceBlock key={c.id} client={c} service={service} state={state}
          onToggleRecur={onToggleRecur} onToggleSetupDone={onToggleSetupDone} onToggleSetupNA={onToggleSetupNA} onSetExpiry={onSetExpiry} />)
      )}
    </>
  );
}

function ClientServiceBlock({ client, service, state, onToggleRecur, onToggleSetupDone, onToggleSetupNA, onSetExpiry }) {
  const [showRest, setShowRest] = useState(false);

  const applicableSetup = SETUP_ITEMS.filter((it) => it.service === service && itemApplies(it.applies, client));
  const { done: setupDone, total: setupTotal } = computeSetupProgress(client, state.setupStatus, applicableSetup);

  const rs = state.recurStatus[client.id] || {};
  const hiddenSet = new Set(state.hidden[client.id] || []);
  const rows = RECURRING_ITEMS.filter((it) => it.service === service && itemApplies(it.applies, client) && !hiddenSet.has(it.key)).map((it) => {
    const due = it.due(client);
    const r = rs[it.key];
    const status = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
    return { item: it, due, status };
  });
  const rank = { overdue: 0, setdate: 1, soon: 2 };
  const urgent = rows.filter((r) => r.status === 'overdue' || r.status === 'soon' || r.status === 'setdate').sort((a, b) => rank[a.status] - rank[b.status]);
  const rest = rows.filter((r) => r.status === 'ok' || r.status === 'done');

  if (applicableSetup.length === 0 && rows.length === 0) return null;

  return (
    <div style={{ marginBottom: 30 }}>
      <div className="section-title" style={{ marginTop: 0 }}>{titleCase(client.name)}</div>

      {applicableSetup.length > 0 && setupDone < setupTotal && (
        <div className="setup-wrap" style={{ marginBottom: 14 }}>
          <div className="progress-row">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(setupDone / setupTotal * 100).toFixed(0)}%` }} /></div>
            <div className="progress-txt">Setup {setupDone} / {setupTotal}</div>
          </div>
          <SetupChecklist client={client} setupStatus={state.setupStatus} onToggleDone={onToggleSetupDone} onToggleNA={onToggleSetupNA} itemsOverride={applicableSetup} />
        </div>
      )}

      {urgent.length > 0 ? (
        <div className="task-list">
          {urgent.map((r) => (
            <TaskRow key={r.item.key} client={client} item={r.item} due={r.due} status={r.status} onToggle={() => onToggleRecur(client, r.item)}
              completion={rs[r.item.key]} onSetExpiry={(val) => onSetExpiry(client.id, r.item.key, val)} />
          ))}
        </div>
      ) : rows.length > 0 ? (
        <div className="empty" style={{ padding: 16 }}>Nothing due soon for {titleCase(client.name)}.</div>
      ) : null}

      {rest.length > 0 && (
        <>
          <button className="toggle-link" onClick={() => setShowRest((s) => !s)}>
            {showRest ? 'Hide' : 'Show'} upcoming &amp; completed ({rest.length})
          </button>
          {showRest && (
            <div className="task-list">
              {rest.map((r) => (
                <TaskRow key={r.item.key} client={client} item={r.item} due={r.due} status={r.status} onToggle={() => onToggleRecur(client, r.item)}
                  completion={rs[r.item.key]} onSetExpiry={(val) => onSetExpiry(client.id, r.item.key, val)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
