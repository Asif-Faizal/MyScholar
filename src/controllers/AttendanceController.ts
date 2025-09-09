import { Request, Response } from 'express';
import { AttendanceService } from '../services/AttendanceService';
import { PunchInRequest, PunchOutRequest } from '../types';

export class AttendanceController {
  private attendanceService = new AttendanceService();

  async punchIn(req: Request, res: Response) {
    try {
      const userId = req.user!.user_id;
      const punchData: PunchInRequest = req.body;
      
      const attendance = await this.attendanceService.punchIn(userId, punchData);
      
      res.json({
        success: true,
        data: attendance,
        message: 'Punched in successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to punch in'
      });
    }
  }

  async punchOut(req: Request, res: Response) {
    try {
      const userId = req.user!.user_id;
      const punchData: PunchOutRequest = req.body;
      
      const attendance = await this.attendanceService.punchOut(userId, punchData);
      
      res.json({
        success: true,
        data: attendance,
        message: 'Punched out successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to punch out'
      });
    }
  }

  async getAttendanceByClass(req: Request, res: Response) {
    try {
      const classId = parseInt(req.params.class_id);
      
      const attendance = await this.attendanceService.getAttendanceByClass(classId);
      
      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get attendance'
      });
    }
  }

  async getMyAttendance(req: Request, res: Response) {
    try {
      const userId = req.user!.user_id;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      
      const attendance = await this.attendanceService.getAttendanceByUser(userId, startDate, endDate);
      
      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get attendance'
      });
    }
  }

  async getAttendanceReport(req: Request, res: Response) {
    try {
      const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      const role = req.query.role as 'teacher' | 'student';
      
      const reports = await this.attendanceService.getAttendanceReport(userId, startDate, endDate, role);
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get attendance report'
      });
    }
  }

  async getCombinedAttendanceReport(req: Request, res: Response) {
    try {
      const classId = parseInt(req.params.class_id);
      
      const report = await this.attendanceService.getCombinedAttendanceReport(classId);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get combined attendance report'
      });
    }
  }

  async getAttendanceStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.user_id);
      
      // Verify access - user can only see their own stats unless admin/staff
      if (req.user!.role !== 'admin' && req.user!.role !== 'staff' && req.user!.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      
      const stats = await this.attendanceService.getAttendanceStats(userId, startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get attendance stats'
      });
    }
  }

  async getMyAttendanceStats(req: Request, res: Response) {
    try {
      const userId = req.user!.user_id;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      
      const stats = await this.attendanceService.getAttendanceStats(userId, startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get attendance stats'
      });
    }
  }
}
