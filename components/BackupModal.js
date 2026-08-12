'use client';
import { useState, useRef } from 'react';

export default function BackupModal({ state, onRestore, onClose }) {
  const [restoreText, setRestoreText] = useState('');
  const [copyStatus, setCopyStatus] = useState({ text: '', kind: '' });
  const [restoreStatus, setRestoreStatus] = useState({ text: '', kind: '' });
  const outRef = useRef(null);
  const json = JSON.stringify(state, null, 2);

  function copy() {
    const ta = outRef.current;
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const done = (ok) => setCopyStatus({ text: ok ? 'Copied.' : 'Couldn\u2019t copy automatically — text is selected, press Ctrl/Cmd+C.', kind: ok ? 'ok' : 'err' });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(() => done(true)).catch(() => { try { done(document.execCommand('copy')); } catch { done(false); } });
    } else {
      try { done(document.execCommand('copy')); } catch { done(false); }
    }
  }

  function restore() {
    const raw = restoreText.trim();
    if (!raw) { setRestoreStatus({ text: 'Paste a backup first.', kind: 'err' }); return; }
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { setRestoreStatus({ text: 'That doesn\u2019t look like valid backup text — nothing was changed.', kind: 'err' }); return; }
    if (!parsed || !Array.isArray(parsed.clients)) { setRestoreStatus({ text: 'That doesn\u2019t look like a tracker backup — nothing was changed.', kind: 'err' }); return; }
    if (!confirm('This replaces everything currently in the tracker with this backup. Continue?')) return;
    onRestore(parsed);
    setRestoreStatus({ text: 'Restored.', kind: 'ok' });
  }

  return (
    <div className="overlay" onClick={(e) => { if (e.target.classList.contains('overlay')) onClose(); }}>
      <div className="modal">
        <h2>Backup &amp; restore</h2>
        <p className="sub" style={{ marginBottom: 8 }}>
          This is everything in your tracker as plain text. Copy it somewhere safe every so often, especially before a big change.
        </p>
        <div className="field">
          <label>Your current data (copy this)</label>
          <textarea ref={outRef} readOnly value={json} style={{ width: '100%', minHeight: 130, fontFamily: 'var(--mono)', fontSize: 11.5, padding: 10, border: '1px solid var(--line)', borderRadius: 8, background: '#FBFAF7' }} />
          <button type="button" className="btn btn-primary" style={{ marginTop: 8 }} onClick={copy}>Copy to clipboard</button>
          <span className={`login-msg ${copyStatus.kind}`}>{copyStatus.text}</span>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <label>Restore from a saved backup</label>
          <textarea value={restoreText} onChange={(e) => setRestoreText(e.target.value)} placeholder="Paste previously-copied backup text here" style={{ width: '100%', minHeight: 130, fontFamily: 'var(--mono)', fontSize: 11.5, padding: 10, border: '1px solid var(--line)', borderRadius: 8, background: '#FBFAF7' }} />
          <button type="button" className="btn btn-primary" style={{ marginTop: 8, background: 'var(--red)' }} onClick={restore}>Restore this backup</button>
          <span className={`login-msg ${restoreStatus.kind}`}>{restoreStatus.text}</span>
        </div>
        <div className="modal-actions">
          <div style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
