import { NextRequest, NextResponse } from 'next/server';
import Database from '../models/Database';

const db = Database.getInstance();

// GET: List all tutor-student mappings
export async function GET() {
  const mappings = await db.all(
    `SELECT m.id, t.user_id as tutorId, t.alias as tutorName, s.user_id as studentId, s.alias as studentName
     FROM tutor_student_mapping m
     JOIN users t ON m.tutor_id = t.user_id
     JOIN users s ON m.student_id = s.user_id`
  );
  return NextResponse.json({ success: true, data: mappings });
}

// POST: Assign a tutor to a student (1:1)
export async function POST(request: NextRequest) {
  const { tutorId, studentId } = await request.json();
  // Remove any previous mapping for this student
  await db.run('DELETE FROM tutor_student_mapping WHERE student_id = ?', [studentId]);
  // Remove any previous mapping for this tutor
  await db.run('DELETE FROM tutor_student_mapping WHERE tutor_id = ?', [tutorId]);
  // Create new mapping
  await db.run('INSERT INTO tutor_student_mapping (tutor_id, student_id) VALUES (?, ?)', [tutorId, studentId]);
  return NextResponse.json({ success: true });
}
