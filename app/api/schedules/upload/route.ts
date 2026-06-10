import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    let insertedCount = 0;
    for (const row of data) {
      const id = uuidv4();
      await query(`
        INSERT INTO schedules (id, class_code, class_name, subject_code, teacher_nik, teacher_name, date, jam_ke, time_start, time_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id, 
        row.class_code, 
        row.class_name, 
        row.subject_code, 
        String(row.teacher_nik), 
        row.teacher_name, 
        row.date, 
        Number(row.jam_ke), 
        row.time_start, 
        row.time_end
      ]);
      insertedCount++;
    }

    return NextResponse.json({ inserted_count: insertedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
