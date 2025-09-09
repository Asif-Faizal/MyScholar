import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './database.sqlite';

const db = new sqlite3.Database(dbPath);

const createTables = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student')),
          alias TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table created successfully');
        }
      });

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
          FOREIGN KEY (teacher_id) REFERENCES users(user_id),
          FOREIGN KEY (student_id) REFERENCES users(user_id),
          FOREIGN KEY (staff_id) REFERENCES users(user_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating classes table:', err);
          reject(err);
        } else {
          console.log('Classes table created successfully');
        }
      });

      // Attendance table
      db.run(`
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
      `, (err) => {
        if (err) {
          console.error('Error creating attendance table:', err);
          reject(err);
        } else {
          console.log('Attendance table created successfully');
        }
      });

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_classes_student ON classes(student_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_classes_staff ON classes(staff_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id)`);

      resolve();
    });
  });
};

const createDefaultAdmin = async () => {
  const bcrypt = require('bcryptjs');
  const defaultPassword = await bcrypt.hash('admin123', 10);
  
  return new Promise<void>((resolve, reject) => {
    db.get(
      'SELECT user_id FROM users WHERE role = ?',
      ['admin'],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          db.run(
            'INSERT INTO users (role, alias, email, password_hash) VALUES (?, ?, ?, ?)',
            ['admin', 'System Admin', 'admin@myscholar.com', defaultPassword],
            (err) => {
              if (err) {
                console.error('Error creating default admin:', err);
                reject(err);
              } else {
                console.log('Default admin user created: admin@myscholar.com / admin123');
                resolve();
              }
            }
          );
        } else {
          console.log('Default admin user already exists');
          resolve();
        }
      }
    );
  });
};

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    await createTables();
    await createDefaultAdmin();
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
};

if (require.main === module) {
  runMigrations();
}

export { runMigrations };
