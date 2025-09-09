import { Request, Response } from 'express';
import { ClassService } from '../services/ClassService';
import { CreateClassRequest, UpdateClassRequest } from '../types';

export class ClassController {
  private classService = new ClassService();

  async createClass(req: Request, res: Response): Promise<void> {
    try {
      const classData: CreateClassRequest = req.body;
      const staffId = req.user!.user_id;
      
      const newClass = await this.classService.createClass(classData, staffId);
      
      res.status(201).json({
        success: true,
        data: newClass
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create class'
      });
    }
  }

  async getAllClasses(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.classService.getAllClasses(page, limit);
      
      res.json({
        success: true,
        data: {
          classes: result.classes,
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
        error: error instanceof Error ? error.message : 'Failed to get classes'
      });
    }
  }

  async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const classId = parseInt(req.params.class_id);
      const classRecord = await this.classService.getClassById(classId);
      
      if (!classRecord) {
        res.status(404).json({
          success: false,
          error: 'Class not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: classRecord
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get class'
      });
    }
  }

  async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const classId = parseInt(req.params.class_id);
      const updateData: UpdateClassRequest = req.body;
      
      const updatedClass = await this.classService.updateClass(classId, updateData);
      
      res.json({
        success: true,
        data: updatedClass
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update class'
      });
    }
  }

  async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const classId = parseInt(req.params.class_id);
      
      await this.classService.deleteClass(classId);
      
      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete class'
      });
    }
  }

  async getTeacherTimetable(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = parseInt(req.params.teacher_id);
      
      // Verify the requesting user is the teacher or has admin/staff access
      if (req.user!.role !== 'admin' && req.user!.role !== 'staff' && req.user!.user_id !== teacherId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }
      
      const timetable = await this.classService.getTeacherTimetable(teacherId);
      
      res.json({
        success: true,
        data: timetable
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get teacher timetable'
      });
    }
  }

  async getStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.student_id);
      
      // Verify the requesting user is the student or has admin/staff access
      if (req.user!.role !== 'admin' && req.user!.role !== 'staff' && req.user!.user_id !== studentId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }
      
      const timetable = await this.classService.getStudentTimetable(studentId);
      
      res.json({
        success: true,
        data: timetable
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get student timetable'
      });
    }
  }

  async getMyTimetable(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.user_id;
      const userRole = req.user!.role;
      
      let timetable;
      if (userRole === 'teacher') {
        timetable = await this.classService.getTeacherTimetable(userId);
      } else if (userRole === 'student') {
        timetable = await this.classService.getStudentTimetable(userId);
      } else {
        res.status(400).json({
          success: false,
          error: 'Timetable not available for this role'
        });
        return;
      }
      
      res.json({
        success: true,
        data: timetable
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get timetable'
      });
    }
  }
}
