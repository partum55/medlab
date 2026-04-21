import { redirect, notFound } from 'next/navigation';
import EditSpecimenForm from './EditSpecimenForm';
import sql from '@/lib/db';

export default async function EditSpecimenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const specimens = await sql`
    SELECT s.specimen_id, s.order_id, s.specimen_type, s.status,
           s.collection_date, s.barcode, s.storage_temp, s.rejection_reason,
           p.first_name || ' ' || p.last_name AS patient_name,
           td.test_name
    FROM specimen s
    JOIN test_order o ON o.order_id = s.order_id
    JOIN patient p ON p.patient_id = o.patient_id
    JOIN test_definition td ON td.test_def_id = o.test_def_id
    WHERE s.specimen_id = ${Number(id)}
    LIMIT 1
  `;
  if (!specimens.length) notFound();
  return <EditSpecimenForm specimen={specimens[0] as any} />;
}
