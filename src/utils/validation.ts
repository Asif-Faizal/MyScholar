import Joi from 'joi';

export const schemas = {
  // User schemas
  createUser: Joi.object({
    role: Joi.string().valid('admin', 'staff', 'teacher', 'student').required(),
    alias: Joi.string().min(2).max(50).pattern(/^[a-zA-Z0-9\s\-\.]+$/).required()
      .messages({
        'string.pattern.base': 'Alias can only contain letters, numbers, spaces, hyphens, and dots'
      }),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  updateUser: Joi.object({
    role: Joi.string().valid('admin', 'staff', 'teacher', 'student').optional(),
    alias: Joi.string().min(2).max(50).pattern(/^[a-zA-Z0-9\s\-\.]+$/).optional()
      .messages({
        'string.pattern.base': 'Alias can only contain letters, numbers, spaces, hyphens, and dots'
      }),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Class schemas
  createClass: Joi.object({
    teacher_id: Joi.number().integer().positive().required(),
    student_id: Joi.number().integer().positive().required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
    meet_link: Joi.string().uri().optional()
  }),

  updateClass: Joi.object({
    teacher_id: Joi.number().integer().positive().optional(),
    student_id: Joi.number().integer().positive().optional(),
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().optional(),
    meet_link: Joi.string().uri().optional()
  }),

  // Attendance schemas
  punchIn: Joi.object({
    class_id: Joi.number().integer().positive().required()
  }),

  punchOut: Joi.object({
    class_id: Joi.number().integer().positive().required()
  }),

  // Query schemas
  userId: Joi.object({
    user_id: Joi.number().integer().positive().required()
  }),

  classId: Joi.object({
    class_id: Joi.number().integer().positive().required()
  }),

  attendanceQuery: Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
    role: Joi.string().valid('teacher', 'student').optional()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};
