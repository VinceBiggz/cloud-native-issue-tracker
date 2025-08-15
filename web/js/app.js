/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Main JavaScript application for Cloud-Native Issue Tracker
 * 
 * This file contains all the client-side logic for the application,
 * featuring Kenyan flag colors and Meta/Facebook-inspired design.
 */

// ===== GLOBAL STATE =====
let currentUser = null;
let authToken = null;
let issues = [
    {
        issueId: 'ISSUE-001',
        title: 'Sample Issue 1',
        description: 'This is a sample issue for testing',
        category: 'BUG',
        status: 'OPEN',
        priority: 'MEDIUM',
        assignee: 'admin@example.com',
        reporter: 'admin@example.com',
        tags: ['sample', 'test'],
        attachments: [],
        createdAt: '2025-08-12T10:00:00.000Z',
        updatedAt: '2025-08-12T10:00:00.000Z'
    },
    {
        issueId: 'ISSUE-002',
        title: 'Sample Issue 2',
        description: 'Another sample issue for testing',
        category: 'FEATURE',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'support@example.com',
        reporter: 'admin@example.com',
        tags: ['sample', 'high-priority'],
        attachments: [],
        createdAt: '2025-08-12T10:00:00.000Z',
        updatedAt: '2025-08-12T10:00:00.000Z'
    }
];

// Pagination state
let currentPage = 1;
let itemsPerPage = 10;

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
    },

    /**
     * Generate unique ID
     */
    generateId: () => {
        return 'ISSUE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Handle file upload
     */
    handleFileUpload: (files) => {
        const attachments = [];
        for (let file of files) {
            attachments.push({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
        }
        return attachments;
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
                headers: {
                    'Content-Type': 'application/json'
                },
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
                headers: {
                    'Content-Type': 'application/json'
                },
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
        UI.updateAccountInfo();
        UI.showDashboard();
        
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
     * Update account information in header
     */
    updateAccountInfo: () => {
        if (currentUser) {
            const accountName = document.getElementById('accountName');
            accountName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
    },

    /**
     * Toggle account dropdown menu
     */
    toggleAccountMenu: () => {
        const dropdown = document.getElementById('accountDropdown');
        dropdown.classList.toggle('show');
    },

    /**
     * Show profile page
     */
    showProfile: () => {
        UI.toggleAccountMenu();
        Utils.showNotification('Profile page coming soon!', 'info');
    },

    /**
     * Show settings page
     */
    showSettings: () => {
        UI.toggleAccountMenu();
        Utils.showNotification('Settings page coming soon!', 'info');
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
            'OPEN': '#006600',
            'IN_PROGRESS': '#FF6B35',
            'RESOLVED': '#000000',
            'CLOSED': '#80868B',
            'LOW': '#006600',
            'MEDIUM': '#FF6B35',
            'HIGH': '#CE1126',
            'CRITICAL': '#000000'
        };
        return colors[key] || '#CE1126';
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
        const category = document.getElementById('issueCategory').value;
        const priority = document.getElementById('issuePriority').value;
        const assignee = document.getElementById('issueAssignee').value;
        const tags = document.getElementById('issueTags').value;
        const attachments = document.getElementById('issueAttachments').files;

        if (!title || !description) {
            Utils.showNotification('Please fill in title and description', 'error');
            return;
        }

        const newIssue = {
            issueId: Utils.generateId(),
            title: title,
            description: description,
            category: category,
            status: 'OPEN',
            priority: priority,
            assignee: assignee || null,
            reporter: currentUser ? currentUser.email : 'anonymous',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            attachments: Utils.handleFileUpload(attachments),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        issues.push(newIssue);
        IssueManager.displayIssues();
        Dashboard.updateMetrics();

        // Clear form
        document.getElementById('issueTitle').value = '';
        document.getElementById('issueDescription').value = '';
        document.getElementById('issueCategory').value = 'BUG';
        document.getElementById('issuePriority').value = 'MEDIUM';
        document.getElementById('issueAssignee').value = '';
        document.getElementById('issueTags').value = '';
        document.getElementById('issueAttachments').value = '';

        Utils.showNotification('Issue created successfully!', 'success');
    },

    /**
     * Load issues from API
     */
    loadIssues: () => {
        // In a real app, this would fetch from the API
        IssueManager.displayIssues();
        Utils.showNotification('Issues refreshed!', 'success');
    },

    /**
     * Display issues in table format with pagination
     */
    displayIssues: () => {
        const tableBody = document.getElementById('issuesTableBody');
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedIssues = issues.slice(startIndex, endIndex);

        tableBody.innerHTML = '';

        if (paginatedIssues.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        No issues found. Create one!
                    </td>
                </tr>
            `;
        } else {
            paginatedIssues.forEach(issue => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${issue.issueId}</td>
                    <td>
                        <strong>${issue.title}</strong>
                        ${issue.description ? `<br><small style="color: #666;">${issue.description.substring(0, 50)}${issue.description.length > 50 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>${issue.category}</td>
                    <td><span class="priority-badge ${issue.priority.toLowerCase()}">${issue.priority}</span></td>
                    <td><span class="status-badge ${issue.status.toLowerCase().replace('_', '-')}">${issue.status}</span></td>
                    <td>${issue.assignee || 'Unassigned'}</td>
                    <td>${Utils.formatDate(issue.createdAt)}</td>
                    <td>
                        <button onclick="IssueManager.editIssue('${issue.issueId}')" style="margin-right: 5px; padding: 4px 8px; font-size: 12px;">✏️</button>
                        <button onclick="IssueManager.deleteIssue('${issue.issueId}')" style="padding: 4px 8px; font-size: 12px; background: #DC3545;">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        IssueManager.updatePagination();
    },

    /**
     * Update pagination controls
     */
    updatePagination: () => {
        const totalPages = Math.ceil(issues.length / itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    },

    /**
     * Edit issue
     */
    editIssue: (issueId) => {
        const issue = issues.find(i => i.issueId === issueId);
        if (issue) {
            Utils.showNotification(`Editing issue: ${issue.title}`, 'info');
            // TODO: Implement edit modal/form
        }
    },

    /**
     * Delete issue
     */
    deleteIssue: (issueId) => {
        if (confirm('Are you sure you want to delete this issue?')) {
            issues = issues.filter(i => i.issueId !== issueId);
            IssueManager.displayIssues();
            Dashboard.updateMetrics();
            Utils.showNotification('Issue deleted successfully!', 'success');
        }
    },

    /**
     * Export issues
     */
    exportIssues: () => {
        const dataStr = JSON.stringify(issues, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `issues-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        Utils.showNotification('Issues exported successfully!', 'success');
    }
};

// ===== PAGINATION FUNCTIONS =====
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        IssueManager.displayIssues();
    }
}

function nextPage() {
    const totalPages = Math.ceil(issues.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        IssueManager.displayIssues();
    }
}

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
            const headers = {
                'Content-Type': 'application/json'
            };
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

    // Handle file upload display
    const fileInput = document.getElementById('issueAttachments');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const label = document.querySelector('.file-upload-label');
            if (e.target.files.length > 0) {
                label.textContent = `📎 ${e.target.files.length} file(s) selected`;
            } else {
                label.textContent = '📎 Choose files or drag and drop here';
            }
        });
    }

    // Close account dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const accountMenu = document.getElementById('accountMenu');
        const dropdown = document.getElementById('accountDropdown');
        
        if (!accountMenu.contains(e.target) && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
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
window.toggleAccountMenu = UI.toggleAccountMenu;
window.showProfile = UI.showProfile;
window.showSettings = UI.showSettings;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.exportIssues = IssueManager.exportIssues;
