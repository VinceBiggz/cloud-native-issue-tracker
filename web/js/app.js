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
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'auth' }, 'Authentication', '/auth');
        }
    },

    /**
     * Show main application section
     */
    showApp: () => {
        document.getElementById('authSection').classList.remove('active');
        document.getElementById('appSection').classList.add('active');
        UI.updateUserInfo();
        UI.showDashboard(); // Show dashboard by default
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
        }
    },

    /**
     * Show dashboard section
     */
    showDashboard: () => {
        UI.hideAllSections();
        document.getElementById('dashboardSection').classList.add('active');
        UI.updateNavigation('dashboard');
        Dashboard.updateMetrics();
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
        }
    },

    /**
     * Show issues section
     */
    showIssues: () => {
        UI.hideAllSections();
        document.getElementById('issuesSection').classList.add('active');
        UI.updateNavigation('issues');
        IssueManager.displayIssues();
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'issues' }, 'Issues', '/issues');
        }
    },

    /**
     * Show API testing section
     */
    showAPI: () => {
        UI.hideAllSections();
        document.getElementById('apiSection').classList.add('active');
        UI.updateNavigation('api');
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'api' }, 'API Testing', '/api');
        }
    },

    /**
     * Hide all content sections
     */
    hideAllSections: () => {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
    },

    /**
     * Update navigation buttons
     */
    updateNavigation: (activeSection) => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick*="${activeSection}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
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

// ===== DASHBOARD MODULE =====
const Dashboard = {
    /**
     * Update dashboard metrics
     */
    updateMetrics: () => {
        const totalIssues = issues.length;
        const openIssues = issues.filter(issue => issue.status === 'OPEN').length;
        const inProgressIssues = issues.filter(issue => issue.status === 'IN_PROGRESS').length;
        const criticalIssues = issues.filter(issue => issue.priority === 'CRITICAL').length;

        // Update metric values
        document.getElementById('totalIssues').textContent = totalIssues;
        document.getElementById('openIssues').textContent = openIssues;
        document.getElementById('inProgressIssues').textContent = inProgressIssues;
        document.getElementById('criticalIssues').textContent = criticalIssues;

        // Update charts
        Dashboard.updateStatusChart();
        Dashboard.updatePriorityChart();
    },

    /**
     * Update status chart
     */
    updateStatusChart: () => {
        const statusCounts = {};
        issues.forEach(issue => {
            statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
        });

        const chartContainer = document.getElementById('statusChart');
        chartContainer.innerHTML = Dashboard.createChartHTML(statusCounts, 'Status Distribution');
    },

    /**
     * Update priority chart
     */
    updatePriorityChart: () => {
        const priorityCounts = {};
        issues.forEach(issue => {
            priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
        });

        const chartContainer = document.getElementById('priorityChart');
        chartContainer.innerHTML = Dashboard.createChartHTML(priorityCounts, 'Priority Distribution');
    },

    /**
     * Create simple chart HTML
     */
    createChartHTML: (data, title) => {
        if (Object.keys(data).length === 0) {
            return '<p style="text-align: center; color: #888;">No data available</p>';
        }

        let chartHTML = `<h4 style="margin: 0 0 15px 0; color: #333;">${title}</h4>`;
        
        Object.entries(data).forEach(([key, value]) => {
            const percentage = Math.round((value / issues.length) * 100) || 0;
            const color = Dashboard.getColorForKey(key);
            
            chartHTML += `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: #333;">${key}</span>
                        <span style="color: #666;">${value} (${percentage}%)</span>
                    </div>
                    <div style="background: #e1e5e9; border-radius: 4px; height: 8px;">
                        <div style="background: ${color}; height: 100%; border-radius: 4px; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        });

        return chartHTML;
    },

    /**
     * Get color for chart keys
     */
    getColorForKey: (key) => {
        const colors = {
            'OPEN': '#28a745',
            'IN_PROGRESS': '#ffc107',
            'RESOLVED': '#17a2b8',
            'CLOSED': '#6c757d',
            'LOW': '#28a745',
            'MEDIUM': '#ffc107',
            'HIGH': '#fd7e14',
            'CRITICAL': '#dc3545'
        };
        return colors[key] || '#667eea';
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
        Dashboard.updateMetrics(); // Update dashboard metrics
        
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

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            switch (event.state.page) {
                case 'dashboard':
                    UI.showDashboard();
                    break;
                case 'issues':
                    UI.showIssues();
                    break;
                case 'api':
                    UI.showAPI();
                    break;
                case 'auth':
                    UI.showAuth();
                    break;
            }
        }
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
window.showDashboard = UI.showDashboard;
window.showIssues = UI.showIssues;
window.showAPI = UI.showAPI;
