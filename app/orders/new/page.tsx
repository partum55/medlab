'use client';

import { useState, useEffect } from 'react';

interface Patient   { patient_id: number; first_name: string; last_name: string; }
interface TestDef   { test_def_id: number; test_name: string; test_code: string; category: string; }

const today = () => new Date().toISOString().slice(0, 10);
const INIT   = { patient_id: '', test_def_id: '', order_date: today(), priority: '', notes: '' };

export default function NewOrderPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests]       = useState<TestDef[]>([]);
  const [ddLoading, setDdLoading] = useState(true);
  const [ddError, setDdError]   = useState<string | null>(null);

  const [form, setForm]     = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dropdown/patients').then(r => r.json()),
      fetch('/api/dropdown/tests').then(r => r.json()),
    ])
      .then(([p, t]) => { setPatients(p.error ? [] : p); setTests(t.error ? [] : t); })
      .catch(() => setDdError('Failed to load dropdown data'))
      .finally(() => setDdLoading(false));
  }, []);

  function set(field: keyof typeof INIT) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
      setSuccess(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patient_id) { setError('Select a patient.'); return; }
    if (!form.test_def_id) { setError('Select a test.'); return; }
    if (!form.priority) { setError('Select a priority.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patient_id: Number(form.patient_id),
          test_def_id: Number(form.test_def_id),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Unknown error'); return; }
      setSuccess(data);
      setForm({ ...INIT, order_date: today() });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '30rem' }}>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>Ordering Physician</p>
        <h1 className="page-title">Create Test Order</h1>
        <p className="page-subtitle">Insert a new row into test_order</p>
      </div>

      {success && (
        <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Order #{success.order_id} created</p>
          {success.order && (
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {success.order.test_name} · {success.order.priority} · {success.order.status}
            </p>
          )}
        </div>
      )}
      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
      {ddError && <div className="alert-warning" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>{ddError}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ddLoading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="spinner" /> Loading…
          </div>
        ) : (
          <>
            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Patient *</label>
              <select className="form-input" value={form.patient_id} onChange={set('patient_id')}>
                <option value="">Select patient…</option>
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    [{p.patient_id}] {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Test *</label>
              <select className="form-input" value={form.test_def_id} onChange={set('test_def_id')}>
                <option value="">Select test…</option>
                {tests.map(t => (
                  <option key={t.test_def_id} value={t.test_def_id}>
                    [{t.test_code}] {t.test_name} — {t.category}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Order Date *</label>
            <input type="date" className="form-input" value={form.order_date} onChange={set('order_date')} />
          </div>
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Priority *</label>
            <select className="form-input" value={form.priority} onChange={set('priority')}>
              <option value="">Select…</option>
              <option value="ROUTINE">ROUTINE</option>
              <option value="URGENT">URGENT</option>
              <option value="STAT">STAT</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Notes</label>
          <textarea
            className="form-input"
            rows={3}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Optional clinical notes…"
          />
        </div>

        <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={loading || ddLoading}>
            {loading && <span className="spinner" />}
            {loading ? 'Creating…' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
