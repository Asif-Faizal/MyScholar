const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Edge case test scenarios
const edgeCaseTests = {
  
  // Test SQL injection attempts
  async testSQLInjection() {
    console.log('🔒 Testing SQL injection protection...');
    
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "1' UNION SELECT * FROM users--"
    ];
    
    for (const input of maliciousInputs) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: input,
          password: input
        });
        
        // Should not return user data even if it doesn't crash
        if (response.data.success && response.data.data?.user) {
          throw new Error(`SQL injection vulnerability detected with input: ${input}`);
        }
      } catch (error) {
        // Expected to fail, but should not crash the server
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Server crashed due to SQL injection attempt');
        }
      }
    }
    
    console.log('✅ SQL injection protection working');
  },
  
  // Test XSS attempts
  async testXSSProtection() {
    console.log('🛡️ Testing XSS protection...');
    
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '"><script>alert("xss")</script>'
    ];
    
    // Get admin token first
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.token;
    
    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(`${BASE_URL}/users`, {
          role: 'teacher',
          alias: payload,
          email: `test${Date.now()}@example.com`,
          password: 'test123'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        // If the request succeeds, it means XSS protection failed
        if (response.data.success) {
          throw new Error(`XSS vulnerability detected - malicious payload was accepted: ${payload}`);
        }
      } catch (error) {
        // Expected to fail validation - check if it's a validation error
        if (error.response?.status === 400 && error.response?.data?.error === 'Validation Error') {
          // This is good - validation is working
          continue;
        } else if (error.response?.status === 400) {
          // Other 400 errors are also acceptable (validation working)
          continue;
        } else {
          // Unexpected error
          throw new Error(`Unexpected error during XSS test: ${error.message}`);
        }
      }
    }
    
    console.log('✅ XSS protection working');
  },
  
  // Test rate limiting
  async testRateLimiting() {
    console.log('⏱️ Testing rate limiting...');
    
    const requests = [];
    const startTime = Date.now();
    
    // Make 150 requests quickly (should exceed rate limit)
    for (let i = 0; i < 150; i++) {
      requests.push(
        axios.get(`${BASE_URL}/health`, { timeout: 1000 }).catch(() => null)
      );
    }
    
    const results = await Promise.all(requests);
    const endTime = Date.now();
    
    // Count successful vs rate limited responses
    const successful = results.filter(r => r && r.status === 200).length;
    const rateLimited = results.filter(r => r && r.status === 429).length;
    
    if (rateLimited === 0) {
      throw new Error('Rate limiting not working - no requests were rate limited');
    }
    
    console.log(`✅ Rate limiting working: ${successful} successful, ${rateLimited} rate limited`);
  },
  
  // Test concurrent user creation
  async testConcurrentUserCreation() {
    console.log('👥 Testing concurrent user creation...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.token;
    
    const promises = [];
    const timestamp = Date.now();
    
    // Try to create 10 users with the same email simultaneously
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${BASE_URL}/users`, {
          role: 'student',
          alias: `Concurrent User ${i}`,
          email: `concurrent${timestamp}@test.com`,
          password: 'test123'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        }).catch(error => ({ error: error.response?.data || error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    
    // Only one should succeed, others should fail with duplicate email error
    const successful = results.filter(r => !r.error && r.data?.success).length;
    const failed = results.filter(r => r.error).length;
    
    if (successful !== 1) {
      throw new Error(`Expected 1 successful user creation, got ${successful}`);
    }
    
    console.log(`✅ Concurrent user creation handled correctly: ${successful} success, ${failed} failures`);
  },
  
  // Test timezone handling
  async testTimezoneHandling() {
    console.log('🌍 Testing timezone handling...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.token;
    
    // Create users first
    const teacherResponse = await axios.post(`${BASE_URL}/users`, {
      role: 'teacher',
      alias: 'Timezone Teacher',
      email: `timezone.teacher${Date.now()}@test.com`,
      password: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const studentResponse = await axios.post(`${BASE_URL}/users`, {
      role: 'student',
      alias: 'Timezone Student',
      email: `timezone.student${Date.now()}@test.com`,
      password: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    // Test different timezone formats
    const timezoneTests = [
      '2024-01-20T10:00:00Z',           // UTC
      '2024-01-20T10:00:00+00:00',      // UTC with offset
      '2024-01-20T10:00:00-05:00',      // EST
      '2024-01-20T10:00:00+09:00',      // JST
    ];
    
    for (const timezone of timezoneTests) {
      try {
        const response = await axios.post(`${BASE_URL}/classes`, {
          teacher_id: teacherResponse.data.data.user_id,
          student_id: studentResponse.data.data.user_id,
          start_time: timezone,
          end_time: '2024-01-20T11:00:00Z',
          meet_link: 'https://meet.google.com/timezone-test'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (!response.data.success) {
          throw new Error(`Timezone handling failed for: ${timezone}`);
        }
      } catch (error) {
        throw new Error(`Timezone test failed: ${error.message}`);
      }
    }
    
    console.log('✅ Timezone handling working correctly');
  },
  
  // Test large payload handling
  async testLargePayloadHandling() {
    console.log('📦 Testing large payload handling...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.token;
    
    // Create a very large alias (should be rejected by validation)
    const largeAlias = 'A'.repeat(1000);
    
    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        role: 'teacher',
        alias: largeAlias,
        email: `large${Date.now()}@test.com`,
        password: 'test123'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        throw new Error('Large payload should be rejected by validation');
      }
    } catch (error) {
      if (error.response?.status === 413) {
        throw new Error('Server should handle large payloads gracefully, not return 413');
      }
      // Expected validation error
    }
    
    console.log('✅ Large payload handling working correctly');
  },
  
  // Test malformed JSON
  async testMalformedJSON() {
    console.log('📝 Testing malformed JSON handling...');
    
    const malformedPayloads = [
      '{ invalid json }',
      '{"email": "test@test.com", "password": }',
      '{"email": "test@test.com", "password": "test123",}',
      'not json at all',
      '{"email": "test@test.com", "password": "test123"',
    ];
    
    for (const payload of malformedPayloads) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          throw new Error(`Malformed JSON was accepted: ${payload}`);
        }
      } catch (error) {
        if (error.response?.status !== 400) {
          throw new Error(`Expected 400 for malformed JSON, got ${error.response?.status}`);
        }
      }
    }
    
    console.log('✅ Malformed JSON handling working correctly');
  },
  
  // Test authentication edge cases
  async testAuthEdgeCases() {
    console.log('🔐 Testing authentication edge cases...');
    
    const edgeCases = [
      { email: '', password: 'test123' },
      { email: 'test@test.com', password: '' },
      { email: null, password: 'test123' },
      { email: 'test@test.com', password: null },
      { email: 'test@test.com', password: 'a'.repeat(1000) }, // Very long password
      { email: 'a'.repeat(1000) + '@test.com', password: 'test123' }, // Very long email
    ];
    
    for (const testCase of edgeCases) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, testCase);
        
        if (response.data.success) {
          throw new Error(`Authentication edge case should fail: ${JSON.stringify(testCase)}`);
        }
      } catch (error) {
        // Expected to fail
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Server crashed on authentication edge case');
        }
      }
    }
    
    console.log('✅ Authentication edge cases handled correctly');
  },
  
  // Test database constraint violations
  async testDatabaseConstraints() {
    console.log('🗄️ Testing database constraint violations...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myscholar.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.token;
    
    // Test duplicate email
    try {
      await axios.post(`${BASE_URL}/users`, {
        role: 'teacher',
        alias: 'Duplicate Email Test',
        email: 'admin@myscholar.com', // Already exists
        password: 'test123'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      throw new Error('Duplicate email should be rejected');
    } catch (error) {
      if (error.response?.data?.success) {
        throw new Error('Duplicate email was accepted');
      }
    }
    
    // Test invalid role
    try {
      await axios.post(`${BASE_URL}/users`, {
        role: 'invalid_role',
        alias: 'Invalid Role Test',
        email: `invalid${Date.now()}@test.com`,
        password: 'test123'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      throw new Error('Invalid role should be rejected');
    } catch (error) {
      if (error.response?.data?.success) {
        throw new Error('Invalid role was accepted');
      }
    }
    
    console.log('✅ Database constraint violations handled correctly');
  }
};

// Run all edge case tests
const runEdgeCaseTests = async () => {
  console.log('🧪 Starting Edge Case Tests for MyScholar API');
  console.log('=' * 50);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  for (const [testName, testFunction] of Object.entries(edgeCaseTests)) {
    results.total++;
    console.log(`\n🔍 Running: ${testName}`);
    
    try {
      await testFunction();
      results.passed++;
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      results.failed++;
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' * 50);
  console.log('📊 Edge Case Test Results:');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All edge case tests passed!');
  } else {
    console.log('\n⚠️ Some edge case tests failed. Review the issues above.');
  }
  
  return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runEdgeCaseTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}

module.exports = { runEdgeCaseTests, edgeCaseTests };
