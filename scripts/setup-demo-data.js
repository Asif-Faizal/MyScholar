const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Demo data
const demoUsers = [
  { role: 'staff', alias: 'Sarah Johnson', email: 'sarah.johnson@myscholar.com', password: 'staff123' },
  { role: 'teacher', alias: 'Dr. Michael Brown', email: 'michael.brown@myscholar.com', password: 'teacher123' },
  { role: 'teacher', alias: 'Prof. Emily Davis', email: 'emily.davis@myscholar.com', password: 'teacher123' },
  { role: 'student', alias: 'Alex Wilson', email: 'alex.wilson@myscholar.com', password: 'student123' },
  { role: 'student', alias: 'Maria Garcia', email: 'maria.garcia@myscholar.com', password: 'student123' },
  { role: 'student', alias: 'David Lee', email: 'david.lee@myscholar.com', password: 'student123' }
];

const demoClasses = [
  {
    teacher_id: 2, // Dr. Michael Brown
    student_id: 4, // Alex Wilson
    start_time: '2024-01-15T09:00:00Z',
    end_time: '2024-01-15T10:00:00Z',
    meet_link: 'https://meet.google.com/math-101-alex'
  },
  {
    teacher_id: 2, // Dr. Michael Brown
    student_id: 5, // Maria Garcia
    start_time: '2024-01-15T11:00:00Z',
    end_time: '2024-01-15T12:00:00Z',
    meet_link: 'https://meet.google.com/math-101-maria'
  },
  {
    teacher_id: 3, // Prof. Emily Davis
    student_id: 4, // Alex Wilson
    start_time: '2024-01-15T14:00:00Z',
    end_time: '2024-01-15T15:00:00Z',
    meet_link: 'https://meet.google.com/science-101-alex'
  },
  {
    teacher_id: 3, // Prof. Emily Davis
    student_id: 6, // David Lee
    start_time: '2024-01-15T16:00:00Z',
    end_time: '2024-01-15T17:00:00Z',
    meet_link: 'https://meet.google.com/science-101-david'
  }
];

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Setup demo data
const setupDemoData = async () => {
  console.log('🚀 Setting up MyScholar demo data...\n');
  
  try {
    // Login as admin
    const adminLogin = await apiRequest('POST', '/auth/login', {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });

    if (!adminLogin?.success) {
      console.error('❌ Failed to login as admin');
      return;
    }

    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Create demo users
    console.log('\n👥 Creating demo users...');
    for (const user of demoUsers) {
      const result = await apiRequest('POST', '/users', user, adminToken);
      if (result?.success) {
        console.log(`✅ Created ${user.role}: ${user.alias}`);
      }
    }

    // Login as staff to create classes
    const staffLogin = await apiRequest('POST', '/auth/login', {
      email: 'sarah.johnson@myscholar.com',
      password: 'staff123'
    });

    if (!staffLogin?.success) {
      console.error('❌ Failed to login as staff');
      return;
    }

    const staffToken = staffLogin.data.token;
    console.log('\n✅ Staff login successful');

    // Create demo classes
    console.log('\n📚 Creating demo classes...');
    for (const classData of demoClasses) {
      const result = await apiRequest('POST', '/classes', classData, staffToken);
      if (result?.success) {
        console.log(`✅ Created class for teacher ${classData.teacher_id} and student ${classData.student_id}`);
      }
    }

    console.log('\n✅ Demo data setup completed!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@myscholar.com / admin123');
    console.log('Staff: sarah.johnson@myscholar.com / staff123');
    console.log('Teacher: michael.brown@myscholar.com / teacher123');
    console.log('Teacher: emily.davis@myscholar.com / teacher123');
    console.log('Student: alex.wilson@myscholar.com / student123');
    console.log('Student: maria.garcia@myscholar.com / student123');
    console.log('Student: david.lee@myscholar.com / student123');

  } catch (error) {
    console.error('\n❌ Demo data setup failed:', error.message);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDemoData();
}

module.exports = { setupDemoData };
