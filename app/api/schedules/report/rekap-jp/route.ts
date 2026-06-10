import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

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
          teacher_nik: row.teacher_nik,
          teacher_name: row.teacher_name,
          total_jp: 0,
          total_minutes: 0,
        });
      }

      const teacherData = recapMap.get(row.teacher_nik);
      teacherData.total_jp += 1;
      
      const start = new Date(`1970-01-01T${row.time_start}Z`);
      const end = new Date(`1970-01-01T${row.time_end}Z`);
      const diffMins = (end.getTime() - start.getTime()) / 60000;
      teacherData.total_minutes += Math.max(0, diffMins);
    }

    const data = Array.from(recapMap.values());
    data.sort((a: any, b: any) => b.total_jp - a.total_jp);

    return NextResponse.json({
      start_date,
      end_date,
      total_teachers: data.length,
      data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
