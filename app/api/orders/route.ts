import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await sql`
      SELECT o.order_id, p.first_name || ' ' || p.last_name AS patient_name,
             td.test_name, o.order_date, o.priority, o.status
      FROM test_order o
      JOIN patient p ON p.patient_id = o.patient_id
      JOIN test_definition td ON td.test_def_id = o.test_def_id
      WHERE o.status != 'CANCELLED'
      ORDER BY o.order_id DESC
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
    SELECT staff_id, role FROM medical_staff
    WHERE auth_user_id = ${user.id} AND role = 'Ordering Physician' LIMIT 1
  `;
  if (!staff.length) return Response.json({ error: 'Not an Ordering Physician' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { patient_id, test_def_id, order_date, priority, notes } = body;
  if (!patient_id || !test_def_id || !order_date || !priority) {
    return Response.json({ error: 'patient_id, test_def_id, order_date, priority are required' }, { status: 400 });
  }
  if (!['ROUTINE', 'URGENT', 'STAT'].includes(priority)) {
    return Response.json({ error: 'priority must be ROUTINE, URGENT, or STAT' }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO test_order (patient_id, staff_id, test_def_id, order_date, priority, status, notes)
      VALUES (${patient_id}, ${staff[0].staff_id}, ${test_def_id}, ${order_date}, ${priority}, 'ORDERED', ${notes?.trim() || null})
      RETURNING order_id
    `;
    const orderId = result[0].order_id;

    const orderRow = await sql`
      SELECT o.order_id, td.test_name, td.test_code, o.priority, o.status
      FROM test_order o
      JOIN test_definition td ON td.test_def_id = o.test_def_id
      WHERE o.order_id = ${orderId}
    `;

    return Response.json({ order_id: orderId, order: orderRow[0] }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
