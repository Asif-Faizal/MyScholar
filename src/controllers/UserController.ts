import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types';

export class UserController {
  private userService = new UserService();

  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserRequest = req.body;
      const createdBy = req.user!.user_id;
      
      const newUser = await this.userService.createUser(userData, createdBy);
      
      // Remove password hash from response
      const { password_hash, ...userResponse } = newUser;
      
      res.status(201).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.userService.getAllUsers(page, limit);
      
      // Remove password hashes from response
      const users = result.users.map(({ password_hash, ...user }) => user);
      
      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users'
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.user_id);
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Remove password hash from response
      const { password_hash, ...userResponse } = user;
      
      res.json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.user_id);
      const updateData: UpdateUserRequest = req.body;
      
      const updatedUser = await this.userService.updateUser(userId, updateData);
      
      // Remove password hash from response
      const { password_hash, ...userResponse } = updatedUser;
      
      res.json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.user_id);
      
      // Prevent admin from deleting themselves
      if (userId === req.user!.user_id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }
      
      await this.userService.deleteUser(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  }

  async getUsersByRole(req: Request, res: Response) {
    try {
      const role = req.params.role as 'admin' | 'staff' | 'teacher' | 'student';
      
      if (!['admin', 'staff', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }
      
      const users = await this.userService.getUsersByRole(role);
      
      // Remove password hashes from response
      const usersResponse = users.map(({ password_hash, ...user }) => user);
      
      res.json({
        success: true,
        data: usersResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users by role'
      });
    }
  }
}
