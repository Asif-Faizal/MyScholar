# MyScholar - Educational Management System

A comprehensive full-stack educational management system with role-based authentication, built with Next.js, TypeScript, and SQLite.

## Features

### 🔐 Role-Based Authentication
- **Admin**: Full system access, user management, attendance reports
- **Staff**: Class assignment, user management (limited)
- **Teacher**: Timetable view, punch in/out, Google Meet links
- **Student**: Timetable view, punch in/out, anonymous Meet access

### 📊 Core Functionality
- User management with role-based access control
- Class scheduling with conflict detection
- Attendance tracking with punch in/out
- Comprehensive reporting system
- Google Meet integration
- RESTful API with proper validation

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: SQLite with migrations
- **Authentication**: JWT tokens
- **Validation**: Joi
- **Security**: Input validation, XSS protection
- **Testing**: Custom test scripts

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env
```

### 2. Database Setup

```bash
# Run database migrations
npm run migrate
```

This will create:
- Database tables (users, classes, attendance)
- Default admin user: `admin@myscholar.com` / `admin123`

### 3. Start Development Server

```bash
# Start Next.js development server
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Access the Dashboard

1. Open `http://localhost:3000` in your browser
2. Login with demo credentials:
   - **Email**: admin@myscholar.com
   - **Password**: admin123
3. Explore the minimal dashboard with user and class management

### 4. Setup Demo Data (Optional)

```bash
# Run demo data setup script
node scripts/setup-demo-data.js
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### User Management (Admin only)
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:user_id` - Get user by ID
- `PUT /api/v1/users/:user_id` - Update user
- `DELETE /api/v1/users/:user_id` - Delete user
- `GET /api/v1/users/role/:role` - Get users by role

### Class Management (Staff/Admin)
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes` - Get all classes (paginated)
- `GET /api/v1/classes/:class_id` - Get class by ID
- `PUT /api/v1/classes/:class_id` - Update class
- `DELETE /api/v1/classes/:class_id` - Delete class

### Timetables
- `GET /api/v1/classes/teacher/:teacher_id/timetable` - Teacher timetable
- `GET /api/v1/classes/student/:student_id/timetable` - Student timetable
- `GET /api/v1/classes/my/timetable` - My timetable (teacher/student)

### Attendance
- `POST /api/v1/attendance/punch-in` - Punch in for class
- `POST /api/v1/attendance/punch-out` - Punch out from class
- `GET /api/v1/attendance/my` - My attendance records
- `GET /api/v1/attendance/my/stats` - My attendance statistics

### Reports (Admin)
- `GET /api/v1/attendance/report` - Attendance report with filters
- `GET /api/v1/attendance/report/combined/:class_id` - Combined class report
- `GET /api/v1/attendance/stats/:user_id` - User attendance statistics

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student')),
  alias TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Classes Table
```sql
CREATE TABLE classes (
  class_id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  meet_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id),
  FOREIGN KEY (student_id) REFERENCES users(user_id),
  FOREIGN KEY (staff_id) REFERENCES users(user_id)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  punch_in DATETIME,
  punch_out DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(class_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE(class_id, user_id)
);
```

## Example API Usage

### 1. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@myscholar.com", "password": "admin123"}'
```

### 2. Create User (Admin)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "role": "teacher",
    "alias": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create Class (Staff)
```bash
curl -X POST http://localhost:3000/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teacher_id": 2,
    "student_id": 3,
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "meet_link": "https://meet.google.com/abc-defg-hij"
  }'
```

### 4. Punch In (Teacher/Student)
```bash
curl -X POST http://localhost:3000/api/v1/attendance/punch-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"class_id": 1}'
```

## Testing

### Run API Tests
```bash
# Start the server first
npm run dev

# In another terminal, run tests
node scripts/test-api.js
```

### Run Demo Data Setup
```bash
node scripts/setup-demo-data.js
```

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database models
├── middleware/      # Authentication, validation
├── routes/          # API routes
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
├── migrations/      # Database migrations
└── index.ts         # Application entry point
```

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention

## Admin Reports Examples

### 1. Attendance Report by Date Range
```bash
curl "http://localhost:3000/api/v1/attendance/report?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. Teacher Attendance Statistics
```bash
curl "http://localhost:3000/api/v1/attendance/stats/2?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Combined Class Report
```bash
curl "http://localhost:3000/api/v1/attendance/report/combined/1" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
