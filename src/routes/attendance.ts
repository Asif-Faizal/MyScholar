import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authenticateToken, requireAdmin, requireTeacherOrStudent } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { schemas } from '../utils/validation';

const router = Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authenticateToken);

// Punch in/out routes (teachers and students)
router.post('/punch-in', requireTeacherOrStudent, validateRequest(schemas.punchIn), attendanceController.punchIn);
router.post('/punch-out', requireTeacherOrStudent, validateRequest(schemas.punchOut), attendanceController.punchOut);

// Personal attendance routes
router.get('/my', requireTeacherOrStudent, validateQuery(schemas.attendanceQuery), attendanceController.getMyAttendance);
router.get('/my/stats', requireTeacherOrStudent, validateQuery(schemas.attendanceQuery), attendanceController.getMyAttendanceStats);

// Admin and staff routes
router.get('/class/:class_id', validateParams(schemas.classId), attendanceController.getAttendanceByClass);
router.get('/report', requireAdmin, validateQuery(schemas.attendanceQuery), attendanceController.getAttendanceReport);
router.get('/report/combined/:class_id', requireAdmin, validateParams(schemas.classId), attendanceController.getCombinedAttendanceReport);
router.get('/stats/:user_id', validateParams(schemas.userId), validateQuery(schemas.attendanceQuery), attendanceController.getAttendanceStats);

export default router;
