import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';
import NavBar from '@/components/NavBar';

export default async function SpecimensLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const staff = await sql`
    SELECT first_name, last_name, role FROM medical_staff WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (!staff.length || staff[0].role !== 'Lab Technician') redirect('/dashboard/staff');

  const member = staff[0];
  return (
    <>
      <NavBar role={member.role} userName={`${member.first_name} ${member.last_name}`} />
      <main style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', flex: 1 }}>
        {children}
      </main>
    </>
  );
}
