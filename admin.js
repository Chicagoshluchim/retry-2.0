// Shiur Gimmel Summer Mivtzah 2025 - Admin Module (Clean Version)
class MivtzahAdmin {
    constructor(core, messaging) {
        this.core = core;
        this.messaging = messaging;
        
        // Initialize sub-modules
        this.adminDashboard = new AdminDashboard(core);
        this.adminSettings = new AdminSettings(core);
        this.adminReports = new AdminReports(core);
    }

    // Helper methods for student calculations
    calculateStudentPoints(username) {
        return this.core.calculateTotalPoints(username);
    }    getStudentSubmissionCount(username) {
        const userSubmissions = this.core.submissions[username];
        if (!userSubmissions) return 0;

        let totalDays = 0;
        const uniqueDates = new Set();

        // Count unique dates across all weeks and sedarim
        Object.values(userSubmissions).forEach(weekSubmissions => {
            if (typeof weekSubmissions === 'object' && weekSubmissions !== null) {
                Object.values(weekSubmissions).forEach(sederSubmissions => {
                    if (typeof sederSubmissions === 'object' && sederSubmissions !== null) {
                        Object.keys(sederSubmissions).forEach(date => {
                            uniqueDates.add(date);
                        });
                    }
                });
            }
        });

        return uniqueDates.size;
    }    getStudentDetailedBreakdown(username) {
        const student = this.core.students[username];
        if (!student) return null;

        const breakdown = {
            username: username,
            name: student.name,
            totalPoints: this.calculateStudentPoints(username),
            auctionTickets: this.core.chineseAuction.tickets?.[username] || 0,
            submissionCount: this.getStudentSubmissionCount(username),
            registrationDate: new Date(student.createdAt || Date.now()).toLocaleDateString(),
            weeklyBreakdown: [],            sedarimStats: {
                chassidusBoker: { days: 0, points: 0, testScores: [] },
                girsa: { days: 0, points: 0, testScores: [] },
                halacha: { days: 0, points: 0, testScores: [] },
                chassidusErev: { days: 0, points: 0, testScores: [] },
                mivtzahTorah: { days: 0, points: 0, totalDafim: 0, testScores: [] }
            }
        };

        const userSubmissions = this.core.submissions[username];
        if (!userSubmissions) return breakdown;

        // Process each week
        Object.entries(userSubmissions).forEach(([week, weekSubmissions]) => {
            if (!weekSubmissions) return;

            const weekData = {
                week: week,
                points: this.core.calculateStudentWeekPoints(username, week),
                days: []
            };

            // Process each seder in the week
            Object.entries(weekSubmissions).forEach(([seder, sederSubmissions]) => {
                if (!sederSubmissions || seder.includes('Test')) return; // Skip test entries

                // Group by date for display
                const dayGroups = {};
                Object.entries(sederSubmissions).forEach(([date, data]) => {
                    if (data.attended) {
                        if (!dayGroups[date]) {
                            dayGroups[date] = { date: date, sedarim: {} };
                        }
                        
                        const points = this.core.getSedarimPoints(seder, data);
                        dayGroups[date].sedarim[seder] = {
                            attended: true,
                            points: points,
                            onTime: data.onTime || false,
                            ritzifus: data.ritzifus || false,
                            dafim: data.dafim || null,
                            late: data.late || false                        };

                        // Update stats with safety checks
                        if (breakdown.sedarimStats[seder]) {
                            breakdown.sedarimStats[seder].days++;
                            breakdown.sedarimStats[seder].points += points;
                            
                            if (seder === 'mivtzahTorah' && data.dafim) {
                                breakdown.sedarimStats[seder].totalDafim += data.dafim;
                            }
                        }
                    }
                });

                // Add days to week data
                Object.values(dayGroups).forEach(dayData => {
                    const existingDay = weekData.days.find(d => d.date === dayData.date);
                    if (existingDay) {
                        Object.assign(existingDay.sedarim, dayData.sedarim);
                    } else {
                        weekData.days.push(dayData);
                    }
                });
            });            // Handle test scores separately with safety checks
            if (weekSubmissions.girsaTest && breakdown.sedarimStats.girsa && breakdown.sedarimStats.girsa.testScores) {
                breakdown.sedarimStats.girsa.testScores.push(weekSubmissions.girsaTest);
            }
            if (weekSubmissions.halachaTest && breakdown.sedarimStats.halacha && breakdown.sedarimStats.halacha.testScores) {
                breakdown.sedarimStats.halacha.testScores.push(weekSubmissions.halachaTest);
            }

            if (weekData.days.length > 0 || weekData.points > 0) {
                breakdown.weeklyBreakdown.push(weekData);
            }
        });        return breakdown;
    }    // Dashboard - Delegate to AdminDashboard module
    loadAdminDashboard() {
        this.adminDashboard.loadAdminDashboard();
    }

    // Student Management
    loadAdminStudents() {
        const container = document.getElementById('admin-students-container');
        const users = Object.entries(this.core.students);

        container.innerHTML = `
            <div class="admin-header">
                <h3>Manage Users</h3>
                <button id="add-user-btn" class="btn btn-primary">
                    <i data-lucide="user-plus"></i> Create User
                </button>
            </div>
            <div class="users-grid">
                ${users.map(([username, student]) => {
                    const totalPoints = this.calculateStudentPoints(username);
                    const auctionTickets = this.core.chineseAuction.tickets?.[username] || 0;
                    const submissionCount = this.getStudentSubmissionCount(username);
                      return `
                        <div class="user-card" data-username="${username}">
                            <div class="user-info">
                                <h4>${student.name}</h4>
                                <p><strong>Username:</strong> ${username}</p>
                                <p><strong>Total Points:</strong> <span class="points-highlight">${totalPoints}</span></p>
                                <p><strong>Submissions:</strong> ${submissionCount} days</p>
                                <p><strong>Auction Tickets:</strong> ${auctionTickets}</p>
                                <p><strong>Registration:</strong> ${new Date(student.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                            
                            <div class="point-adjustment-section">
                                <h5>Adjust Points</h5>
                                <div class="adjustment-controls">
                                    <select id="adjustment-type-${username}" class="adjustment-type">
                                        <option value="add">Add Points</option>
                                        <option value="subtract">Subtract Points</option>
                                        <option value="set">Set Total</option>
                                    </select>
                                    <input type="number" id="adjustment-amount-${username}" placeholder="Amount" min="0" class="adjustment-amount">
                                    <input type="text" id="adjustment-reason-${username}" placeholder="Reason (optional)" class="reason-input">
                                    <button class="btn btn-sm btn-success apply-adjustment-btn" data-username="${username}">
                                        <i data-lucide="check"></i> Apply
                                    </button>
                                </div>
                            </div>
                            
                            <div class="user-actions">
                                <button class="btn btn-sm btn-primary view-details-btn" data-username="${username}">
                                    <i data-lucide="eye"></i> View Details
                                </button>
                                <button class="btn btn-sm btn-outline edit-user-btn" data-username="${username}">
                                    <i data-lucide="edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger delete-user-btn" data-username="${username}">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Create New User</h4>
                        <button id="close-add-user-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="add-user-form" class="user-edit-form">
                            <div class="input-group">
                                <label>Full Name</label>
                                <input type="text" id="new-user-name" placeholder="e.g., Yossi Cohen" required class="full-width">
                            </div>
                            <div class="input-row">
                                <div class="input-group">
                                    <label>Username</label>
                                    <input type="text" id="new-user-username" placeholder="e.g., yossi.cohen" required class="full-width">
                                </div>
                                <div class="input-group">
                                    <label>Password</label>
                                    <input type="password" id="new-user-password" placeholder="At least 6 characters" required class="full-width">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-add-user" class="btn btn-outline">Cancel</button>
                        <button id="save-add-user" class="btn btn-primary">Create User</button>
                    </div>
                </div>
            </div>

            <!-- Edit User Modal -->
            <div id="edit-user-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Edit User</h4>
                        <button id="close-edit-user-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-user-form" class="user-edit-form">
                            <input type="hidden" id="edit-user-original-username">
                            <div class="input-group">
                                <label>Full Name</label>
                                <input type="text" id="edit-user-name" required class="full-width">
                            </div>                            <div class="input-row">
                                <div class="input-group">
                                    <label>Username</label>
                                    <input type="text" id="edit-user-username" required class="full-width">
                                </div>
                                <div class="input-group">
                                    <label>New Password (leave blank to keep current)</label>
                                    <input type="password" id="edit-user-password" placeholder="Leave blank to keep current" class="full-width">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-edit-user" class="btn btn-outline">Cancel</button>
                        <button id="save-edit-user" class="btn btn-primary">Save Changes</button>                    </div>
                </div>
            </div>

            <!-- Student Details Modal -->
            <div id="student-details-modal" class="modal hidden">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h4>Student Details</h4>
                        <button id="close-student-details-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="student-details-content">
                            <!-- Content will be populated by openStudentDetailsModal -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="close-student-details" class="btn btn-primary">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupUserManagementEventListeners();
    }    // Settings - Delegate to AdminSettings module
    loadAdminSettings() {
        this.adminSettings.loadAdminSettings();
    }

    // Reports - Delegate to AdminReports module
    loadAdminReports() {
        this.adminReports.loadAdminReports();
    }// Messaging - Following original script.js implementation
    loadAdminMessages() {
        const container = document.getElementById('admin-messages-container');
        if (!container) return;
        
        container.innerHTML = this.generateAdminInboxUI();
        this.setupAdminMessagesEventListeners();
    }

    generateAdminInboxUI() {
        // Initialize admin inbox tab state if not exists
        if (!this.adminInboxTab) {
            this.adminInboxTab = 'inbox';
        }

        // Get counts for each tab
        const inboxThreads = this.messaging.getThreadsForUser('admin', 'admin', 'inbox') || [];
        const allThreads = this.messaging.getThreadsForUser('admin', 'admin', 'all') || [];
        const trashThreads = this.messaging.getThreadsForUser('admin', 'admin', 'trash') || [];

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
                                ${Object.keys(this.core.students || {}).map(username => 
                                    `<option value="${username}">${this.core.students[username]?.name || username} (${username})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Subject</label>
                            <input type="text" id="admin-compose-subject" placeholder="Message subject" class="full-width">
                        </div>
                        <div class="input-group">
                            <label>Message</label>
                            <textarea id="admin-compose-message" rows="4" placeholder="Type your message..." class="full-width"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-admin-compose" class="btn btn-outline">Cancel</button>
                        <button id="send-admin-compose" class="btn btn-primary">Send Message</button>
                    </div>
                </div>
            </div>
        `;
    }    generateAdminInboxTabContent() {
        const threads = this.messaging.getThreadsForUser('admin', 'admin', this.adminInboxTab);

        if (!threads || !threads.length) {
            const emptyMessages = {
                inbox: 'No unread messages.',
                all: 'No messages yet.',
                trash: 'No deleted messages.'
            };
            return `<div class="empty-state">
                <p>${emptyMessages[this.adminInboxTab]}</p>
                <p class="empty-state-subtext">${this.adminInboxTab === 'inbox' ? 'New student messages will appear here.' : this.adminInboxTab === 'trash' ? 'Deleted messages will appear here.' : 'Student conversations will appear here.'}</p>
            </div>`;
        }

        return `
            <div class="inbox-list">
                ${threads.map(thread => {
                    if (!thread || thread.length === 0) return '';
                    
                    const lastMsg = thread[thread.length - 1];
                    if (!lastMsg) return '';
                    
                    // For admin inbox, show the student name
                    const otherUser = lastMsg.from === 'admin' ? lastMsg.to : lastMsg.from;
                    const studentName = this.core.students[otherUser]?.name || otherUser;
                    const conversationWith = `${studentName} (${otherUser})`;
                    // Show who sent the last message in the snippet
                    const lastMsgSender = lastMsg.from === 'admin' ? 'You: ' : '';
                    const unread = thread.some(msg => msg.to === 'admin' && !msg.read && !msg.deleted);
                    const isDeleted = thread.some(msg => msg.deleted);

                    return `<div class="inbox-thread ${unread ? 'unread' : ''} ${isDeleted ? 'deleted' : ''}" data-thread="${thread[0].threadId}">
                        <div class="thread-content">
                            <div class="thread-title">${conversationWith}</div>
                            <div class="thread-snippet">${(() => {
                                const content = lastMsg.message || lastMsg.body || lastMsg.content || 'Message content unavailable';
                                const prefix = lastMsgSender;
                                const maxLength = prefix ? 55 : 60;
                                return prefix + content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
                            })()}</div>
                            <div class="thread-time">${new Date(lastMsg.timestamp).toLocaleString()}</div>
                        </div>
                        ${unread ? '<span class="unread-dot"></span>' : ''}
                        <div class="thread-actions">
                            ${this.adminInboxTab === 'trash' ? `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.platform.admin.restoreAdminThread('${thread[0].threadId}')" title="Restore">
                                    <i data-lucide="undo"></i> Restore
                                </button>
                            ` : `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.platform.admin.deleteAdminThread('${thread[0].threadId}')" title="Delete">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            `}
                        </div>
                    </div>`;
                }).filter(html => html).join('')}
            </div>
        `;
    }    setupAdminMessagesEventListeners() {
        // Admin compose message
        const composeBtn = document.getElementById('admin-compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                document.getElementById('admin-compose-modal').classList.remove('hidden');
                document.getElementById('admin-compose-recipient').focus();
            });
        }

        // Close compose modal
        const closeComposeBtn = document.getElementById('close-admin-compose-modal');
        if (closeComposeBtn) {
            closeComposeBtn.addEventListener('click', () => {
                this.hideAdminComposeModal();
            });
        }

        // Cancel compose
        const cancelComposeBtn = document.getElementById('cancel-admin-compose');
        if (cancelComposeBtn) {
            cancelComposeBtn.addEventListener('click', () => {
                this.hideAdminComposeModal();
            });
        }

        // Send compose
        const sendComposeBtn = document.getElementById('send-admin-compose');
        if (sendComposeBtn) {
            sendComposeBtn.addEventListener('click', () => {
                this.sendAdminCompose();
            });
        }        // Tab switching
        document.querySelectorAll('.admin-inbox-tabs .inbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.adminInboxTab = btn.dataset.tab;
                // Regenerate the entire tabs section to update counts and active states
                this.refreshAdminInboxTabs();
                // Clear thread view and show message list
                document.getElementById('admin-inbox-thread-view').innerHTML = '';
                document.querySelector('.admin-inbox-tabs').classList.remove('hidden');
            });
        });

        // Admin inbox thread click
        document.querySelectorAll('.admin-inbox-tabs .inbox-thread').forEach(threadEl => {
            threadEl.addEventListener('click', (e) => {
                // Prevent clicking action buttons from triggering thread view
                if (e.target.closest('.thread-action-btn')) return;

                const threadId = threadEl.dataset.thread;
                this.showAdminThreadView(threadId);
            });
        });

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setupAdminThreadViewEventListeners() {
        // Back to inbox button
        const backBtn = document.querySelector('.back-to-inbox-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const threadView = document.getElementById('admin-thread-view');
                if (threadView) threadView.innerHTML = '';
            });
        }

        // Reply button
        const replyBtn = document.querySelector('.reply-thread-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                // Get the thread ID and find the student to reply to
                const threadId = replyBtn.dataset.threadId;
                const thread = this.messaging.getThread(threadId);
                if (thread && thread.length > 0) {
                    // Open compose modal with recipient pre-filled
                    const modal = document.getElementById('admin-compose-modal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        // Pre-fill recipient and subject
                        const recipientSelect = document.getElementById('admin-compose-recipient');
                        const subjectInput = document.getElementById('admin-compose-subject');
                        if (recipientSelect) {
                            recipientSelect.value = thread[0].from;
                        }
                        if (subjectInput) {
                            subjectInput.value = 'Re: ' + (thread[0].subject || 'No Subject');
                        }
                    }
                }
            });
        }
          // Initialize Lucide icons for thread view
        if (window.lucide) {
            window.lucide.createIcons();
        }    }

    hideAdminComposeModal() {
        document.getElementById('admin-compose-modal').classList.add('hidden');
        // Clear form
        document.getElementById('admin-compose-recipient').value = '';
        document.getElementById('admin-compose-subject').value = '';
        document.getElementById('admin-compose-message').value = '';
    }    sendAdminCompose() {
        // Prevent multiple sends
        if (this.isAdminComposing) return;
        this.isAdminComposing = true;

        const recipient = document.getElementById('admin-compose-recipient').value.trim();
        const subject = document.getElementById('admin-compose-subject').value.trim();
        const message = document.getElementById('admin-compose-message').value.trim();

        if (!recipient || !subject || !message) {
            this.core.showNotification('Missing Information', 'Please fill in all fields', 'warning');
            this.isAdminComposing = false;
            return;
        }

        this.core.showLoading('Sending message...');

        setTimeout(() => {
            // Send message using messaging system
            const threadId = this.messaging.sendMessage({
                from: 'admin',
                to: recipient,
                body: message,
                subject: subject,
                senderRole: 'admin'
            });

            this.hideAdminComposeModal();
            this.isAdminComposing = false;
            
            // Refresh admin messages
            this.loadAdminMessages();
            
            this.core.hideLoading();
            this.core.showNotification('Message Sent', 'Message sent successfully!', 'success');
        }, 600);
    }refreshAdminInboxTab() {
        const tabContent = document.querySelector('.admin-inbox-tabs .inbox-tab-content');
        if (tabContent) {
            tabContent.innerHTML = this.generateAdminInboxTabContent();
            this.setupAdminMessagesEventListeners();
        }
    }

    refreshAdminInboxTabs() {
        const tabsContainer = document.querySelector('.admin-inbox-tabs');
        if (tabsContainer) {
            // Get updated counts for each tab
            const inboxThreads = this.messaging.getThreadsForUser('admin', 'admin', 'inbox') || [];
            const allThreads = this.messaging.getThreadsForUser('admin', 'admin', 'all') || [];
            const trashThreads = this.messaging.getThreadsForUser('admin', 'admin', 'trash') || [];

            tabsContainer.innerHTML = `
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
            `;

            // Re-setup event listeners for the regenerated content
            this.setupAdminMessagesEventListeners();
        }
    }    showAdminThreadView(threadId) {
        const threads = this.messaging.getThreadsForUser('admin', 'admin');
        const thread = threads.find(t => t[0].threadId === threadId);
        if (!thread) return;

        // Mark as read
        this.messaging.markThreadRead(threadId, 'admin');

        // Update admin inbox tabs and refresh tabs after marking as read
        this.refreshAdminInboxTabs();

        // Get the other user
        const otherUser = thread[0].from === 'admin' ? thread[0].to : thread[0].from;
        const studentName = this.core.students[otherUser]?.name || otherUser;

        // Render messages
        const messagesHtml = thread.map(msg => {
            const isMe = msg.from === 'admin';
            return `<div class="inbox-msg ${isMe ? 'me' : 'them'}">
                <div class="msg-body">${msg.message || msg.body || msg.content || 'Message content unavailable'}</div>
                <div class="msg-meta">${isMe ? 'You' : studentName} • ${new Date(msg.timestamp).toLocaleString()}</div>
            </div>`;
        }).join('');

        // Reply box
        const replyBox = `<div class="inbox-reply-box">
            <input id="admin-reply-input" type="text" placeholder="Type your reply..." />
            <button id="admin-reply-btn" class="btn btn-primary" data-thread="${threadId}" data-recipient="${otherUser}">
                <i data-lucide="send"></i> Send
            </button>
        </div>`;

        document.getElementById('admin-inbox-thread-view').innerHTML = `
            <div class="thread-view-header">
                <button id="back-to-admin-messages" class="btn btn-outline btn-sm">
                    <i data-lucide="arrow-left"></i> Back to Messages
                </button>
                <h5>Conversation with ${studentName}</h5>
            </div>
            <div class="inbox-messages">${messagesHtml}</div>
            ${replyBox}
        `;

        // Hide the inbox tabs and message list when thread is open
        document.querySelector('.admin-inbox-tabs').classList.add('hidden');

        // Add back to messages functionality
        document.getElementById('back-to-admin-messages').addEventListener('click', () => {
            document.getElementById('admin-inbox-thread-view').innerHTML = '';
            document.querySelector('.admin-inbox-tabs').classList.remove('hidden');
        });

        // Add Enter key support for reply
        const replyInput = document.getElementById('admin-reply-input');
        if (replyInput) {
            replyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    document.getElementById('admin-reply-btn').click();
                }
            });
        }

        // Add reply functionality
        const replyBtn = document.getElementById('admin-reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                if (this.isAdminReplying) return;
                this.isAdminReplying = true;

                const threadId = replyBtn.dataset.thread;
                const recipient = replyBtn.dataset.recipient;
                const input = document.getElementById('admin-reply-input');
                const body = input.value.trim();

                if (body) {
                    this.messaging.sendMessage({
                        from: 'admin',
                        to: recipient,
                        body,
                        senderRole: 'admin',
                        threadId
                    });

                    input.value = '';
                    this.isAdminReplying = false;
                    this.showAdminThreadView(threadId);
                } else {
                    this.isAdminReplying = false;
                }
            });
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
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

    setupUserManagementEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                document.getElementById('add-user-modal').classList.remove('hidden');
                document.getElementById('new-user-name').focus();
            });
        }

        // Close modals
        const closeAddBtn = document.getElementById('close-add-user-modal');
        const cancelAddBtn = document.getElementById('cancel-add-user');
        [closeAddBtn, cancelAddBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('add-user-modal').classList.add('hidden');
                    this.clearAddUserForm();
                });
            }
        });        const closeEditBtn = document.getElementById('close-edit-user-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-user');
        [closeEditBtn, cancelEditBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('edit-user-modal').classList.add('hidden');
                    this.clearEditUserForm();
                });
            }
        });

        const closeDetailsBtn = document.getElementById('close-student-details-modal');
        const closeDetailsBtn2 = document.getElementById('close-student-details');
        [closeDetailsBtn, closeDetailsBtn2].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('student-details-modal').classList.add('hidden');
                });
            }
        });

        // Save buttons
        const saveAddBtn = document.getElementById('save-add-user');
        if (saveAddBtn) {
            saveAddBtn.addEventListener('click', () => this.createUser());
        }

        const saveEditBtn = document.getElementById('save-edit-user');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => this.updateUser());
        }        // View details, edit and delete buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                this.openStudentDetailsModal(username);
            });
        });

        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                this.openEditUserModal(username);
            });
        });

        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                this.deleteUser(username);
            });
        });

        // Point adjustment buttons
        document.querySelectorAll('.apply-adjustment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                this.handlePointAdjustment(username);
            });
        });

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }createUser() {
        const name = document.getElementById('new-user-name').value.trim();
        const username = document.getElementById('new-user-username').value.trim();
        const password = document.getElementById('new-user-password').value;

        if (!name || !username || !password) {
            this.core.showNotification('Missing Information', 'Please fill in all fields', 'warning');
            return;
        }

        if (password.length < 6) {
            this.core.showNotification('Invalid Password', 'Password must be at least 6 characters', 'warning');
            return;
        }

        if (this.core.students[username]) {
            this.core.showNotification('Username Exists', 'Username already exists', 'error');
            return;
        }

        this.core.showLoading('Creating user...');

        setTimeout(() => {
            // Create new user
            this.core.students[username] = {
                name: name,
                username: username,
                password: password,
                totalPoints: 0,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            this.core.saveData('students', this.core.students);

            // Close modal and refresh
            document.getElementById('add-user-modal').classList.add('hidden');
            this.clearAddUserForm();
            this.loadAdminStudents();

            this.core.hideLoading();
            this.core.showNotification('User Created', 'User created successfully!', 'success');
        }, 500);
    }    openEditUserModal(username) {
        const user = this.core.students[username];
        if (!user) return;

        // Fill form with current data
        document.getElementById('edit-user-original-username').value = username;
        document.getElementById('edit-user-name').value = user.name;
        document.getElementById('edit-user-username').value = username;
        document.getElementById('edit-user-password').value = '';

        // Show modal
        document.getElementById('edit-user-modal').classList.remove('hidden');
        document.getElementById('edit-user-name').focus();
    }    openStudentDetailsModal(username) {
        const breakdown = this.getStudentDetailedBreakdown(username);
        if (!breakdown) return;

        const content = document.getElementById('student-details-content');
        
        content.innerHTML = `
            <div class="student-details-wrapper">
                <!-- Student Header Card -->
                <div class="student-header-card">
                    <div class="student-avatar">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="student-info">
                        <h2 class="student-name">${breakdown.name}</h2>
                        <p class="student-username">@${breakdown.username}</p>
                        <p class="student-registration">Member since ${breakdown.registrationDate}</p>
                    </div>
                    <div class="student-badges">
                        <div class="badge points-badge">
                            <i data-lucide="star"></i>
                            <span>${breakdown.totalPoints} Points</span>
                        </div>
                        <div class="badge tickets-badge">
                            <i data-lucide="ticket"></i>
                            <span>${breakdown.auctionTickets} Tickets</span>
                        </div>
                        <div class="badge days-badge">
                            <i data-lucide="calendar-days"></i>
                            <span>${breakdown.submissionCount} Days</span>
                        </div>
                    </div>
                </div>

                <!-- Stats Overview Cards -->
                <div class="stats-overview">
                    <h3 class="section-title">
                        <i data-lucide="bar-chart-3"></i>
                        Learning Statistics
                    </h3>
                    <div class="stats-grid">
                        ${Object.entries(breakdown.sedarimStats).map(([seder, stats]) => `
                            <div class="stat-card ${seder}">
                                <div class="stat-header">
                                    <div class="stat-icon">
                                        ${this.getSedarIcon(seder)}
                                    </div>
                                    <h4>${this.formatSedarName(seder)}</h4>
                                </div>
                                <div class="stat-metrics">
                                    <div class="metric">
                                        <span class="metric-value">${stats.days}</span>
                                        <span class="metric-label">Days</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-value">${stats.points}</span>
                                        <span class="metric-label">Points</span>
                                    </div>
                                    ${stats.testScores && stats.testScores.length > 0 ? `
                                        <div class="metric">
                                            <span class="metric-value">${Math.round(stats.testScores.reduce((a, b) => a + b, 0) / stats.testScores.length)}%</span>
                                            <span class="metric-label">Avg Score</span>
                                        </div>
                                    ` : ''}
                                    ${seder === 'mivtzahTorah' && stats.totalDafim > 0 ? `
                                        <div class="metric">
                                            <span class="metric-value">${stats.totalDafim}</span>
                                            <span class="metric-label">Dafim</span>
                                        </div>
                                    ` : ''}
                                </div>
                                ${stats.testScores && stats.testScores.length > 0 ? `
                                    <div class="test-scores">
                                        <span class="test-label">Test Scores:</span>
                                        <div class="scores-list">
                                            ${stats.testScores.map(score => `
                                                <span class="score ${score >= 90 ? 'excellent' : score >= 80 ? 'good' : score >= 70 ? 'satisfactory' : 'needs-improvement'}">${score}%</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Weekly Progress -->
                <div class="weekly-progress">
                    <h3 class="section-title">
                        <i data-lucide="trending-up"></i>
                        Weekly Progress
                    </h3>
                    <div class="weeks-timeline">
                        ${breakdown.weeklyBreakdown.map((week, index) => `
                            <div class="week-card">
                                <div class="week-header">
                                    <div class="week-number">${index + 1}</div>
                                    <div class="week-info">
                                        <h4>Parshas ${week.week.charAt(0).toUpperCase() + week.week.slice(1)}</h4>
                                        <p>${week.points} points • ${week.days.length} submission days</p>
                                    </div>
                                    <div class="week-score">
                                        <div class="score-circle ${this.getWeekScoreClass(week.points)}">
                                            ${week.points}
                                        </div>
                                    </div>
                                </div>
                                <div class="week-details">
                                    <div class="daily-grid">
                                        ${week.days.map(day => `
                                            <div class="day-card">
                                                <div class="day-date">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                <div class="day-sedarim">
                                                    ${Object.entries(day.sedarim).map(([seder, data]) => `
                                                        <div class="seder-chip ${seder}">
                                                            <span class="seder-name">${this.getSedarAbbrev(seder)}</span>
                                                            <span class="seder-points">${data.points}</span>
                                                            <div class="seder-indicators">
                                                                ${data.onTime ? '<i data-lucide="clock" class="on-time" title="On Time"></i>' : '<i data-lucide="clock" class="late" title="Late"></i>'}
                                                                ${data.ritzifus ? '<i data-lucide="zap" class="ritzifus" title="Ritzifus"></i>' : ''}
                                                                ${data.dafim ? `<span class="dafim" title="Dafim">${data.dafim}ד</span>` : ''}
                                                            </div>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Show modal
        document.getElementById('student-details-modal').classList.remove('hidden');
    }

    formatSedarName(seder) {
        const names = {
            chassidusBoker: 'Chassidus Boker',
            girsa: 'Girsa',
            halacha: 'Halacha',
            chassidusErev: 'Chassidus Erev',
            mivtzahTorah: 'Mivtzah Torah'
        };
        return names[seder] || seder;
    }

    setupDetailsTabNavigation() {
        document.querySelectorAll('.details-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab button
                document.querySelectorAll('.details-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.details-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.dataset.tab === tab) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }

    // ===== NEW ADMIN CONTROL FEATURES =====

    // Admin Credentials Management
    loadAdminCredentials() {
        const container = document.getElementById('admin-credentials-container');
        const admins = Object.entries(this.core.admins);

        container.innerHTML = `
            <div class="admin-header">
                <h3>Admin Credentials Management</h3>
                <button id="add-admin-btn" class="btn btn-primary">
                    <i data-lucide="shield-plus"></i> Add Admin
                </button>
            </div>
            
            <div class="admins-grid">
                ${admins.map(([username, admin]) => `
                    <div class="admin-card" data-username="${username}">
                        <div class="admin-info">
                            <h4>${admin.name}</h4>
                            <p><strong>Username:</strong> ${username}</p>
                            <p><strong>Role:</strong> Administrator</p>
                            <p><strong>Status:</strong> <span class="status-active">Active</span></p>
                        </div>
                        <div class="admin-actions">
                            <button class="btn btn-sm btn-outline edit-admin-btn" data-username="${username}">
                                <i data-lucide="edit"></i> Edit
                            </button>
                            ${username !== 'admin' ? `
                                <button class="btn btn-sm btn-danger delete-admin-btn" data-username="${username}">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            ` : '<span class="protected-admin">Protected Account</span>'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Add Admin Modal -->
            <div id="add-admin-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Add New Administrator</h4>
                        <button id="close-add-admin-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input type="text" id="new-admin-name" placeholder="Administrator's full name">
                        </div>
                        <div class="input-group">
                            <label>Username</label>
                            <input type="text" id="new-admin-username" placeholder="Login username">
                        </div>
                        <div class="input-group">
                            <label>Password</label>
                            <input type="password" id="new-admin-password" placeholder="Secure password (min 8 characters)">
                        </div>
                        <div class="input-group">
                            <label>Confirm Password</label>
                            <input type="password" id="new-admin-confirm" placeholder="Confirm password">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-add-admin" class="btn btn-outline">Cancel</button>
                        <button id="save-add-admin" class="btn btn-primary">Create Admin</button>
                    </div>
                </div>
            </div>

            <!-- Edit Admin Modal -->
            <div id="edit-admin-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Edit Administrator</h4>
                        <button id="close-edit-admin-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-admin-original-username">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input type="text" id="edit-admin-name" placeholder="Administrator's full name">
                        </div>
                        <div class="input-group">
                            <label>Username</label>
                            <input type="text" id="edit-admin-username" placeholder="Login username">
                        </div>
                        <div class="input-group">
                            <label>New Password</label>
                            <input type="password" id="edit-admin-password" placeholder="Leave blank to keep current password">
                        </div>
                        <div class="input-group">
                            <label>Confirm New Password</label>
                            <input type="password" id="edit-admin-confirm" placeholder="Confirm new password">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-edit-admin" class="btn btn-outline">Cancel</button>
                        <button id="save-edit-admin" class="btn btn-primary">Update Admin</button>
                    </div>
                </div>
            </div>
        `;

        this.setupAdminCredentialsEventListeners();
    }

    // Point Adjustment Feature
    loadPointAdjustment() {
        const container = document.getElementById('admin-points-container');
        const students = Object.entries(this.core.students);

        container.innerHTML = `
            <div class="admin-header">
                <h3>Manual Point Adjustment</h3>
                <p class="admin-subtitle">Adjust any student's point total for special circumstances</p>
            </div>
            
            <div class="points-adjustment-grid">
                ${students.map(([username, student]) => {
                    const currentPoints = this.core.calculateTotalPoints(username);
                    return `
                        <div class="point-adjustment-card" data-username="${username}">
                            <div class="student-info">
                                <h4>${student.name}</h4>
                                <p><strong>Username:</strong> ${username}</p>
                                <p><strong>Current Points:</strong> <span class="current-points">${currentPoints}</span></p>
                            </div>
                            <div class="adjustment-controls">
                                <div class="input-group">
                                    <label>Adjustment</label>
                                    <div class="adjustment-input-group">
                                        <select id="adjustment-type-${username}" class="adjustment-type">
                                            <option value="add">Add Points</option>
                                            <option value="subtract">Subtract Points</option>
                                            <option value="set">Set Total</option>
                                        </select>
                                        <input type="number" id="adjustment-amount-${username}" placeholder="0" min="0" class="adjustment-amount">
                                        <button class="btn btn-primary btn-sm apply-adjustment-btn" data-username="${username}">
                                            <i data-lucide="check"></i> Apply
                                        </button>
                                    </div>
                                </div>
                                <div class="adjustment-reason">
                                    <input type="text" id="adjustment-reason-${username}" placeholder="Reason for adjustment (optional)" class="reason-input">
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.setupPointAdjustmentEventListeners();
    }

    // Chinese Auction Prize Management
    loadPrizeManagement() {
        const container = document.getElementById('admin-prizes-container');
        const auction = this.core.chineseAuction;

        container.innerHTML = `
            <div class="admin-header">
                <h3>Chinese Auction Prize Management</h3>
                <button id="add-prize-btn" class="btn btn-primary">
                    <i data-lucide="gift"></i> Add Prize
                </button>
            </div>
            
            <div class="prizes-grid">
                ${auction.prizes.map((prize, index) => `
                    <div class="prize-card" data-prize-index="${index}">
                        <div class="prize-image">
                            ${prize.image ? `<img src="${prize.image}" alt="${prize.name}">` : '<div class="no-image"><i data-lucide="image"></i></div>'}
                        </div>
                        <div class="prize-info">
                            <h4>${prize.name}</h4>
                            <p class="prize-description">${prize.description}</p>
                            <p class="prize-tickets"><strong>Tickets Sold:</strong> ${prize.ticketsSold || 0}</p>
                        </div>
                        <div class="prize-actions">
                            <button class="btn btn-sm btn-outline edit-prize-btn" data-prize-index="${index}">
                                <i data-lucide="edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-prize-btn" data-prize-index="${index}">
                                <i data-lucide="trash-2"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Add Prize Modal -->
            <div id="add-prize-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Add New Prize</h4>
                        <button id="close-add-prize-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label>Prize Name</label>
                            <input type="text" id="new-prize-name" placeholder="Enter prize name">
                        </div>
                        <div class="input-group">
                            <label>Description</label>
                            <textarea id="new-prize-description" rows="3" placeholder="Brief description of the prize"></textarea>
                        </div>
                        <div class="input-group">
                            <label>Prize Image</label>
                            <input type="file" id="new-prize-image" accept="image/*">
                            <div id="prize-image-preview" class="image-preview hidden"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-add-prize" class="btn btn-outline">Cancel</button>
                        <button id="save-add-prize" class="btn btn-primary">Add Prize</button>
                    </div>
                </div>
            </div>

            <!-- Edit Prize Modal -->
            <div id="edit-prize-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Edit Prize</h4>
                        <button id="close-edit-prize-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-prize-index">
                        <div class="input-group">
                            <label>Prize Name</label>
                            <input type="text" id="edit-prize-name" placeholder="Enter prize name">
                        </div>
                        <div class="input-group">
                            <label>Description</label>
                            <textarea id="edit-prize-description" rows="3" placeholder="Brief description of the prize"></textarea>
                        </div>
                        <div class="input-group">
                            <label>Prize Image</label>
                            <input type="file" id="edit-prize-image" accept="image/*">
                            <div id="edit-prize-image-preview" class="image-preview"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-edit-prize" class="btn btn-outline">Cancel</button>
                        <button id="save-edit-prize" class="btn btn-primary">Update Prize</button>
                    </div>
                </div>
            </div>
        `;

        this.setupPrizeManagementEventListeners();
    }

    // Weekly Goals Configuration
    loadGoalsConfiguration() {
        const container = document.getElementById('admin-goals-container');
        const thresholds = this.core.eventThresholds;

        container.innerHTML = `
            <div class="admin-header">
                <h3>Weekly Goals Configuration</h3>
                <p class="admin-subtitle">Set the points required for each week's special event</p>
            </div>
            
            <div class="goals-grid">
                ${Object.entries(this.core.parshiyos).map(([week, weekData]) => `
                    <div class="goal-card" data-week="${week}">
                        <div class="week-info">
                            <h4>Parshas ${weekData.name}</h4>
                            <p><strong>Week ${weekData.weekNum}</strong></p>
                            <p><strong>Dates:</strong> ${weekData.startDate} to ${weekData.endDate}</p>
                        </div>
                        <div class="goal-setting">
                            <div class="input-group">
                                <label>Points Required for Event</label>
                                <div class="goal-input-group">
                                    <input type="number" id="goal-${week}" value="${thresholds[week] || 1500}" min="0" step="50" class="goal-input">
                                    <button class="btn btn-primary btn-sm update-goal-btn" data-week="${week}">
                                        <i data-lucide="save"></i> Update
                                    </button>
                                </div>
                            </div>
                            <p class="goal-status">Current: <strong>${thresholds[week] || 1500} points</strong></p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.setupGoalsConfigurationEventListeners();
    }

    // Schedule Configuration
    loadScheduleConfiguration() {
        const container = document.getElementById('admin-schedule-container');
        const schedule = this.core.weeklySchedule;

        container.innerHTML = `
            <div class="admin-header">
                <h3>Schedule Configuration</h3>
                <p class="admin-subtitle">Configure which sedarim are available on which days</p>
            </div>
            
            <div class="schedule-config">
                <div class="days-grid">
                    ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day, dayIndex) => `
                        <div class="day-config-card" data-day="${dayIndex}">
                            <h4>${day}</h4>
                            <div class="sedarim-checkboxes">
                                ${Object.keys(schedule).map(seder => `
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="schedule-${dayIndex}-${seder}" 
                                               data-day="${dayIndex}" data-seder="${seder}"
                                               ${schedule[seder] && schedule[seder].includes(dayIndex) ? 'checked' : ''}>
                                        <span>${seder.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="schedule-actions">
                    <button id="save-schedule-config" class="btn btn-primary">
                        <i data-lucide="save"></i> Save Schedule Configuration
                    </button>
                    <button id="reset-schedule-config" class="btn btn-outline">
                        <i data-lucide="rotate-ccw"></i> Reset to Default
                    </button>
                </div>
            </div>
        `;

        this.setupScheduleConfigurationEventListeners();
    }

    // Event Listeners for new features
    setupAdminCredentialsEventListeners() {
        // Add admin button
        const addAdminBtn = document.getElementById('add-admin-btn');
        if (addAdminBtn) {
            addAdminBtn.addEventListener('click', () => {
                document.getElementById('add-admin-modal').classList.remove('hidden');
                document.getElementById('new-admin-name').focus();
            });
        }

        // Close modals
        this.setupModalCloseListeners('add-admin');
        this.setupModalCloseListeners('edit-admin');

        // Save admin
        const saveAdminBtn = document.getElementById('save-add-admin');
        if (saveAdminBtn) {
            saveAdminBtn.addEventListener('click', () => this.handleAddAdmin());
        }

        // Edit admin buttons
        document.querySelectorAll('.edit-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.closest('.edit-admin-btn').dataset.username;
                this.showEditAdminModal(username);
            });
        });

        // Delete admin buttons
        document.querySelectorAll('.delete-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.closest('.delete-admin-btn').dataset.username;
                this.handleDeleteAdmin(username);
            });
        });

        // Save edit admin
        const saveEditAdminBtn = document.getElementById('save-edit-admin');
        if (saveEditAdminBtn) {
            saveEditAdminBtn.addEventListener('click', () => this.handleEditAdmin());
        }
    }

    setupPointAdjustmentEventListeners() {
        document.querySelectorAll('.apply-adjustment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.closest('.apply-adjustment-btn').dataset.username;
                this.handlePointAdjustment(username);
            });
        });
    }

    setupPrizeManagementEventListeners() {
        // Add prize button
        const addPrizeBtn = document.getElementById('add-prize-btn');
        if (addPrizeBtn) {
            addPrizeBtn.addEventListener('click', () => {
                document.getElementById('add-prize-modal').classList.remove('hidden');
                document.getElementById('new-prize-name').focus();
            });
        }

        // Image preview for add prize
        const addPrizeImage = document.getElementById('new-prize-image');
        if (addPrizeImage) {
            addPrizeImage.addEventListener('change', (e) => this.handleImagePreview(e, 'prize-image-preview'));
        }

        // Image preview for edit prize
        const editPrizeImage = document.getElementById('edit-prize-image');
        if (editPrizeImage) {
            editPrizeImage.addEventListener('change', (e) => this.handleImagePreview(e, 'edit-prize-image-preview'));
        }

        // Close modals
        this.setupModalCloseListeners('add-prize');
        this.setupModalCloseListeners('edit-prize');

        // Save prize
        const savePrizeBtn = document.getElementById('save-add-prize');
        if (savePrizeBtn) {
            savePrizeBtn.addEventListener('click', () => this.handleAddPrize());
        }

        // Edit and delete prize buttons
        document.querySelectorAll('.edit-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.edit-prize-btn').dataset.prizeIndex);
                this.showEditPrizeModal(index);
            });
        });

        document.querySelectorAll('.delete-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.delete-prize-btn').dataset.prizeIndex);
                this.handleDeletePrize(index);
            });
        });

        // Save edit prize
        const saveEditPrizeBtn = document.getElementById('save-edit-prize');
        if (saveEditPrizeBtn) {
            saveEditPrizeBtn.addEventListener('click', () => this.handleEditPrize());
        }
    }

    setupGoalsConfigurationEventListeners() {
        document.querySelectorAll('.update-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const week = e.target.closest('.update-goal-btn').dataset.week;
                this.handleUpdateGoal(week);
            });
        });
    }

    setupScheduleConfigurationEventListeners() {
        const saveBtn = document.getElementById('save-schedule-config');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveScheduleConfig());
        }

        const resetBtn = document.getElementById('reset-schedule-config');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleResetScheduleConfig());
        }
    }

    // Handler methods for new features
    handleAddAdmin() {
        const name = document.getElementById('new-admin-name').value.trim();
        const username = document.getElementById('new-admin-username').value.trim();
        const password = document.getElementById('new-admin-password').value;
        const confirm = document.getElementById('new-admin-confirm').value;

        if (!name || !username || !password || !confirm) {
            this.core.showNotification('Missing Information', 'All fields are required', 'warning');
            return;
        }

        if (password !== confirm) {
            this.core.showNotification('Password Mismatch', 'Passwords do not match', 'error');
            return;
        }

        if (password.length < 8) {
            this.core.showNotification('Weak Password', 'Password must be at least 8 characters', 'warning');
            return;
        }

        if (this.core.admins[username] || this.core.students[username]) {
            this.core.showNotification('Username Taken', 'This username already exists', 'error');
            return;
        }

        this.core.showLoading('Creating administrator...');

        setTimeout(() => {
            this.core.admins[username] = {
                username: username,
                password: password,
                name: name,
                createdAt: new Date().toISOString()
            };

            this.core.saveData('admins', this.core.admins);
            this.core.hideLoading();
            document.getElementById('add-admin-modal').classList.add('hidden');
            this.clearAddAdminForm();
            this.loadAdminCredentials();
            this.core.showNotification('Admin Created', `Administrator ${name} created successfully`, 'success');
        }, 500);
    }    handlePointAdjustment(username) {
        const adjustmentType = document.getElementById(`adjustment-type-${username}`).value;
        const amount = parseInt(document.getElementById(`adjustment-amount-${username}`).value);
        const reason = document.getElementById(`adjustment-reason-${username}`).value.trim();

        if (isNaN(amount) || amount < 0) {
            this.core.showNotification('Invalid Amount', 'Please enter a valid positive number', 'warning');
            return;
        }

        const student = this.core.students[username];
        if (!student) {
            this.core.showNotification('Student Not Found', 'Student not found', 'error');
            return;
        }

        this.core.showLoading('Adjusting points...');        setTimeout(() => {
            const currentPoints = this.core.calculateTotalPoints(username);
            let adjustmentValue;

            switch (adjustmentType) {
                case 'add':
                    adjustmentValue = amount;
                    break;
                case 'subtract':
                    adjustmentValue = -amount;
                    break;
                case 'set':
                    // For 'set', clear existing manual adjustments first, then set to desired total
                    const basePoints = this.calculateBasePoints(username);
                    this.clearManualAdjustments(username);
                    adjustmentValue = amount - basePoints;
                    break;
            }

            // Apply adjustment ONLY to the submissions structure (not both places)
            if (!this.core.submissions[username]) {
                this.core.submissions[username] = {};
            }
            if (!this.core.submissions[username]['manual_adjustments']) {
                this.core.submissions[username]['manual_adjustments'] = {};
            }
            
            const adjustmentId = `adj_${Date.now()}`;
            this.core.submissions[username]['manual_adjustments'][adjustmentId] = {
                date: new Date().toISOString().split('T')[0],
                points: adjustmentValue,
                type: 'manual_adjustment',
                reason: reason || 'No reason provided',
                adjustedBy: this.core.loggedInUser,
                originalAmount: amount,
                adjustmentType: adjustmentType
            };

            // Save submissions data
            this.core.saveData('submissions', this.core.submissions);
            this.core.hideLoading();            // Clear the form
            document.getElementById(`adjustment-amount-${username}`).value = '';
            document.getElementById(`adjustment-reason-${username}`).value = '';
            
            // Refresh the user management display
            this.loadAdminStudents();
            
            // Calculate new total after adjustment
            const newTotal = this.core.calculateTotalPoints(username);
            this.core.showNotification('Points Adjusted', 
                `${student.name}'s points adjusted from ${currentPoints} to ${newTotal}`, 'success');
        }, 500);
    }

    handleAddPrize() {
        const name = document.getElementById('new-prize-name').value.trim();
        const description = document.getElementById('new-prize-description').value.trim();
        const imageFile = document.getElementById('new-prize-image').files[0];

        if (!name || !description) {
            this.core.showNotification('Missing Information', 'Name and description are required', 'warning');
            return;
        }

        this.core.showLoading('Adding prize...');

        // Handle image upload (convert to base64 for local storage)
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.savePrize(name, description, e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.savePrize(name, description, null);
        }
    }

    savePrize(name, description, imageData) {
        const newPrize = {
            id: Date.now(),
            name: name,
            description: description,
            image: imageData,
            ticketsSold: 0,
            createdAt: new Date().toISOString()
        };

        this.core.chineseAuction.prizes.push(newPrize);
        this.core.saveData('chineseAuction', this.core.chineseAuction);
        
        this.core.hideLoading();
        document.getElementById('add-prize-modal').classList.add('hidden');
        this.clearAddPrizeForm();
        this.loadPrizeManagement();
        this.core.showNotification('Prize Added', `Prize "${name}" added successfully`, 'success');
    }

    handleUpdateGoal(week) {
        const goalInput = document.getElementById(`goal-${week}`);
        const newGoal = parseInt(goalInput.value);

        if (isNaN(newGoal) || newGoal < 0) {
            this.core.showNotification('Invalid Goal', 'Please enter a valid positive number', 'warning');
            return;
        }

        this.core.showLoading('Updating goal...');

        setTimeout(() => {
            this.core.eventThresholds[week] = newGoal;
            this.core.saveData('eventThresholds', this.core.eventThresholds);
            
            this.core.hideLoading();
            this.loadGoalsConfiguration();
            this.core.showNotification('Goal Updated', 
                `Goal for Parshas ${this.core.parshiyos[week].name} set to ${newGoal} points`, 'success');
        }, 300);
    }

    handleSaveScheduleConfig() {
        this.core.showLoading('Saving schedule configuration...');
        
        setTimeout(() => {
            const newSchedule = {};
            
            // Initialize all seders
            Object.keys(this.core.weeklySchedule).forEach(seder => {
                newSchedule[seder] = [];
            });

            // Collect checked schedules
            document.querySelectorAll('input[type="checkbox"][data-day][data-seder]').forEach(checkbox => {
                if (checkbox.checked) {
                    const day = parseInt(checkbox.dataset.day);
                    const seder = checkbox.dataset.seder;
                    newSchedule[seder].push(day);
                }
            });

            this.core.weeklySchedule = newSchedule;
            this.core.saveData('weeklySchedule', this.core.weeklySchedule);
            
            this.core.hideLoading();
            this.core.showNotification('Schedule Saved', 'Schedule configuration updated successfully', 'success');
        }, 500);
    }    // Export functionality - Delegate to AdminReports module
    setupExportListeners() {
        // Delegate to reports module
        if (this.adminReports && this.adminReports.setupExportListeners) {
            this.adminReports.setupExportListeners();
        }
    }    // Export methods moved to AdminReports module
    exportCurrentView() {
        return this.adminReports.exportCurrentView();
    }

    exportAllStudentData() {
        return this.adminReports.exportAllStudentData();
    }

    // Helper method for backward compatibility
    downloadArrayAsCSV(data, filename) {
        return this.adminReports.downloadArrayAsCSV(data, filename);
    }

    // ===== MISSING USER MANAGEMENT METHODS =====
      updateUser() {        const originalUsername = document.getElementById('edit-user-original-username').value;
        const name = document.getElementById('edit-user-name').value.trim();
        const username = document.getElementById('edit-user-username').value.trim();
        const password = document.getElementById('edit-user-password').value;

        if (!name || !username) {
            this.core.showNotification('Missing Information', 'Name and username are required', 'warning');
            return;
        }

        // Check if username changed and if new username exists
        if (username !== originalUsername && this.core.students[username]) {
            this.core.showNotification('Username Exists', 'This username already exists', 'error');
            return;
        }

        if (password && password.length < 6) {
            this.core.showNotification('Invalid Password', 'Password must be at least 6 characters', 'warning');
            return;
        }

        this.core.showLoading('Updating user...');

        setTimeout(() => {
            const student = this.core.students[originalUsername];
            
            // Update student data
            student.name = name;
            if (password) {
                student.password = password;
            }

            // Handle username change
            if (username !== originalUsername) {
                // Move data to new username
                this.core.students[username] = student;
                student.username = username;
                
                // Move submissions data
                if (this.core.submissions[originalUsername]) {
                    this.core.submissions[username] = this.core.submissions[originalUsername];
                    delete this.core.submissions[originalUsername];
                }
                
                // Move auction tickets
                if (this.core.chineseAuction.tickets && this.core.chineseAuction.tickets[originalUsername]) {
                    this.core.chineseAuction.tickets[username] = this.core.chineseAuction.tickets[originalUsername];
                    delete this.core.chineseAuction.tickets[originalUsername];
                }
                
                // Delete old username
                delete this.core.students[originalUsername];
            }

            // Save all relevant data
            this.core.saveData('students', this.core.students);
            this.core.saveData('submissions', this.core.submissions);
            this.core.saveData('chineseAuction', this.core.chineseAuction);

            // Close modal and refresh
            document.getElementById('edit-user-modal').classList.add('hidden');
            this.clearEditUserForm();
            this.loadAdminStudents();

            this.core.hideLoading();
            this.core.showNotification('User Updated', 'User updated successfully!', 'success');
        }, 500);
    }

    deleteUser(username) {
        const student = this.core.students[username];
        if (!student) {
            this.core.showNotification('User Not Found', 'User not found', 'error');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete user "${student.name}" (${username})?\n\nThis will permanently remove:\n- User account\n- All submissions\n- Auction tickets\n- All associated data\n\nThis action cannot be undone.`);
        
        if (!confirmed) return;

        this.core.showLoading('Deleting user...');

        setTimeout(() => {
            // Delete from all data structures
            delete this.core.students[username];
            
            if (this.core.submissions[username]) {
                delete this.core.submissions[username];
            }
            
            if (this.core.chineseAuction.tickets && this.core.chineseAuction.tickets[username]) {
                delete this.core.chineseAuction.tickets[username];
            }

            // Save all relevant data
            this.core.saveData('students', this.core.students);
            this.core.saveData('submissions', this.core.submissions);
            this.core.saveData('chineseAuction', this.core.chineseAuction);

            // Refresh display
            this.loadAdminStudents();

            this.core.hideLoading();
            this.core.showNotification('User Deleted', `User "${student.name}" has been deleted`, 'success');
        }, 500);
    }

    clearAddUserForm() {
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-username').value = '';
        document.getElementById('new-user-password').value = '';
    }    clearEditUserForm() {
        document.getElementById('edit-user-original-username').value = '';
        document.getElementById('edit-user-name').value = '';
        document.getElementById('edit-user-username').value = '';
        document.getElementById('edit-user-password').value = '';
    }

    // Helper methods for point adjustment
    calculateBasePoints(username) {
        // Calculate points without manual adjustments
        let totalPoints = 0;
        Object.keys(this.core.parshiyos).forEach(week => {
            totalPoints += this.core.calculateStudentWeekPoints(username, week);
        });
        return totalPoints;
    }

    getExistingManualAdjustments(username) {
        let total = 0;
        if (this.core.submissions[username] && this.core.submissions[username].manual_adjustments) {
            Object.values(this.core.submissions[username].manual_adjustments).forEach(adjustment => {
                total += adjustment.points || 0;
            });
        }
        return total;
    }

    clearManualAdjustments(username) {
        if (this.core.submissions[username] && this.core.submissions[username].manual_adjustments) {
            this.core.submissions[username].manual_adjustments = {};
        }
    }    // Helper methods for UI (keep these as they're used by user management)
    getSedarIcon(seder) {
        const icons = {
            chassidusBoker: '<i data-lucide="sunrise"></i>',
            girsa: '<i data-lucide="book-open"></i>',
            halacha: '<i data-lucide="scales"></i>',
            chassidusErev: '<i data-lucide="sunset"></i>',
            mivtzahTorah: '<i data-lucide="scroll"></i>'
        };
        return icons[seder] || '<i data-lucide="book"></i>';
    }

    getSedarAbbrev(seder) {
        const abbrevs = {
            chassidusBoker: 'CB',
            girsa: 'GR',
            halacha: 'HL',
            chassidusErev: 'CE',
            mivtzahTorah: 'MT'
        };
        return abbrevs[seder] || seder.slice(0, 2).toUpperCase();
    }

    getWeekScoreClass(points) {
        if (points >= 1000) return 'excellent';
        if (points >= 750) return 'good';
        if (points >= 500) return 'satisfactory';
        return 'needs-improvement';
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MivtzahAdmin };
} else {
    // Browser environment
    window.MivtzahAdmin = MivtzahAdmin;
}
