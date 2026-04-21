import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/app/landing/LandingPage';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const { default: sql } = await import('@/lib/db');

  // Check medical_staff first
  const staff = await sql`
    SELECT staff_id, role FROM medical_staff WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (staff.length > 0) redirect('/dashboard/staff');

  // Check patient
  const patients = await sql`
    SELECT patient_id, profile_complete FROM patient WHERE auth_user_id = ${user.id} LIMIT 1
  `;
  if (patients.length > 0) {
    if (patients[0].profile_complete) redirect('/dashboard/patient');
    else redirect('/profile/complete');
  }

  // New user — create patient row
  await sql`
    INSERT INTO patient (auth_user_id, profile_complete)
    VALUES (${user.id}, false)
    ON CONFLICT (auth_user_id) DO NOTHING
  `;
  redirect('/profile/complete');
}
