import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import ReviewReportForm from './ReviewReportForm';

export default async function ReviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const reports = await sql`
    SELECT r.report_id, r.overall_status, r.report_date, r.comments,
           r.is_amended, r.amendment_note, r.reviewed_by,
           s.specimen_id, s.specimen_type,
           p.first_name || ' ' || p.last_name AS patient_name,
           td.test_name, td.test_code
    FROM lab_report r
    JOIN specimen s ON s.specimen_id = r.specimen_id
    JOIN test_order o ON o.order_id = s.order_id
    JOIN patient p ON p.patient_id = o.patient_id
    JOIN test_definition td ON td.test_def_id = o.test_def_id
    WHERE r.report_id = ${Number(id)}
    LIMIT 1
  `;
  if (!reports.length) notFound();

  const resultItems = await sql`
    SELECT ri.item_seq_no, ri.measured_value, ri.text_result, ri.flag,
           td.test_name, td.test_code, td.normal_range, td.unit
    FROM result_item ri
    JOIN test_definition td ON td.test_def_id = ri.test_def_id
    WHERE ri.report_id = ${Number(id)}
    ORDER BY ri.item_seq_no
  `;

  return <ReviewReportForm report={reports[0] as any} resultItems={resultItems as any[]} />;
}
