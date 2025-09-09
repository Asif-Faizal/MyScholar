import Database from '../models/Database';
import { Attendance, AttendanceReport, PunchInRequest, PunchOutRequest } from '../types';

export class AttendanceService {
  private db = Database.getInstance();

  async punchIn(userId: number, punchData: PunchInRequest): Promise<Attendance> {
    // Verify class exists and user is assigned to it
    const classRecord = await this.db.get(
      'SELECT * FROM classes WHERE class_id = ? AND (teacher_id = ? OR student_id = ?)',
      [punchData.class_id, userId, userId]
    );

    if (!classRecord) {
      throw new Error('Class not found or user not assigned to this class');
    }

    // Check if user has already punched in for this class
    const existingAttendance = await this.db.get(
      'SELECT * FROM attendance WHERE class_id = ? AND user_id = ?',
      [punchData.class_id, userId]
    );

    if (existingAttendance && existingAttendance.punch_in) {
      throw new Error('User has already punched in for this class');
    }

    const now = new Date().toISOString();

    if (existingAttendance) {
      // Update existing record
      await this.db.run(
        'UPDATE attendance SET punch_in = ? WHERE class_id = ? AND user_id = ?',
        [now, punchData.class_id, userId]
      );
    } else {
      // Create new record
      await this.db.run(
        'INSERT INTO attendance (class_id, user_id, punch_in) VALUES (?, ?, ?)',
        [punchData.class_id, userId, now]
      );
    }

    const updatedAttendance = await this.db.get(
      'SELECT * FROM attendance WHERE class_id = ? AND user_id = ?',
      [punchData.class_id, userId]
    );

    return updatedAttendance;
  }

  async punchOut(userId: number, punchData: PunchOutRequest): Promise<Attendance> {
    // Verify class exists and user is assigned to it
    const classRecord = await this.db.get(
      'SELECT * FROM classes WHERE class_id = ? AND (teacher_id = ? OR student_id = ?)',
      [punchData.class_id, userId, userId]
    );

    if (!classRecord) {
      throw new Error('Class not found or user not assigned to this class');
    }

    // Check if user has punched in
    const existingAttendance = await this.db.get(
      'SELECT * FROM attendance WHERE class_id = ? AND user_id = ?',
      [punchData.class_id, userId]
    );

    if (!existingAttendance || !existingAttendance.punch_in) {
      throw new Error('User must punch in before punching out');
    }

    if (existingAttendance.punch_out) {
      throw new Error('User has already punched out for this class');
    }

    const now = new Date().toISOString();

    await this.db.run(
      'UPDATE attendance SET punch_out = ? WHERE class_id = ? AND user_id = ?',
      [now, punchData.class_id, userId]
    );

    const updatedAttendance = await this.db.get(
      'SELECT * FROM attendance WHERE class_id = ? AND user_id = ?',
      [punchData.class_id, userId]
    );

    return updatedAttendance;
  }

  async getAttendanceByClass(classId: number): Promise<Attendance[]> {
    return await this.db.all(
      'SELECT * FROM attendance WHERE class_id = ? ORDER BY created_at',
      [classId]
    );
  }

  async getAttendanceByUser(userId: number, startDate?: string, endDate?: string): Promise<AttendanceReport[]> {
    let query = `
      SELECT 
        a.user_id,
        u.alias as user_alias,
        u.role as user_role,
        a.class_id,
        c.start_time as scheduled_start,
        c.end_time as scheduled_end,
        a.punch_in as actual_punch_in,
        a.punch_out as actual_punch_out,
        c.meet_link
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      JOIN classes c ON a.class_id = c.class_id
      WHERE a.user_id = ?
    `;

    const params: any[] = [userId];

    if (startDate) {
      query += ' AND c.start_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND c.end_time <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY c.start_time';

    const results = await this.db.all(query, params);

    return results.map(this.mapToAttendanceReport);
  }

  async getAttendanceReport(
    userId?: number, 
    startDate?: string, 
    endDate?: string, 
    role?: 'teacher' | 'student'
  ): Promise<AttendanceReport[]> {
    let query = `
      SELECT 
        a.user_id,
        u.alias as user_alias,
        u.role as user_role,
        a.class_id,
        c.start_time as scheduled_start,
        c.end_time as scheduled_end,
        a.punch_in as actual_punch_in,
        a.punch_out as actual_punch_out,
        c.meet_link
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      JOIN classes c ON a.class_id = c.class_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userId) {
      query += ' AND a.user_id = ?';
      params.push(userId);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (startDate) {
      query += ' AND c.start_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND c.end_time <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY c.start_time, a.user_id';

    const results = await this.db.all(query, params);

    return results.map(this.mapToAttendanceReport);
  }

  async getCombinedAttendanceReport(classId: number): Promise<{
    class: any;
    teacher_attendance: AttendanceReport | null;
    student_attendance: AttendanceReport | null;
  }> {
    // Get class details
    const classRecord = await this.db.get(
      `SELECT 
        c.*,
        t.alias as teacher_alias,
        s.alias as student_alias
      FROM classes c
      JOIN users t ON c.teacher_id = t.user_id
      JOIN users s ON c.student_id = s.user_id
      WHERE c.class_id = ?`,
      [classId]
    );

    if (!classRecord) {
      throw new Error('Class not found');
    }

    // Get teacher attendance
    const teacherAttendance = await this.db.get(
      `SELECT 
        a.user_id,
        u.alias as user_alias,
        u.role as user_role,
        a.class_id,
        c.start_time as scheduled_start,
        c.end_time as scheduled_end,
        a.punch_in as actual_punch_in,
        a.punch_out as actual_punch_out,
        c.meet_link
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      JOIN classes c ON a.class_id = c.class_id
      WHERE a.class_id = ? AND a.user_id = ?`,
      [classId, classRecord.teacher_id]
    );

    // Get student attendance
    const studentAttendance = await this.db.get(
      `SELECT 
        a.user_id,
        u.alias as user_alias,
        u.role as user_role,
        a.class_id,
        c.start_time as scheduled_start,
        c.end_time as scheduled_end,
        a.punch_in as actual_punch_in,
        a.punch_out as actual_punch_out,
        c.meet_link
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      JOIN classes c ON a.class_id = c.class_id
      WHERE a.class_id = ? AND a.user_id = ?`,
      [classId, classRecord.student_id]
    );

    return {
      class: classRecord,
      teacher_attendance: teacherAttendance ? this.mapToAttendanceReport(teacherAttendance) : null,
      student_attendance: studentAttendance ? this.mapToAttendanceReport(studentAttendance) : null
    };
  }

  private mapToAttendanceReport(row: any): AttendanceReport {
    let attendanceStatus: 'on_time' | 'late' | 'absent' | 'partial' = 'absent';
    
    if (row.actual_punch_in && row.actual_punch_out) {
      const scheduledStart = new Date(row.scheduled_start);
      const actualPunchIn = new Date(row.actual_punch_in);
      const timeDiff = actualPunchIn.getTime() - scheduledStart.getTime();
      
      // Consider late if more than 5 minutes after scheduled start
      attendanceStatus = timeDiff > 5 * 60 * 1000 ? 'late' : 'on_time';
    } else if (row.actual_punch_in) {
      attendanceStatus = 'partial';
    }

    return {
      user_id: row.user_id,
      user_alias: row.user_alias,
      user_role: row.user_role,
      class_id: row.class_id,
      scheduled_start: row.scheduled_start,
      scheduled_end: row.scheduled_end,
      actual_punch_in: row.actual_punch_in,
      actual_punch_out: row.actual_punch_out,
      meet_link: row.meet_link,
      attendance_status: attendanceStatus
    };
  }

  async getAttendanceStats(userId: number, startDate?: string, endDate?: string): Promise<{
    total_classes: number;
    attended_classes: number;
    on_time_classes: number;
    late_classes: number;
    partial_classes: number;
    absent_classes: number;
    attendance_rate: number;
  }> {
    // Get total classes for user
    let totalQuery = `
      SELECT COUNT(*) as count 
      FROM classes 
      WHERE (teacher_id = ? OR student_id = ?)
    `;
    const totalParams = [userId, userId];

    if (startDate) {
      totalQuery += ' AND start_time >= ?';
      totalParams.push(startDate);
    }

    if (endDate) {
      totalQuery += ' AND end_time <= ?';
      totalParams.push(endDate);
    }

    const totalResult = await this.db.get(totalQuery, totalParams);
    const totalClasses = totalResult.count;

    // Get attendance statistics
    const reports = await this.getAttendanceByUser(userId, startDate, endDate);
    
    const attendedClasses = reports.length;
    const onTimeClasses = reports.filter(r => r.attendance_status === 'on_time').length;
    const lateClasses = reports.filter(r => r.attendance_status === 'late').length;
    const partialClasses = reports.filter(r => r.attendance_status === 'partial').length;
    const absentClasses = totalClasses - attendedClasses;
    const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

    return {
      total_classes: totalClasses,
      attended_classes: attendedClasses,
      on_time_classes: onTimeClasses,
      late_classes: lateClasses,
      partial_classes: partialClasses,
      absent_classes: absentClasses,
      attendance_rate: Math.round(attendanceRate * 100) / 100
    };
  }
}
