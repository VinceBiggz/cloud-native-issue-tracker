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
  
  // Simulate Lambda handler responses
  let response;
  
  if (endpoint === '/issues' && method === 'GET') {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        items: [
          { issueId: 'ISSUE-001', title: 'Sample Issue 1', status: 'OPEN', priority: 'MEDIUM' },
          { issueId: 'ISSUE-002', title: 'Sample Issue 2', status: 'IN_PROGRESS', priority: 'HIGH' }
        ],
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
      response = {
        statusCode: 201,
        body: JSON.stringify({
          issueId: 'ISSUE-' + Date.now(),
          title: data.title || 'New Issue',
          status: 'OPEN',
          priority: data.priority || 'MEDIUM'
        })
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
