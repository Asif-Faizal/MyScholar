import Database from '../models/Database';
import { Class, CreateClassRequest, UpdateClassRequest, TimetableEntry } from '../types';

export class ClassService {
  private db = Database.getInstance();

  async createClass(classData: CreateClassRequest, staffId: number): Promise<Class> {
    // Validate that teacher and student exist and have correct roles
    const teacher = await this.db.get(
      'SELECT user_id, role FROM users WHERE user_id = ? AND role = ?',
      [classData.teacher_id, 'teacher']
    );

    if (!teacher) {
      throw new Error('Teacher not found or invalid role');
    }

    const student = await this.db.get(
      'SELECT user_id, role FROM users WHERE user_id = ? AND role = ?',
      [classData.student_id, 'student']
    );

    if (!student) {
      throw new Error('Student not found or invalid role');
    }

    // Check for time conflicts for teacher
    const teacherConflict = await this.db.get(
      `SELECT class_id FROM classes 
       WHERE teacher_id = ? AND (
         (start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        classData.teacher_id,
        classData.start_time, classData.start_time,
        classData.end_time, classData.end_time,
        classData.start_time, classData.end_time
      ]
    );

    if (teacherConflict) {
      throw new Error('Teacher has a scheduling conflict at this time');
    }

    // Check for time conflicts for student
    const studentConflict = await this.db.get(
      `SELECT class_id FROM classes 
       WHERE student_id = ? AND (
         (start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        classData.student_id,
        classData.start_time, classData.start_time,
        classData.end_time, classData.end_time,
        classData.start_time, classData.end_time
      ]
    );

    if (studentConflict) {
      throw new Error('Student has a scheduling conflict at this time');
    }

    // Create the class
    const result = await this.db.run(
      'INSERT INTO classes (teacher_id, student_id, staff_id, start_time, end_time, meet_link) VALUES (?, ?, ?, ?, ?, ?)',
      [classData.teacher_id, classData.student_id, staffId, classData.start_time, classData.end_time, classData.meet_link || null]
    );

    const newClass = await this.db.get(
      'SELECT * FROM classes WHERE class_id = ?',
      [result.lastID]
    );

    return newClass;
  }

  async getClassById(classId: number): Promise<Class | null> {
    return await this.db.get(
      'SELECT * FROM classes WHERE class_id = ?',
      [classId]
    );
  }

  async getAllClasses(page: number = 1, limit: number = 10): Promise<{ classes: Class[], total: number }> {
    const offset = (page - 1) * limit;
    
    const classes = await this.db.all(
      'SELECT * FROM classes ORDER BY start_time DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const totalResult = await this.db.get('SELECT COUNT(*) as count FROM classes');
    const total = totalResult.count;

    return { classes, total };
  }

  async updateClass(classId: number, updateData: UpdateClassRequest): Promise<Class> {
    const existingClass = await this.getClassById(classId);
    if (!existingClass) {
      throw new Error('Class not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.teacher_id !== undefined) {
      // Validate teacher exists and has correct role
      const teacher = await this.db.get(
        'SELECT user_id FROM users WHERE user_id = ? AND role = ?',
        [updateData.teacher_id, 'teacher']
      );
      if (!teacher) {
        throw new Error('Teacher not found or invalid role');
      }
      updates.push('teacher_id = ?');
      values.push(updateData.teacher_id);
    }

    if (updateData.student_id !== undefined) {
      // Validate student exists and has correct role
      const student = await this.db.get(
        'SELECT user_id FROM users WHERE user_id = ? AND role = ?',
        [updateData.student_id, 'student']
      );
      if (!student) {
        throw new Error('Student not found or invalid role');
      }
      updates.push('student_id = ?');
      values.push(updateData.student_id);
    }

    if (updateData.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(updateData.start_time);
    }

    if (updateData.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(updateData.end_time);
    }

    if (updateData.meet_link !== undefined) {
      updates.push('meet_link = ?');
      values.push(updateData.meet_link);
    }

    if (updates.length === 0) {
      return existingClass;
    }

    values.push(classId);
    await this.db.run(
      `UPDATE classes SET ${updates.join(', ')} WHERE class_id = ?`,
      values
    );

    return await this.getClassById(classId) as Class;
  }

  async deleteClass(classId: number): Promise<void> {
    const classRecord = await this.getClassById(classId);
    if (!classRecord) {
      throw new Error('Class not found');
    }

    // Delete associated attendance records first
    await this.db.run('DELETE FROM attendance WHERE class_id = ?', [classId]);
    
    // Delete the class
    await this.db.run('DELETE FROM classes WHERE class_id = ?', [classId]);
  }

  async getTeacherTimetable(teacherId: number): Promise<TimetableEntry[]> {
    const classes = await this.db.all(
      `SELECT 
        c.class_id,
        c.teacher_id,
        c.student_id,
        c.start_time,
        c.end_time,
        c.meet_link,
        s.alias as student_alias,
        a.punch_in,
        a.punch_out
      FROM classes c
      LEFT JOIN users s ON c.student_id = s.user_id
      LEFT JOIN attendance a ON c.class_id = a.class_id AND a.user_id = ?
      WHERE c.teacher_id = ?
      ORDER BY c.start_time`,
      [teacherId, teacherId]
    );

    return classes.map(this.mapToTimetableEntry);
  }

  async getStudentTimetable(studentId: number): Promise<TimetableEntry[]> {
    const classes = await this.db.all(
      `SELECT 
        c.class_id,
        c.teacher_id,
        c.student_id,
        c.start_time,
        c.end_time,
        c.meet_link,
        t.alias as teacher_alias,
        a.punch_in,
        a.punch_out
      FROM classes c
      LEFT JOIN users t ON c.teacher_id = t.user_id
      LEFT JOIN attendance a ON c.class_id = a.class_id AND a.user_id = ?
      WHERE c.student_id = ?
      ORDER BY c.start_time`,
      [studentId, studentId]
    );

    return classes.map(this.mapToTimetableEntry);
  }

  private mapToTimetableEntry(row: any): TimetableEntry {
    let attendanceStatus: 'on_time' | 'late' | 'absent' | 'partial' = 'absent';
    
    if (row.punch_in && row.punch_out) {
      attendanceStatus = 'on_time';
    } else if (row.punch_in) {
      attendanceStatus = 'partial';
    }

    return {
      class_id: row.class_id,
      teacher_id: row.teacher_id,
      student_id: row.student_id,
      teacher_alias: row.teacher_alias,
      student_alias: row.student_alias,
      start_time: row.start_time,
      end_time: row.end_time,
      meet_link: row.meet_link,
      attendance_status: attendanceStatus
    };
  }

  async getClassesByDateRange(startDate: string, endDate: string): Promise<Class[]> {
    return await this.db.all(
      'SELECT * FROM classes WHERE start_time >= ? AND end_time <= ? ORDER BY start_time',
      [startDate, endDate]
    );
  }
}
