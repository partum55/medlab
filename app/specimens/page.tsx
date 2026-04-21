import Link from 'next/link';
import sql from '@/lib/db';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    COLLECTED: 'badge-ordered', IN_ANALYSIS: 'badge-progress',
    COMPLETED: 'badge-completed', REJECTED: 'badge-stat', PENDING: 'badge-pending',
  };
  return <span className={`badge ${map[status] ?? 'badge-pending'}`}>{status}</span>;
}

export default async function SpecimensPage() {
  const specimens = await sql`
    SELECT s.specimen_id, s.specimen_type, s.status, s.collection_date, s.barcode,
           s.rejection_reason, o.order_id,
           p.first_name || ' ' || p.last_name AS patient_name
    FROM specimen s
    JOIN test_order o ON o.order_id = s.order_id
    JOIN patient p ON p.patient_id = o.patient_id
    ORDER BY s.specimen_id DESC
    LIMIT 200
  `;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="field-label" style={{ marginBottom: '0.25rem' }}>Lab Technician</p>
          <h1 className="page-title">Specimens</h1>
          <p className="page-subtitle">{specimens.length} specimen{specimens.length !== 1 ? 's' : ''} on record</p>
        </div>
        <Link href="/specimens/new" className="btn-primary">New Specimen</Link>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Barcode</th>
              <th>Collected</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {specimens.length === 0 ? (
              <tr><td colSpan={8} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No specimens yet.</td></tr>
            ) : specimens.map((s: any) => (
              <tr key={s.specimen_id}>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{s.specimen_id}</td>
                <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>#{s.order_id}</td>
                <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.patient_name}</td>
                <td style={{ fontSize: '0.875rem' }}>{s.specimen_type}</td>
                <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.barcode ?? '—'}</td>
                <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {s.collection_date ? String(s.collection_date).slice(0, 10) : '—'}
                </td>
                <td>{statusBadge(s.status)}</td>
                <td>
                  <Link
                    href={`/specimens/${s.specimen_id}/edit`}
                    style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    Edit
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
