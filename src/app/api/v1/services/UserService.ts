import Database from '../models/Database';
import { AuthUtils } from '../utils/auth';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, LoginRequest, AuthResponse } from '../types';

export class UserService {
  private db = Database.getInstance();

  async createUser(userData: CreateUserRequest, createdBy: number): Promise<User> {
    // Check if email already exists
    const existingUser = await this.db.get(
      'SELECT user_id FROM users WHERE email = ?',
      [userData.email]
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(userData.password);

    // Insert user
    const result = await this.db.run(
      'INSERT INTO users (role, alias, email, password_hash) VALUES (?, ?, ?, ?)',
      [userData.role, userData.alias, userData.email, passwordHash]
    );

    const newUser = await this.db.get(
      'SELECT * FROM users WHERE user_id = ?',
      [result.lastID]
    );

    return newUser;
  }

  async getUserById(userId: number): Promise<User | null> {
    return await this.db.get(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    const users = await this.db.all(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const totalResult = await this.db.get('SELECT COUNT(*) as count FROM users');
    const total = totalResult.count;

    return { users, total };
  }

  async updateUser(userId: number, updateData: UpdateUserRequest): Promise<User> {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.role !== undefined) {
      updates.push('role = ?');
      values.push(updateData.role);
    }

    if (updateData.alias !== undefined) {
      updates.push('alias = ?');
      values.push(updateData.alias);
    }

    if (updateData.email !== undefined) {
      // Check if email is already taken by another user
      const emailExists = await this.db.get(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [updateData.email, userId]
      );
      if (emailExists) {
        throw new Error('Email already taken by another user');
      }
      updates.push('email = ?');
      values.push(updateData.email);
    }

    if (updateData.password !== undefined) {
      const passwordHash = await AuthUtils.hashPassword(updateData.password);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return existingUser;
    }

    values.push(userId);
    await this.db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return await this.getUserById(userId) as User;
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has any classes or attendance records
    const classCount = await this.db.get(
      'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ? OR student_id = ?',
      [userId, userId]
    );

    const attendanceCount = await this.db.get(
      'SELECT COUNT(*) as count FROM attendance WHERE user_id = ?',
      [userId]
    );

    if (classCount.count > 0 || attendanceCount.count > 0) {
      throw new Error('Cannot delete user with existing classes or attendance records');
    }

    await this.db.run('DELETE FROM users WHERE user_id = ?', [userId]);
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const user = await this.getUserByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await AuthUtils.comparePassword(loginData.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = AuthUtils.generateToken({
      user_id: user.user_id,
      role: user.role,
      email: user.email
    });

    return {
      token,
      user: {
        user_id: user.user_id,
        role: user.role,
        alias: user.alias,
        email: user.email
      }
    };
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.db.all(
      'SELECT * FROM users WHERE role = ? ORDER BY alias',
      [role]
    );
  }
}
