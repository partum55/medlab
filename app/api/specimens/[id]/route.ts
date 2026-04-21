import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await sql`
    SELECT staff_id FROM medical_staff
    WHERE auth_user_id = ${user.id} AND role = 'Lab Technician' LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { status, rejection_reason } = body;
  if (!status) return Response.json({ error: 'status is required' }, { status: 400 });

  try {
    const result = await sql`
      UPDATE specimen
      SET status = ${status},
          rejection_reason = ${rejection_reason ?? null}
      WHERE specimen_id = ${Number(id)}
      RETURNING specimen_id, status, rejection_reason
    `;
    if (!result.length) return Response.json({ error: 'Specimen not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await sql`
    SELECT staff_id FROM medical_staff
    WHERE auth_user_id = ${user.id} AND role = 'Lab Technician' LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  try {
    await sql`DELETE FROM specimen WHERE specimen_id = ${Number(id)}`;
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
