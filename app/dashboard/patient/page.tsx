import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ORDERED: 'badge-ordered', IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] ?? 'badge-pending'}`}>{status}</span>;
}

function priorityBadge(p: string) {
  const map: Record<string, string> = {
    ROUTINE: 'badge-routine', URGENT: 'badge-urgent', STAT: 'badge-stat',
  };
  return <span className={`badge ${map[p] ?? 'badge-pending'}`}>{p}</span>;
}

export default async function PatientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const patients = await sql`
    SELECT patient_id, first_name, last_name, profile_complete
    FROM patient WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (!patients.length) redirect('/');
  const patient = patients[0];
  if (!patient.profile_complete) redirect('/profile/complete');

  const orders = await sql`
    SELECT o.order_id, td.test_name, td.test_code, o.order_date, o.priority, o.status,
           ms.first_name || ' ' || ms.last_name AS physician
    FROM test_order o
    JOIN test_definition td ON td.test_def_id = o.test_def_id
    JOIN medical_staff ms ON ms.staff_id = o.staff_id
    WHERE o.patient_id = ${patient.patient_id}
    ORDER BY o.order_id DESC
    LIMIT 50
  `;

  const specimens = await sql`
    SELECT s.specimen_id, s.specimen_type, s.status, s.collection_date, s.barcode,
           o.order_id
    FROM specimen s
    JOIN test_order o ON o.order_id = s.order_id
    WHERE o.patient_id = ${patient.patient_id}
    ORDER BY s.specimen_id DESC
    LIMIT 50
  `;

  const reports = await sql`
    SELECT r.report_id, r.overall_status, r.report_date, r.comments,
           ms.first_name || ' ' || ms.last_name AS reviewer,
           s.specimen_id
    FROM lab_report r
    JOIN specimen s ON s.specimen_id = r.specimen_id
    JOIN test_order o ON o.order_id = s.order_id
    LEFT JOIN medical_staff ms ON ms.staff_id = r.reviewed_by
    WHERE o.patient_id = ${patient.patient_id}
    ORDER BY r.report_id DESC
    LIMIT 50
  `;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="field-label" style={{ marginBottom: '0.25rem' }}>Patient</p>
          <h1 className="page-title">{patient.first_name} {patient.last_name}</h1>
          <p className="page-subtitle">Your diagnostic records</p>
        </div>
      </div>

      {/* Test Orders */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.875rem', color: 'var(--text)' }}>
          Test Orders
        </h2>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Test</th>
                <th>Physician</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No orders found.</td></tr>
              ) : orders.map((o: any) => (
                <tr key={o.order_id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{o.order_id}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{o.test_name}</span>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{o.test_code}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dr. {o.physician}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{String(o.order_date).slice(0, 10)}</td>
                  <td>{priorityBadge(o.priority)}</td>
                  <td>{statusBadge(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Specimens */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.875rem', color: 'var(--text)' }}>
          Specimens
        </h2>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Specimen ID</th>
                <th>Order</th>
                <th>Type</th>
                <th>Barcode</th>
                <th>Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {specimens.length === 0 ? (
                <tr><td colSpan={6} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No specimens found.</td></tr>
              ) : specimens.map((s: any) => (
                <tr key={s.specimen_id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{s.specimen_id}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>#{s.order_id}</td>
                  <td style={{ fontWeight: 500 }}>{s.specimen_type}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.barcode ?? '—'}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.collection_date ? String(s.collection_date).slice(0, 10) : '—'}</td>
                  <td>{statusBadge(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lab Reports */}
      <section>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.875rem', color: 'var(--text)' }}>
          Lab Reports
        </h2>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Specimen</th>
                <th>Date</th>
                <th>Reviewed By</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={6} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reports available.</td></tr>
              ) : reports.map((r: any) => (
                <tr key={r.report_id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{r.report_id}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>#{r.specimen_id}</td>
                  <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{r.report_date ? String(r.report_date).slice(0, 10) : '—'}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{r.reviewer ? `Dr. ${r.reviewer}` : '—'}</td>
                  <td>
                    <span className={`badge ${r.overall_status === 'NORMAL' ? 'badge-normal' : r.overall_status === 'ABNORMAL' ? 'badge-abnormal' : r.overall_status === 'CRITICAL' ? 'badge-critical' : 'badge-pending'}`}>
                      {r.overall_status ?? 'PENDING'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '16rem' }}>{r.comments ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
