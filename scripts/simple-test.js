const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Simple test to verify core functionality
const runSimpleTest = async () => {
  console.log('🧪 Running Simple MyScholar API Test');
  console.log('=' * 40);
  
  let passed = 0;
  let failed = 0;
  
  const test = async (name, testFn) => {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };
  
  // Test 1: Health check
  await test('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    if (!response.data.success) throw new Error('Health check failed');
  });
  
  // Test 2: Admin login
  let adminToken;
  await test('Admin Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    if (!response.data.success) throw new Error('Admin login failed');
    adminToken = response.data.data.token;
  });
  
  // Test 3: Create a unique teacher
  let teacherId, teacherEmail;
  await test('Create Teacher', async () => {
    const timestamp = Date.now();
    teacherEmail = `test.teacher.${timestamp}@myscholar.com`;
    const response = await axios.post(`${BASE_URL}/users`, {
      role: 'teacher',
      alias: `Test Teacher ${timestamp}`,
      email: teacherEmail,
      password: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to create teacher');
    teacherId = response.data.data.user_id;
  });
  
  // Test 4: Create a unique student
  let studentId, studentEmail;
  await test('Create Student', async () => {
    const timestamp = Date.now();
    studentEmail = `test.student.${timestamp}@myscholar.com`;
    const response = await axios.post(`${BASE_URL}/users`, {
      role: 'student',
      alias: `Test Student ${timestamp}`,
      email: studentEmail,
      password: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to create student');
    studentId = response.data.data.user_id;
  });
  
  // Test 5: Create a unique staff member
  let staffId, staffEmail;
  await test('Create Staff', async () => {
    const timestamp = Date.now();
    staffEmail = `test.staff.${timestamp}@myscholar.com`;
    const response = await axios.post(`${BASE_URL}/users`, {
      role: 'staff',
      alias: `Test Staff ${timestamp}`,
      email: staffEmail,
      password: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to create staff');
    staffId = response.data.data.user_id;
  });
  
  // Test 6: Staff login
  let staffToken;
  await test('Staff Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: staffEmail,
      password: 'test123'
    });
    if (!response.data.success) throw new Error('Staff login failed');
    staffToken = response.data.data.token;
  });
  
  // Test 7: Create a class
  let classId;
  await test('Create Class', async () => {
    const response = await axios.post(`${BASE_URL}/classes`, {
      teacher_id: teacherId,
      student_id: studentId,
      start_time: '2024-01-20T10:00:00Z',
      end_time: '2024-01-20T11:00:00Z',
      meet_link: 'https://meet.google.com/test-class'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to create class');
    classId = response.data.data.class_id;
  });
  
  // Test 8: Teacher login
  let teacherToken;
  await test('Teacher Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: teacherEmail,
      password: 'test123'
    });
    if (!response.data.success) throw new Error('Teacher login failed');
    teacherToken = response.data.data.token;
  });
  
  // Test 9: Student login
  let studentToken;
  await test('Student Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: studentEmail,
      password: 'test123'
    });
    if (!response.data.success) throw new Error('Student login failed');
    studentToken = response.data.data.token;
  });
  
  // Test 10: Teacher punch in
  await test('Teacher Punch In', async () => {
    const response = await axios.post(`${BASE_URL}/attendance/punch-in`, {
      class_id: classId
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!response.data.success) throw new Error('Teacher punch in failed');
  });
  
  // Test 11: Student punch in
  await test('Student Punch In', async () => {
    const response = await axios.post(`${BASE_URL}/attendance/punch-in`, {
      class_id: classId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!response.data.success) throw new Error('Student punch in failed');
  });
  
  // Test 12: Teacher punch out
  await test('Teacher Punch Out', async () => {
    const response = await axios.post(`${BASE_URL}/attendance/punch-out`, {
      class_id: classId
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!response.data.success) throw new Error('Teacher punch out failed');
  });
  
  // Test 13: Student punch out
  await test('Student Punch Out', async () => {
    const response = await axios.post(`${BASE_URL}/attendance/punch-out`, {
      class_id: classId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!response.data.success) throw new Error('Student punch out failed');
  });
  
  // Test 14: Get attendance report
  await test('Get Attendance Report', async () => {
    const response = await axios.get(`${BASE_URL}/attendance/report`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get attendance report');
  });
  
  // Test 15: Get teacher timetable
  await test('Get Teacher Timetable', async () => {
    const response = await axios.get(`${BASE_URL}/classes/teacher/${teacherId}/timetable`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get teacher timetable');
  });
  
  // Test 16: Get student timetable
  await test('Get Student Timetable', async () => {
    const response = await axios.get(`${BASE_URL}/classes/student/${studentId}/timetable`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get student timetable');
  });
  
  // Test 17: Get my timetable (teacher)
  await test('Get My Timetable (Teacher)', async () => {
    const response = await axios.get(`${BASE_URL}/classes/my/timetable`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get my timetable (teacher)');
  });
  
  // Test 18: Get my timetable (student)
  await test('Get My Timetable (Student)', async () => {
    const response = await axios.get(`${BASE_URL}/classes/my/timetable`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get my timetable (student)');
  });
  
  // Test 19: Get my attendance
  await test('Get My Attendance', async () => {
    const response = await axios.get(`${BASE_URL}/attendance/my`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get my attendance');
  });
  
  // Test 20: Get my attendance stats
  await test('Get My Attendance Stats', async () => {
    const response = await axios.get(`${BASE_URL}/attendance/my/stats`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!response.data.success) throw new Error('Failed to get my attendance stats');
  });
  
  console.log('\n' + '=' * 40);
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The MyScholar API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  return { passed, failed, total: passed + failed };
};

// Run the test
if (require.main === module) {
  runSimpleTest().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}

module.exports = { runSimpleTest };
