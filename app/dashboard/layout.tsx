import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';
import NavBar from '@/components/NavBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let role: string | null = null;
  let userName: string | null = user.email ?? null;

  const staff = await sql`
    SELECT first_name, last_name, role FROM medical_staff WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (staff.length > 0) {
    role = staff[0].role;
    userName = `${staff[0].first_name} ${staff[0].last_name}`;
  } else {
    const patients = await sql`
      SELECT first_name, last_name FROM patient WHERE auth_user_id = ${user.id} LIMIT 1
    `;
    if (patients.length > 0) {
      role = 'patient';
      if (patients[0].first_name) userName = `${patients[0].first_name} ${patients[0].last_name}`;
    }
  }

  return (
    <>
      <NavBar role={role} userName={userName} />
      <main style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', flex: 1 }}>
        {children}
      </main>
    </>
  );
}
