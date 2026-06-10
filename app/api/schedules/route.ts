import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await query('SELECT * FROM schedules ORDER BY date DESC, time_start ASC');
    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    const { class_code, class_name, subject_code, teacher_nik, teacher_name, date, jam_ke, time_start, time_end } = body;
    
    await query(`
      INSERT INTO schedules (id, class_code, class_name, subject_code, teacher_nik, teacher_name, date, jam_ke, time_start, time_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, class_code, class_name, subject_code, teacher_nik, teacher_name, date, jam_ke, time_start, time_end]);

    return NextResponse.json({ data: { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
