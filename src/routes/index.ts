import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import classRoutes from './classes';
import attendanceRoutes from './attendance';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MyScholar API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
