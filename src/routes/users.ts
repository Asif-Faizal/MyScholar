import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { schemas } from '../utils/validation';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', requireAdmin, validateRequest(schemas.createUser), userController.createUser);
router.get('/', requireAdmin, validateQuery(schemas.pagination), userController.getAllUsers);
router.get('/role/:role', requireAdmin, userController.getUsersByRole);
router.put('/:user_id', requireAdmin, validateParams(schemas.userId), validateRequest(schemas.updateUser), userController.updateUser);
router.delete('/:user_id', requireAdmin, validateParams(schemas.userId), userController.deleteUser);

// Admin and user can access their own profile
router.get('/:user_id', validateParams(schemas.userId), userController.getUserById);

export default router;
