// Shiur Gimmel Summer Mivtzah 2025 - Admin Module
class MivtzahAdmin {
    constructor(core, messaging) {
        this.core = core;
        this.messaging = messaging;
        this.adminInboxTab = 'inbox';
        this.isAdminComposing = false;
        this.isAdminReplying = false;
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
            <div class="user-table-container">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.length > 0 ? users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.username}</td>
                                <td class="actions">
                                    <button class="btn btn-outline btn-sm delete-user-btn" data-username="${user.username}">
                                        <i data-lucide="trash-2"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="3" class="text-center">No users found.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>

            <div id="add-user-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Create New User</h4>
                        <button id="close-add-user-modal" class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label for="new-user-name">Full Name</label>
                            <input type="text" id="new-user-name" placeholder="Enter full name">
                        </div>
                        <div class="input-group">
                            <label for="new-user-username">Username</label>
                            <input type="text" id="new-user-username" placeholder="Enter username">
                        </div>
                        <div class="input-group">
                            <label for="new-user-password">Password</label>
                            <input type="password" id="new-user-password" placeholder="Enter password (min. 6 characters)">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-add-user" class="btn btn-outline">Cancel</button>
                        <button id="save-user-btn" class="btn btn-primary">Save User</button>
                    </div>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add event listeners
        document.getElementById('add-user-btn').addEventListener('click', () => this.openCreateUserModal());
        document.getElementById('close-add-user-modal').addEventListener('click', () => this.closeCreateUserModal());
        document.getElementById('cancel-add-user').addEventListener('click', () => this.closeCreateUserModal());
        document.getElementById('save-user-btn').addEventListener('click', () => this.handleCreateUser());
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteUser(e.currentTarget.dataset.username));
        });
    }

    openCreateUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
    }

    closeCreateUserModal() {
        document.getElementById('add-user-modal').classList.add('hidden');
        // Clear form fields
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-username').value = '';
        document.getElementById('new-user-password').value = '';
    }

    handleCreateUser() {
        const name = document.getElementById('new-user-name').value.trim();
        const username = document.getElementById('new-user-username').value.trim();
        const password = document.getElementById('new-user-password').value;

        if (!name || !username || !password) {
            this.core.showNotification('Missing Information', 'Please fill in all fields.', 'warning');
            return;
        }

        if (password.length < 6) {
            this.core.showNotification('Invalid Password', 'Password must be at least 6 characters.', 'warning');
            return;
        }

        if (this.core.students[username] || this.core.admins[username]) {
            this.core.showNotification('User Exists', 'This username is already taken.', 'error');
            return;
        }

        this.core.students[username] = { name, username, password };
        this.core.saveData('students', this.core.students);
        this.core.showNotification('User Created', `User "${name}" has been successfully created.`, 'success');
        this.closeCreateUserModal();
        this.loadAdminStudents(); // Refresh the user list
    }

    handleDeleteUser(username) {
        if (confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
            // Delete user and associated data
            delete this.core.students[username];
            delete this.core.submissions[username];
            if (this.core.chineseAuction.tickets[username]) {
                delete this.core.chineseAuction.tickets[username];
            }

            this.core.saveData('students', this.core.students);
            this.core.saveData('submissions', this.core.submissions);
            this.core.saveData('chineseAuction', this.core.chineseAuction);

            this.core.showNotification('User Deleted', `User "${username}" has been deleted.`, 'success');
            this.loadAdminStudents(); // Refresh the user list
        }
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

    // Student Requests
    loadAdminRequests() {
        const container = document.getElementById('admin-requests-container');

        container.innerHTML = `
            <div class="card">
                <h3>Student Requests</h3>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">Manage messages and requests from students</p>

                ${this.core.adminRequests.length > 0 ? `
                    <div class="requests-list">
                        ${this.core.adminRequests
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .map(request => `
                                <div class="request-card ${request.resolved ? 'resolved' : 'pending'}">
                                    <div class="request-header">
                                        <div class="request-user-info">
                                            <h4>${request.studentName} (${request.studentUsername})</h4>
                                            <p class="request-timestamp">${new Date(request.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div class="request-status">
                                            <span class="status-badge ${request.resolved ? 'resolved' : 'pending'}">
                                                ${request.resolved ? 'Resolved' : 'Pending'}
                                            </span>
                                            ${!request.resolved ? `
                                                <button class="btn btn-success btn-sm" onclick="window.admin.resolveRequest(${request.id})">
                                                    Mark Resolved
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div class="request-content">
                                        <h5 class="request-subject">${request.subject}</h5>
                                        <p class="request-message">${request.message}</p>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <p class="empty-state-text">No student requests yet.</p>
                        <p class="empty-state-subtext">Student messages will appear here when they contact admin.</p>
                    </div>
                `}
            </div>
        `;
    }

    resolveRequest(requestId) {
        const request = this.core.adminRequests.find(req => req.id === requestId);
        if (request) {
            request.resolved = true;
            this.core.saveData('adminRequests', this.core.adminRequests);
            this.loadAdminRequests(); // Refresh the display
        }
    }

    // Chinese Auction Management
    loadAdminAuction() {
        document.getElementById('admin-auction-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Chinese Auction Management</h2>
                <p>Auction management coming soon!</p>
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
    }    // Admin messaging system - use same UI as student side
    loadAdminMessages() {
        const container = document.getElementById('admin-messages-container');
        if (!container) return;
        
        // Set admin as logged in user temporarily for messaging
        const originalUser = this.core.loggedInUser;
        this.core.loggedInUser = 'admin';
        
        // Use the standard messaging UI from messaging.js
        container.innerHTML = this.messaging.generateInboxUI('admin');
        this.messaging.setupMessagesEventListeners();
        
        // Restore original user        this.core.loggedInUser = originalUser;
    }
}
        // Initialize admin inbox tab state if not exists
        if (!this.adminInboxTab) {
            this.adminInboxTab = 'inbox';
        }        // Get counts for each tab using messaging module
        try {
            const inboxThreads = this.messaging.getThreadsForUser('admin', 'admin', 'inbox') || [];
            const allThreads = this.messaging.getThreadsForUser('admin', 'admin', 'all') || [];
            const trashThreads = this.messaging.getThreadsForUser('admin', 'admin', 'trash') || [];

            console.log('Admin UI - Inbox threads:', inboxThreads.length, 'All threads:', allThreads.length, 'Trash threads:', trashThreads.length);

            return `
                <div class="inbox-header">
                    <h4>Student Messages</h4>
                    <button id="admin-compose-btn" class="btn btn-primary btn-sm">
                        <i data-lucide="edit-3"></i> New Message
                    </button>
                </div>

                <div id="admin-inbox-thread-view"></div>

                <div class="admin-inbox-tabs">
                    <div class="inbox-tab-nav">
                        <button class="inbox-tab-btn ${this.adminInboxTab === 'inbox' ? 'active' : ''}" data-tab="inbox">
                            Inbox ${inboxThreads.length > 0 ? `(${inboxThreads.length})` : ''}
                        </button>
                        <button class="inbox-tab-btn ${this.adminInboxTab === 'all' ? 'active' : ''}" data-tab="all">
                            All ${allThreads.length > 0 ? `(${allThreads.length})` : ''}
                        </button>
                        <button class="inbox-tab-btn ${this.adminInboxTab === 'trash' ? 'active' : ''}" data-tab="trash">
                            Trash ${trashThreads.length > 0 ? `(${trashThreads.length})` : ''}
                        </button>
                    </div>

                    <div class="inbox-tab-content">
                        ${this.generateAdminInboxTabContent()}
                    </div>
                </div>

                <div id="admin-compose-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4>New Message to Student</h4>
                            <button id="close-admin-compose-modal" class="btn-close">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label>Send to Student</label>
                                <select id="admin-compose-recipient" class="full-width">
                                    <option value="">Select a student...</option>
                                    ${Object.keys(this.core.students).map(username => 
                                        `<option value="${username}">${this.core.students[username].name} (${username})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="input-group">
                                <label>Subject</label>
                                <input type="text" id="admin-compose-subject" placeholder="Message subject" class="full-width">
                            </div>
                            <div class="input-group">
                                <label>Message</label>
                                <textarea id="admin-compose-message" placeholder="Write your message..." class="full-width" rows="6"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="send-admin-message-btn" class="btn btn-primary">Send Message</button>
                            <button id="cancel-admin-compose-btn" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            `;        } catch (error) {
            console.error('Error generating admin inbox UI:', error);
            return `<div class="error-message">Error loading messaging interface</div>`;
        }
    }    generateAdminInboxTabContent() {
        try {
            const threads = this.messaging.getThreadsForUser('admin', 'admin', this.adminInboxTab);
            console.log(`Admin inbox tab: ${this.adminInboxTab}, Threads:`, threads);
            
            if (!threads || threads.length === 0) {
                console.log('No threads found for admin inbox');
                return `<div class="inbox-empty">No messages in ${this.adminInboxTab}</div>`;
            }

            return threads.map(thread => {
                // Handle case where thread is just an array of messages
                const messages = Array.isArray(thread) ? thread : (thread.messages || []);
                if (!messages || messages.length === 0) return '';
                
                const lastMessage = messages[messages.length - 1];
                if (!lastMessage) return '';
                
                const threadId = lastMessage.threadId || 'unknown';
                const isUnread = !thread.readBy || !thread.readBy.includes('admin');
                
                return `
                    <div class="thread-item ${isUnread ? 'unread' : ''}" data-thread-id="${threadId}">
                        <div class="thread-main">
                            <div class="thread-header">
                                <div class="thread-info">
                                    <span class="thread-from">From: ${this.core.students[lastMessage.from]?.name || lastMessage.from}</span>
                                    <span class="thread-date">${this.core.formatDate ? this.core.formatDate(lastMessage.timestamp) : new Date(lastMessage.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="thread-actions">
                                    ${this.adminInboxTab === 'trash' ? 
                                        `<button class="btn-icon restore-thread-btn" data-thread-id="${threadId}" title="Restore">
                                            <i data-lucide="rotate-ccw"></i>
                                        </button>` :
                                        `<button class="btn-icon delete-admin-thread-btn" data-thread-id="${threadId}" title="Delete">
                                            <i data-lucide="trash-2"></i>
                                        </button>`
                                    }
                                </div>
                            </div>
                            <div class="thread-subject">${lastMessage.subject || 'No Subject'}</div>
                            <div class="thread-preview">${(lastMessage.message || '').substring(0, 100)}${(lastMessage.message || '').length > 100 ? '...' : ''}</div>
                        </div>
                    </div>
                `;
            }).filter(html => html).join(''); // Filter out empty strings
        } catch (error) {
            console.error('Error generating admin inbox content:', error);
            return `<div class="inbox-empty">Error loading messages</div>`;
        }
    }

    setupAdminMessagesEventListeners() {
        // Admin compose button
        const composeBtn = document.getElementById('admin-compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                document.getElementById('admin-compose-modal').classList.remove('hidden');
                document.getElementById('admin-compose-recipient').focus();
            });
        }

        // Close compose modal
        const closeModalBtn = document.getElementById('close-admin-compose-modal');
        const cancelBtn = document.getElementById('cancel-admin-compose-btn');
        
        [closeModalBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('admin-compose-modal').classList.add('hidden');
                    this.clearAdminComposeForm();
                });
            }
        });

        // Send message
        const sendBtn = document.getElementById('send-admin-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendAdminMessage());
        }

        // Tab switching
        document.querySelectorAll('.admin-inbox-tabs .inbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.adminInboxTab = btn.dataset.tab;
                this.loadAdminMessages();
            });
        });

        // Thread items
        document.querySelectorAll('.thread-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.thread-actions')) {
                    this.openAdminThread(item.dataset.threadId);
                }
            });
        });

        // Delete/restore buttons
        document.querySelectorAll('.delete-admin-thread-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.platform.deleteAdminThread(btn.dataset.threadId);
            });
        });

        document.querySelectorAll('.restore-thread-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.platform.restoreAdminThread(btn.dataset.threadId);
            });
        });

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    sendAdminMessage() {
        const recipient = document.getElementById('admin-compose-recipient').value;
        const subject = document.getElementById('admin-compose-subject').value.trim();
        const message = document.getElementById('admin-compose-message').value.trim();

        if (!recipient || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Create new thread using messaging module
        const threadId = this.messaging.createThread(recipient, 'admin', subject, message);
        
        if (threadId) {
            document.getElementById('admin-compose-modal').classList.add('hidden');
            this.clearAdminComposeForm();
            this.loadAdminMessages();
            this.core.showNotification('Success', 'Message sent successfully', 'success');
        }
    }

    clearAdminComposeForm() {
        document.getElementById('admin-compose-recipient').value = '';
        document.getElementById('admin-compose-subject').value = '';
        document.getElementById('admin-compose-message').value = '';
    }

    openAdminThread(threadId) {
        // Mark as read
        this.messaging.markThreadRead(threadId, 'admin');
        
        // Show thread view
        const threadView = document.getElementById('admin-inbox-thread-view');
        const thread = this.messaging.getThread(threadId);
        
        if (!thread || !threadView) return;

        threadView.innerHTML = this.messaging.generateThreadView(thread, 'admin');
        threadView.classList.remove('hidden');

        // Setup thread view event listeners
        this.messaging.setupThreadViewEventListeners(thread, 'admin');
        
        // Refresh inbox to update read status
        const tabContent = document.querySelector('.admin-inbox-tabs .inbox-tab-content');
        if (tabContent) {
            tabContent.innerHTML = this.generateAdminInboxTabContent();
            this.setupAdminMessagesEventListeners();
        }
    }

    deleteAdminThread(threadId) {
        if (confirm('Are you sure you want to delete this thread?')) {
            this.messaging.moveThreadToTrash(threadId);
            this.loadAdminMessages();
        }
    }

    restoreAdminThread(threadId) {
        this.messaging.restoreThreadFromTrash(threadId);
        this.loadAdminMessages();
    }
}