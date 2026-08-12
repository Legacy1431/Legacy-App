'use client';
import { useState, useMemo } from 'react';
import {
  RECURRING_ITEMS, itemApplies, statusOf, isoKey, customTaskStatus, dateOnlyStatus,
  titleCase, fmtDate, today0,
} from '@/lib/complianceLogic';

const STATUS_COLOR = { overdue: 'var(--red)', soon: 'var(--amber)', done: 'var(--green)', ok: 'var(--navy)', setdate: 'var(--muted)' };
const STATUS_BG = { overdue: 'var(--red-bg)', soon: 'var(--amber-bg)', done: 'var(--green-bg)', ok: 'var(--blue-bg)', setdate: '#F0EDE3' };

function buildEventMap(state) {
  const map = {};
  function add(dateStr, ev) {
    if (!dateStr) return;
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(ev);
  }
  state.clients.forEach((c) => {
    const rs = state.recurStatus[c.id] || {};
    const hiddenSet = new Set(state.hidden[c.id] || []);
    RECURRING_ITEMS.forEach((it) => {
      if (!itemApplies(it.applies, c) || hiddenSet.has(it.key)) return;
      const due = it.due(c);
      if (!due) return;
      const r = rs[it.key];
      const key = isoKey(due);
      const status = statusOf(due, r && r.doneKey, key);
      add(key, { kind: 'recur', client: c, item: it, status, label: it.label });
    });
    (state.customTasks[c.id] || []).forEach((t) => {
      if (!t.due) return;
      const status = customTaskStatus(t);
      add(t.due, { kind: 'custom', client: c, task: t, status, label: t.label });
    });
    (c.driverRoster || []).forEach((d) => {
      if (d.cdlExpires) add(d.cdlExpires, { kind: 'driver', client: c, driver: d, status: dateOnlyStatus(d.cdlExpires), label: `${d.name} — CDL expires` });
      if (d.medExpires) add(d.medExpires, { kind: 'driver', client: c, driver: d, status: dateOnlyStatus(d.medExpires), label: `${d.name} — Medical card` });
    });
  });
  return map;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage({ state, onToggleRecur, onToggleTask, goToClient }) {
  const t = today0();
  const [viewYear, setViewYear] = useState(t.getFullYear());
  const [viewMonth, setViewMonth] = useState(t.getMonth());
  const [selectedKey, setSelectedKey] = useState(isoKey(t));

  const eventMap = useMemo(() => buildEventMap(state), [state]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const start = new Date(viewYear, viewMonth, 1 - startWeekday);
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      arr.push({ date: d, key: isoKey(d), inMonth: d.getMonth() === viewMonth });
    }
    return arr;
  }, [viewYear, viewMonth]);

  function go(deltaMonths) {
    let m = viewMonth + deltaMonths, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }
  function goToday() { setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); setSelectedKey(isoKey(t)); }

  const selectedEvents = (eventMap[selectedKey] || []).slice().sort((a, b) => {
    const rank = { overdue: 0, soon: 1, ok: 2, setdate: 3, done: 4 };
    return rank[a.status] - rank[b.status];
  });
  const selectedDate = new Date(selectedKey + 'T00:00:00');

  return (
    <>
      <p className="eyebrow">Legacy Business Services</p>
      <h1>Calendar</h1>
      <p className="sub">Everything with a due date — trucking, bookkeeping, payroll, excise, driver CDL &amp; medical cards, and your own custom tasks — laid out by day.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 16, minWidth: 160, textAlign: 'center' }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
        <button className="icon-btn" onClick={() => go(1)} aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button className="icon-btn" onClick={goToday}>Today</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', letterSpacing: '.04em' }}>{w}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 24 }}>
        {cells.map((cell) => {
          const evs = eventMap[cell.key] || [];
          const isToday = cell.key === isoKey(t);
          const isSelected = cell.key === selectedKey;
          const shown = evs.slice(0, 3);
          const overflow = evs.length - shown.length;
          return (
            <button key={cell.key} onClick={() => setSelectedKey(cell.key)}
              style={{
                textAlign: 'left', minHeight: 78, borderRadius: 9, padding: '6px 6px 5px',
                border: isSelected ? '2px solid var(--navy)' : '1px solid var(--line)',
                background: cell.inMonth ? '#fff' : '#FAF8F3', opacity: cell.inMonth ? 1 : 0.55,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3,
              }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: isToday ? 800 : 600,
                color: isToday ? '#fff' : 'var(--ink)',
                background: isToday ? 'var(--navy)' : 'transparent',
                borderRadius: 20, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cell.date.getDate()}</span>
              {shown.map((ev, i) => (
                <div key={i} style={{
                  fontSize: 10, padding: '1.5px 5px', borderRadius: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  background: STATUS_BG[ev.status], color: STATUS_COLOR[ev.status], fontWeight: 600,
                }}>{ev.label}</div>
              ))}
              {overflow > 0 && <div style={{ fontSize: 10, color: 'var(--muted)' }}>+{overflow} more</div>}
            </button>
          );
        })}
      </div>

      <div className="section-title">{fmtDate(selectedDate)}{selectedKey === isoKey(t) ? ' — Today' : ''}</div>
      {selectedEvents.length === 0 ? (
        <div className="empty">Nothing due this day.</div>
      ) : (
        <div className="task-list">
          {selectedEvents.map((ev, i) => (
            <div className="task" key={i}>
              <div className="task-main">
                <div className="task-co" style={{ cursor: 'pointer' }} onClick={() => goToClient(ev.client.id)}>{titleCase(ev.client.name)}</div>
                <div className="task-label">
                  <span className="pill" style={{ background: STATUS_BG[ev.status], color: STATUS_COLOR[ev.status] }}>
                    {ev.status === 'overdue' ? 'OVERDUE' : ev.status === 'soon' ? 'DUE SOON' : ev.status === 'done' ? 'DONE' : 'OK'}
                  </span>
                  {ev.label}
                </div>
              </div>
              {ev.kind === 'recur' && (
                <button className={`chk ${ev.status === 'done' ? 'checked' : ''}`} onClick={() => onToggleRecur(ev.client, ev.item)} aria-label="Toggle done">
                  <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
                </button>
              )}
              {ev.kind === 'custom' && (
                <button className={`chk ${ev.status === 'done' ? 'checked' : ''}`} onClick={() => onToggleTask(ev.client.id, ev.task)} aria-label="Toggle done">
                  <svg viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></svg>
                </button>
              )}
              {ev.kind === 'driver' && (
                <button className="icon-btn" onClick={() => goToClient(ev.client.id)}>Open client</button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
