import Link from 'next/link';

const STATS = [
  { value: '3,800+', label: 'Tests Processed', sub: 'across all categories' },
  { value: '< 24h',  label: 'Report Turnaround', sub: 'average for routine orders' },
  { value: '7',      label: 'Integrated Tables', sub: 'normalized schema' },
  { value: '4',      label: 'Staff Roles',       sub: 'physician · tech · path · patient' },
];

const STEPS = [
  {
    n: '01',
    title: 'Physician Orders',
    body: 'An ordering physician selects the patient, test, and priority. The order enters the system instantly with full traceability.',
  },
  {
    n: '02',
    title: 'Specimen Collected',
    body: 'A lab technician registers the biological specimen, assigns a barcode, and tracks it through analysis. Rejections are documented.',
  },
  {
    n: '03',
    title: 'Report Issued',
    body: 'A pathologist reviews all result items, sets the overall status, and signs off the report. Patients see results in real time.',
  },
];

const SERVICES = [
  {
    title: 'Physician Ordering',
    body: 'Create and manage test orders with priority levels — ROUTINE, URGENT, or STAT — linked to specific patients and definitions.',
    label: 'ORDERING PHYSICIAN',
  },
  {
    title: 'Specimen Management',
    body: 'Full lifecycle tracking from collection through analysis: barcode, storage temperature, status, and rejection documentation.',
    label: 'LAB TECHNICIAN',
  },
  {
    title: 'Pathology Review',
    body: 'Pathologists sign off on lab reports, interpret result items with clinical flags, and issue amendments when required.',
    label: 'PATHOLOGIST',
  },
  {
    title: 'Patient Records',
    body: 'Patients access their complete diagnostic history — orders, specimens, and final reports — through a secure personal dashboard.',
    label: 'PATIENT',
  },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text)', background: '#ffffff' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#06091a',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 1.5rem',
          height: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1d4ed8',
            }}
          >
            MedLab
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.06em',
            }}
          >
            DX
          </span>
        </div>
        <Link href="/login" className="land-nav-link">
          Sign In →
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="land-hero"
        style={{
          padding: 'clamp(5rem, 12vw, 9rem) 1.5rem clamp(4rem, 10vw, 7rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2rem',
        }}
      >
        <p
          className="land-animate"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(29,78,216,0.9)',
            background: 'rgba(29,78,216,0.1)',
            border: '1px solid rgba(29,78,216,0.25)',
            padding: '0.25rem 0.875rem',
            borderRadius: '2px',
            animationDelay: '0ms',
          }}
        >
          Private Diagnostic Clinic · Est. 2024
        </p>

        <h1
          className="land-display land-animate"
          style={{
            fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
            maxWidth: '820px',
            animationDelay: '100ms',
          }}
        >
          Precision diagnostics.<br />
          From order to report.
        </h1>

        <p
          className="land-animate"
          style={{
            fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
            color: 'rgba(240,244,255,0.55)',
            maxWidth: '500px',
            lineHeight: 1.65,
            animationDelay: '200ms',
          }}
        >
          MedLab connects physicians, lab technicians, and pathologists
          in a single integrated workflow — traceable, auditable, fast.
        </p>

        <div
          className="land-animate"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '300ms' }}
        >
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.75rem 1.875rem',
              background: '#1d4ed8',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'background 0.12s',
            }}
          >
            Access the platform →
          </Link>
          <a
            href="#how-it-works"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.65)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'border-color 0.12s, color 0.12s',
            }}
          >
            How it works
          </a>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="land-animate"
              style={{
                padding: '2.5rem 1.5rem',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                animationDelay: `${i * 80}ms`,
              }}
            >
              <p className="land-stat-number">{s.value}</p>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--text)',
                  marginTop: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          background: '#ffffff',
          padding: 'clamp(4rem, 8vw, 6.5rem) 1.5rem',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            className="land-step-number"
            style={{ marginBottom: '1rem', display: 'block' }}
          >
            How it works
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--text)',
              marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
              maxWidth: '28rem',
            }}
          >
            Three steps.<br />End-to-end traceability.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
              gap: '0',
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="land-animate"
                style={{
                  padding: '2rem 2.25rem 2rem 0',
                  paddingRight: i < STEPS.length - 1 ? '2.25rem' : '0',
                  marginRight: i < STEPS.length - 1 ? '2.25rem' : '0',
                  borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <span className="land-step-number" style={{ display: 'block', marginBottom: '1.25rem' }}>
                  {step.n}
                </span>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.65,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="land-divider" />

      {/* ── Services ────────────────────────────────────────── */}
      <section
        style={{
          background: '#ffffff',
          padding: 'clamp(4rem, 8vw, 6.5rem) 1.5rem',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            className="land-step-number"
            style={{ marginBottom: '1rem', display: 'block' }}
          >
            Services
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--text)',
              marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
              maxWidth: '28rem',
            }}
          >
            Built for every role<br />in the workflow.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
              gap: '1rem',
            }}
          >
            {SERVICES.map((svc, i) => (
              <div
                key={svc.title}
                className="land-card land-animate"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#1d4ed8',
                    marginBottom: '1rem',
                  }}
                >
                  {svc.label}
                </p>
                <h3
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '0.625rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {svc.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {svc.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section
        className="land-cta-banner"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(29,78,216,0.85)',
              marginBottom: '1.5rem',
            }}
          >
            Authorized access only
          </p>
          <h2
            className="land-display"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.75rem' }}
          >
            Ready to access<br />the platform?
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'rgba(240,244,255,0.5)',
              marginBottom: '2.25rem',
              lineHeight: 1.6,
            }}
          >
            Sign in with your clinic-issued credentials. Access is granted
            to registered staff and patients only.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.875rem 2.25rem',
              background: '#1d4ed8',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'background 0.12s',
            }}
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        style={{
          background: '#06091a',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.07em',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          MEDLAB DX · PRIVATE DIAGNOSTIC CLINIC · © 2024
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.07em',
            color: 'rgba(255,255,255,0.15)',
          }}
        >
          FOR AUTHORIZED PERSONNEL ONLY
        </span>
      </footer>
    </div>
  );
}
