import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { schemas } from '../utils/validation';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validateRequest(schemas.login), authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
