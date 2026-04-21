'use client';

import { useState, useEffect } from 'react';

interface OrderOption {
  order_id: number;
  patient_name: string;
  test_name: string;
  order_date: string;
  status: string;
  priority: string;
}

export default function CancelOrderPage() {
  const [orders, setOrders]     = useState<OrderOption[]>([]);
  const [ddLoading, setDdLoading] = useState(true);
  const [ddError, setDdError]   = useState<string | null>(null);

  const [orderId, setOrderId]   = useState('');
  const [reason, setReason]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState<any>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dropdown/orders')
      .then(r => r.json())
      .then(data => { if (data.error) setDdError(data.error); else setOrders(data); })
      .catch(() => setDdError('Failed to load orders'))
      .finally(() => setDdLoading(false));
  }, []);

  const selected = orders.find(o => String(o.order_id) === orderId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) { setError('Select an order.'); return; }
    if (!reason.trim()) { setError('Cancellation reason is required.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason: reason }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Unknown error'); return; }
      setSuccess(data);
      setOrders(prev => prev.filter(o => String(o.order_id) !== orderId));
      setOrderId('');
      setReason('');
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
        <h1 className="page-title">Cancel Test Order</h1>
        <p className="page-subtitle">Set status to CANCELLED and record reason</p>
      </div>

      {success && (
        <div className="alert-warning" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Order #{success.order_id} cancelled</p>
          <p style={{ fontSize: '0.8125rem' }}>Reason: {success.cancellation_reason}</p>
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
            <select
              className="form-input"
              value={orderId}
              onChange={e => { setOrderId(e.target.value); setError(null); setSuccess(null); }}
            >
              <option value="">Select order…</option>
              {orders.map(o => (
                <option key={o.order_id} value={o.order_id}>
                  #{o.order_id} · {o.patient_name} · {o.test_name} · {o.status}
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
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
            }}
          >
            <div>
              <p className="field-label" style={{ marginBottom: '0.125rem' }}>Status</p>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>{selected.status}</p>
            </div>
            <div>
              <p className="field-label" style={{ marginBottom: '0.125rem' }}>Priority</p>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>{selected.priority}</p>
            </div>
            <div>
              <p className="field-label" style={{ marginBottom: '0.125rem' }}>Date</p>
              <p className="mono" style={{ color: 'var(--text-muted)' }}>{String(selected.order_date).slice(0, 10)}</p>
            </div>
          </div>
        )}

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Cancellation Reason *</label>
          <textarea
            className="form-input"
            rows={3}
            value={reason}
            onChange={e => { setReason(e.target.value); setError(null); }}
            placeholder="Document the clinical reason for cancellation…"
          />
        </div>

        <div style={{ paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="field-label">{orders.length} cancellable order{orders.length !== 1 ? 's' : ''}</span>
          <button type="submit" className="btn-danger" disabled={loading || ddLoading || !orderId}>
            {loading && <span className="spinner" />}
            {loading ? 'Cancelling…' : 'Cancel Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
