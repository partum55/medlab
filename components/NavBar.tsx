'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface NavBarProps {
  role?: string | null;
  userName?: string | null;
}

export default function NavBar({ role, userName }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const staffLinks = role === 'Ordering Physician'
    ? [
        { href: '/dashboard/staff', label: 'Dashboard' },
        { href: '/orders/new', label: 'New Order' },
        { href: '/orders/cancel', label: 'Cancel Order' },
      ]
    : role === 'Lab Technician'
    ? [
        { href: '/dashboard/staff', label: 'Dashboard' },
        { href: '/specimens', label: 'Specimens' },
        { href: '/specimens/new', label: 'New Specimen' },
      ]
    : role === 'Pathologist'
    ? [
        { href: '/dashboard/staff', label: 'Dashboard' },
        { href: '/reports', label: 'Lab Reports' },
      ]
    : role === 'patient'
    ? [{ href: '/dashboard/patient', label: 'Dashboard' }]
    : [];

  return (
    <header
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          height: '3rem',
          gap: '0',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.375rem',
            textDecoration: 'none',
            marginRight: '2rem',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            MedLab
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            DX
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
          {staffLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0 0.875rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                fontWeight: isActive(href) ? 600 : 400,
                color: isActive(href) ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: isActive(href)
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'color 0.1s',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexShrink: 0 }}>
          {userName && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
              }}
            >
              {userName}
            </span>
          )}
          {role && (
            <button
              onClick={signOut}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0',
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
