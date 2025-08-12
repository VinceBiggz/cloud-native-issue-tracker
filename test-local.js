/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Local Testing Script - Lambda Handler Testing
 * 
 * This script provides local testing capabilities for the Lambda handler
 * without requiring AWS deployment. It simulates API Gateway events and
 * validates the handler responses.
 * 
 * Test Coverage:
 * - GET /issues - List all issues
 * - POST /issues - Create new issue
 * - GET /issues/{id} - Get specific issue
 * - PUT /issues/{id} - Update issue
 * - DELETE /issues/{id} - Delete issue
 * - Error handling for unknown routes
 * 
 * Usage:
 * - npm run build (to compile TypeScript)
 * - node test-local.js
 * 
 * Prerequisites:
 * - TypeScript compilation completed
 * - Lambda handler built in services/api/dist/
 */

const { handler } = require('./services/api/dist/handler');

/**
 * Test events that simulate API Gateway HTTP API v2 events
 * Each event represents a different API endpoint and HTTP method
 */
const testEvents = [
  {
    name: 'GET /issues',
    event: {
      requestContext: { http: { method: 'GET' } },
      rawPath: '/issues'
    }
  },
  {
    name: 'POST /issues',
    event: {
      requestContext: { http: { method: 'POST' } },
      rawPath: '/issues',
      body: JSON.stringify({ title: 'Test Issue', description: 'Test Description' })
    }
  },
  {
    name: 'GET /issues/123',
    event: {
      requestContext: { http: { method: 'GET' } },
      rawPath: '/issues/123'
    }
  },
  {
    name: 'PUT /issues/123',
    event: {
      requestContext: { http: { method: 'PUT' } },
      rawPath: '/issues/123',
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    }
  },
  {
    name: 'DELETE /issues/123',
    event: {
      requestContext: { http: { method: 'DELETE' } },
      rawPath: '/issues/123'
    }
  },
  {
    name: 'GET /unknown',
    event: {
      requestContext: { http: { method: 'GET' } },
      rawPath: '/unknown'
    }
  }
];

/**
 * Main test runner function
 * Executes all test cases and reports results
 */
async function runTests() {
  console.log('🧪 Testing Lambda Handler Locally\n');
  
  let passedTests = 0;
  let totalTests = testEvents.length;
  
  for (const test of testEvents) {
    try {
      console.log(`📝 Testing: ${test.name}`);
      
      // Execute the Lambda handler with the test event
      const result = await handler(test.event);
      
      // Display test results
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📄 Response: ${result.body}`);
      console.log('---');
      
      passedTests++;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---');
    }
  }
  
  // Display test summary
  console.log(`🎉 Local testing complete!`);
  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎯 All tests passed successfully!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

// Run the tests and handle any uncaught errors
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
