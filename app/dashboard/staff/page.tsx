import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

const ROLE_LINKS: Record<string, Array<{ href: string; label: string; desc: string }>> = {
  'Ordering Physician': [
    { href: '/orders/new',    label: 'Create Test Order',  desc: 'Order a new diagnostic test for a patient' },
    { href: '/orders/cancel', label: 'Cancel Test Order',  desc: 'Cancel a pending or in-progress order' },
  ],
  'Lab Technician': [
    { href: '/specimens',     label: 'View Specimens',     desc: 'List and manage all collected specimens' },
    { href: '/specimens/new', label: 'Register Specimen',  desc: 'Log a newly collected specimen' },
  ],
  'Pathologist': [
    { href: '/reports',       label: 'Lab Reports',        desc: 'Review and sign off on pending reports' },
  ],
};

export default async function StaffDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const staff = await sql`
    SELECT staff_id, first_name, last_name, role, department
    FROM medical_staff WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (!staff.length) redirect('/');

  const member = staff[0];
  const links = ROLE_LINKS[member.role] ?? [];

  return (
    <div style={{ maxWidth: '40rem' }}>
      <div className="page-header">
        <p className="field-label" style={{ marginBottom: '0.25rem' }}>Staff</p>
        <h1 className="page-title">{member.first_name} {member.last_name}</h1>
        <p className="page-subtitle">
          {member.role}
          {member.department ? ` · ${member.department}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              textDecoration: 'none',
              transition: 'border-color 0.12s',
            }}
            className="dashboard-link"
          >
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>{label}</p>
              <p style={{ color: 'var(--text-muted)', margin: '0.125rem 0 0', fontSize: '0.8125rem' }}>{desc}</p>
            </div>
            <span style={{ color: 'var(--text-faint)', fontSize: '1.25rem', fontWeight: 300 }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
