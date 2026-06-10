import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Connect Next.js to PostgreSQL.');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  return pool;
}

export async function query(text: string, params?: any[]) {
  return getPool().query(text, params);
}

export async function ensureSchedulesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY,
      class_code VARCHAR(10) NOT NULL,
      class_name VARCHAR(10) NOT NULL,
      subject_code VARCHAR(10) NOT NULL,
      teacher_nik VARCHAR(20) NOT NULL,
      teacher_name VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      jam_ke INTEGER NOT NULL,
      time_start TIME NOT NULL,
      time_end TIME NOT NULL
    );
  `);
}
