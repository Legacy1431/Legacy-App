'use client';
import { useState } from 'react';
import { fmtDate, titleCase, FREQ_META, resolveFreq } from '@/lib/complianceLogic';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NEEDS DATE'],
  done: ['green', 'DONE'], ok: ['green', 'OK'],
};

export default function TaskRow({ client, item, due, status, showCompany, onToggle, onHide, completion, onSetExpiry }) {
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryVal, setExpiryVal] = useState(completion?.expiresOn || '');
  const [cls, label] = PILL_MAP[status];
  const dueTxt = due ? fmtDate(due) : (item.fieldLabel ? `add ${item.fieldLabel} on this client` : 'add a date');
  const checked = status === 'done';
  const freqLabel = item.freq && FREQ_META[resolveFreq(item, client)] ? FREQ_META[resolveFreq(item, client)].label : '';
  const showExpiry = checked && !!onSetExpiry;

  function saveExpiry() {
    onSetExpiry(expiryVal);
    setEditingExpiry(false);
  }

  return (
    <div className={`task ${checked ? 'done' : ''}`}>
      <button className={`chk ${checked ? 'checked' : ''}`} onClick={onToggle} aria-label={`Mark ${item.label} done`}>
        <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
      </button>
      <div className="task-main">
        {showCompany && <div className="task-co">{titleCase(client.name)}</div>}
        <div className="task-label">
          <span className={`pill ${cls}`}>{label}</span>
          {item.label}
          {item.cadence && <span className="freq-tag">{item.cadence}</span>}
        </div>
        <div className="task-due">
          {status === 'setdate' ? dueTxt : `Due ${dueTxt}`}
          {freqLabel && !showCompany ? ` · ${freqLabel}` : ''}
          {checked && completion?.date ? ` · Filed ${fmtDate(new Date(completion.date + 'T00:00:00'))}` : ''}
        </div>
        {showExpiry && (
          editingExpiry ? (
            <div style={{ marginTop: 5, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="date" value={expiryVal} onChange={(e) => setExpiryVal(e.target.value)}
                style={{ fontSize: 12, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 6 }} />
              <button className="na-btn" onClick={saveExpiry}>Save</button>
              <button className="na-btn" onClick={() => setEditingExpiry(false)}>Cancel</button>
            </div>
          ) : (
            <button className="task-hide" style={{ marginTop: 3, padding: 0, fontSize: 11.5, color: completion?.expiresOn ? 'var(--navy)' : '#B9B4A4' }}
              onClick={() => setEditingExpiry(true)}>
              {completion?.expiresOn ? `Expires ${fmtDate(new Date(completion.expiresOn + 'T00:00:00'))} — edit` : '+ set expiration date'}
            </button>
          )
        )}
      </div>
      {onHide && (
        <button className="task-hide" onClick={onHide} title="Not applicable for this client">hide</button>
      )}
    </div>
  );
}
