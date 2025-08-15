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
        title: 'Critical Database Connection Issue',
        description: 'Users are experiencing intermittent database connection failures during peak hours. This is affecting the core functionality of the application and needs immediate attention.',
        category: 'BUG',
        status: 'OPEN',
        priority: 'CRITICAL',
        assignee: 'admin@example.com',
        reporter: 'admin@example.com',
        tags: ['database', 'critical', 'performance'],
        attachments: [
            { name: 'error_log.txt', size: 2048, type: 'text/plain', lastModified: Date.now() },
            { name: 'screenshot.png', size: 512000, type: 'image/png', lastModified: Date.now() }
        ],
        createdAt: '2025-08-12T10:00:00.000Z',
        updatedAt: '2025-08-12T10:00:00.000Z'
    },
    {
        issueId: 'ISSUE-002',
        title: 'Implement Dark Mode Feature',
        description: 'Add a dark mode toggle to improve user experience and reduce eye strain. This should include theme switching for all components and persistent user preference storage.',
        category: 'FEATURE',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'support@example.com',
        reporter: 'admin@example.com',
        tags: ['ui', 'feature', 'dark-mode'],
        attachments: [
            { name: 'design_mockup.fig', size: 1024000, type: 'application/fig', lastModified: Date.now() }
        ],
        createdAt: '2025-08-12T10:00:00.000Z',
        updatedAt: '2025-08-12T10:00:00.000Z'
    },
    {
        issueId: 'ISSUE-003',
        title: 'Update API Documentation',
        description: 'The current API documentation is outdated and missing several new endpoints. Need to update the documentation to reflect all current API capabilities.',
        category: 'DOCUMENTATION',
        status: 'OPEN',
        priority: 'MEDIUM',
        assignee: '',
        reporter: 'admin@example.com',
        tags: ['documentation', 'api'],
        attachments: [],
        createdAt: '2025-08-12T10:00:00.000Z',
        updatedAt: '2025-08-12T10:00:00.000Z'
    },
    {
        issueId: 'ISSUE-004',
        title: 'Performance Optimization for Mobile',
        description: 'The mobile version of the application is experiencing slow load times. Need to optimize images, reduce bundle size, and implement lazy loading.',
        category: 'ENHANCEMENT',
        status: 'RESOLVED',
        priority: 'HIGH',
        assignee: 'admin@example.com',
        reporter: 'support@example.com',
        tags: ['mobile', 'performance', 'optimization'],
        attachments: [
            { name: 'performance_report.pdf', size: 256000, type: 'application/pdf', lastModified: Date.now() }
        ],
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
     * Show reports section
     */
    showReports: () => {
        UI.hideAllSections();
        document.getElementById('reportsSection').classList.add('active');
        UI.updateNavigation('reports');
        ReportsManager.loadDefaultReport();
        
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'reports' }, 'Reports', '/reports');
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
                        <button onclick="openIssueModal('${issue.issueId}')" style="margin-right: 5px; padding: 4px 8px; font-size: 12px; background: var(--secondary-color); color: white;">👁️</button>
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

// ===== PHASE 2: ADVANCED ISSUE MANAGEMENT =====

// Global state for Phase 2 features
let currentIssue = null;
let timerInterval = null;
let timerStartTime = null;
let isTimerRunning = false;

// Enhanced Issue Management
const AdvancedIssueManager = {
    /**
     * Open issue details modal
     */
    openIssueModal: (issueId) => {
        const issue = issues.find(i => i.issueId === issueId);
        if (!issue) {
            Utils.showNotification('Issue not found', 'error');
            return;
        }
        
        currentIssue = issue;
        AdvancedIssueManager.populateModal(issue);
        document.getElementById('issueModal').style.display = 'block';
    },

    /**
     * Close issue details modal
     */
    closeIssueModal: () => {
        document.getElementById('issueModal').style.display = 'none';
        currentIssue = null;
        if (isTimerRunning) {
            AdvancedIssueManager.stopTimer();
        }
    },

    /**
     * Populate modal with issue data
     */
    populateModal: (issue) => {
        // Set basic issue information
        document.getElementById('modalIssueTitle').textContent = issue.title;
        document.getElementById('modalIssueStatus').value = issue.status;
        document.getElementById('modalIssuePriority').value = issue.priority;
        document.getElementById('modalIssueAssignee').value = issue.assignee || '';
        document.getElementById('modalIssueCategory').textContent = issue.category;
        document.getElementById('modalIssueCreated').textContent = Utils.formatDate(issue.createdAt);
        document.getElementById('modalIssueUpdated').textContent = Utils.formatDate(issue.updatedAt);
        document.getElementById('modalIssueDescription').textContent = issue.description;

        // Populate tags
        const tagsContainer = document.getElementById('modalIssueTags');
        if (issue.tags && issue.tags.length > 0) {
            tagsContainer.innerHTML = issue.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        } else {
            tagsContainer.innerHTML = '<span style="color: var(--gray-500);">No tags</span>';
        }

        // Populate attachments
        const attachmentsContainer = document.getElementById('modalIssueAttachments');
        if (issue.attachments && issue.attachments.length > 0) {
            attachmentsContainer.innerHTML = issue.attachments.map(attachment => 
                `<div class="attachment-item">
                    <span class="attachment-icon">📎</span>
                    <div class="attachment-info">
                        <div class="attachment-name">${attachment.name}</div>
                        <div class="attachment-size">${Utils.formatFileSize(attachment.size)}</div>
                    </div>
                </div>`
            ).join('');
        } else {
            attachmentsContainer.innerHTML = '<span style="color: var(--gray-500);">No attachments</span>';
        }

        // Load comments
        AdvancedIssueManager.loadComments(issue.issueId);

        // Load time tracking
        AdvancedIssueManager.loadTimeTracking(issue.issueId);
    },

    /**
     * Load comments for an issue
     */
    loadComments: (issueId) => {
        const commentsContainer = document.getElementById('commentsContainer');
        
        // Get comments from localStorage or use default
        const comments = JSON.parse(localStorage.getItem(`comments_${issueId}`)) || [
            {
                id: 'comment-1',
                author: 'admin@example.com',
                content: 'Initial investigation started',
                date: new Date().toISOString(),
                type: 'comment'
            }
        ];

        commentsContainer.innerHTML = comments.map(comment => 
            `<div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${Utils.formatDate(comment.date)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>`
        ).join('');
    },

    /**
     * Add a new comment
     */
    addComment: () => {
        const commentText = document.getElementById('newCommentText').value.trim();
        if (!commentText) {
            Utils.showNotification('Please enter a comment', 'error');
            return;
        }

        if (!currentIssue) {
            Utils.showNotification('No issue selected', 'error');
            return;
        }

        const newComment = {
            id: 'comment-' + Date.now(),
            author: currentUser ? currentUser.email : 'anonymous@example.com',
            content: commentText,
            date: new Date().toISOString(),
            type: 'comment'
        };

        // Get existing comments
        const comments = JSON.parse(localStorage.getItem(`comments_${currentIssue.issueId}`)) || [];
        comments.push(newComment);
        localStorage.setItem(`comments_${currentIssue.issueId}`, JSON.stringify(comments));

        // Reload comments
        AdvancedIssueManager.loadComments(currentIssue.issueId);

        // Clear input
        document.getElementById('newCommentText').value = '';

        Utils.showNotification('Comment added successfully', 'success');
    },

    /**
     * Load time tracking data
     */
    loadTimeTracking: (issueId) => {
        const timeEntriesContainer = document.getElementById('timeEntriesContainer');
        const totalTimeSpent = document.getElementById('totalTimeSpent');
        
        // Get time entries from localStorage
        const timeEntries = JSON.parse(localStorage.getItem(`time_${issueId}`)) || [
            {
                id: 'time-1',
                date: new Date().toISOString(),
                duration: 120, // minutes
                description: 'Initial setup and investigation'
            }
        ];

        // Calculate total time
        const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        totalTimeSpent.textContent = `${hours}h ${minutes}m`;

        // Display time entries
        timeEntriesContainer.innerHTML = timeEntries.map(entry => {
            const entryHours = Math.floor(entry.duration / 60);
            const entryMinutes = entry.duration % 60;
            return `<div class="time-entry">
                <div class="time-entry-info">
                    <div class="time-entry-date">${Utils.formatDate(entry.date)}</div>
                    <div class="time-entry-duration">${entryHours}h ${entryMinutes}m</div>
                    <div class="time-entry-description">${entry.description}</div>
                </div>
            </div>`;
        }).join('');
    },

    /**
     * Add time entry manually
     */
    addTimeEntry: () => {
        const hours = prompt('Enter hours spent:');
        const minutes = prompt('Enter minutes spent:');
        const description = prompt('Enter description:');

        if (!hours || !minutes || !description) {
            Utils.showNotification('All fields are required', 'error');
            return;
        }

        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        
        const timeEntry = {
            id: 'time-' + Date.now(),
            date: new Date().toISOString(),
            duration: totalMinutes,
            description: description
        };

        // Get existing time entries
        const timeEntries = JSON.parse(localStorage.getItem(`time_${currentIssue.issueId}`)) || [];
        timeEntries.push(timeEntry);
        localStorage.setItem(`time_${currentIssue.issueId}`, JSON.stringify(timeEntries));

        // Reload time tracking
        AdvancedIssueManager.loadTimeTracking(currentIssue.issueId);

        Utils.showNotification('Time entry added successfully', 'success');
    },

    /**
     * Toggle timer on/off
     */
    toggleTimer: () => {
        if (isTimerRunning) {
            AdvancedIssueManager.stopTimer();
        } else {
            AdvancedIssueManager.startTimer();
        }
    },

    /**
     * Start timer
     */
    startTimer: () => {
        if (!currentIssue) {
            Utils.showNotification('No issue selected', 'error');
            return;
        }

        timerStartTime = new Date();
        isTimerRunning = true;
        
        const timerButton = document.getElementById('timerButton');
        timerButton.textContent = '⏸️ Pause Timer';
        timerButton.className = 'btn-accent';

        timerInterval = setInterval(() => {
            const now = new Date();
            const diff = now - timerStartTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            document.getElementById('timerDisplay').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);

        Utils.showNotification('Timer started', 'success');
    },

    /**
     * Stop timer
     */
    stopTimer: () => {
        if (!isTimerRunning) return;

        clearInterval(timerInterval);
        isTimerRunning = false;
        
        const timerButton = document.getElementById('timerButton');
        timerButton.textContent = '▶️ Start Timer';
        timerButton.className = 'btn-accent';

        // Calculate total time
        const endTime = new Date();
        const totalMinutes = Math.floor((endTime - timerStartTime) / 60000);
        
        // Ask for description
        const description = prompt('Enter description for this time entry:') || 'Timer session';
        
        const timeEntry = {
            id: 'time-' + Date.now(),
            date: timerStartTime.toISOString(),
            duration: totalMinutes,
            description: description
        };

        // Add to time entries
        const timeEntries = JSON.parse(localStorage.getItem(`time_${currentIssue.issueId}`)) || [];
        timeEntries.push(timeEntry);
        localStorage.setItem(`time_${currentIssue.issueId}`, JSON.stringify(timeEntries));

        // Reload time tracking
        AdvancedIssueManager.loadTimeTracking(currentIssue.issueId);

        // Reset timer display
        document.getElementById('timerDisplay').textContent = '00:00:00';

        Utils.showNotification(`Timer stopped. Added ${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`, 'success');
    },

    /**
     * Update issue status
     */
    updateIssueStatus: () => {
        if (!currentIssue) return;
        
        const newStatus = document.getElementById('modalIssueStatus').value;
        currentIssue.status = newStatus;
        currentIssue.updatedAt = new Date().toISOString();
        
        // Update in issues array
        const index = issues.findIndex(i => i.issueId === currentIssue.issueId);
        if (index !== -1) {
            issues[index] = currentIssue;
        }

        Utils.showNotification('Status updated', 'success');
    },

    /**
     * Update issue priority
     */
    updateIssuePriority: () => {
        if (!currentIssue) return;
        
        const newPriority = document.getElementById('modalIssuePriority').value;
        currentIssue.priority = newPriority;
        currentIssue.updatedAt = new Date().toISOString();
        
        // Update in issues array
        const index = issues.findIndex(i => i.issueId === currentIssue.issueId);
        if (index !== -1) {
            issues[index] = currentIssue;
        }

        Utils.showNotification('Priority updated', 'success');
    },

    /**
     * Update issue assignee
     */
    updateIssueAssignee: () => {
        if (!currentIssue) return;
        
        const newAssignee = document.getElementById('modalIssueAssignee').value;
        currentIssue.assignee = newAssignee;
        currentIssue.updatedAt = new Date().toISOString();
        
        // Update in issues array
        const index = issues.findIndex(i => i.issueId === currentIssue.issueId);
        if (index !== -1) {
            issues[index] = currentIssue;
        }

        Utils.showNotification('Assignee updated', 'success');
    },

    /**
     * Save all changes
     */
    saveIssueChanges: () => {
        if (!currentIssue) return;
        
        // Update issue in the main array
        const index = issues.findIndex(i => i.issueId === currentIssue.issueId);
        if (index !== -1) {
            issues[index] = currentIssue;
        }

        // Refresh the issues table
        IssueManager.loadIssues();
        
        Utils.showNotification('Changes saved successfully', 'success');
    }
};

// Add utility function for file size formatting
Utils.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ===== GLOBAL FUNCTIONS FOR PHASE 2 =====
window.openIssueModal = AdvancedIssueManager.openIssueModal;
window.closeIssueModal = AdvancedIssueManager.closeIssueModal;
window.addComment = AdvancedIssueManager.addComment;
window.addTimeEntry = AdvancedIssueManager.addTimeEntry;
window.toggleTimer = AdvancedIssueManager.toggleTimer;
window.updateIssueStatus = AdvancedIssueManager.updateIssueStatus;
window.updateIssuePriority = AdvancedIssueManager.updateIssuePriority;
window.updateIssueAssignee = AdvancedIssueManager.updateIssueAssignee;
window.saveIssueChanges = AdvancedIssueManager.saveIssueChanges;

// ===== PHASE 2B: REPORTS & ANALYTICS =====

// Reports Management
const ReportsManager = {
    currentReportType: 'summary',
    
    /**
     * Show reports section
     */
    showReports: () => {
        UI.hideAllSections();
        document.getElementById('reportsSection').classList.add('active');
        ReportsManager.loadDefaultReport();
    },

    /**
     * Show specific report type
     */
    showReportType: (type) => {
        ReportsManager.currentReportType = type;
        
        // Hide all report sections
        const reportSections = ['summaryReport', 'trendsReport', 'performanceReport', 'customReport'];
        reportSections.forEach(section => {
            document.getElementById(section).style.display = 'none';
        });
        
        // Show selected report section
        document.getElementById(type + 'Report').style.display = 'block';
        
        // Load report data
        ReportsManager.loadReportData(type);
    },

    /**
     * Load default report
     */
    loadDefaultReport: () => {
        ReportsManager.showReportType('summary');
    },

    /**
     * Load report data based on type
     */
    loadReportData: (type) => {
        switch(type) {
            case 'summary':
                ReportsManager.loadSummaryReport();
                break;
            case 'trends':
                ReportsManager.loadTrendsReport();
                break;
            case 'performance':
                ReportsManager.loadPerformanceReport();
                break;
            case 'custom':
                ReportsManager.loadCustomReport();
                break;
        }
    },

    /**
     * Load summary report
     */
    loadSummaryReport: () => {
        const filteredIssues = ReportsManager.getFilteredIssues();
        
        // Calculate metrics
        const totalIssues = filteredIssues.length;
        const resolvedIssues = filteredIssues.filter(issue => issue.status === 'RESOLVED' || issue.status === 'CLOSED').length;
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
        
        // Calculate average resolution time (mock data)
        const avgResolutionTime = ReportsManager.calculateAvgResolutionTime(filteredIssues);
        
        // Calculate team velocity (issues per week)
        const teamVelocity = ReportsManager.calculateTeamVelocity(filteredIssues);

        // Update metrics
        document.getElementById('reportTotalIssues').textContent = totalIssues;
        document.getElementById('reportResolutionRate').textContent = resolutionRate + '%';
        document.getElementById('reportAvgResolutionTime').textContent = avgResolutionTime + ' days';
        document.getElementById('reportTeamVelocity').textContent = teamVelocity + ' issues/week';

        // Load charts
        ReportsManager.loadSummaryCharts(filteredIssues);
    },

    /**
     * Load trends report
     */
    loadTrendsReport: () => {
        const filteredIssues = ReportsManager.getFilteredIssues();
        ReportsManager.loadTrendsCharts(filteredIssues);
    },

    /**
     * Load performance report
     */
    loadPerformanceReport: () => {
        const filteredIssues = ReportsManager.getFilteredIssues();
        ReportsManager.loadPerformanceCharts(filteredIssues);
    },

    /**
     * Load custom report
     */
    loadCustomReport: () => {
        // Custom report builder interface
        console.log('Custom report builder loaded');
    },

    /**
     * Get filtered issues based on current filters
     */
    getFilteredIssues: () => {
        let filteredIssues = [...issues];
        
        const dateRange = document.getElementById('reportDateRange').value;
        const category = document.getElementById('reportCategory').value;
        const assignee = document.getElementById('reportAssignee').value;

        // Filter by date range
        if (dateRange !== 'all') {
            const daysAgo = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            
            filteredIssues = filteredIssues.filter(issue => 
                new Date(issue.createdAt) >= cutoffDate
            );
        }

        // Filter by category
        if (category !== 'all') {
            filteredIssues = filteredIssues.filter(issue => issue.category === category);
        }

        // Filter by assignee
        if (assignee !== 'all') {
            if (assignee === 'unassigned') {
                filteredIssues = filteredIssues.filter(issue => !issue.assignee || issue.assignee === '');
            } else {
                filteredIssues = filteredIssues.filter(issue => issue.assignee === assignee);
            }
        }

        return filteredIssues;
    },

    /**
     * Calculate average resolution time
     */
    calculateAvgResolutionTime: (issues) => {
        const resolvedIssues = issues.filter(issue => issue.status === 'RESOLVED' || issue.status === 'CLOSED');
        if (resolvedIssues.length === 0) return 0;

        const totalDays = resolvedIssues.reduce((sum, issue) => {
            const created = new Date(issue.createdAt);
            const updated = new Date(issue.updatedAt);
            const days = Math.ceil((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);

        return Math.round(totalDays / resolvedIssues.length);
    },

    /**
     * Calculate team velocity
     */
    calculateTeamVelocity: (issues) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentIssues = issues.filter(issue => 
            new Date(issue.createdAt) >= weekAgo
        );

        return recentIssues.length;
    },

    /**
     * Load summary charts
     */
    loadSummaryCharts: (issues) => {
        // Status chart
        const statusData = ReportsManager.getStatusData(issues);
        ReportsManager.renderChart('reportStatusChart', 'Status Distribution', statusData, 'pie');

        // Priority chart
        const priorityData = ReportsManager.getPriorityData(issues);
        ReportsManager.renderChart('reportPriorityChart', 'Priority Distribution', priorityData, 'bar');

        // Category chart
        const categoryData = ReportsManager.getCategoryData(issues);
        ReportsManager.renderChart('reportCategoryChart', 'Category Distribution', categoryData, 'pie');

        // Time chart
        const timeData = ReportsManager.getTimeData(issues);
        ReportsManager.renderChart('reportTimeChart', 'Issues Over Time', timeData, 'line');
    },

    /**
     * Load trends charts
     */
    loadTrendsCharts: (issues) => {
        // Volume trends
        const volumeData = ReportsManager.getVolumeTrends(issues);
        ReportsManager.renderChart('trendsVolumeChart', 'Issue Volume Trends', volumeData, 'line');

        // Resolution trends
        const resolutionData = ReportsManager.getResolutionTrends(issues);
        ReportsManager.renderChart('trendsResolutionChart', 'Resolution Time Trends', resolutionData, 'bar');

        // Priority trends
        const priorityTrends = ReportsManager.getPriorityTrends(issues);
        ReportsManager.renderChart('trendsPriorityChart', 'Priority Distribution Trends', priorityTrends, 'bar');
    },

    /**
     * Load performance charts
     */
    loadPerformanceCharts: (issues) => {
        // Team performance
        const teamData = ReportsManager.getTeamPerformance(issues);
        ReportsManager.renderChart('teamPerformanceChart', 'Team Performance', teamData, 'bar');

        // Resolution time by category
        const resolutionData = ReportsManager.getResolutionByCategory(issues);
        ReportsManager.renderChart('resolutionTimeChart', 'Resolution Time by Category', resolutionData, 'bar');

        // Workload distribution
        const workloadData = ReportsManager.getWorkloadDistribution(issues);
        ReportsManager.renderChart('workloadChart', 'Workload Distribution', workloadData, 'pie');

        // SLA compliance
        const slaData = ReportsManager.getSLACompliance(issues);
        ReportsManager.renderChart('slaChart', 'SLA Compliance', slaData, 'pie');
    },

    /**
     * Get status data for charts
     */
    getStatusData: (issues) => {
        const statusCount = {};
        issues.forEach(issue => {
            statusCount[issue.status] = (statusCount[issue.status] || 0) + 1;
        });
        return Object.entries(statusCount).map(([status, count]) => ({ label: status, value: count }));
    },

    /**
     * Get priority data for charts
     */
    getPriorityData: (issues) => {
        const priorityCount = {};
        issues.forEach(issue => {
            priorityCount[issue.priority] = (priorityCount[issue.priority] || 0) + 1;
        });
        return Object.entries(priorityCount).map(([priority, count]) => ({ label: priority, value: count }));
    },

    /**
     * Get category data for charts
     */
    getCategoryData: (issues) => {
        const categoryCount = {};
        issues.forEach(issue => {
            categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
        });
        return Object.entries(categoryCount).map(([category, count]) => ({ label: category, value: count }));
    },

    /**
     * Get time data for charts
     */
    getTimeData: (issues) => {
        const timeCount = {};
        issues.forEach(issue => {
            const date = new Date(issue.createdAt).toLocaleDateString();
            timeCount[date] = (timeCount[date] || 0) + 1;
        });
        return Object.entries(timeCount).map(([date, count]) => ({ label: date, value: count }));
    },

    /**
     * Get volume trends data
     */
    getVolumeTrends: (issues) => {
        // Mock data for trends
        return [
            { label: 'Week 1', value: 5 },
            { label: 'Week 2', value: 8 },
            { label: 'Week 3', value: 12 },
            { label: 'Week 4', value: 7 }
        ];
    },

    /**
     * Get resolution trends data
     */
    getResolutionTrends: (issues) => {
        return [
            { label: 'Low', value: 2 },
            { label: 'Medium', value: 5 },
            { label: 'High', value: 8 },
            { label: 'Critical', value: 12 }
        ];
    },

    /**
     * Get priority trends data
     */
    getPriorityTrends: (issues) => {
        return [
            { label: 'Low', value: 3 },
            { label: 'Medium', value: 6 },
            { label: 'High', value: 4 },
            { label: 'Critical', value: 1 }
        ];
    },

    /**
     * Get team performance data
     */
    getTeamPerformance: (issues) => {
        return [
            { label: 'Admin User', value: 8 },
            { label: 'Support Staff', value: 12 },
            { label: 'Unassigned', value: 3 }
        ];
    },

    /**
     * Get resolution time by category
     */
    getResolutionByCategory: (issues) => {
        return [
            { label: 'Bug', value: 3 },
            { label: 'Feature', value: 7 },
            { label: 'Enhancement', value: 5 },
            { label: 'Documentation', value: 2 }
        ];
    },

    /**
     * Get workload distribution
     */
    getWorkloadDistribution: (issues) => {
        return [
            { label: 'Admin User', value: 40 },
            { label: 'Support Staff', value: 60 }
        ];
    },

    /**
     * Get SLA compliance data
     */
    getSLACompliance: (issues) => {
        return [
            { label: 'Within SLA', value: 85 },
            { label: 'Overdue', value: 15 }
        ];
    },

    /**
     * Render chart (mock implementation)
     */
    renderChart: (elementId, title, data, type) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Create a simple chart representation
        let chartHTML = `<div style="text-align: center; padding: 20px;">
            <h4 style="color: var(--gray-700); margin-bottom: 15px;">${title}</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">`;

        data.forEach(item => {
            const percentage = data.reduce((sum, d) => sum + d.value, 0) > 0 
                ? Math.round((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100) 
                : 0;
            
            chartHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: var(--gray-50); border-radius: 8px;">
                    <span style="font-weight: 500; color: var(--gray-700);">${item.label}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 100px; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));"></div>
                        </div>
                        <span style="font-weight: 600; color: var(--primary-color);">${item.value} (${percentage}%)</span>
                    </div>
                </div>`;
        });

        chartHTML += `</div></div>`;
        element.innerHTML = chartHTML;
    },

    /**
     * Generate report based on current filters
     */
    generateReport: () => {
        ReportsManager.loadReportData(ReportsManager.currentReportType);
        Utils.showNotification('Report generated successfully!', 'success');
    },

    /**
     * Export report
     */
    exportReport: (format) => {
        const reportData = ReportsManager.getFilteredIssues();
        const reportName = `issue_report_${new Date().toISOString().split('T')[0]}`;
        
        switch(format) {
            case 'pdf':
                ReportsManager.exportToPDF(reportData, reportName);
                break;
            case 'csv':
                ReportsManager.exportToCSV(reportData, reportName);
                break;
            case 'excel':
                ReportsManager.exportToExcel(reportData, reportName);
                break;
        }
    },

    /**
     * Export to PDF (mock implementation)
     */
    exportToPDF: (data, filename) => {
        Utils.showNotification('PDF export would generate: ' + filename + '.pdf', 'info');
        // In a real implementation, this would use a PDF library
    },

    /**
     * Export to CSV
     */
    exportToCSV: (data, filename) => {
        const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Assignee', 'Created', 'Updated'];
        const csvContent = [
            headers.join(','),
            ...data.map(issue => [
                issue.issueId,
                `"${issue.title}"`,
                issue.category,
                issue.priority,
                issue.status,
                issue.assignee || 'Unassigned',
                issue.createdAt,
                issue.updatedAt
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename + '.csv';
        link.click();
        URL.revokeObjectURL(url);
        
        Utils.showNotification('CSV exported successfully!', 'success');
    },

    /**
     * Export to Excel (mock implementation)
     */
    exportToExcel: (data, filename) => {
        Utils.showNotification('Excel export would generate: ' + filename + '.xlsx', 'info');
        // In a real implementation, this would use an Excel library
    },

    /**
     * Build custom report
     */
    buildCustomReport: () => {
        const selectedFilters = Array.from(document.querySelectorAll('.filter-options input:checked')).map(cb => cb.value);
        const selectedCharts = Array.from(document.querySelectorAll('.chart-options input:checked')).map(cb => cb.value);
        
        if (selectedFilters.length === 0 || selectedCharts.length === 0) {
            Utils.showNotification('Please select at least one filter and one chart type', 'error');
            return;
        }

        Utils.showNotification(`Custom report built with ${selectedFilters.length} filters and ${selectedCharts.length} chart types`, 'success');
    }
};

// ===== GLOBAL FUNCTIONS FOR PHASE 2B =====
window.showReports = ReportsManager.showReports;
window.showReportType = ReportsManager.showReportType;
window.generateReport = ReportsManager.generateReport;
window.exportReport = ReportsManager.exportReport;
window.buildCustomReport = ReportsManager.buildCustomReport;

// ===== PHASE 3: TEAM MANAGEMENT =====

// Global state for team management
let teams = [
    {
        id: 'team-1',
        name: 'Engineering Team',
        description: 'Core development team responsible for backend and frontend development',
        department: 'engineering',
        lead: 'admin@example.com',
        members: 8,
        activeIssues: 12,
        createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
        id: 'team-2',
        name: 'Design Team',
        description: 'UI/UX design team focused on user experience and visual design',
        department: 'design',
        lead: 'support@example.com',
        members: 4,
        activeIssues: 6,
        createdAt: '2025-01-15T00:00:00.000Z'
    },
    {
        id: 'team-3',
        name: 'Product Team',
        description: 'Product management team handling feature planning and roadmap',
        department: 'product',
        lead: 'admin@example.com',
        members: 3,
        activeIssues: 8,
        createdAt: '2025-02-01T00:00:00.000Z'
    }
];

let teamMembers = [
    {
        id: 'member-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'ADMIN',
        team: 'Engineering Team',
        department: 'engineering',
        status: 'active',
        joinedAt: '2025-01-01T00:00:00.000Z'
    },
    {
        id: 'member-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'SUPPORT_STAFF',
        team: 'Design Team',
        department: 'design',
        status: 'active',
        joinedAt: '2025-01-15T00:00:00.000Z'
    },
    {
        id: 'member-3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        role: 'TEAM_LEAD',
        team: 'Product Team',
        department: 'product',
        status: 'active',
        joinedAt: '2025-02-01T00:00:00.000Z'
    }
];

let roles = [
    {
        id: 'role-1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: ['create_issues', 'edit_issues', 'delete_issues', 'assign_issues', 'view_reports', 'manage_teams', 'manage_users', 'admin_access'],
        memberCount: 2,
        createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
        id: 'role-2',
        name: 'Team Lead',
        description: 'Team management with issue assignment capabilities',
        permissions: ['create_issues', 'edit_issues', 'assign_issues', 'view_reports', 'manage_teams'],
        memberCount: 3,
        createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
        id: 'role-3',
        name: 'Support Staff',
        description: 'Issue management and support capabilities',
        permissions: ['create_issues', 'edit_issues', 'assign_issues', 'view_reports'],
        memberCount: 5,
        createdAt: '2025-01-01T00:00:00.000Z'
    }
];

let departments = [
    {
        id: 'dept-1',
        name: 'Engineering',
        description: 'Software development and technical operations',
        head: 'admin@example.com',
        budget: 500000,
        teamCount: 2,
        memberCount: 12,
        createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
        id: 'dept-2',
        name: 'Design',
        description: 'User experience and visual design',
        head: 'support@example.com',
        budget: 200000,
        teamCount: 1,
        memberCount: 4,
        createdAt: '2025-01-15T00:00:00.000Z'
    },
    {
        id: 'dept-3',
        name: 'Product',
        description: 'Product strategy and roadmap management',
        head: 'admin@example.com',
        budget: 150000,
        teamCount: 1,
        memberCount: 3,
        createdAt: '2025-02-01T00:00:00.000Z'
    }
];

// Team Management
const TeamManager = {
    currentTab: 'teams',
    
    /**
     * Show teams section
     */
    showTeams: () => {
        UI.hideAllSections();
        document.getElementById('teamsSection').classList.add('active');
        UI.updateNavigation('teams');
        TeamManager.loadDefaultTab();
        
        // Update URL
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: 'teams' }, 'Teams', '/teams');
        }
    },

    /**
     * Switch between team tabs
     */
    switchTeamTab: (tabName) => {
        TeamManager.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Hide all tab content
        document.querySelectorAll('.team-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected tab content
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        // Load tab data
        TeamManager.loadTabData(tabName);
    },

    /**
     * Load default tab
     */
    loadDefaultTab: () => {
        TeamManager.switchTeamTab('teams');
    },

    /**
     * Load tab data
     */
    loadTabData: (tabName) => {
        switch(tabName) {
            case 'teams':
                TeamManager.loadTeams();
                break;
            case 'members':
                TeamManager.loadMembers();
                break;
            case 'roles':
                TeamManager.loadRoles();
                break;
            case 'departments':
                TeamManager.loadDepartments();
                break;
        }
    },

    /**
     * Load teams
     */
    loadTeams: () => {
        const teamsGrid = document.getElementById('teamsGrid');
        
        teamsGrid.innerHTML = teams.map(team => `
            <div class="team-card">
                <div class="team-header">
                    <div class="team-info">
                        <div class="team-name">${team.name}</div>
                        <div class="team-description">${team.description}</div>
                    </div>
                    <div class="team-actions">
                        <button class="action-btn edit" onclick="editTeam('${team.id}')">✏️</button>
                        <button class="action-btn delete" onclick="deleteTeam('${team.id}')">🗑️</button>
                    </div>
                </div>
                <div class="team-stats">
                    <div class="stat-item">
                        <div class="stat-label">Members</div>
                        <div class="stat-value">${team.members}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Active Issues</div>
                        <div class="stat-value">${team.activeIssues}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Department</div>
                        <div class="stat-value">${team.department}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Load members
     */
    loadMembers: () => {
        const membersTableBody = document.getElementById('membersTableBody');
        
        membersTableBody.innerHTML = teamMembers.map(member => `
            <tr>
                <td>${member.firstName} ${member.lastName}</td>
                <td>${member.email}</td>
                <td>${member.role}</td>
                <td>${member.team}</td>
                <td>${member.department}</td>
                <td><span class="member-status ${member.status}">${member.status}</span></td>
                <td>
                    <button class="action-btn edit" onclick="editMember('${member.id}')">✏️</button>
                    <button class="action-btn delete" onclick="deleteMember('${member.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Load roles
     */
    loadRoles: () => {
        const rolesGrid = document.getElementById('rolesGrid');
        
        rolesGrid.innerHTML = roles.map(role => `
            <div class="role-card">
                <div class="role-header">
                    <div class="role-info">
                        <div class="role-name">${role.name}</div>
                        <div class="role-description">${role.description}</div>
                    </div>
                    <div class="role-actions">
                        <button class="action-btn edit" onclick="editRole('${role.id}')">✏️</button>
                        <button class="action-btn delete" onclick="deleteRole('${role.id}')">🗑️</button>
                    </div>
                </div>
                <div class="role-stats">
                    <div class="stat-item">
                        <div class="stat-label">Members</div>
                        <div class="stat-value">${role.memberCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Permissions</div>
                        <div class="stat-value">${role.permissions.length}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Load departments
     */
    loadDepartments: () => {
        const departmentsGrid = document.getElementById('departmentsGrid');
        
        departmentsGrid.innerHTML = departments.map(dept => `
            <div class="department-card">
                <div class="department-header">
                    <div class="department-info">
                        <div class="department-name">${dept.name}</div>
                        <div class="department-description">${dept.description}</div>
                    </div>
                    <div class="department-actions">
                        <button class="action-btn edit" onclick="editDepartment('${dept.id}')">✏️</button>
                        <button class="action-btn delete" onclick="deleteDepartment('${dept.id}')">🗑️</button>
                    </div>
                </div>
                <div class="department-stats">
                    <div class="stat-item">
                        <div class="stat-label">Teams</div>
                        <div class="stat-value">${dept.teamCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Members</div>
                        <div class="stat-value">${dept.memberCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Budget</div>
                        <div class="stat-value">$${(dept.budget / 1000).toFixed(0)}k</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Open create team modal
     */
    openCreateTeamModal: () => {
        document.getElementById('createTeamModal').style.display = 'block';
    },

    /**
     * Close create team modal
     */
    closeCreateTeamModal: () => {
        document.getElementById('createTeamModal').style.display = 'none';
        document.getElementById('createTeamForm').reset();
    },

    /**
     * Create new team
     */
    createTeam: () => {
        const name = document.getElementById('teamName').value;
        const description = document.getElementById('teamDescription').value;
        const department = document.getElementById('teamDepartment').value;
        const lead = document.getElementById('teamLead').value;

        if (!name) {
            Utils.showNotification('Team name is required', 'error');
            return;
        }

        const newTeam = {
            id: 'team-' + Date.now(),
            name: name,
            description: description,
            department: department,
            lead: lead,
            members: 0,
            activeIssues: 0,
            createdAt: new Date().toISOString()
        };

        teams.push(newTeam);
        TeamManager.loadTeams();
        TeamManager.closeCreateTeamModal();
        Utils.showNotification('Team created successfully!', 'success');
    },

    /**
     * Open invite member modal
     */
    openInviteMemberModal: () => {
        document.getElementById('inviteMemberModal').style.display = 'block';
    },

    /**
     * Close invite member modal
     */
    closeInviteMemberModal: () => {
        document.getElementById('inviteMemberModal').style.display = 'none';
        document.getElementById('inviteMemberForm').reset();
    },

    /**
     * Invite new member
     */
    inviteMember: () => {
        const firstName = document.getElementById('inviteFirstName').value;
        const lastName = document.getElementById('inviteLastName').value;
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;
        const team = document.getElementById('inviteTeam').value;
        const department = document.getElementById('inviteDepartment').value;

        if (!firstName || !lastName || !email) {
            Utils.showNotification('First name, last name, and email are required', 'error');
            return;
        }

        const newMember = {
            id: 'member-' + Date.now(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
            team: team,
            department: department,
            status: 'pending',
            joinedAt: new Date().toISOString()
        };

        teamMembers.push(newMember);
        TeamManager.loadMembers();
        TeamManager.closeInviteMemberModal();
        Utils.showNotification('Member invitation sent successfully!', 'success');
    },

    /**
     * Open create role modal
     */
    openCreateRoleModal: () => {
        document.getElementById('createRoleModal').style.display = 'block';
    },

    /**
     * Close create role modal
     */
    closeCreateRoleModal: () => {
        document.getElementById('createRoleModal').style.display = 'none';
        document.getElementById('createRoleForm').reset();
    },

    /**
     * Create new role
     */
    createRole: () => {
        const name = document.getElementById('roleName').value;
        const description = document.getElementById('roleDescription').value;
        const permissions = Array.from(document.querySelectorAll('.permission-item input:checked')).map(cb => cb.value);

        if (!name) {
            Utils.showNotification('Role name is required', 'error');
            return;
        }

        const newRole = {
            id: 'role-' + Date.now(),
            name: name,
            description: description,
            permissions: permissions,
            memberCount: 0,
            createdAt: new Date().toISOString()
        };

        roles.push(newRole);
        TeamManager.loadRoles();
        TeamManager.closeCreateRoleModal();
        Utils.showNotification('Role created successfully!', 'success');
    },

    /**
     * Open create department modal
     */
    openCreateDepartmentModal: () => {
        document.getElementById('createDepartmentModal').style.display = 'block';
    },

    /**
     * Close create department modal
     */
    closeCreateDepartmentModal: () => {
        document.getElementById('createDepartmentModal').style.display = 'none';
        document.getElementById('createDepartmentForm').reset();
    },

    /**
     * Create new department
     */
    createDepartment: () => {
        const name = document.getElementById('departmentName').value;
        const description = document.getElementById('departmentDescription').value;
        const head = document.getElementById('departmentHead').value;
        const budget = document.getElementById('departmentBudget').value;

        if (!name) {
            Utils.showNotification('Department name is required', 'error');
            return;
        }

        const newDepartment = {
            id: 'dept-' + Date.now(),
            name: name,
            description: description,
            head: head,
            budget: budget ? parseInt(budget) : 0,
            teamCount: 0,
            memberCount: 0,
            createdAt: new Date().toISOString()
        };

        departments.push(newDepartment);
        TeamManager.loadDepartments();
        TeamManager.closeCreateDepartmentModal();
        Utils.showNotification('Department created successfully!', 'success');
    },

    /**
     * Refresh functions
     */
    refreshTeams: () => {
        TeamManager.loadTeams();
        Utils.showNotification('Teams refreshed!', 'success');
    },

    refreshMembers: () => {
        TeamManager.loadMembers();
        Utils.showNotification('Members refreshed!', 'success');
    },

    refreshRoles: () => {
        TeamManager.loadRoles();
        Utils.showNotification('Roles refreshed!', 'success');
    },

    refreshDepartments: () => {
        TeamManager.loadDepartments();
        Utils.showNotification('Departments refreshed!', 'success');
    }
};

// ===== GLOBAL FUNCTIONS FOR PHASE 3 =====
window.showTeams = TeamManager.showTeams;
window.switchTeamTab = TeamManager.switchTeamTab;
window.openCreateTeamModal = TeamManager.openCreateTeamModal;
window.closeCreateTeamModal = TeamManager.closeCreateTeamModal;
window.createTeam = TeamManager.createTeam;
window.openInviteMemberModal = TeamManager.openInviteMemberModal;
window.closeInviteMemberModal = TeamManager.closeInviteMemberModal;
window.inviteMember = TeamManager.inviteMember;
window.openCreateRoleModal = TeamManager.openCreateRoleModal;
window.closeCreateRoleModal = TeamManager.closeCreateRoleModal;
window.createRole = TeamManager.createRole;
window.openCreateDepartmentModal = TeamManager.openCreateDepartmentModal;
window.closeCreateDepartmentModal = TeamManager.closeCreateDepartmentModal;
window.createDepartment = TeamManager.createDepartment;
window.refreshTeams = TeamManager.refreshTeams;
window.refreshMembers = TeamManager.refreshMembers;
window.refreshRoles = TeamManager.refreshRoles;
window.refreshDepartments = TeamManager.refreshDepartments;
