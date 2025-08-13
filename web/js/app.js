/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Main JavaScript application for Cloud-Native Issue Tracker
 * 
 * This file contains all the client-side logic for the application,
 * following best practices for maintainability and scalability.
 */

// ===== GLOBAL STATE =====
let currentUser = null;
let authToken = null;
let issues = [
    { issueId: 'ISSUE-001', title: 'Sample Issue 1', description: 'This is a sample issue', status: 'OPEN', priority: 'MEDIUM' },
    { issueId: 'ISSUE-002', title: 'Sample Issue 2', description: 'Another sample issue', status: 'IN_PROGRESS', priority: 'HIGH' }
];

// ===== UTILITY FUNCTIONS =====
const Utils = {
    /**
     * Show notification message
     */
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Format date
     */
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString();
    }
};

// ===== AUTHENTICATION MODULE =====
const Auth = {
    /**
     * Handle user login
     */
    login: async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            UI.showAuthResponse('Please enter both email and password', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            UI.showAuthResponse('Please enter a valid email address', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                currentUser = data.data.user;
                authToken = data.data.token;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(currentUser));
                UI.showAuthResponse('Login successful!', 'success');
                setTimeout(() => {
                    UI.showApp();
                }, 1000);
            } else {
                UI.showAuthResponse(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            UI.showAuthResponse('Login failed: ' + error.message, 'error');
        }
    },

    /**
     * Handle user registration
     */
    register: async () => {
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        if (!firstName || !lastName || !email || !password) {
            UI.showAuthResponse('Please fill in all required fields', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            UI.showAuthResponse('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            UI.showAuthResponse('Password must be at least 8 characters long', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password, role })
            });

            const data = await response.json();
            
            if (data.success) {
                currentUser = data.data.user;
                authToken = data.data.token;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(currentUser));
                UI.showAuthResponse('Registration successful!', 'success');
                setTimeout(() => {
                    UI.showApp();
                }, 1000);
            } else {
                UI.showAuthResponse(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            UI.showAuthResponse('Registration failed: ' + error.message, 'error');
        }
    },

    /**
     * Demo login for testing
     */
    demoLogin: () => {
        currentUser = {
            userId: 'admin-001',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            status: 'ACTIVE'
        };
        authToken = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        UI.showAuthResponse('Demo login successful!', 'success');
        setTimeout(() => {
            UI.showApp();
        }, 1000);
    },

    /**
     * Handle user logout
     */
    logout: () => {
        currentUser = null;
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        UI.showAuth();
    },

    /**
     * Check authentication status
     */
    checkAuth: () => {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            UI.showApp();
        } else {
            UI.showAuth();
        }
    }
};

// ===== UI MODULE =====
const UI = {
    /**
     * Switch between login and register tabs
     */
    switchTab: (tabName) => {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        if (tabName === 'login') {
            document.getElementById('loginTab').classList.add('active');
        } else {
            document.getElementById('registerTab').classList.add('active');
        }
    },

    /**
     * Show authentication response message
     */
    showAuthResponse: (message, type) => {
        const responseDiv = document.getElementById('authResponse');
        responseDiv.style.display = 'block';
        responseDiv.className = `auth-response ${type === 'error' ? 'error-message' : 'success-message'}`;
        responseDiv.textContent = message;
    },

    /**
     * Show authentication section
     */
    showAuth: () => {
        document.getElementById('authSection').classList.add('active');
        document.getElementById('appSection').classList.remove('active');
    },

    /**
     * Show main application section
     */
    showApp: () => {
        document.getElementById('authSection').classList.remove('active');
        document.getElementById('appSection').classList.add('active');
        UI.updateUserInfo();
        IssueManager.displayIssues();
    },

    /**
     * Update user information display
     */
    updateUserInfo: () => {
        if (currentUser) {
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('userRole').textContent = currentUser.role;
            document.getElementById('userEmail').textContent = currentUser.email;
        }
    }
};

// ===== ISSUE MANAGEMENT MODULE =====
const IssueManager = {
    /**
     * Create a new issue
     */
    createIssue: () => {
        const title = document.getElementById('issueTitle').value;
        const description = document.getElementById('issueDescription').value;
        const priority = document.getElementById('issuePriority').value;
        
        if (!title) {
            Utils.showNotification('Please enter a title for the issue', 'error');
            return;
        }

        const newIssue = {
            issueId: 'ISSUE-' + Date.now(),
            title: title,
            description: description,
            status: 'OPEN',
            priority: priority,
            createdAt: new Date().toISOString(),
            reporter: currentUser ? currentUser.email : 'anonymous'
        };

        issues.push(newIssue);
        IssueManager.displayIssues();
        
        // Clear form
        document.getElementById('issueTitle').value = '';
        document.getElementById('issueDescription').value = '';
        document.getElementById('issuePriority').value = 'MEDIUM';
        
        Utils.showNotification('Issue created successfully!', 'success');
    },

    /**
     * Load issues from API
     */
    loadIssues: () => {
        // In a real app, this would fetch from the API
        IssueManager.displayIssues();
    },

    /**
     * Display issues in the UI
     */
    displayIssues: () => {
        const issuesList = document.getElementById('issuesList');
        issuesList.innerHTML = '';
        
        if (issues.length === 0) {
            issuesList.innerHTML = '<p style="text-align: center; color: #888;">No issues found. Create one!</p>';
            return;
        }
        
        issues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = 'issue-item';
            issueDiv.innerHTML = `
                <div class="issue-title">${issue.title}</div>
                <div class="issue-meta">
                    ID: ${issue.issueId} | 
                    Status: <span class="status ${issue.status === 'OPEN' ? 'success' : 'info'}">${issue.status}</span> | 
                    Priority: ${issue.priority} | 
                    Reporter: ${issue.reporter || 'Unknown'}
                </div>
                ${issue.description ? `<div style="margin-top: 5px; font-size: 14px;">${issue.description}</div>` : ''}
            `;
            issuesList.appendChild(issueDiv);
        });
    }
};

// ===== API TESTING MODULE =====
const APITester = {
    /**
     * Test API endpoints
     */
    testEndpoint: async () => {
        const endpoint = document.getElementById('endpoint').value;
        const requestBody = document.getElementById('requestBody').value;
        
        const responseDiv = document.getElementById('apiResponse');
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = 'Loading...';
        
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            let url = '/api' + endpoint.split(' ')[1];
            let method = endpoint.split(' ')[0];
            let body = null;

            if (method === 'POST' || method === 'PUT') {
                body = requestBody ? JSON.parse(requestBody) : null;
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();
            
            responseDiv.innerHTML = `✅ Status: ${response.status}\n📄 Response: ${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            responseDiv.innerHTML = `❌ Error: ${error.message}`;
        }
    }
};

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    Auth.checkAuth();
    
    // Add event listeners for forms
    document.addEventListener('submit', (e) => {
        e.preventDefault();
    });
});

// ===== GLOBAL FUNCTIONS (for HTML onclick) =====
window.switchTab = UI.switchTab;
window.login = Auth.login;
window.register = Auth.register;
window.demoLogin = Auth.demoLogin;
window.logout = Auth.logout;
window.createIssue = IssueManager.createIssue;
window.loadIssues = IssueManager.loadIssues;
window.testEndpoint = APITester.testEndpoint;
