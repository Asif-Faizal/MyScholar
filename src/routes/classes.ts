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
router.post('/', requireStaffOrAdmin, validateRequest(schemas.createClass), classController.createClass.bind(classController));
router.get('/', requireStaffOrAdmin, validateQuery(schemas.pagination), classController.getAllClasses.bind(classController));
router.get('/:class_id', validateParams(schemas.classId), classController.getClassById.bind(classController));
router.put('/:class_id', requireStaffOrAdmin, validateParams(schemas.classId), validateRequest(schemas.updateClass), classController.updateClass.bind(classController));
router.delete('/:class_id', requireStaffOrAdmin, validateParams(schemas.classId), classController.deleteClass.bind(classController));

// Timetable routes
router.get('/teacher/:teacher_id/timetable', classController.getTeacherTimetable.bind(classController));
router.get('/student/:student_id/timetable', classController.getStudentTimetable.bind(classController));
router.get('/my/timetable', requireTeacherOrStudent, classController.getMyTimetable.bind(classController));

export default router;
