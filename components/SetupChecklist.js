'use client';
import { SETUP_ITEMS, itemApplies } from '@/lib/complianceLogic';

export function computeSetupProgress(client, setupStatus) {
  const applicable = SETUP_ITEMS.filter((it) => itemApplies(it.applies, client));
  const st = setupStatus[client.id] || {};
  const done = applicable.filter((it) => { const s = st[it.key]; return s && (s.done || s.na); }).length;
  return { applicable, total: applicable.length, done };
}

export default function SetupChecklist({ client, setupStatus, onToggleDone, onToggleNA }) {
  const { applicable } = computeSetupProgress(client, setupStatus);
  const st = setupStatus[client.id] || {};
  return (
    <div className="setup-list">
      {applicable.map((it, idx) => {
        const s = st[it.key] || {};
        const rowCls = s.done ? 'done' : s.na ? 'na' : '';
        return (
          <div className={`setup-row ${rowCls}`} key={it.key}>
            <div className="setup-num">
              {s.done ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3"><polyline points="5 13 10 18 19 7" /></svg>
              ) : idx + 1}
            </div>
            <div className="setup-main">
              <div className="setup-label">{it.label}</div>
              <div className="setup-how">{it.how}</div>
            </div>
            <div className="setup-actions">
              <button className={`chk-sq ${s.done ? 'checked' : ''}`} onClick={() => onToggleDone(client.id, it.key)} aria-label={`Mark ${it.label} done`}>
                <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
              </button>
              <button className="na-btn" onClick={() => onToggleNA(client.id, it.key)}>{s.na ? 'Applies →' : 'N/A'}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
