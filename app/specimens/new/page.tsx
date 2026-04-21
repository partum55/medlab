'use client';

import { useState, useEffect } from 'react';

interface OrderOption {
  order_id: number;
  patient_name: string;
  test_name: string;
  status: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const INIT = { order_id: '', specimen_type: '', collection_date: today(), barcode: '', storage_temp: '' };

const SPECIMEN_TYPES = ['Blood', 'Urine', 'Saliva', 'Tissue', 'CSF', 'Stool', 'Swab', 'Other'];

export default function NewSpecimenPage() {
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [ddLoading, setDdLoading] = useState(true);
  const [ddError, setDdError]   = useState<string | null>(null);

  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dropdown/orders')
      .then(r => r.json())
      .then(data => { if (data.error) setDdError(data.error); else setOrders(data); })
      .catch(() => setDdError('Failed to load orders'))
      .finally(() => setDdLoading(false));
  }, []);

  function set(field: keyof typeof INIT) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
      setSuccess(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.order_id) { setError('Select an order.'); return; }
    if (!form.specimen_type) { setError('Select specimen type.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/specimens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: Number(form.order_id),
          specimen_type: form.specimen_type,
          collection_date: form.collection_date || null,
          barcode: form.barcode.trim() || null,
          storage_temp: form.storage_temp ? Number(form.storage_temp) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Unknown error'); return; }
      setSuccess(data);
      setForm({ ...INIT, collection_date: today() });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '30rem' }}>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>Lab Technician</p>
        <h1 className="page-title">Register Specimen</h1>
        <p className="page-subtitle">Insert a new row into specimen</p>
      </div>

      {success && (
        <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 600 }}>Specimen #{success.specimen_id} registered</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            {success.specimen_type} · Status: {success.status}
          </p>
        </div>
      )}
      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
      {ddError && <div className="alert-warning" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>{ddError}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Test Order *</label>
          {ddLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="spinner" /> Loading…
            </div>
          ) : (
            <select className="form-input" value={form.order_id} onChange={set('order_id')}>
              <option value="">Select order…</option>
              {orders.map(o => (
                <option key={o.order_id} value={o.order_id}>
                  #{o.order_id} · {o.patient_name} · {o.test_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Specimen Type *</label>
          <select className="form-input" value={form.specimen_type} onChange={set('specimen_type')}>
            <option value="">Select type…</option>
            {SPECIMEN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Collection Date</label>
            <input type="date" className="form-input" value={form.collection_date} onChange={set('collection_date')} />
          </div>
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Storage Temp (°C)</label>
            <input type="number" className="form-input" value={form.storage_temp} onChange={set('storage_temp')} placeholder="e.g. 4" step="0.1" />
          </div>
        </div>

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Barcode</label>
          <input className="form-input" value={form.barcode} onChange={set('barcode')} placeholder="Optional barcode…" />
        </div>

        <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={loading || ddLoading}>
            {loading && <span className="spinner" />}
            {loading ? 'Registering…' : 'Register Specimen'}
          </button>
        </div>
      </form>
    </div>
  );
}
