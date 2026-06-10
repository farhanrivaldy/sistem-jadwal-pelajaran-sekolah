import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const class_code = searchParams.get('class_code');
  const date = searchParams.get('date');

  if (!class_code || !date) {
    return NextResponse.json({ error: 'class_code and date are required' }, { status: 400 });
  }

  try {
    const result = await query(`
      SELECT * FROM schedules 
      WHERE class_code = $1 AND date = $2 
      ORDER BY time_start ASC
    `, [class_code, date]);

    return NextResponse.json({
      class_code,
      date,
      total_jadwal: result.rowCount,
      schedules: result.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
