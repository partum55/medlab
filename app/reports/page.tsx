import Link from 'next/link';
import sql from '@/lib/db';

function overallBadge(status: string | null) {
  if (!status) return <span className="badge badge-pending">PENDING</span>;
  const map: Record<string, string> = {
    NORMAL: 'badge-normal', ABNORMAL: 'badge-abnormal', CRITICAL: 'badge-critical',
  };
  return <span className={`badge ${map[status] ?? 'badge-pending'}`}>{status}</span>;
}

export default async function ReportsPage() {
  const reports = await sql`
    SELECT r.report_id, r.overall_status, r.report_date, r.is_amended,
           ms.first_name || ' ' || ms.last_name AS reviewer,
           p.first_name || ' ' || p.last_name   AS patient_name,
           s.specimen_id
    FROM lab_report r
    JOIN specimen s ON s.specimen_id = r.specimen_id
    JOIN test_order o ON o.order_id = s.order_id
    JOIN patient p ON p.patient_id = o.patient_id
    LEFT JOIN medical_staff ms ON ms.staff_id = r.reviewed_by
    ORDER BY r.report_id DESC
    LIMIT 200
  `;

  return (
    <div>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>Pathologist</p>
        <h1 className="page-title">Lab Reports</h1>
        <p className="page-subtitle">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Specimen</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Reviewed By</th>
              <th>Status</th>
              <th>Amended</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={8} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reports yet.</td></tr>
            ) : reports.map((r: any) => (
              <tr key={r.report_id}>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{r.report_id}</td>
                <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>#{r.specimen_id}</td>
                <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.patient_name}</td>
                <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {r.report_date ? String(r.report_date).slice(0, 10) : '—'}
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {r.reviewer ? `Dr. ${r.reviewer}` : '—'}
                </td>
                <td>{overallBadge(r.overall_status)}</td>
                <td>
                  {r.is_amended ? <span className="badge badge-amended">YES</span> : <span style={{ color: 'var(--text-faint)', fontSize: '0.8125rem' }}>—</span>}
                </td>
                <td>
                  <Link
                    href={`/reports/${r.report_id}/review`}
                    style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
