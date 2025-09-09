const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new sqlite3.Database(dbPath);

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student')),
          alias TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Classes table
      db.run(`
        CREATE TABLE IF NOT EXISTS classes (
          class_id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          staff_id INTEGER NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          meet_link TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users (user_id),
          FOREIGN KEY (student_id) REFERENCES users (user_id),
          FOREIGN KEY (staff_id) REFERENCES users (user_id)
        )
      `);

      // Attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
          class_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          punch_in DATETIME,
          punch_out DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes (class_id),
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables created successfully!');
          resolve();
        }
      });
    });
  });
};

// Create indexes for better performance
const createIndexes = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
      db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      db.run('CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_classes_student ON classes(student_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_classes_staff ON classes(staff_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_attendance_punch_in ON attendance(punch_in)');
      db.run('CREATE INDEX IF NOT EXISTS idx_attendance_punch_out ON attendance(punch_out)');
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database indexes created successfully!');
        resolve();
      }
    });
  });
};

// Run migration
const runMigration = async () => {
  try {
    await createTables();
    await createIndexes();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
};

runMigration();
