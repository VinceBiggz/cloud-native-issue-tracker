/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Local Development Server - Web Interface
 * 
 * This server provides a local development environment for testing the
 * issue tracker web interface. It serves the HTML file and provides
 * a simple API endpoint for testing.
 * 
 * Usage:
 * - node server.js
 * - Open http://localhost:3000 in your browser
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Local database for testing

// Database file path
const DB_FILE = path.join(__dirname, 'data', 'local-db.json');

// Load database
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  
  // Return default database structure
  return {
    users: [
      {
        userId: 'admin-001',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }
    ],
    sessions: [],
    issues: []
  };
}

// Save database
function saveDatabase(db) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database
let db = loadDatabase();
console.log('📊 Local database loaded successfully');
console.log(`📁 Database file: ${DB_FILE}`);

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Set CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API endpoints
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname);
    return;
  }

  // Serve static files
  serveStaticFile(req, res, pathname);
});

// Handle API requests (simulate Lambda responses)
function handleApiRequest(req, res, pathname) {
  const method = req.method;
  const endpoint = pathname.replace('/api', '');
  
  // Handle authentication endpoints
  if (endpoint.startsWith('/auth/')) {
    handleAuthRequest(req, res, endpoint, method);
    return;
  }
  
  // Handle issue endpoints
  handleIssueRequest(req, res, endpoint, method);
}

// Handle authentication requests
function handleAuthRequest(req, res, endpoint, method) {
  console.log(`Auth request: ${method} ${endpoint}`); // Debug logging
  
  // Remove /auth prefix from endpoint for matching
  const authEndpoint = endpoint.replace('/auth', '');
  
  if (authEndpoint === '/register' && method === 'POST') {
    handleRegister(req, res);
  } else if (authEndpoint === '/login' && method === 'POST') {
    handleLogin(req, res);
  } else if (authEndpoint === '/refresh' && method === 'POST') {
    handleRefreshToken(req, res);
  } else if (authEndpoint === '/me' && method === 'GET') {
    handleGetCurrentUser(req, res);
  } else if (authEndpoint === '/logout' && method === 'POST') {
    handleLogout(req, res);
  } else {
    sendResponse(res, {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        message: `Unknown auth endpoint: ${method} ${endpoint}`,
      })
    });
  }
}

// Handle user registration
function handleRegister(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Validate required fields
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        sendResponse(res, {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            error: 'Validation error',
            message: 'All required fields must be provided',
          })
        });
        return;
      }

      // Check if user already exists
      const existingUser = db.users.find(u => u.email === data.email);
      if (existingUser) {
        sendResponse(res, {
          statusCode: 409,
          body: JSON.stringify({
            success: false,
            error: 'User already exists',
            message: 'A user with this email already exists',
          })
        });
        return;
      }

      // Create new user
      const newUser = {
        userId: 'user-' + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'END_USER',
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to database
      db.users.push(newUser);
      saveDatabase(db);

      // Generate mock tokens
      const token = 'mock-jwt-token-' + Date.now();
      const refreshToken = 'mock-refresh-token-' + Date.now();

      const authResponse = {
        user: newUser,
        token,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      };

      sendResponse(res, {
        statusCode: 201,
        body: JSON.stringify({
          success: true,
          data: authResponse,
          message: 'User registered successfully',
        })
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON',
          message: 'Invalid request body',
        })
      });
    }
  });
}

// Handle user login
function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Find user by email
      const user = db.users.find(u => u.email === data.email);
      if (!user) {
        sendResponse(res, {
          statusCode: 401,
          body: JSON.stringify({
            success: false,
            error: 'Invalid credentials',
            message: 'Invalid email or password',
          })
        });
        return;
      }

      // For demo purposes, accept any password
      // In real implementation, verify password hash
      
      // Update last login
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      
      // Save updated user
      saveDatabase(db);

      // Generate mock tokens
      const token = 'mock-jwt-token-' + Date.now();
      const refreshToken = 'mock-refresh-token-' + Date.now();

      const authResponse = {
        user,
        token,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      };

      sendResponse(res, {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: authResponse,
          message: 'Login successful',
        })
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON',
          message: 'Invalid request body',
        })
      });
    }
  });
}

// Handle token refresh
function handleRefreshToken(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      if (!data.refreshToken) {
        sendResponse(res, {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            error: 'Missing refresh token',
            message: 'Refresh token is required',
          })
        });
        return;
      }

      // For demo purposes, accept any refresh token
      // In real implementation, verify the refresh token
      
      // Find a user (in real implementation, extract user ID from token)
      const user = db.users[0];
      if (!user) {
        sendResponse(res, {
          statusCode: 401,
          body: JSON.stringify({
            success: false,
            error: 'Invalid token',
            message: 'Invalid refresh token',
          })
        });
        return;
      }

      // Generate new tokens
      const token = 'mock-jwt-token-' + Date.now();
      const refreshToken = 'mock-refresh-token-' + Date.now();

      const authResponse = {
        user,
        token,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      };

      sendResponse(res, {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: authResponse,
          message: 'Token refreshed successfully',
        })
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON',
          message: 'Invalid request body',
        })
      });
    }
  });
}

// Handle get current user
function handleGetCurrentUser(req, res) {
  const token = extractTokenFromHeaders(req);
  if (!token) {
    sendResponse(res, {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        error: 'Missing token',
        message: 'Authorization token is required',
      })
    });
    return;
  }

  // For demo purposes, return the first user
  // In real implementation, verify JWT token and extract user ID
  const user = db.users[0];
  if (!user) {
    sendResponse(res, {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        error: 'Invalid token',
        message: 'Invalid authorization token',
      })
    });
    return;
  }

  sendResponse(res, {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    })
  });
}

// Handle user logout
function handleLogout(req, res) {
  // In real implementation, invalidate the token
  sendResponse(res, {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Logout successful',
    })
  });
}

// Handle issue requests
function handleIssueRequest(req, res, endpoint, method) {
  // Simulate Lambda handler responses
  let response;
  
  if (endpoint === '/issues' && method === 'GET') {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        items: db.issues || [],
        nextToken: null
      })
    };
  } else if (endpoint === '/issues' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      const newIssue = {
        issueId: 'ISSUE-' + Date.now(),
        title: data.title || 'New Issue',
        description: data.description || '',
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
        reporter: 'admin@example.com', // In real implementation, get from token
        assignee: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || []
      };
      
      // Add to database
      if (!db.issues) db.issues = [];
      db.issues.push(newIssue);
      saveDatabase(db);
      
      response = {
        statusCode: 201,
        body: JSON.stringify(newIssue)
      };
      sendResponse(res, response);
    });
    return;
  } else if (endpoint.startsWith('/issues/') && method === 'GET') {
    const id = endpoint.split('/').pop();
    response = {
      statusCode: 200,
      body: JSON.stringify({
        issueId: id,
        title: 'Sample Issue',
        description: 'This is a sample issue for testing',
        status: 'OPEN',
        priority: 'MEDIUM'
      })
    };
  } else if (endpoint.startsWith('/issues/') && method === 'PUT') {
    const id = endpoint.split('/').pop();
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      response = {
        statusCode: 200,
        body: JSON.stringify({
          issueId: id,
          title: data.title || 'Updated Issue',
          status: 'UPDATED',
          priority: data.priority || 'MEDIUM'
        })
      };
      sendResponse(res, response);
    });
    return;
  } else if (endpoint.startsWith('/issues/') && method === 'DELETE') {
    response = {
      statusCode: 204,
      body: ''
    };
  } else {
    response = {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Not Found',
        path: endpoint,
        method: method
      })
    };
  }
  
  sendResponse(res, response);
}

// Extract JWT token from request headers
function extractTokenFromHeaders(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Send API response
function sendResponse(res, response) {
  res.writeHead(response.statusCode, {
    'Content-Type': 'application/json'
  });
  res.end(response.body);
}

// Serve static files
function serveStaticFile(req, res, pathname) {
  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Map pathname to file path
  let filePath = pathname;
  if (pathname.startsWith('/web/')) {
    filePath = pathname.replace('/web/', '');
  }
  
  // Resolve file path
  const fullPath = path.join(__dirname, 'web', filePath);
  
  // Get file extension
  const extname = path.extname(fullPath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read and serve file
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'web', 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log('🚀 Local Development Server Started');
  console.log(`📱 Web Interface: http://localhost:${PORT}`);
  console.log(`🔧 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`📊 Author: Vincent Wachira | Version: v1.0.0 | Date: 12-Aug-2025`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  POST http://localhost:${PORT}/api/auth/refresh`);
  console.log(`  GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`  POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`  GET  http://localhost:${PORT}/api/issues`);
  console.log(`  POST http://localhost:${PORT}/api/issues`);
  console.log(`  GET  http://localhost:${PORT}/api/issues/{id}`);
  console.log(`  PUT  http://localhost:${PORT}/api/issues/{id}`);
  console.log(`  DELETE http://localhost:${PORT}/api/issues/{id}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
