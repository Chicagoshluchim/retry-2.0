// Shiur Gimmel Summer Mivtzah 2025 - Admin Module (Clean Version)
class MivtzahAdmin {
    constructor(core, messaging) {
        this.core = core;
        this.messaging = messaging;
    }

    // Dashboard
    loadAdminDashboard() {
        document.getElementById('admin-dashboard-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Admin Dashboard</h2>
                <p>Full admin features coming soon!</p>
            </div>
        `;
    }

    // Student Management
    loadAdminStudents() {
        const container = document.getElementById('admin-students-container');
        const users = Object.values(this.core.students);

        container.innerHTML = `
            <div class="admin-header">
                <h3>Manage Users</h3>
                <button id="add-user-btn" class="btn btn-primary">
                    <i data-lucide="user-plus"></i> Create User
                </button>
            </div>
            <div class="users-grid">
                ${users.map(student => `
                    <div class="user-card">
                        <div class="user-info">
                            <h4>${student.name}</h4>
                            <p>Points: ${student.totalPoints || 0}</p>
                        </div>
                        <div class="user-actions">
                            <button class="btn btn-sm btn-outline">Edit</button>
                            <button class="btn btn-sm btn-danger">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Settings
    loadAdminSettings() {
        document.getElementById('admin-settings-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Settings</h2>
                <p>Admin settings coming soon!</p>
            </div>
        `;
    }

    // Auction
    loadAdminAuction() {
        document.getElementById('admin-auction-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Chinese Auction</h2>
                <p>Auction management coming soon!</p>
            </div>
        `;
    }

    // Requests
    loadAdminRequests() {
        document.getElementById('admin-requests-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Student Requests</h2>
                <p>Request management coming soon!</p>
            </div>
        `;
    }

    // Reports
    loadAdminReports() {
        document.getElementById('admin-reports-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Reports</h2>
                <p>Reporting system coming soon!</p>
            </div>
        `;
    }

    // Messaging - Use same system as student side
    loadAdminMessages() {
        const container = document.getElementById('admin-messages-container');
        if (!container) return;
        
        // Set admin as logged in user temporarily for messaging
        const originalUser = this.core.loggedInUser;
        this.core.loggedInUser = 'admin';
        
        // Use the standard messaging UI from messaging.js but adapted for admin
        const adminMessagingHTML = this.messaging.generateInboxUI('admin').replace(/student-compose/g, 'admin-compose').replace('New Message to Admin', 'New Message to Student');
        container.innerHTML = adminMessagingHTML;
        
        // Set up event listeners using messaging system
        this.messaging.setupMessagesEventListeners();
        
        // Restore original user
        this.core.loggedInUser = originalUser;
    }
}
