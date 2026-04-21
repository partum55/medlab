'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUSES = ['PENDING', 'COLLECTED', 'IN_ANALYSIS', 'COMPLETED', 'REJECTED'];

interface Specimen {
  specimen_id: number;
  order_id: number;
  specimen_type: string;
  status: string;
  collection_date: string | null;
  barcode: string | null;
  storage_temp: number | null;
  rejection_reason: string | null;
  patient_name: string;
  test_name: string;
}

export default function EditSpecimenForm({ specimen }: { specimen: Specimen }) {
  const router = useRouter();
  const [status, setStatus]       = useState(specimen.status);
  const [rejection, setRejection] = useState(specimen.rejection_reason ?? '');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'REJECTED' && !rejection.trim()) {
      setError('Rejection reason is required when status is REJECTED.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/specimens/${specimen.specimen_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rejection_reason: status === 'REJECTED' ? rejection.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Unknown error'); return; }
      setSuccess(true);
      setTimeout(() => router.push('/specimens'), 1200);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete specimen #${specimen.specimen_id}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/specimens/${specimen.specimen_id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Delete failed'); return; }
      router.push('/specimens');
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
        <h1 className="page-title">Edit Specimen #{specimen.specimen_id}</h1>
        <p className="page-subtitle">{specimen.patient_name} · {specimen.test_name}</p>
      </div>

      {success && (
        <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
          Specimen updated. Redirecting…
        </div>
      )}
      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          padding: '0.75rem 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <p className="field-label" style={{ marginBottom: '0.125rem' }}>Type</p>
          <p style={{ fontWeight: 500, color: 'var(--text)' }}>{specimen.specimen_type}</p>
        </div>
        <div>
          <p className="field-label" style={{ marginBottom: '0.125rem' }}>Barcode</p>
          <p className="mono" style={{ color: 'var(--text-muted)' }}>{specimen.barcode ?? '—'}</p>
        </div>
        <div>
          <p className="field-label" style={{ marginBottom: '0.125rem' }}>Storage</p>
          <p className="mono" style={{ color: 'var(--text-muted)' }}>
            {specimen.storage_temp != null ? `${specimen.storage_temp}°C` : '—'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Status *</label>
          <select
            className="form-input"
            value={status}
            onChange={e => { setStatus(e.target.value); setError(null); }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {status === 'REJECTED' && (
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Rejection Reason *</label>
            <textarea
              className="form-input"
              rows={3}
              value={rejection}
              onChange={e => { setRejection(e.target.value); setError(null); }}
              placeholder="Document why the specimen was rejected…"
            />
          </div>
        )}

        <div style={{ paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading}>
            Delete
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/specimens" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
