'use client';
import { useState } from 'react';
import { customTaskStatus, fmtDate, titleCase } from '@/lib/complianceLogic';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NO DATE'], done: ['green', 'DONE'], ok: ['green', 'OK'],
};

function Row({ client, task, onToggle, onDelete }) {
  const status = customTaskStatus(task);
  const [cls, label] = PILL_MAP[status];
  const checked = status === 'done';
  return (
    <div className={`task ${checked ? 'done' : ''}`}>
      <button className={`chk ${checked ? 'checked' : ''}`} onClick={onToggle} aria-label={`Mark ${task.label} done`}>
        <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
      </button>
      <div className="task-main">
        <div className="task-co">{titleCase(client.name)}</div>
        <div className="task-label"><span className={`pill ${cls}`}>{label}</span>{task.label}</div>
        <div className="task-due">{task.due ? `Due ${fmtDate(new Date(task.due + 'T00:00:00'))}` : 'No date set'}{task.notes ? ` · ${task.notes}` : ''}</div>
      </div>
      <button className="task-hide" onClick={onDelete} title="Delete this task">delete</button>
    </div>
  );
}

export default function OtherTasksPage({ state, onAdd, onToggle, onDelete }) {
  const [clientId, setClientId] = useState(state.clients[0]?.id || '');
  const [label, setLabel] = useState('');
  const [due, setDue] = useState('');

  let all = [];
  state.clients.forEach((c) => {
    (state.customTasks[c.id] || []).forEach((t) => all.push({ client: c, task: t }));
  });
  const rank = { overdue: 0, setdate: 1, soon: 2, ok: 3, done: 4 };
  all.sort((a, b) => rank[customTaskStatus(a.task)] - rank[customTaskStatus(b.task)]);
  const urgent = all.filter((x) => ['overdue', 'soon', 'setdate'].includes(customTaskStatus(x.task)));
  const rest = all.filter((x) => !['overdue', 'soon', 'setdate'].includes(customTaskStatus(x.task)));

  function submit(e) {
    e.preventDefault();
    if (!clientId || !label.trim()) return;
    onAdd(clientId, { label: label.trim(), due, notes: '' });
    setLabel(''); setDue('');
  }

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>Other Tasks</h1>
      <p className="sub">One-off work that doesn&rsquo;t fit a template — notices, special filings, anything you just need to not forget. Assign it to a client and it shows up here and on their page.</p>

      <div className="setup-wrap" style={{ marginBottom: 24 }}>
        <form onSubmit={submit} className="field-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ minWidth: 160, flex: '1 1 160px' }}>
            <label>Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {state.clients.map((c) => <option key={c.id} value={c.id}>{titleCase(c.name)}</option>)}
            </select>
          </div>
          <div className="field" style={{ minWidth: 200, flex: '2 1 220px' }}>
            <label>Task</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Respond to DOR notice" />
          </div>
          <div className="field" style={{ minWidth: 140, flex: '0 0 150px' }}>
            <label>Due date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="field" style={{ flex: '0 0 auto' }}>
            <button className="btn btn-primary" type="submit">Add task</button>
          </div>
        </form>
      </div>

      {all.length === 0 ? (
        <div className="empty">No custom tasks yet. Add one above for any client.</div>
      ) : (
        <>
          {urgent.length > 0 && (
            <>
              <div className="section-title">Needs attention <span className="badge">{urgent.length}</span></div>
              <div className="task-list">
                {urgent.map((x) => (
                  <Row key={x.task.id} client={x.client} task={x.task} onToggle={() => onToggle(x.client.id, x.task)} onDelete={() => onDelete(x.client.id, x.task.id)} />
                ))}
              </div>
            </>
          )}
          {rest.length > 0 && (
            <>
              <div className="section-title">Everything else</div>
              <div className="task-list">
                {rest.map((x) => (
                  <Row key={x.task.id} client={x.client} task={x.task} onToggle={() => onToggle(x.client.id, x.task)} onDelete={() => onDelete(x.client.id, x.task.id)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
