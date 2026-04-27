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
    <div className="bg-grid-dots min-h-[calc(100vh-8rem)]" style={{ paddingBottom: '4rem' }}>
      <header className="page-header animate-entry" style={{ borderBottom: 'none', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="mono" style={{ fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(29, 78, 216, 0.08)', padding: '0.25rem 0.625rem', borderRadius: '2px' }}>
            Patient ID #{patient.patient_id}
          </span>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
        </div>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700 }}>
          {patient.first_name} {patient.last_name}
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
          Your clinical history and diagnostic results.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))', gap: '2rem' }}>
        
        {/* Lab Reports — High priority for patients */}
        <section className="animate-entry" style={{ animationDelay: '100ms', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Latest Reports
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          
          {reports.length === 0 ? (
            <div className="panel" style={{ padding: '3rem', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>NO DIAGNOSTIC REPORTS ISSUED YET.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: '1rem' }}>
              {reports.map((r: any, i: number) => (
                <div key={r.report_id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `3px solid ${r.overall_status === 'NORMAL' ? 'var(--success)' : r.overall_status === 'ABNORMAL' ? 'var(--warning)' : r.overall_status === 'CRITICAL' ? 'var(--error)' : 'var(--text-faint)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>REPORT #{r.report_id}</span>
                    <span className={`badge ${r.overall_status === 'NORMAL' ? 'badge-normal' : r.overall_status === 'ABNORMAL' ? 'badge-abnormal' : r.overall_status === 'CRITICAL' ? 'badge-critical' : 'badge-pending'}`}>
                      {r.overall_status ?? 'PENDING'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {r.report_date ? String(r.report_date).slice(0, 10) : '—'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {r.comments ? `"${r.comments.slice(0, 80)}${r.comments.length > 80 ? '...' : ''}"` : 'No specific comments.'}
                  </p>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Reviewer: Dr. {r.reviewer ?? 'Pending'}</span>
                    <Link href={`/reports/${r.report_id}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>VIEW FULL →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Test Orders */}
        <section className="animate-entry" style={{ animationDelay: '200ms' }}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
            Test Orders
          </h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Test</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-faint)', fontStyle: 'italic' }}>No active orders.</td></tr>
                ) : orders.map((o: any) => (
                  <tr key={o.order_id}>
                    <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>#{o.order_id}</td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{o.test_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>Dr. {o.physician}</p>
                    </td>
                    <td>{statusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Specimens */}
        <section className="animate-entry" style={{ animationDelay: '300ms' }}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
            Specimens
          </h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Barcode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {specimens.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-faint)', fontStyle: 'italic' }}>No specimens collected.</td></tr>
                ) : specimens.map((s: any) => (
                  <tr key={s.specimen_id}>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.specimen_type}</td>
                    <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{s.barcode ?? 'UNASSIGNED'}</td>
                    <td>{statusBadge(s.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
