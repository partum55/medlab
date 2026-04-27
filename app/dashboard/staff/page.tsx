import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

const ROLE_LINKS: Record<string, Array<{ href: string; label: string; desc: string }>> = {
  'Admin': [
    { href: '/orders/new',    label: 'Create Test Order',  desc: 'Order a new diagnostic test for a patient' },
    { href: '/specimens',     label: 'View Specimens',     desc: 'List and manage all collected specimens' },
    { href: '/reports',       label: 'Lab Reports',        desc: 'Review and sign off on pending reports' },
    { href: '/admin',         label: 'System Settings',    desc: 'Manage staff and test definitions' },
  ],
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
    <div className="bg-grid-dots min-h-[calc(100vh-8rem)]">
      <div style={{ maxWidth: '48rem' }}>
        <div className="page-header animate-entry" style={{ borderBottom: 'none', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span className="mono" style={{ fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(29, 78, 216, 0.08)', padding: '0.25rem 0.625rem', borderRadius: '2px' }}>
              Personnel ID #{member.staff_id}
            </span>
            <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
          </div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700 }}>
            Welcome, {member.first_name}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{member.role}</span>
            {member.department ? <span style={{ color: 'var(--text-faint)' }}> · {member.department} Department</span> : ''}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
          {links.length === 0 ? (
            <div className="panel animate-entry" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>NO AUTHORIZED ACTIONS ASSIGNED TO THIS ROLE.</p>
            </div>
          ) : links.map(({ href, label, desc }, i) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                animationDelay: `${(i + 1) * 100}ms`,
                height: '100%',
              }}
              className="dashboard-link glass-panel animate-entry"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '2px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>0{i + 1}</span>
                  </div>
                  <span style={{ color: 'var(--accent)', fontSize: '1.25rem', transform: 'rotate(-45deg)' }}>→</span>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>{label}</p>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="animate-entry" style={{ marginTop: '4rem', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '4px', animationDelay: '500ms' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>System Status</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Database</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                <span className="mono" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>OPERATIONAL</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Security</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                <span className="mono" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
