import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { schemas } from '../utils/validation';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validateRequest(schemas.login), authController.login.bind(authController));

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

export default router;
