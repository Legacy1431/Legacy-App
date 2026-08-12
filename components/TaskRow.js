'use client';
import { fmtDate, titleCase, FREQ_META, resolveFreq } from '@/lib/complianceLogic';

const PILL_MAP = {
  overdue: ['red', 'OVERDUE'], soon: ['amber', 'DUE SOON'], setdate: ['blue', 'NEEDS DATE'],
  done: ['green', 'DONE'], ok: ['green', 'OK'],
};

export default function TaskRow({ client, item, due, status, showCompany, onToggle, onHide }) {
  const [cls, label] = PILL_MAP[status];
  const dueTxt = due ? fmtDate(due) : (item.fieldLabel ? `add ${item.fieldLabel} on this client` : 'add a date');
  const checked = status === 'done';
  const freqLabel = item.freq && FREQ_META[resolveFreq(item, client)] ? FREQ_META[resolveFreq(item, client)].label : '';

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
        </div>
      </div>
      {onHide && (
        <button className="task-hide" onClick={onHide} title="Not applicable for this client">hide</button>
      )}
    </div>
  );
}
