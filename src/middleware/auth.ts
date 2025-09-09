import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { UserRole } from '../types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        role: UserRole;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    const payload = AuthUtils.verifyToken(token);
    
    req.user = {
      user_id: payload.user_id,
      role: payload.role,
      email: payload.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: error instanceof Error ? error.message : 'Invalid token' 
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireStaff = requireRole(['staff']);
export const requireTeacher = requireRole(['teacher']);
export const requireStudent = requireRole(['student']);
export const requireStaffOrAdmin = requireRole(['staff', 'admin']);
export const requireTeacherOrStudent = requireRole(['teacher', 'student']);
