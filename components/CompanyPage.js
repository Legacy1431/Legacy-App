'use client';
import { useState } from 'react';
import { RECURRING_ITEMS, itemApplies, statusOf, isoKey, titleCase, customTaskStatus, fmtDate, SERVICES } from '@/lib/complianceLogic';
import SetupChecklist, { computeSetupProgress } from './SetupChecklist';
import TaskRow from './TaskRow';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NO DATE'], done: ['green', 'DONE'], ok: ['green', 'OK'],
};

function CustomTaskRow({ task, onToggle, onDelete }) {
  const status = customTaskStatus(task);
  const [cls, label] = PILL_MAP[status];
  const checked = status === 'done';
  return (
    <div className={`task ${checked ? 'done' : ''}`}>
      <button className={`chk ${checked ? 'checked' : ''}`} onClick={onToggle} aria-label={`Mark ${task.label} done`}>
        <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
      </button>
      <div className="task-main">
        <div className="task-label"><span className={`pill ${cls}`}>{label}</span>{task.label}</div>
        <div className="task-due">{task.due ? `Due ${fmtDate(new Date(task.due + 'T00:00:00'))}` : 'No date set'}</div>
      </div>
      <button className="task-hide" onClick={onDelete} title="Delete this task">delete</button>
    </div>
  );
}

export default function CompanyPage({ client, state, onEdit, onToggleRecur, onToggleSetupDone, onToggleSetupNA, onHide, onUnhide, onAddTask, onToggleTask, onDeleteTask }) {
  const [showRest, setShowRest] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [taskLabel, setTaskLabel] = useState('');
  const [taskDue, setTaskDue] = useState('');

  const { total: setupTotal, done: setupDone } = computeSetupProgress(client, state.setupStatus);
  const setupComplete = setupTotal > 0 && setupDone === setupTotal;

  const rs = state.recurStatus[client.id] || {};
  const hiddenSet = new Set(state.hidden[client.id] || []);
  const recurRows = RECURRING_ITEMS.filter((it) => itemApplies(it.applies, client) && !hiddenSet.has(it.key)).map((it) => {
    const due = it.due(client);
    const r = rs[it.key];
    const status = statusOf(due, r && r.doneKey, due ? isoKey(due) : null);
    return { item: it, due, status };
  });
  const rank = { overdue: 0, setdate: 1, soon: 2 };
  const urgent = recurRows.filter((r) => r.status === 'overdue' || r.status === 'soon' || r.status === 'setdate').sort((a, b) => rank[a.status] - rank[b.status]);
  const upcoming = recurRows.filter((r) => r.status === 'ok');
  const doneRows = recurRows.filter((r) => r.status === 'done');
  const hiddenItems = RECURRING_ITEMS.filter((it) => itemApplies(it.applies, client) && hiddenSet.has(it.key));
  const restCount = upcoming.length + doneRows.length;

  const myTasks = state.customTasks[client.id] || [];
  const taskRank = { overdue: 0, setdate: 1, soon: 2, ok: 3, done: 4 };
  const sortedTasks = [...myTasks].sort((a, b) => taskRank[customTaskStatus(a)] - taskRank[customTaskStatus(b)]);

  function submitTask(e) {
    e.preventDefault();
    if (!taskLabel.trim()) return;
    onAddTask(client.id, { label: taskLabel.trim(), due: taskDue, notes: '' });
    setTaskLabel(''); setTaskDue('');
  }

  const profileBits = [client.usdot && `DOT ${client.usdot}`, client.mc, client.ein && `EIN ${client.ein}`, client.ubi && `UBI ${client.ubi}`].filter(Boolean);
  const profileBits2 = [
    client.oregon && `Oregon permit ${client.oregon}`, client.ifta && `IFTA ${client.ifta}`,
    client.units && `${client.units} truck${client.units === '1' ? '' : 's'}`,
    client.drivers && `${client.drivers} driver${client.drivers === '1' ? '' : 's'}`,
  ].filter(Boolean);
  const contactBits = [client.contact, client.phone, client.email].filter(Boolean);
  const vendorBits = [
    client.insCarrier && `Insurance: ${client.insCarrier}`, client.consortium && `Consortium: ${client.consortium}`, client.eld && `ELD: ${client.eld}`,
  ].filter(Boolean);

  return (
    <>
      <p className="eyebrow">{client.type}{client.entityType ? ` · ${client.entityType}` : ''}</p>
      <div className="co-head">
        <div>
          <h1>{titleCase(client.name)}</h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {(client.services || []).map((sk) => {
              const s = SERVICES.find((x) => x.key === sk);
              return s ? <span key={sk} className="pill blue" style={{ marginRight: 0 }}>{s.label}</span> : null;
            })}
          </div>
          <div className="co-meta">
            {profileBits.length > 0 && profileBits.join('  ·  ')}
            {profileBits2.length > 0 && <><br />{profileBits2.join('  ·  ')}</>}
            {contactBits.length > 0 && <><br />{contactBits.join('  ·  ')}</>}
            {vendorBits.length > 0 && <><br />{vendorBits.join('  ·  ')}</>}
            {client.notes && <><br /><span style={{ color: 'var(--muted)', fontFamily: 'var(--sans)', fontStyle: 'italic' }}>{client.notes}</span></>}
          </div>
        </div>
        <button className="icon-btn" onClick={onEdit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          Edit
        </button>
      </div>

      {setupTotal > 0 && (setupComplete ? (
        <>
          <div className="section-title">Setup checklist</div>
          <div className="task-list"><div className="task done"><div className="task-main"><div className="task-label" style={{ textDecoration: 'none', color: 'var(--green)' }}>✓ All {setupTotal} setup steps complete</div></div></div></div>
        </>
      ) : (
        <>
          <div className="section-title">Setup checklist — one-time</div>
          <div className="setup-wrap">
            <div className="progress-row">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(setupDone / setupTotal * 100).toFixed(0)}%` }} /></div>
              <div className="progress-txt">{setupDone} / {setupTotal}</div>
            </div>
            <SetupChecklist client={client} setupStatus={state.setupStatus} onToggleDone={onToggleSetupDone} onToggleNA={onToggleSetupNA} />
          </div>
        </>
      ))}

      <div className="section-title">Needs attention {urgent.length > 0 && <span className="badge">{urgent.length}</span>}</div>
      {urgent.length === 0 ? (
        <div className="empty">Nothing due soon. <b>{titleCase(client.name)}</b> is caught up.</div>
      ) : (
        <div className="task-list">
          {urgent.map((r) => (
            <TaskRow key={r.item.key} client={client} item={r.item} due={r.due} status={r.status}
              onToggle={() => onToggleRecur(client, r.item)} onHide={() => onHide(client.id, r.item.key)} />
          ))}
        </div>
      )}

      {restCount > 0 && (
        <>
          <button className="toggle-link" onClick={() => setShowRest((s) => !s)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11" style={{ transform: showRest ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
            {showRest ? 'Hide' : 'Show'} upcoming &amp; completed ({restCount})
          </button>
          {showRest && (
            <div className="task-list">
              {[...doneRows, ...upcoming].map((r) => (
                <TaskRow key={r.item.key} client={client} item={r.item} due={r.due} status={r.status}
                  onToggle={() => onToggleRecur(client, r.item)} onHide={() => onHide(client.id, r.item.key)} />
              ))}
            </div>
          )}
        </>
      )}

      {hiddenItems.length > 0 && (
        <>
          <button className="toggle-link" style={{ marginTop: 2 }} onClick={() => setShowHidden((s) => !s)}>
            {hiddenItems.length} item{hiddenItems.length > 1 ? 's' : ''} hidden for this client — {showHidden ? 'hide' : 'show'}
          </button>
          {showHidden && (
            <div className="task-list">
              {hiddenItems.map((it) => (
                <div className="task" key={it.key}>
                  <div className="task-main"><div className="task-label" style={{ color: 'var(--muted)' }}>{it.label}</div></div>
                  <button className="task-hide" style={{ fontSize: 11.5, color: 'var(--navy)', fontWeight: 600 }} onClick={() => onUnhide(client.id, it.key)}>unhide</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="section-title">Other tasks</div>
      <div className="setup-wrap" style={{ marginBottom: 14 }}>
        <form onSubmit={submitTask} className="field-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ minWidth: 200, flex: '2 1 220px' }}>
            <label>Task</label>
            <input value={taskLabel} onChange={(e) => setTaskLabel(e.target.value)} placeholder="e.g. Notarize POA for property matter" />
          </div>
          <div className="field" style={{ minWidth: 140, flex: '0 0 150px' }}>
            <label>Due date</label>
            <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
          </div>
          <div className="field" style={{ flex: '0 0 auto' }}>
            <button className="btn btn-primary" type="submit">Add</button>
          </div>
        </form>
      </div>
      {sortedTasks.length === 0 ? (
        <div className="empty">No one-off tasks for {titleCase(client.name)} right now.</div>
      ) : (
        <div className="task-list">
          {sortedTasks.map((t) => (
            <CustomTaskRow key={t.id} task={t} onToggle={() => onToggleTask(client.id, t)} onDelete={() => onDeleteTask(client.id, t.id)} />
          ))}
        </div>
      )}
    </>
  );
}
