import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacher_nik = searchParams.get('teacher_nik');
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');

  if (!teacher_nik || !start_date || !end_date) {
    return NextResponse.json({ error: 'teacher_nik, start_date, and end_date are required' }, { status: 400 });
  }

  try {
    const result = await query(`
      SELECT * FROM schedules 
      WHERE teacher_nik = $1 AND date >= $2 AND date <= $3 
      ORDER BY date ASC, time_start ASC
    `, [teacher_nik, start_date, end_date]);

    let total_jp = 0;
    let total_minutes = 0;

    for (const row of result.rows) {
      total_jp += 1;
      
      const start = new Date(`1970-01-01T${row.time_start}Z`);
      const end = new Date(`1970-01-01T${row.time_end}Z`);
      const diffMins = (end.getTime() - start.getTime()) / 60000;
      total_minutes += Math.max(0, diffMins);
    }

    return NextResponse.json({
      teacher_nik,
      start_date,
      end_date,
      total_jp,
      total_minutes,
      schedules: result.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
