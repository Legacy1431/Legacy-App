'use client';
import { useState } from 'react';
import { dateOnlyStatus, fmtDate } from '@/lib/complianceLogic';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NO DATE'], ok: ['green', 'OK'],
};

function DatePill({ label, value }) {
  const status = dateOnlyStatus(value);
  const [cls, txt] = PILL_MAP[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className={`pill ${cls}`}>{txt}</span>
      <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{label}{value ? `: ${fmtDate(new Date(value + 'T00:00:00'))}` : ''}</span>
    </div>
  );
}

export default function DriversSection({ client, onUpdate }) {
  const drivers = client.driverRoster || [];
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', cdlExpires: '', medExpires: '', notes: '' });

  function startAdd() { setForm({ name: '', cdlExpires: '', medExpires: '', notes: '' }); setEditingId(null); setAdding(true); }
  function startEdit(d) { setForm({ name: d.name, cdlExpires: d.cdlExpires || '', medExpires: d.medExpires || '', notes: d.notes || '' }); setEditingId(d.id); setAdding(true); }
  function cancel() { setAdding(false); setEditingId(null); }

  function save() {
    if (!form.name.trim()) return;
    let next;
    if (editingId) {
      next = drivers.map((d) => d.id === editingId ? { ...d, ...form } : d);
    } else {
      next = [...drivers, { id: 'd' + Date.now(), ...form }];
    }
    onUpdate(next);
    setAdding(false); setEditingId(null);
  }
  function remove(id) {
    if (!confirm('Remove this driver?')) return;
    onUpdate(drivers.filter((d) => d.id !== id));
  }

  return (
    <>
      <div className="section-title">Drivers</div>
      {drivers.length === 0 && !adding && (
        <div className="empty">No drivers on file yet.</div>
      )}
      {drivers.length > 0 && (
        <div className="task-list" style={{ marginBottom: 10 }}>
          {drivers.map((d) => (
            <div className="task" key={d.id}>
              <div className="task-main">
                <div className="task-label">{d.name}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                  <DatePill label="CDL" value={d.cdlExpires} />
                  <DatePill label="Medical card" value={d.medExpires} />
                </div>
                {d.notes && <div className="task-due" style={{ marginTop: 3 }}>{d.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="task-hide" onClick={() => startEdit(d)}>edit</button>
                <button className="task-hide" onClick={() => remove(d.id)}>delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="setup-wrap" style={{ marginBottom: 14 }}>
          <div className="field-row">
            <div className="field"><label>Driver name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>CDL expires</label><input type="date" value={form.cdlExpires} onChange={(e) => setForm((f) => ({ ...f, cdlExpires: e.target.value }))} /></div>
            <div className="field"><label>Medical card expires</label><input type="date" value={form.medExpires} onChange={(e) => setForm((f) => ({ ...f, medExpires: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Notes</label><input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={save}>{editingId ? 'Save' : 'Add driver'}</button>
            <button className="btn btn-ghost" onClick={cancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="toggle-link" onClick={startAdd}>+ Add a driver</button>
      )}
    </>
  );
}
