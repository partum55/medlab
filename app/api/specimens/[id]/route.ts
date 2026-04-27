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
    WHERE auth_user_id = ${user.id} AND role IN ('Lab Technician', 'Admin') LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { status, rejection_reason } = body;
  if (!status) return Response.json({ error: 'status is required' }, { status: 400 });

  try {
    const result = await sql.begin(async (sql) => {
      const updateResult = await sql`
        UPDATE specimen
        SET status = ${status},
            rejection_reason = ${rejection_reason ?? null}
        WHERE specimen_id = ${Number(id)}
        RETURNING specimen_id, order_id, status
      `;
      
      if (!updateResult.length) throw new Error('Specimen not found');

      // If status is COMPLETED, auto-generate a lab report and mock result items
      if (status === 'COMPLETED') {
        const order = await sql`
          SELECT test_def_id FROM test_order WHERE order_id = ${updateResult[0].order_id} LIMIT 1
        `;
        
        if (order.length) {
          const report = await sql`
            INSERT INTO lab_report (specimen_id, overall_status, report_date)
            VALUES (${Number(id)}, 'PENDING', CURRENT_DATE)
            RETURNING report_id
          `;

          await sql`
            INSERT INTO result_item (report_id, item_seq_no, test_def_id, measured_value, text_result)
            VALUES (${report[0].report_id}, 1, ${order[0].test_def_id}, '---', 'Pending interpretation')
          `;
        }
      }

      return updateResult[0];
    });

    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: err.message === 'Specimen not found' ? 404 : 500 });
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
    WHERE auth_user_id = ${user.id} AND role IN ('Lab Technician', 'Admin') LIMIT 1
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
