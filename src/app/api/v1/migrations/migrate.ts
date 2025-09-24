import Database from '../models/Database';

async function migrate() {
  const db = Database.getInstance();

  try {
    // Users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student')),
        alias TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Classes table
    await db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        class_id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        meet_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(user_id),
        FOREIGN KEY (student_id) REFERENCES users(user_id),
        FOREIGN KEY (staff_id) REFERENCES users(user_id)
      )
    `);

    // Attendance table
    await db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        punch_in DATETIME,
        punch_out DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        UNIQUE(class_id, user_id)
      )
    `);

    // Tutor-Student mapping table
    await db.run(`
      CREATE TABLE IF NOT EXISTS tutor_student_mapping (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id),
        FOREIGN KEY (tutor_id) REFERENCES users(user_id),
        FOREIGN KEY (student_id) REFERENCES users(user_id)
      )
    `);

    // Sessions table for punch in/out
    await db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        meeting_link TEXT,
        punch_in DATETIME,
        punch_out DATETIME,
        duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tutor_id) REFERENCES users(user_id),
        FOREIGN KEY (student_id) REFERENCES users(user_id)
      )
    `);

    // Create default admin user if not exists
    const adminEmail = 'admin@myscholar.com';
    const adminExists = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await db.run(
        'INSERT INTO users (role, alias, email, password_hash) VALUES (?, ?, ?, ?)',
        ['admin', 'Admin', adminEmail, passwordHash]
      );
      console.log('Default admin user created.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.close();
  }
}

migrate();
