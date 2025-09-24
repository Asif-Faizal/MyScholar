import { NextRequest, NextResponse } from 'next/server';
import Database from '../models/Database';

const db = Database.getInstance();

// GET: List all sessions (with optional filters)
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

// POST: Tutor punches in (start session)
export async function POST(request: NextRequest) {
  const { tutorId, studentId, meetingLink } = await request.json();
  const punchIn = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO sessions (tutor_id, student_id, meeting_link, punch_in) VALUES (?, ?, ?, ?)',
    [tutorId, studentId, meetingLink, punchIn]
  );
  return NextResponse.json({ success: true, sessionId: result.lastID });
}

// PUT: Tutor punches out (end session)
export async function PUT(request: NextRequest) {
  const { sessionId } = await request.json();
  const punchOut = new Date().toISOString();
  // Get punch in time
  const session = await db.get('SELECT punch_in FROM sessions WHERE id = ?', [sessionId]);
  if (!session) return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  const duration = Math.floor((new Date(punchOut).getTime() - new Date(session.punch_in).getTime()) / 1000); // seconds
  await db.run('UPDATE sessions SET punch_out = ?, duration = ? WHERE id = ?', [punchOut, duration, sessionId]);
  return NextResponse.json({ success: true });
}
