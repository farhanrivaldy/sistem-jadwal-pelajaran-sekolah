import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import * as xlsx from 'xlsx';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');

  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'start_date and end_date are required' }, { status: 400 });
  }

  try {
    const result = await query(`
      SELECT teacher_nik, teacher_name, time_start, time_end
      FROM schedules 
      WHERE date >= $1 AND date <= $2 
    `, [start_date, end_date]);

    const recapMap = new Map<string, any>();

    for (const row of result.rows) {
      if (!recapMap.has(row.teacher_nik)) {
        recapMap.set(row.teacher_nik, {
          'NIK Guru': row.teacher_nik,
          'Nama Guru': row.teacher_name,
          'Total JP': 0,
          'Total Menit': 0,
        });
      }

      const teacherData = recapMap.get(row.teacher_nik);
      teacherData['Total JP'] += 1;
      
      const start = new Date(`1970-01-01T${row.time_start}Z`);
      const end = new Date(`1970-01-01T${row.time_end}Z`);
      const diffMins = (end.getTime() - start.getTime()) / 60000;
      teacherData['Total Menit'] += Math.max(0, diffMins);
    }

    const data = Array.from(recapMap.values());
    data.sort((a: any, b: any) => b['Total JP'] - a['Total JP']);

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Rekap JP');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="rekap-jp-${start_date}-${end_date}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
