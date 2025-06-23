// Shiur Gimmel Summer Mivtzah 2025 - Messaging System
class MivtzahMessaging {
    constructor(core) {
        this.core = core;
        this.inboxTab = 'inbox'; // Current inbox tab for students
        this.adminInboxTab = 'inbox'; // Current inbox tab for admin
        this.isComposing = false;
        this.isReplying = false;
        this.isAdminComposing = false;
        this.isAdminReplying = false;
    }

    // Message data management
    getMessages() {
        return this.core.loadData('messages') || [];
    }

    saveMessages(messages) {
        this.core.saveData('messages', messages);
    }

    sendMessage({ from, to, body, subject, senderRole, threadId = null }) {
        const messages = this.getMessages();
        const timestamp = new Date().toISOString();
        const messageThreadId = threadId || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newMessage = {
            id: Date.now(),
            threadId: messageThreadId,
            from,
            to,
            message: body, // Store as 'message' for consistency
            subject: subject || 'No Subject',
            timestamp,
            read: false,
            deleted: false,
            senderRole: senderRole || 'student'
        };

        messages.push(newMessage);
        this.saveMessages(messages);
        return messageThreadId;
    }

    markThreadRead(threadId, username) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && msg.to === username && !msg.read) {
                msg.read = true;
                changed = true;
            }
        });
        if (changed) {
            this.saveMessages(messages);
        }
    }

    getThreadsForUser(username, role, filter = 'all') {
        const messages = this.getMessages();
        const userMessages = messages.filter(msg => 
            (msg.from === username || msg.to === username)
        );

        // Group by thread
        const threadsMap = {};
        userMessages.forEach(msg => {
            if (!threadsMap[msg.threadId]) {
                threadsMap[msg.threadId] = [];
            }
            threadsMap[msg.threadId].push(msg);
        });

        // Convert to array and sort each thread by timestamp
        let threads = Object.values(threadsMap).map(thread => 
            thread.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        );

        // Apply filters
        if (filter === 'inbox') {
            threads = threads.filter(thread => {
                const hasUnread = thread.some(msg => msg.to === username && !msg.read);
                const notDeleted = !thread.some(msg => msg.deleted);
                return hasUnread && notDeleted;
            });
        } else if (filter === 'trash') {
            threads = threads.filter(thread => 
                thread.some(msg => msg.deleted)
            );
        } else {
            // 'all' - exclude deleted threads
            threads = threads.filter(thread => 
                !thread.some(msg => msg.deleted)
            );
        }

        // Sort threads by latest message timestamp
        threads.sort((a, b) => {
            const aLatest = Math.max(...a.map(msg => new Date(msg.timestamp)));
            const bLatest = Math.max(...b.map(msg => new Date(msg.timestamp)));
            return bLatest - aLatest;
        });

        return threads;
    }

    updateMessagesBadge() {
        const unreadCount = this.getThreadsForUser(this.core.loggedInUser, 'student', 'inbox').length;
        const badge = document.querySelector('.nav-item[data-tab="messages"] .badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }    // Student messaging UI
    generateInboxUI(role) {
        const inboxThreads = this.getThreadsForUser(this.core.loggedInUser, role, 'inbox');
        const allThreads = this.getThreadsForUser(this.core.loggedInUser, role, 'all');
        const trashThreads = this.getThreadsForUser(this.core.loggedInUser, role, 'trash');

        return `
            <div class="inbox-header">
                <h4>Messages</h4>
                <button id="student-compose-btn" class="btn btn-primary btn-sm">
                    <i data-lucide="edit-3"></i> New Message
                </button>
            </div>

            <div id="inbox-thread-view"></div>

            <div class="inbox-tabs">
                <div class="inbox-tab-nav">
                    <button class="inbox-tab-btn ${this.inboxTab === 'inbox' ? 'active' : ''}" data-tab="inbox">
                        Inbox ${inboxThreads.length > 0 ? `(${inboxThreads.length})` : ''}
                    </button>
                    <button class="inbox-tab-btn ${this.inboxTab === 'all' ? 'active' : ''}" data-tab="all">
                        All ${allThreads.length > 0 ? `(${allThreads.length})` : ''}
                    </button>
                    <button class="inbox-tab-btn ${this.inboxTab === 'trash' ? 'active' : ''}" data-tab="trash">
                        Trash ${trashThreads.length > 0 ? `(${trashThreads.length})` : ''}
                    </button>
                </div>

                <div class="inbox-tab-content">
                    ${this.generateInboxTabContent(this.core.loggedInUser, role)}
                </div>
            </div>
        `;
    }

    generateInboxTabContent(username, role) {
        const threads = this.getThreadsForUser(username, role, this.inboxTab);

        if (!threads.length) {
            const emptyMessages = {
                inbox: 'No unread messages.',
                all: 'No messages yet.',
                trash: 'No deleted messages.'
            };
            return `<div class="empty-state">
                <p>${emptyMessages[this.inboxTab]}</p>
                <p class="empty-state-subtext">${this.inboxTab === 'inbox' ? 'New messages from admin will appear here.' : this.inboxTab === 'trash' ? 'Deleted messages will appear here.' : 'Your conversations will appear here.'}</p>
            </div>`;
        }

        return `
            <div class="inbox-list">
                ${threads.map(thread => {
                    const lastMsg = thread[thread.length - 1];
                    const unread = thread.some(msg => msg.to === username && !msg.read && !msg.deleted);
                    const isDeleted = thread.some(msg => msg.deleted);

                    return `<div class="inbox-thread ${unread ? 'unread' : ''} ${isDeleted ? 'deleted' : ''}" data-thread="${thread[0].threadId}">
                        <div class="thread-content">
                            <div class="thread-title">Admin</div>
                            <div class="thread-snippet">${(() => {
                                const content = lastMsg.message || lastMsg.body || lastMsg.content || 'Message content unavailable';
                                return content.slice(0, 60) + (content.length > 60 ? '...' : '');
                            })()}</div>
                            <div class="thread-time">${new Date(lastMsg.timestamp).toLocaleString()}</div>
                        </div>
                        ${unread ? '<span class="unread-dot"></span>' : ''}
                        <div class="thread-actions">
                            ${this.inboxTab === 'trash' ? `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.messaging.restoreThread('${thread[0].threadId}')" title="Restore">
                                    <i data-lucide="undo"></i> Restore
                                </button>
                            ` : `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.messaging.deleteThread('${thread[0].threadId}')" title="Delete">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            `}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    }

    setupMessagesEventListeners() {
        // Student compose message
        const composeBtn = document.getElementById('student-compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                document.getElementById('student-compose-modal').classList.remove('hidden');
                document.getElementById('student-compose-message').focus();
            });
        }

        // Close compose modal
        const closeComposeBtn = document.getElementById('close-student-compose-modal');
        if (closeComposeBtn) {
            closeComposeBtn.addEventListener('click', () => {
                this.hideStudentComposeModal();
            });
        }

        // Cancel compose
        const cancelComposeBtn = document.getElementById('cancel-student-compose');
        if (cancelComposeBtn) {
            cancelComposeBtn.addEventListener('click', () => {
                this.hideStudentComposeModal();
            });
        }

        // Send compose
        const sendComposeBtn = document.getElementById('send-student-compose');
        if (sendComposeBtn) {
            sendComposeBtn.addEventListener('click', () => {
                this.sendStudentCompose();
            });
        }

        // Close modal on background click
        const modal = document.getElementById('student-compose-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'student-compose-modal') {
                    this.hideStudentComposeModal();
                }
            });
        }

        // Inbox tab switching
        document.querySelectorAll('.inbox-tabs .inbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.inbox-tabs .inbox-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update inbox tab state
                this.inboxTab = btn.dataset.tab;

                // Refresh tab content
                this.refreshInboxTab();

                // Clear thread view and show message list
                document.getElementById('inbox-thread-view').innerHTML = '';
                document.querySelector('.inbox-tabs').classList.remove('hidden');
            });
        });

        // Inbox thread click
        document.querySelectorAll('.inbox-tabs .inbox-thread').forEach(threadEl => {
            threadEl.addEventListener('click', (e) => {
                // Prevent clicking action buttons from triggering thread view
                if (e.target.closest('.thread-action-btn')) return;

                const threadId = threadEl.dataset.thread;
                this.showThreadView(threadId, 'student');
            });
        });

        // Student reply modal handlers
        const closeReplyBtn = document.getElementById('close-student-reply-modal');
        if (closeReplyBtn) {
            closeReplyBtn.addEventListener('click', () => {
                this.hideStudentReplyModal();
            });
        }

        const cancelReplyBtn = document.getElementById('cancel-student-reply');
        if (cancelReplyBtn) {
            cancelReplyBtn.addEventListener('click', () => {
                this.hideStudentReplyModal();
            });
        }

        const sendReplyBtn = document.getElementById('send-student-reply');
        if (sendReplyBtn) {
            sendReplyBtn.addEventListener('click', () => {
                this.sendStudentReply();
            });
        }

        const replyModal = document.getElementById('student-reply-modal');
        if (replyModal) {
            replyModal.addEventListener('click', (e) => {
                if (e.target.id === 'student-reply-modal') {
                    this.hideStudentReplyModal();
                }
            });
        }

        // Admin reply modal handlers
        const closeAdminReplyBtn = document.getElementById('close-admin-reply-modal');
        if (closeAdminReplyBtn) {
            closeAdminReplyBtn.addEventListener('click', () => {
                this.hideAdminReplyModal();
            });
        }

        const cancelAdminReplyBtn = document.getElementById('cancel-admin-reply');
        if (cancelAdminReplyBtn) {
            cancelAdminReplyBtn.addEventListener('click', () => {
                this.hideAdminReplyModal();
            });
        }

        const sendAdminReplyBtn = document.getElementById('send-admin-reply');
        if (sendAdminReplyBtn) {
            sendAdminReplyBtn.addEventListener('click', () => {
                this.sendAdminReply();
            });
        }

        const adminReplyModal = document.getElementById('admin-reply-modal');
        if (adminReplyModal) {
            adminReplyModal.addEventListener('click', (e) => {
                if (e.target.id === 'admin-reply-modal') {
                    this.hideAdminReplyModal();
                }
            });
        }
    }

    hideStudentComposeModal() {
        document.getElementById('student-compose-modal').classList.add('hidden');
        // Clear form
        document.getElementById('student-compose-message').value = '';
    }

    sendStudentCompose() {
        // Prevent multiple sends
        if (this.isComposing) return;
        this.isComposing = true;

        const message = document.getElementById('student-compose-message').value.trim();

        if (!message) {
            this.core.showNotification('Missing Information', 'Please enter your message', 'warning');
            this.isComposing = false;
            return;
        }

        this.core.showLoading('Sending message...');

        setTimeout(() => {
            const threadId = this.sendMessage({
                from: this.core.loggedInUser,
                to: 'admin',
                body: message,
                subject: 'Student Message',
                senderRole: 'student',
                threadId: null
            });

            this.core.hideLoading();
            this.hideStudentComposeModal();
            this.core.showNotification('Message Sent!', 'Your message has been sent to the admin successfully.', 'success');

            // Reset compose flag
            this.isComposing = false;

            // Refresh inbox
            setTimeout(() => {
                const container = document.getElementById('messages-container');
                if (container) {
                    container.innerHTML = this.generateInboxUI('student');
                    this.setupMessagesEventListeners();
                    // Switch to All tab to show the sent message
                    const allTab = document.querySelector('.inbox-tabs .inbox-tab-btn[data-tab="all"]');
                    if (allTab) {
                        allTab.click();
                    }
                    // Initialize Lucide icons
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }, 600);
        }, 800);
    }

    showThreadView(threadId, role) {
        const username = this.core.loggedInUser;
        const threads = this.getThreadsForUser(username, role);
        const thread = threads.find(t => t[0].threadId === threadId);
        if (!thread) return;

        // Mark as read
        this.markThreadRead(threadId, username);
        // Update inbox badge and refresh tabs after marking as read
        this.updateMessagesBadge();
        this.refreshInboxTab();

        // Render messages
        const messagesHtml = thread.map(msg => {
            const isMe = msg.from === username;
            const content = msg.message || msg.body || msg.content || 'Message content unavailable';
            return `<div class="inbox-msg ${isMe ? 'me' : 'them'}">
                <div class="msg-body">${content}</div>
                <div class="msg-meta">${isMe ? 'You' : 'Admin'} • ${new Date(msg.timestamp).toLocaleString()}</div>
            </div>`;
        }).join('');

        // Reply box
        const replyBox = `<div class="inbox-reply-box">
            <input id="inbox-reply-input" type="text" placeholder="Type your reply..." />
            <button id="inbox-reply-btn" class="btn btn-primary" data-thread="${threadId}">
                <i data-lucide="send"></i> Send
            </button>
        </div>`;

        document.getElementById('inbox-thread-view').innerHTML = `
            <div class="thread-view-header">
                <button id="back-to-messages" class="btn btn-outline btn-sm">
                    <i data-lucide="arrow-left"></i> Back to Messages
                </button>
                <h5>Conversation with Admin</h5>
            </div>
            <div class="inbox-messages">${messagesHtml}</div>
            ${replyBox}
        `;

        // Hide the inbox tabs and message list when thread is open
        document.querySelector('.inbox-tabs').classList.add('hidden');

        // Add Enter key support for reply
        const replyInput = document.getElementById('inbox-reply-input');
        if (replyInput) {
            replyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    document.getElementById('inbox-reply-btn').click();
                }
            });
        }

        // Add reply functionality
        const replyBtn = document.getElementById('inbox-reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                if (this.isReplying) return;
                this.isReplying = true;

                const threadId = replyBtn.dataset.thread;
                const input = document.getElementById('inbox-reply-input');
                const body = input.value.trim();

                if (body) {
                    this.sendMessage({
                        from: this.core.loggedInUser,
                        to: 'admin',
                        body,
                        senderRole: 'student',
                        threadId
                    });
                    input.value = '';
                    // Refresh the thread view only
                    this.showThreadView(threadId, role);

                    // Focus the reply input again for better UX
                    setTimeout(() => {
                        const newInput = document.getElementById('inbox-reply-input');
                        if (newInput) {
                            newInput.focus();
                        }
                    }, 100);
                }

                // Reset reply flag after a short delay
                setTimeout(() => {
                    this.isReplying = false;
                }, 1000);
            });
        }

        // Back to messages button
        const backBtn = document.getElementById('back-to-messages');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('inbox-thread-view').innerHTML = '';
                document.querySelector('.inbox-tabs').classList.remove('hidden');
            });
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    refreshInboxTab() {
        const tabContent = document.querySelector('.inbox-tabs .inbox-tab-content');
        if (tabContent) {
            tabContent.innerHTML = this.generateInboxTabContent(this.core.loggedInUser, 'student');
            this.setupMessagesEventListeners();
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    deleteThread(threadId) {
        const messages = this.getMessages();
        messages.forEach(msg => {
            if (msg.threadId === threadId) {
                msg.deleted = true;
            }
        });
        this.saveMessages(messages);
        this.refreshInboxTab();
        this.updateMessagesBadge();
        this.core.showNotification('Message Deleted', 'The conversation has been moved to trash.', 'info');
    }

    restoreThread(threadId) {
        const messages = this.getMessages();
        messages.forEach(msg => {
            if (msg.threadId === threadId) {
                msg.deleted = false;
            }
        });
        this.saveMessages(messages);
        this.refreshInboxTab();
        this.updateMessagesBadge();
        this.core.showNotification('Message Restored', 'The conversation has been restored.', 'success');
    }    // Admin messaging UI
    generateAdminInboxUI() {
        const students = Object.keys(this.core.students);
        const allThreads = [];
        
        // Get all threads for all students
        students.forEach(username => {
            const userThreads = this.getThreadsForUser(username, 'student', 'all');
            allThreads.push(...userThreads);
        });

        // Remove duplicates and sort by latest message
        const uniqueThreads = [];
        const seenThreadIds = new Set();
        
        allThreads.forEach(thread => {
            const threadId = thread[0].threadId;
            if (!seenThreadIds.has(threadId)) {
                seenThreadIds.add(threadId);
                uniqueThreads.push(thread);
            }
        });

        uniqueThreads.sort((a, b) => {
            const aLatest = Math.max(...a.map(msg => new Date(msg.timestamp)));
            const bLatest = Math.max(...b.map(msg => new Date(msg.timestamp)));
            return bLatest - aLatest;
        });

        return `
            <div class="admin-inbox-header">
                <h4>Student Messages</h4>
                <button id="admin-compose-btn" class="btn btn-primary btn-sm">
                    <i data-lucide="edit-3"></i> New Message
                </button>
            </div>

            <div id="admin-inbox-thread-view"></div>

            <div class="admin-inbox-list">
                ${uniqueThreads.length === 0 ? `
                    <div class="empty-state">
                        <p>No messages yet.</p>
                        <p class="empty-state-subtext">Student messages will appear here.</p>
                    </div>
                ` : `
                    <div class="inbox-list">
                        ${uniqueThreads.map(thread => {
                            const lastMsg = thread[thread.length - 1];
                            const studentUsername = thread.find(msg => msg.from !== 'admin')?.from || 'Unknown';
                            const studentName = this.core.students[studentUsername]?.name || studentUsername;
                            const hasUnread = thread.some(msg => msg.to === 'admin' && !msg.read);

                            return `<div class="inbox-thread ${hasUnread ? 'unread' : ''}" data-thread="${thread[0].threadId}">
                                <div class="thread-content">
                                    <div class="thread-title">${studentName}</div>
                                    <div class="thread-snippet">${(() => {
                                        const content = lastMsg.message || lastMsg.body || lastMsg.content || 'Message content unavailable';
                                        return content.slice(0, 60) + (content.length > 60 ? '...' : '');
                                    })()}</div>
                                    <div class="thread-time">${new Date(lastMsg.timestamp).toLocaleString()}</div>
                                </div>
                                ${hasUnread ? '<span class="unread-dot"></span>' : ''}
                            </div>`;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
    }    setupAdminMessagesEventListeners() {
        // Admin compose message
        const composeBtn = document.getElementById('admin-compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                // Populate student dropdown
                const recipientSelect = document.getElementById('admin-compose-recipient');
                if (recipientSelect) {
                    recipientSelect.innerHTML = '<option value="">Select recipient...</option>';
                    Object.keys(this.core.students).forEach(username => {
                        const studentName = this.core.students[username]?.name || username;
                        recipientSelect.innerHTML += `<option value="${username}">${studentName}</option>`;
                    });
                }
                
                document.getElementById('admin-compose-modal').classList.remove('hidden');
                if (recipientSelect) recipientSelect.focus();
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
        }

        // Close modal on background click
        const modal = document.getElementById('admin-compose-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'admin-compose-modal') {
                    this.hideAdminComposeModal();
                }
            });
        }

        // Admin thread click
        document.querySelectorAll('.admin-inbox-list .inbox-thread').forEach(threadEl => {
            threadEl.addEventListener('click', (e) => {
                const threadId = threadEl.dataset.thread;
                this.showAdminThreadView(threadId);
            });
        });
    }    hideAdminComposeModal() {
        document.getElementById('admin-compose-modal').classList.add('hidden');
        // Clear form
        document.getElementById('admin-compose-recipient').value = '';
        document.getElementById('admin-compose-subject').value = '';
        document.getElementById('admin-compose-message').value = '';
    }

    sendAdminCompose() {
        // Prevent multiple sends
        if (this.isAdminComposing) return;
        this.isAdminComposing = true;

        const to = document.getElementById('admin-compose-recipient').value;
        const subject = document.getElementById('admin-compose-subject').value.trim();
        const message = document.getElementById('admin-compose-message').value.trim();

        if (!to || !message) {
            this.core.showNotification('Missing Information', 'Please select a student and enter your message', 'warning');
            this.isAdminComposing = false;
            return;
        }

        this.core.showLoading('Sending message...');

        setTimeout(() => {
            const threadId = this.sendMessage({
                from: 'admin',
                to: to,
                body: message,
                subject: subject || 'Message from Admin',
                senderRole: 'admin',
                threadId: null
            });

            this.core.hideLoading();
            this.hideAdminComposeModal();
            this.core.showNotification('Message Sent!', 'Your message has been sent successfully.', 'success');            // Reset compose flag
            this.isAdminComposing = false;

            // Refresh admin inbox
            setTimeout(() => {
                const container = document.getElementById('admin-messages-container');
                if (container) {
                    container.innerHTML = this.generateAdminInboxUI();
                    this.setupAdminMessagesEventListeners();
                    // Initialize Lucide icons
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }, 100);
        }, 500);
    }

    showAdminThreadView(threadId) {
        const messages = this.getMessages();
        const thread = messages.filter(msg => msg.threadId === threadId)
                               .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (!thread.length) return;

        // Mark as read for admin
        this.markThreadRead(threadId, 'admin');

        const studentUsername = thread.find(msg => msg.from !== 'admin')?.from || 'Unknown';
        const studentName = this.core.students[studentUsername]?.name || studentUsername;

        // Render messages
        const messagesHtml = thread.map(msg => {
            const isAdmin = msg.from === 'admin';
            const content = msg.message || msg.body || msg.content || 'Message content unavailable';
            return `<div class="inbox-msg ${isAdmin ? 'me' : 'them'}">
                <div class="msg-body">${content}</div>
                <div class="msg-meta">${isAdmin ? 'You' : studentName} • ${new Date(msg.timestamp).toLocaleString()}</div>
            </div>`;
        }).join('');

        // Reply box
        const replyBox = `<div class="inbox-reply-box">
            <input id="admin-reply-input" type="text" placeholder="Type your reply..." />
            <button id="admin-reply-btn" class="btn btn-primary" data-thread="${threadId}" data-student="${studentUsername}">
                <i data-lucide="send"></i> Send
            </button>
        </div>`;

        document.getElementById('admin-inbox-thread-view').innerHTML = `
            <div class="thread-view-header">
                <button id="admin-back-to-messages" class="btn btn-outline btn-sm">
                    <i data-lucide="arrow-left"></i> Back to Messages
                </button>
                <h5>Conversation with ${studentName}</h5>
            </div>
            <div class="inbox-messages">${messagesHtml}</div>
            ${replyBox}
        `;

        // Hide the inbox list when thread is open
        document.querySelector('.admin-inbox-list').classList.add('hidden');

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
                const studentUsername = replyBtn.dataset.student;
                const input = document.getElementById('admin-reply-input');
                const body = input.value.trim();

                if (body) {
                    this.sendMessage({
                        from: 'admin',
                        to: studentUsername,
                        body,
                        senderRole: 'admin',
                        threadId
                    });
                    input.value = '';
                    // Refresh the thread view only
                    this.showAdminThreadView(threadId);

                    // Focus the reply input again for better UX
                    setTimeout(() => {
                        const newInput = document.getElementById('admin-reply-input');
                        if (newInput) {
                            newInput.focus();
                        }
                    }, 100);
                }

                // Reset reply flag after a short delay
                setTimeout(() => {
                    this.isAdminReplying = false;
                }, 1000);
            });
        }

        // Back to messages button
        const backBtn = document.getElementById('admin-back-to-messages');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('admin-inbox-thread-view').innerHTML = '';                document.querySelector('.admin-inbox-list').classList.remove('hidden');
            });
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    hideStudentReplyModal() {
        document.getElementById('student-reply-modal').classList.add('hidden');
        document.getElementById('student-reply-message').value = '';
        this.isReplying = false;
        this.replyingToThreadId = null;
    }

    sendStudentReply() {
        // Prevent multiple sends
        if (this.isReplying) return;
        this.isReplying = true;

        const message = document.getElementById('student-reply-message').value.trim();

        if (!message) {
            this.core.showNotification('Missing Information', 'Please enter your reply', 'warning');
            this.isReplying = false;
            return;
        }

        this.core.showLoading('Sending reply...');

        setTimeout(() => {
            const threadId = this.sendMessage({
                from: this.core.loggedInUser,
                to: 'admin',
                body: message,
                subject: 'Re: Student Message',
                senderRole: 'student',
                threadId: this.replyingToThreadId
            });

            this.core.hideLoading();
            this.hideStudentReplyModal();
            this.core.showNotification('Reply Sent!', 'Your reply has been sent successfully.', 'success');

            // Refresh the thread view
            if (this.replyingToThreadId) {
                this.showThreadView(this.replyingToThreadId, 'student');
            }

            this.isReplying = false;
        }, 500);
    }

    hideAdminReplyModal() {
        document.getElementById('admin-reply-modal').classList.add('hidden');
        document.getElementById('admin-reply-message').value = '';
        this.isAdminReplying = false;
        this.adminReplyingToThreadId = null;
    }

    sendAdminReply() {
        // Prevent multiple sends
        if (this.isAdminReplying) return;
        this.isAdminReplying = true;

        const message = document.getElementById('admin-reply-message').value.trim();

        if (!message) {
            this.core.showNotification('Missing Information', 'Please enter your reply', 'warning');
            this.isAdminReplying = false;
            return;
        }

        this.core.showLoading('Sending reply...');

        setTimeout(() => {
            // Get the student from the thread
            const messages = this.getMessages();
            const threadMessages = messages.filter(msg => msg.threadId === this.adminReplyingToThreadId);
            const studentUsername = threadMessages.find(msg => msg.from !== 'admin')?.from;

            if (studentUsername) {
                const threadId = this.sendMessage({
                    from: 'admin',
                    to: studentUsername,
                    body: message,
                    subject: 'Re: Admin Reply',
                    senderRole: 'admin',
                    threadId: this.adminReplyingToThreadId
                });
            }

            this.core.hideLoading();
            this.hideAdminReplyModal();
            this.core.showNotification('Reply Sent!', 'Your reply has been sent successfully.', 'success');

            // Refresh the admin thread view
            if (this.adminReplyingToThreadId) {
                this.showAdminThreadView(this.adminReplyingToThreadId);
            }

            this.isAdminReplying = false;
        }, 500);
    }

    // ...existing code...
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MivtzahMessaging };
} else {
    // Browser environment
    window.MivtzahMessaging = MivtzahMessaging;
}
