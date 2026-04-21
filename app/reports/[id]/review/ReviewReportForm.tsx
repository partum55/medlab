'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Report {
  report_id: number;
  overall_status: string | null;
  report_date: string | null;
  comments: string | null;
  is_amended: boolean;
  amendment_note: string | null;
  reviewed_by: number | null;
  specimen_id: number;
  specimen_type: string;
  patient_name: string;
  test_name: string;
  test_code: string;
}

interface ResultItem {
  item_seq_no: number;
  measured_value: string | null;
  text_result: string | null;
  flag: string | null;
  test_name: string;
  test_code: string;
  normal_range: string | null;
  unit: string | null;
}

const STATUSES = ['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'];

export default function ReviewReportForm({
  report,
  resultItems,
}: {
  report: Report;
  resultItems: ResultItem[];
}) {
  const router = useRouter();
  const [status, setStatus]       = useState(report.overall_status ?? '');
  const [comments, setComments]   = useState(report.comments ?? '');
  const [isAmended, setIsAmended] = useState(report.is_amended ?? false);
  const [amendment, setAmendment] = useState(report.amendment_note ?? '');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) { setError('Select an overall status.'); return; }
    if (isAmended && !amendment.trim()) { setError('Amendment note is required when marking as amended.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${report.report_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall_status: status,
          comments: comments.trim() || null,
          is_amended: isAmended,
          amendment_note: isAmended ? amendment.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Unknown error'); return; }
      setSuccess(true);
      setTimeout(() => router.push('/reports'), 1500);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  function flagStyle(flag: string | null) {
    if (!flag) return {};
    if (flag === 'H' || flag === 'HH') return { color: '#dc2626', fontWeight: 600 };
    if (flag === 'L' || flag === 'LL') return { color: '#1d4ed8', fontWeight: 600 };
    if (flag === 'A' || flag === 'C')  return { color: '#d97706', fontWeight: 600 };
    return {};
  }

  return (
    <div style={{ maxWidth: '48rem' }}>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>Pathologist · Review</p>
        <h1 className="page-title">Lab Report #{report.report_id}</h1>
        <p className="page-subtitle">
          {report.patient_name} · {report.test_name} ({report.test_code}) ·
          Specimen #{report.specimen_id}
        </p>
      </div>

      {/* Result Items */}
      {resultItems.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
            Result Items
          </h2>
          <div className="panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test</th>
                  <th>Measured Value</th>
                  <th>Normal Range</th>
                  <th>Unit</th>
                  <th>Flag</th>
                  <th>Text Result</th>
                </tr>
              </thead>
              <tbody>
                {resultItems.map(item => (
                  <tr key={item.item_seq_no}>
                    <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{item.item_seq_no}</td>
                    <td style={{ fontSize: '0.875rem' }}>{item.test_name}</td>
                    <td className="mono" style={{ fontSize: '0.875rem', ...flagStyle(item.flag) }}>
                      {item.measured_value ?? '—'}
                    </td>
                    <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.normal_range ?? '—'}</td>
                    <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.unit ?? '—'}</td>
                    <td>
                      {item.flag ? (
                        <span className="mono" style={{ fontSize: '0.875rem', ...flagStyle(item.flag) }}>{item.flag}</span>
                      ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.text_result ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {success && (
        <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
          Report updated. Redirecting…
        </div>
      )}
      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Overall Status *</label>
          <select
            className="form-input"
            value={status}
            onChange={e => { setStatus(e.target.value); setError(null); }}
          >
            <option value="">Select status…</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Comments</label>
          <textarea
            className="form-input"
            rows={3}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Clinical comments or interpretation notes…"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <input
            type="checkbox"
            id="amended"
            checked={isAmended}
            onChange={e => setIsAmended(e.target.checked)}
            style={{ marginTop: '0.125rem', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <label
            htmlFor="amended"
            className="field-label"
            style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.875rem', letterSpacing: 0 }}
          >
            Mark as amended report
          </label>
        </div>

        {isAmended && (
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Amendment Note *</label>
            <textarea
              className="form-input"
              rows={3}
              value={amendment}
              onChange={e => { setAmendment(e.target.value); setError(null); }}
              placeholder="Describe what was amended and why…"
            />
          </div>
        )}

        <div style={{ paddingTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Link href="/reports" className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : 'Save Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
