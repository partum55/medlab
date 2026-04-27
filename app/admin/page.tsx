import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const staff = await sql`
    SELECT role FROM medical_staff WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (!staff.length || staff[0].role !== 'Admin') redirect('/dashboard/staff');

  const staffList = await sql`SELECT * FROM medical_staff ORDER BY last_name`;
  const testList = await sql`SELECT * FROM test_definition ORDER BY test_name`;

  return (
    <div style={{ maxWidth: '60rem', margin: '0 auto' }}>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>System Administration</p>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage personnel and test definitions</p>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>Medical Staff</h2>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s: any) => (
                <tr key={s.staff_id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>#{s.staff_id}</td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.first_name} {s.last_name}</td>
                  <td><span className="badge badge-ordered">{s.role}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{s.department ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>Test Definitions</h2>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Normal Range</th>
              </tr>
            </thead>
            <tbody>
              {testList.map((t: any) => (
                <tr key={t.test_def_id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{t.test_code}</td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{t.test_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.category ?? '—'}</td>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{t.normal_range} {t.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
