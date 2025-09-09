const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3
};

// Test data
const testData = {
  admin: { email: 'admin@myscholar.com', password: 'admin123' },
  users: {
    staff: { role: 'staff', alias: 'Test Staff', email: 'test.staff@myscholar.com', password: 'test123' },
    teacher: { role: 'teacher', alias: 'Test Teacher', email: 'test.teacher@myscholar.com', password: 'test123' },
    student: { role: 'student', alias: 'Test Student', email: 'test.student@myscholar.com', password: 'test123' }
  },
  classes: [
    {
      teacher_id: null, // Will be set dynamically
      student_id: null, // Will be set dynamically
      start_time: '2024-01-20T10:00:00Z',
      end_time: '2024-01-20T11:00:00Z',
      meet_link: 'https://meet.google.com/test-class-1'
    },
    {
      teacher_id: null, // Will be set dynamically
      student_id: null, // Will be set dynamically
      start_time: '2024-01-20T14:00:00Z',
      end_time: '2024-01-20T15:00:00Z',
      meet_link: 'https://meet.google.com/test-class-2'
    }
  ]
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const apiRequest = async (method, endpoint, data = null, token = null, expectedStatus = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      timeout: TEST_CONFIG.timeout,
      ...(data && { data })
    };

    const response = await axios(config);
    
    if (expectedStatus && response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    return { 
      success: false, 
      error: errorData, 
      status: error.response?.status || 0,
      message: error.message 
    };
  }
};

const runTest = async (testName, testFunction) => {
  testResults.total++;
  log(`Running test: ${testName}`, 'info');
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED' });
    log(`Test passed: ${testName}`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    log(`Test failed: ${testName} - ${error.message}`, 'error');
  }
};

// Authentication Tests
const testAuthentication = async () => {
  const tokens = {};
  
  // Test admin login
  const adminLogin = await apiRequest('POST', '/auth/login', testData.admin);
  if (!adminLogin.success) throw new Error('Admin login failed');
  tokens.admin = adminLogin.data.data.token;
  
  // Test invalid login
  const invalidLogin = await apiRequest('POST', '/auth/login', { email: 'invalid@test.com', password: 'wrong' });
  if (invalidLogin.success) throw new Error('Invalid login should fail');
  
  // Test profile access
  const profile = await apiRequest('GET', '/auth/profile', null, tokens.admin);
  if (!profile.success) throw new Error('Profile access failed');
  
  // Test invalid token
  const invalidToken = await apiRequest('GET', '/auth/profile', null, 'invalid-token');
  if (invalidToken.success) throw new Error('Invalid token should fail');
  
  return tokens;
};

// User Management Tests
const testUserManagement = async (adminToken) => {
  const createdUsers = {};
  
  // Test create users
  for (const [role, userData] of Object.entries(testData.users)) {
    const result = await apiRequest('POST', '/users', userData, adminToken);
    if (!result.success) throw new Error(`Failed to create ${role}: ${result.error.error || result.error.message}`);
    createdUsers[role] = result.data.data;
  }
  
  // Test get all users
  const allUsers = await apiRequest('GET', '/users', null, adminToken);
  if (!allUsers.success) throw new Error('Failed to get all users');
  
  // Test get user by ID
  const userById = await apiRequest('GET', `/users/${createdUsers.teacher.user_id}`, null, adminToken);
  if (!userById.success) throw new Error('Failed to get user by ID');
  
  // Test get users by role
  const teachers = await apiRequest('GET', '/users/role/teacher', null, adminToken);
  if (!teachers.success) throw new Error('Failed to get users by role');
  
  // Test update user
  const updateData = { alias: 'Updated Teacher Name' };
  const updatedUser = await apiRequest('PUT', `/users/${createdUsers.teacher.user_id}`, updateData, adminToken);
  if (!updatedUser.success) throw new Error('Failed to update user');
  
  // Test unauthorized access (non-admin trying to create user)
  const staffLogin = await apiRequest('POST', '/auth/login', { email: createdUsers.staff.email, password: 'test123' });
  if (!staffLogin.success) throw new Error('Staff login failed');
  
  const unauthorizedCreate = await apiRequest('POST', '/users', testData.users.teacher, staffLogin.data.data.token);
  if (unauthorizedCreate.success) throw new Error('Non-admin should not be able to create users');
  
  return { createdUsers, staffToken: staffLogin.data.data.token };
};

// Class Management Tests
const testClassManagement = async (staffToken, createdUsers) => {
  const createdClasses = [];
  
  // Update test data with actual user IDs
  testData.classes[0].teacher_id = createdUsers.teacher.user_id;
  testData.classes[0].student_id = createdUsers.student.user_id;
  testData.classes[1].teacher_id = createdUsers.teacher.user_id;
  testData.classes[1].student_id = createdUsers.student.user_id;
  
  // Test create classes
  for (const classData of testData.classes) {
    const result = await apiRequest('POST', '/classes', classData, staffToken);
    if (!result.success) throw new Error(`Failed to create class: ${result.error.error || result.error.message}`);
    createdClasses.push(result.data.data);
  }
  
  // Test get all classes
  const allClasses = await apiRequest('GET', '/classes', null, staffToken);
  if (!allClasses.success) throw new Error('Failed to get all classes');
  
  // Test get class by ID
  const classById = await apiRequest('GET', `/classes/${createdClasses[0].class_id}`, null, staffToken);
  if (!classById.success) throw new Error('Failed to get class by ID');
  
  // Test update class
  const updateData = { meet_link: 'https://meet.google.com/updated-link' };
  const updatedClass = await apiRequest('PUT', `/classes/${createdClasses[0].class_id}`, updateData, staffToken);
  if (!updatedClass.success) throw new Error('Failed to update class');
  
  // Test unauthorized access (teacher trying to create class)
  const teacherLogin = await apiRequest('POST', '/auth/login', { email: createdUsers.teacher.email, password: 'test123' });
  if (!teacherLogin.success) throw new Error('Teacher login failed');
  
  const unauthorizedCreate = await apiRequest('POST', '/classes', testData.classes[0], teacherLogin.data.data.token);
  if (unauthorizedCreate.success) throw new Error('Teacher should not be able to create classes');
  
  return { createdClasses, teacherToken: teacherLogin.data.data.token };
};

// Timetable Tests
const testTimetables = async (tokens, createdUsers, createdClasses) => {
  // Test teacher timetable
  const teacherTimetable = await apiRequest('GET', `/classes/teacher/${createdUsers.teacher.user_id}/timetable`, null, tokens.admin);
  if (!teacherTimetable.success) throw new Error('Failed to get teacher timetable');
  
  // Test student timetable
  const studentTimetable = await apiRequest('GET', `/classes/student/${createdUsers.student.user_id}/timetable`, null, tokens.admin);
  if (!studentTimetable.success) throw new Error('Failed to get student timetable');
  
  // Test my timetable (teacher)
  const teacherLogin = await apiRequest('POST', '/auth/login', { email: createdUsers.teacher.email, password: 'test123' });
  if (!teacherLogin.success) throw new Error('Teacher login failed');
  
  const myTimetableTeacher = await apiRequest('GET', '/classes/my/timetable', null, teacherLogin.data.data.token);
  if (!myTimetableTeacher.success) throw new Error('Failed to get my timetable (teacher)');
  
  // Test my timetable (student)
  const studentLogin = await apiRequest('POST', '/auth/login', { email: createdUsers.student.email, password: 'test123' });
  if (!studentLogin.success) throw new Error('Student login failed');
  
  const myTimetableStudent = await apiRequest('GET', '/classes/my/timetable', null, studentLogin.data.data.token);
  if (!myTimetableStudent.success) throw new Error('Failed to get my timetable (student)');
  
  return { 
    studentToken: studentLogin.data.data.token,
    teacherToken: teacherLogin.data.data.token
  };
};

// Attendance Tests
const testAttendance = async (tokens, createdClasses) => {
  const classId = createdClasses[0].class_id;
  
  // Test teacher punch in
  const teacherPunchIn = await apiRequest('POST', '/attendance/punch-in', { class_id: classId }, tokens.teacherToken);
  if (!teacherPunchIn.success) throw new Error('Teacher punch in failed');
  
  // Test student punch in
  const studentPunchIn = await apiRequest('POST', '/attendance/punch-in', { class_id: classId }, tokens.studentToken);
  if (!studentPunchIn.success) throw new Error('Student punch in failed');
  
  // Test duplicate punch in (should fail)
  const duplicatePunchIn = await apiRequest('POST', '/attendance/punch-in', { class_id: classId }, tokens.teacherToken);
  if (duplicatePunchIn.success) throw new Error('Duplicate punch in should fail');
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test teacher punch out
  const teacherPunchOut = await apiRequest('POST', '/attendance/punch-out', { class_id: classId }, tokens.teacherToken);
  if (!teacherPunchOut.success) throw new Error('Teacher punch out failed');
  
  // Test student punch out
  const studentPunchOut = await apiRequest('POST', '/attendance/punch-out', { class_id: classId }, tokens.studentToken);
  if (!studentPunchOut.success) throw new Error('Student punch out failed');
  
  // Test punch out without punch in (should fail)
  const punchOutWithoutIn = await apiRequest('POST', '/attendance/punch-out', { class_id: createdClasses[1].class_id }, tokens.teacherToken);
  if (punchOutWithoutIn.success) throw new Error('Punch out without punch in should fail');
  
  // Test my attendance
  const myAttendance = await apiRequest('GET', '/attendance/my', null, tokens.teacherToken);
  if (!myAttendance.success) throw new Error('Failed to get my attendance');
  
  // Test my attendance stats
  const myStats = await apiRequest('GET', '/attendance/my/stats', null, tokens.teacherToken);
  if (!myStats.success) throw new Error('Failed to get my attendance stats');
};

// Reports Tests
const testReports = async (adminToken, createdUsers) => {
  // Test attendance report
  const attendanceReport = await apiRequest('GET', '/attendance/report?start_date=2024-01-01&end_date=2024-12-31', null, adminToken);
  if (!attendanceReport.success) throw new Error('Failed to get attendance report');
  
  // Test attendance report with role filter
  const teacherReport = await apiRequest('GET', '/attendance/report?role=teacher&start_date=2024-01-01&end_date=2024-12-31', null, adminToken);
  if (!teacherReport.success) throw new Error('Failed to get teacher attendance report');
  
  // Test user attendance stats
  const userStats = await apiRequest('GET', `/attendance/stats/${createdUsers.teacher.user_id}`, null, adminToken);
  if (!userStats.success) throw new Error('Failed to get user attendance stats');
  
  // Test combined attendance report
  const combinedReport = await apiRequest('GET', '/attendance/report/combined/1', null, adminToken);
  if (!combinedReport.success) throw new Error('Failed to get combined attendance report');
  
  // Test unauthorized access (teacher trying to access reports)
  const teacherLogin = await apiRequest('POST', '/auth/login', { email: createdUsers.teacher.email, password: 'test123' });
  if (!teacherLogin.success) throw new Error('Teacher login failed');
  
  const unauthorizedReport = await apiRequest('GET', '/attendance/report', null, teacherLogin.data.data.token);
  if (unauthorizedReport.success) throw new Error('Teacher should not be able to access reports');
};

// Validation Tests
const testValidation = async (adminToken) => {
  // Test invalid user creation
  const invalidUser = await apiRequest('POST', '/users', { role: 'invalid', alias: '', email: 'invalid-email' }, adminToken);
  if (invalidUser.success) throw new Error('Invalid user creation should fail');
  
  // Test invalid class creation
  const invalidClass = await apiRequest('POST', '/classes', { teacher_id: 999, student_id: 999, start_time: 'invalid' }, adminToken);
  if (invalidClass.success) throw new Error('Invalid class creation should fail');
  
  // Test invalid attendance
  const invalidAttendance = await apiRequest('POST', '/attendance/punch-in', { class_id: 'invalid' }, adminToken);
  if (invalidAttendance.success) throw new Error('Invalid attendance should fail');
};

// Error Handling Tests
const testErrorHandling = async () => {
  // Test 404 endpoints
  const notFound = await apiRequest('GET', '/nonexistent-endpoint');
  if (notFound.success) throw new Error('Non-existent endpoint should return 404');
  
  // Test invalid JSON
  try {
    await axios.post(`${BASE_URL}/auth/login`, 'invalid json', {
      headers: { 'Content-Type': 'application/json' }
    });
    throw new Error('Invalid JSON should fail');
  } catch (error) {
    if (error.response?.status !== 400) {
      throw new Error('Invalid JSON should return 400');
    }
  }
};

// Performance Tests
const testPerformance = async (adminToken) => {
  const startTime = Date.now();
  
  // Test multiple concurrent requests
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(apiRequest('GET', '/users', null, adminToken));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const failedRequests = results.filter(r => !r.success);
  if (failedRequests.length > 0) {
    throw new Error(`${failedRequests.length} concurrent requests failed`);
  }
  
  const duration = endTime - startTime;
  if (duration > 5000) {
    throw new Error(`Performance test took too long: ${duration}ms`);
  }
  
  log(`Performance test completed in ${duration}ms`, 'success');
};

// Main test runner
const runComprehensiveTests = async () => {
  log('🚀 Starting Comprehensive MyScholar API Tests', 'info');
  log('=' * 60, 'info');
  
  try {
    // Authentication Tests
    await runTest('Authentication System', async () => {
      const tokens = await testAuthentication();
      global.testTokens = tokens;
    });
    
    // User Management Tests
    await runTest('User Management', async () => {
      const userResults = await testUserManagement(global.testTokens.admin);
      global.testData = userResults;
    });
    
    // Class Management Tests
    await runTest('Class Management', async () => {
      const classResults = await testClassManagement(global.testData.staffToken, global.testData.createdUsers);
      global.testData = { ...global.testData, ...classResults };
    });
    
    // Timetable Tests
    await runTest('Timetable System', async () => {
      const timetableResults = await testTimetables(global.testTokens, global.testData.createdUsers, global.testData.createdClasses);
      global.testTokens = { ...global.testTokens, ...timetableResults };
    });
    
    // Attendance Tests
    await runTest('Attendance System', async () => {
      await testAttendance(global.testTokens, global.testData.createdClasses);
    });
    
    // Reports Tests
    await runTest('Reporting System', async () => {
      await testReports(global.testTokens.admin, global.testData.createdUsers);
    });
    
    // Validation Tests
    await runTest('Input Validation', async () => {
      await testValidation(global.testTokens.admin);
    });
    
    // Error Handling Tests
    await runTest('Error Handling', async () => {
      await testErrorHandling();
    });
    
    // Performance Tests
    await runTest('Performance', async () => {
      await testPerformance(global.testTokens.admin);
    });
    
  } catch (error) {
    log(`Critical error in test suite: ${error.message}`, 'error');
  }
  
  // Print results
  log('=' * 60, 'info');
  log('📊 Test Results Summary', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`, 'info');
  
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.details.filter(t => t.status === 'FAILED').forEach(test => {
      log(`  - ${test.name}: ${test.error}`, 'error');
    });
  }
  
  log('\n✅ Comprehensive testing completed!', 'success');
  
  return testResults;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}

module.exports = { runComprehensiveTests, apiRequest, testResults };
