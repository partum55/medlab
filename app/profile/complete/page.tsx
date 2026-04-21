'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { first_name, last_name, date_of_birth, gender, phone } = form;
    if (!first_name.trim() || !last_name.trim()) { setError('First and last name are required.'); return; }
    if (!date_of_birth) { setError('Date of birth is required.'); return; }
    if (!gender) { setError('Gender is required.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, date_of_birth, gender, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save.'); return; }
      router.push('/dashboard/patient');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-subtle)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '26rem',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '2.5rem 2rem',
        }}
      >
        <div className="page-header">
          <p className="field-label" style={{ marginBottom: '0.25rem' }}>One-time setup</p>
          <h1 className="page-title">Complete your profile</h1>
          <p className="page-subtitle">Required before accessing your records.</p>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>First name *</label>
              <input className="form-input" value={form.first_name} onChange={set('first_name')} placeholder="Jane" />
            </div>
            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Last name *</label>
              <input className="form-input" value={form.last_name} onChange={set('last_name')} placeholder="Smith" />
            </div>
          </div>

          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Date of birth *</label>
            <input type="date" className="form-input" value={form.date_of_birth} onChange={set('date_of_birth')} />
          </div>

          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Gender *</label>
            <select className="form-input" value={form.gender} onChange={set('gender')}>
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Phone</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
          </div>

          <div style={{ paddingTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Saving…' : 'Save and continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
