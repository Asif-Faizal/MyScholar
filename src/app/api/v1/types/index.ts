export type UserRole = 'admin' | 'staff' | 'teacher' | 'student';

export interface User {
  user_id: number;
  role: UserRole;
  alias: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserRequest {
  role: UserRole;
  alias: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  role?: UserRole;
  alias?: string;
  email?: string;
  password?: string;
}

export interface Class {
  class_id: number;
  teacher_id: number;
  student_id: number;
  staff_id: number;
  start_time: string;
  end_time: string;
  meet_link: string | null;
  created_at: string;
}

export interface CreateClassRequest {
  teacher_id: number;
  student_id: number;
  start_time: string;
  end_time: string;
  meet_link?: string;
}

export interface UpdateClassRequest {
  teacher_id?: number;
  student_id?: number;
  start_time?: string;
  end_time?: string;
  meet_link?: string;
}

export interface Attendance {
  attendance_id: number;
  class_id: number;
  user_id: number;
  punch_in: string | null;
  punch_out: string | null;
}

export interface PunchInRequest {
  class_id: number;
}

export interface PunchOutRequest {
  class_id: number;
}

export interface AttendanceReport {
  user_id: number;
  user_alias: string;
  user_role: UserRole;
  class_id: number;
  scheduled_start: string;
  scheduled_end: string;
  actual_punch_in: string | null;
  actual_punch_out: string | null;
  meet_link: string | null;
  attendance_status: 'on_time' | 'late' | 'absent' | 'partial';
}

export interface TimetableEntry {
  class_id: number;
  teacher_id?: number;
  student_id?: number;
  teacher_alias?: string;
  student_alias?: string;
  start_time: string;
  end_time: string;
  meet_link: string | null;
  attendance_status?: 'on_time' | 'late' | 'absent' | 'partial';
}

export interface JwtPayload {
  user_id: number;
  role: UserRole;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    user_id: number;
    role: UserRole;
    alias: string;
    email: string;
  };
}
