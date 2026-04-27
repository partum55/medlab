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
    WHERE auth_user_id = ${user.id} AND role IN ('Pathologist', 'Admin') LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { overall_status, comments, is_amended, amendment_note } = body;
  if (!overall_status) return Response.json({ error: 'overall_status is required' }, { status: 400 });

  try {
    const result = await sql`
      UPDATE lab_report
      SET overall_status  = ${overall_status},
          comments        = ${comments ?? null},
          reviewed_by     = ${staff[0].staff_id},
          is_amended      = ${is_amended ?? false},
          amendment_note  = ${amendment_note ?? null},
          report_date     = CURRENT_DATE
      WHERE report_id = ${Number(id)}
      RETURNING report_id, overall_status, is_amended
    `;
    if (!result.length) return Response.json({ error: 'Report not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
