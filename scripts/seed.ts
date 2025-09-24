import Database from '../src/app/api/v1/models/Database';
import { AuthUtils } from '../src/app/api/v1/utils/auth';

async function seed() {
  const db = Database.getInstance();

  // Create tables if not exist
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS tutor_student_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutor_id INTEGER,
    student_id INTEGER
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutor_id INTEGER,
    student_id INTEGER,
    meeting_link TEXT,
    punch_in TEXT,
    punch_out TEXT,
    duration INTEGER
  )`);

  // Seed users
  const adminPass = await AuthUtils.hashPassword('admin123');
  const staffPass = await AuthUtils.hashPassword('staff123');
  const tutorPass = await AuthUtils.hashPassword('tutor123');
  const studentPass = await AuthUtils.hashPassword('student123');

  await db.run(`INSERT OR IGNORE INTO users (alias, email, password_hash, role) VALUES
    ('Admin', 'admin@myscholar.com', ?, 'admin'),
    ('Staff', 'staff@myscholar.com', ?, 'staff'),
    ('Tutor1', 'tutor1@myscholar.com', ?, 'tutor'),
    ('Student1', 'student1@myscholar.com', ?, 'student')
  `, [adminPass, staffPass, tutorPass, studentPass]);

  // Seed mapping (Tutor1 <-> Student1)
  const tutor = await db.get('SELECT user_id FROM users WHERE role = "tutor"');
  const student = await db.get('SELECT user_id FROM users WHERE role = "student"');
  await db.run('INSERT OR IGNORE INTO tutor_student_mapping (tutor_id, student_id) VALUES (?, ?)', [tutor.user_id, student.user_id]);

  // Seed session
  await db.run(`INSERT OR IGNORE INTO sessions (tutor_id, student_id, meeting_link, punch_in, punch_out, duration)
    VALUES (?, ?, 'https://meet.example.com/class1', '2025-09-24T09:00:00Z', '2025-09-24T10:00:00Z', 3600)`, [tutor.user_id, student.user_id]);

  console.log('Seed data inserted.');
}

seed();
