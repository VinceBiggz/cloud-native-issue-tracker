const { handler } = require('./services/api/dist/handler');

// Test events that simulate API Gateway
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

async function runTests() {
  console.log('🧪 Testing Lambda Handler Locally\n');
  
  for (const test of testEvents) {
    try {
      console.log(`📝 Testing: ${test.name}`);
      const result = await handler(test.event);
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📄 Response: ${result.body}`);
      console.log('---');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---');
    }
  }
  
  console.log('🎉 Local testing complete!');
}

runTests().catch(console.error);
