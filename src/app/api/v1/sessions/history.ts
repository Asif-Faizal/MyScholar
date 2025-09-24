import { NextRequest, NextResponse } from 'next/server';
import Database from '../models/Database';

const db = Database.getInstance();

// GET: Filtered session history (by tutor, student, date range)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tutorId = searchParams.get('tutorId');
  const studentId = searchParams.get('studentId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let sql = `SELECT s.*, t.alias as tutorName, st.alias as studentName FROM sessions s
    JOIN users t ON s.tutor_id = t.user_id
    JOIN users st ON s.student_id = st.user_id WHERE 1=1`;
  const params: any[] = [];
  if (tutorId) { sql += ' AND s.tutor_id = ?'; params.push(tutorId); }
  if (studentId) { sql += ' AND s.student_id = ?'; params.push(studentId); }
  if (from) { sql += ' AND s.punch_in >= ?'; params.push(from); }
  if (to) { sql += ' AND s.punch_out <= ?'; params.push(to); }

  sql += ' ORDER BY s.punch_in DESC';
  const sessions = await db.all(sql, params);
  return NextResponse.json({ success: true, data: sessions });
}
