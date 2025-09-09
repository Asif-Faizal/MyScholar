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
router.post('/punch-in', requireTeacherOrStudent, validateRequest(schemas.punchIn), attendanceController.punchIn.bind(attendanceController));
router.post('/punch-out', requireTeacherOrStudent, validateRequest(schemas.punchOut), attendanceController.punchOut.bind(attendanceController));

// Personal attendance routes
router.get('/my', requireTeacherOrStudent, validateQuery(schemas.attendanceQuery), attendanceController.getMyAttendance.bind(attendanceController));
router.get('/my/stats', requireTeacherOrStudent, validateQuery(schemas.attendanceQuery), attendanceController.getMyAttendanceStats.bind(attendanceController));

// Admin and staff routes
router.get('/class/:class_id', validateParams(schemas.classId), attendanceController.getAttendanceByClass.bind(attendanceController));
router.get('/report', requireAdmin, validateQuery(schemas.attendanceQuery), attendanceController.getAttendanceReport.bind(attendanceController));
router.get('/report/combined/:class_id', requireAdmin, validateParams(schemas.classId), attendanceController.getCombinedAttendanceReport.bind(attendanceController));
router.get('/stats/:user_id', validateParams(schemas.userId), validateQuery(schemas.attendanceQuery), attendanceController.getAttendanceStats.bind(attendanceController));

export default router;
