# MyScholar API - Complete Examples

This document provides comprehensive examples for all API endpoints and scenarios.

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [Class Management](#class-management)
- [Attendance System](#attendance-system)
- [Reports & Analytics](#reports--analytics)
- [Error Handling](#error-handling)
- [Testing Examples](#testing-examples)

## Authentication

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@myscholar.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "role": "admin",
      "alias": "System Admin",
      "email": "admin@myscholar.com"
    }
  }
}
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Management

### Create User (Admin only)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "teacher",
    "alias": "Dr. John Smith",
    "email": "john.smith@myscholar.com",
    "password": "securepassword123"
  }'
```

### Get All Users (Admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get User by ID
```bash
curl -X GET http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update User (Admin only)
```bash
curl -X PUT http://localhost:3000/api/v1/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "alias": "Dr. John Smith (Updated)",
    "email": "john.smith.updated@myscholar.com"
  }'
```

### Get Users by Role (Admin only)
```bash
curl -X GET http://localhost:3000/api/v1/users/role/teacher \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Class Management

### Create Class (Staff/Admin only)
```bash
curl -X POST http://localhost:3000/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN" \
  -d '{
    "teacher_id": 2,
    "student_id": 3,
    "start_time": "2024-01-20T10:00:00Z",
    "end_time": "2024-01-20T11:00:00Z",
    "meet_link": "https://meet.google.com/abc-defg-hij"
  }'
```

### Get All Classes (Staff/Admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/classes?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"
```

### Get Class by ID
```bash
curl -X GET http://localhost:3000/api/v1/classes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Class (Staff/Admin only)
```bash
curl -X PUT http://localhost:3000/api/v1/classes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN" \
  -d '{
    "meet_link": "https://meet.google.com/updated-link"
  }'
```

### Get Teacher Timetable
```bash
curl -X GET http://localhost:3000/api/v1/classes/teacher/2/timetable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Student Timetable
```bash
curl -X GET http://localhost:3000/api/v1/classes/student/3/timetable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get My Timetable (Teacher/Student)
```bash
curl -X GET http://localhost:3000/api/v1/classes/my/timetable \
  -H "Authorization: Bearer YOUR_TEACHER_OR_STUDENT_TOKEN"
```

## Attendance System

### Punch In (Teacher/Student)
```bash
curl -X POST http://localhost:3000/api/v1/attendance/punch-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_OR_STUDENT_TOKEN" \
  -d '{
    "class_id": 1
  }'
```

### Punch Out (Teacher/Student)
```bash
curl -X POST http://localhost:3000/api/v1/attendance/punch-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_OR_STUDENT_TOKEN" \
  -d '{
    "class_id": 1
  }'
```

### Get My Attendance Records
```bash
curl -X GET "http://localhost:3000/api/v1/attendance/my?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TEACHER_OR_STUDENT_TOKEN"
```

### Get My Attendance Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/attendance/my/stats?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TEACHER_OR_STUDENT_TOKEN"
```

### Get Attendance by Class
```bash
curl -X GET http://localhost:3000/api/v1/attendance/class/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Reports & Analytics

### Get Attendance Report (Admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/attendance/report?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Attendance Report by Role (Admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/attendance/report?role=teacher&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get User Attendance Statistics (Admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/attendance/stats/2?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Combined Class Report (Admin only)
```bash
curl -X GET http://localhost:3000/api/v1/attendance/report/combined/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Email must be a valid email address"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required roles: admin"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

## Testing Examples

### Run All Tests
```bash
# Run complete test suite
node scripts/run-all-tests.js

# Run specific test suite
node scripts/run-all-tests.js comprehensive
node scripts/run-all-tests.js edge
node scripts/run-all-tests.js business
```

### Run Individual Test Suites
```bash
# Comprehensive API tests
node scripts/comprehensive-test.js

# Edge case and security tests
node scripts/edge-case-tests.js

# Business logic tests
node scripts/business-logic-tests.js

# Setup demo data
node scripts/setup-demo-data.js
```

## Complete Workflow Example

Here's a complete workflow example showing how to use the API:

```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@myscholar.com", "password": "admin123"}' | \
  jq -r '.data.token')

# 2. Create a teacher
TEACHER_ID=$(curl -s -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "role": "teacher",
    "alias": "Dr. Jane Doe",
    "email": "jane.doe@myscholar.com",
    "password": "teacher123"
  }' | jq -r '.data.user_id')

# 3. Create a student
STUDENT_ID=$(curl -s -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "role": "student",
    "alias": "John Student",
    "email": "john.student@myscholar.com",
    "password": "student123"
  }' | jq -r '.data.user_id')

# 4. Create a staff member
STAFF_ID=$(curl -s -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "role": "staff",
    "alias": "Sarah Staff",
    "email": "sarah.staff@myscholar.com",
    "password": "staff123"
  }' | jq -r '.data.user_id')

# 5. Login as staff
STAFF_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah.staff@myscholar.com", "password": "staff123"}' | \
  jq -r '.data.token')

# 6. Create a class
CLASS_ID=$(curl -s -X POST http://localhost:3000/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{
    "teacher_id": '$TEACHER_ID',
    "student_id": '$STUDENT_ID',
    "start_time": "2024-01-20T10:00:00Z",
    "end_time": "2024-01-20T11:00:00Z",
    "meet_link": "https://meet.google.com/example-class"
  }' | jq -r '.data.class_id')

# 7. Login as teacher
TEACHER_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane.doe@myscholar.com", "password": "teacher123"}' | \
  jq -r '.data.token')

# 8. Login as student
STUDENT_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.student@myscholar.com", "password": "student123"}' | \
  jq -r '.data.token')

# 9. Teacher punches in
curl -X POST http://localhost:3000/api/v1/attendance/punch-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"class_id": '$CLASS_ID'}'

# 10. Student punches in
curl -X POST http://localhost:3000/api/v1/attendance/punch-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"class_id": '$CLASS_ID'}'

# 11. Teacher punches out
curl -X POST http://localhost:3000/api/v1/attendance/punch-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"class_id": '$CLASS_ID'}'

# 12. Student punches out
curl -X POST http://localhost:3000/api/v1/attendance/punch-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"class_id": '$CLASS_ID'}'

# 13. Get attendance report (admin)
curl -X GET "http://localhost:3000/api/v1/attendance/report?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Response**: 429 Too Many Requests when exceeded

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions per role
- **Input Validation**: Comprehensive validation using Joi
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers

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

This comprehensive API system provides all the functionality needed for educational management with proper security, validation, and testing coverage.
