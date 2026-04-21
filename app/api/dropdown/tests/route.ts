import { createClient } from '@/lib/supabase/server';
import sql from '@/lib/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await sql`
      SELECT test_def_id, test_name, test_code, category
      FROM test_definition
      ORDER BY category, test_name
    `;
    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
