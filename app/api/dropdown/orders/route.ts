import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await sql`
      SELECT o.order_id,
             p.first_name || ' ' || p.last_name AS patient_name,
             td.test_name, o.order_date, o.priority, o.status
      FROM test_order o
      JOIN patient p ON p.patient_id = o.patient_id
      JOIN test_definition td ON td.test_def_id = o.test_def_id
      WHERE o.status NOT IN ('CANCELLED', 'COMPLETED')
      ORDER BY o.order_id DESC
      LIMIT 200
    `;
    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
