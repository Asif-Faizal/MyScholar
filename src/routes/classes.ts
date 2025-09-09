import { Router } from 'express';
import { ClassController } from '../controllers/ClassController';
import { authenticateToken, requireStaffOrAdmin, requireTeacherOrStudent } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { schemas } from '../utils/validation';

const router = Router();
const classController = new ClassController();

// All class routes require authentication
router.use(authenticateToken);

// Staff and Admin routes
router.post('/', requireStaffOrAdmin, validateRequest(schemas.createClass), classController.createClass);
router.get('/', requireStaffOrAdmin, validateQuery(schemas.pagination), classController.getAllClasses);
router.get('/:class_id', validateParams(schemas.classId), classController.getClassById);
router.put('/:class_id', requireStaffOrAdmin, validateParams(schemas.classId), validateRequest(schemas.updateClass), classController.updateClass);
router.delete('/:class_id', requireStaffOrAdmin, validateParams(schemas.classId), classController.deleteClass);

// Timetable routes
router.get('/teacher/:teacher_id/timetable', classController.getTeacherTimetable);
router.get('/student/:student_id/timetable', classController.getStudentTimetable);
router.get('/my/timetable', requireTeacherOrStudent, classController.getMyTimetable);

export default router;
