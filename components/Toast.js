'use client';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', zIndex: 100,
      background: 'var(--navy-deep)', color: '#fff', borderRadius: 10, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 8px 24px rgba(0,0,0,.25)',
      fontSize: 13.5, maxWidth: '90vw',
    }}>
      <span>{toast.message}</span>
      {toast.onUndo && (
        <button onClick={() => { toast.onUndo(); onDismiss(); }}
          style={{ background: 'none', border: 'none', color: '#8FB3E8', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', padding: 0 }}>
          Undo
        </button>
      )}
      <button onClick={onDismiss} aria-label="Dismiss"
        style={{ background: 'none', border: 'none', color: '#8091AE', fontSize: 15, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
        ×
      </button>
    </div>
  );
}
