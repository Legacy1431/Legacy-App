'use client';
import { useState, useEffect } from 'react';
import { SERVICES } from '@/lib/complianceLogic';

const BLANK = {
  name: '', type: 'Carrier - Interstate', entityType: '', usdot: '', mc: '', ein: '', ubi: '',
  ifta: '', oregon: '', formed: '', irp: '', ins: '', units: '', drivers: '',
  contact: '', phone: '', email: '', insCarrier: '', consortium: '', eld: '', notes: '',
  services: ['trucking'], exciseFrequency: 'quarterly',
};

export default function ClientModal({ client, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(BLANK);
  useEffect(() => { setForm(client ? { ...BLANK, ...client } : BLANK); }, [client]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function toggleService(key) {
    setForm((f) => {
      const has = f.services.includes(key);
      return { ...f, services: has ? f.services.filter((s) => s !== key) : [...f.services, key] };
    });
  }
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: client ? client.id : undefined });
  }

  return (
    <div className="overlay" onClick={(e) => { if (e.target.classList.contains('overlay')) onClose(); }}>
      <div className="modal">
        <h2>{client ? 'Edit company' : 'Add company'}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Company name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. ABC Trucking LLC" autoFocus />
          </div>
          <div className="field">
            <label>Client type <span style={{ fontWeight: 400, textTransform: 'none' }}>(only matters if Trucking Compliance is checked below)</span></label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="Carrier - Interstate">Carrier — Interstate</option>
              <option value="Carrier - Intrastate">Carrier — Intrastate (WA only)</option>
              <option value="Broker">Broker</option>
            </select>
          </div>
          <div className="field">
            <label>Services — what Legacy does for this client</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', padding: '10px 2px' }}>
              {SERVICES.map((s) => (
                <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.services.includes(s.key)} onChange={() => toggleService(s.key)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          {form.services.includes('excise') && (
            <div className="field">
              <label>WA DOR filing frequency</label>
              <select value={form.exciseFrequency} onChange={(e) => set('exciseFrequency', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          )}
          <details className="more">
            <summary>+ Add DOT / MC / EIN and other details (optional, can add later)</summary>
            <div className="field-row">
              <div className="field">
                <label>Entity type</label>
                <select value={form.entityType} onChange={(e) => set('entityType', e.target.value)}>
                  <option value="">—</option>
                  <option value="LLC">LLC</option>
                  <option value="S-Corp">S-Corp</option>
                  <option value="C-Corp">C-Corp</option>
                  <option value="Sole Prop">Sole Prop</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
              <div className="field"><label>UBI #</label><input value={form.ubi} onChange={(e) => set('ubi', e.target.value)} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>USDOT #</label><input value={form.usdot} onChange={(e) => set('usdot', e.target.value)} /></div>
              <div className="field"><label>MC #</label><input value={form.mc} onChange={(e) => set('mc', e.target.value)} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>EIN</label><input value={form.ein} onChange={(e) => set('ein', e.target.value)} /></div>
              <div className="field"><label>IFTA account #</label><input value={form.ifta} onChange={(e) => set('ifta', e.target.value)} /></div>
            </div>
            <div className="field"><label>Oregon permit #</label><input value={form.oregon} onChange={(e) => set('oregon', e.target.value)} /></div>
            <div className="field">
              <label>Formation date <span style={{ fontWeight: 400, textTransform: 'none' }}>(for WA annual report)</span></label>
              <input type="date" value={form.formed} onChange={(e) => set('formed', e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field"><label>IRP expiration</label><input type="date" value={form.irp} onChange={(e) => set('irp', e.target.value)} /></div>
              <div className="field"><label>Insurance / bond renewal</label><input type="date" value={form.ins} onChange={(e) => set('ins', e.target.value)} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Fleet — trucks</label><input value={form.units} onChange={(e) => set('units', e.target.value)} inputMode="numeric" /></div>
              <div className="field"><label>Fleet — drivers</label><input value={form.drivers} onChange={(e) => set('drivers', e.target.value)} inputMode="numeric" /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Contact name</label><input value={form.contact} onChange={(e) => set('contact', e.target.value)} /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            </div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div className="field-row">
              <div className="field"><label>Insurance carrier</label><input value={form.insCarrier} onChange={(e) => set('insCarrier', e.target.value)} /></div>
              <div className="field"><label>Drug consortium</label><input value={form.consortium} onChange={(e) => set('consortium', e.target.value)} /></div>
            </div>
            <div className="field"><label>ELD provider</label><input value={form.eld} onChange={(e) => set('eld', e.target.value)} /></div>
            <div className="field"><label>Notes</label><input value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
          </details>
          <div className="modal-actions">
            {client && <button type="button" className="btn-danger" onClick={() => onDelete(client.id)}>Remove company</button>}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
