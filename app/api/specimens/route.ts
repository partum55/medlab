import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await sql`
      SELECT s.specimen_id, s.order_id, s.specimen_type, s.status,
             s.collection_date, s.barcode, s.rejection_reason,
             p.first_name || ' ' || p.last_name AS patient_name
      FROM specimen s
      JOIN test_order o ON o.order_id = s.order_id
      JOIN patient p ON p.patient_id = o.patient_id
      ORDER BY s.specimen_id DESC
      LIMIT 200
    `;
    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await sql`
    SELECT staff_id FROM medical_staff
    WHERE auth_user_id = ${user.id} AND role = 'Lab Technician' LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Not a Lab Technician' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { order_id, specimen_type, collection_date, barcode, storage_temp } = body;
  if (!order_id || !specimen_type) {
    return Response.json({ error: 'order_id and specimen_type are required' }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO specimen (order_id, specimen_type, collection_date, collected_by, barcode, storage_temp, status)
      VALUES (${order_id}, ${specimen_type}, ${collection_date || null},
              ${staff[0].staff_id}, ${barcode || null}, ${storage_temp ?? null}, 'COLLECTED')
      RETURNING specimen_id, specimen_type, status
    `;
    return Response.json(result[0], { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
