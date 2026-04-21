import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { first_name, last_name, date_of_birth, gender, phone } = body;
  if (!first_name?.trim() || !last_name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 });
  if (!date_of_birth) return Response.json({ error: 'Date of birth required' }, { status: 400 });
  if (!gender) return Response.json({ error: 'Gender required' }, { status: 400 });

  try {
    await sql`
      UPDATE patient
      SET first_name = ${first_name.trim()},
          last_name  = ${last_name.trim()},
          date_of_birth = ${date_of_birth},
          gender     = ${gender},
          phone      = ${phone?.trim() || null},
          profile_complete = true
      WHERE auth_user_id = ${user.id}
    `;
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message ?? 'DB error' }, { status: 500 });
  }
}
