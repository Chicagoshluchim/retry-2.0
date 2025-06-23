// Shiur Gimmel Summer Mivtzah 2025 - Admin Messaging Module
class AdminMessaging {
    constructor(core, messaging) {
        this.core = core;
        this.messaging = messaging;
        this.adminInboxTab = 'inbox';
    }

    loadAdminMessages() {
        const container = document.getElementById('admin-messages-container');
        
        container.innerHTML = `
            <div class="messages-section">
                <div class="section-header">
                    <h2>Admin Messages</h2>
                    <div class="message-stats">
                        <span class="stat-item">
                            <i data-lucide="mail"></i>
                            <span id="unread-count">0</span> unread
                        </span>
                        <span class="stat-item">
                            <i data-lucide="users"></i>
                            <span id="thread-count">0</span> conversations
                        </span>
                    </div>
                </div>

                <div class="inbox-tabs">
                    <button class="inbox-tab active" data-tab="inbox">
                        <i data-lucide="inbox"></i> Inbox
                    </button>
                    <button class="inbox-tab" data-tab="conversations">
                        <i data-lucide="message-circle"></i> All Conversations
                    </button>
                    <button class="inbox-tab" data-tab="trash">
                        <i data-lucide="trash"></i> Deleted
                    </button>
                </div>

                <div class="inbox-container">
                    <div id="inbox-list" class="inbox-list">
                        <!-- Message threads will be populated here -->
                    </div>
                    
                    <div id="conversation-view" class="conversation-view hidden">
                        <div class="conversation-header">
                            <button id="back-to-inbox" class="btn btn-outline btn-sm">
                                <i data-lucide="arrow-left"></i> Back to Inbox
                            </button>
                            <div class="conversation-info">
                                <h4 id="conversation-student-name">Student Name</h4>
                                <p id="conversation-student-username">@username</p>
                            </div>
                            <div class="conversation-actions">
                                <button id="mark-read-btn" class="btn btn-outline btn-sm">
                                    <i data-lucide="check"></i> Mark Read
                                </button>
                                <button id="delete-conversation-btn" class="btn btn-danger btn-sm">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            </div>
                        </div>
                        
                        <div id="messages-list" class="messages-list">
                            <!-- Individual messages will be populated here -->
                        </div>
                        
                        <div class="reply-form">
                            <div class="reply-input-group">
                                <textarea id="admin-reply-text" placeholder="Type your reply..." rows="3"></textarea>
                                <button id="send-admin-reply" class="btn btn-primary">
                                    <i data-lucide="send"></i> Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadInbox();
        this.setupMessagingListeners();
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    loadInbox() {
        const messages = this.messaging.getMessages('admin');
        const inboxList = document.getElementById('inbox-list');
        
        // Group messages by thread
        const threads = this.groupMessagesByThread(messages);
        
        // Update stats
        const unreadCount = messages.filter(msg => msg.to === 'admin' && !msg.read && !msg.deleted).length;
        const threadCount = threads.length;
        
        document.getElementById('unread-count').textContent = unreadCount;
        document.getElementById('thread-count').textContent = threadCount;
        
        // Filter threads based on active tab
        const filteredThreads = threads.filter(thread => {
            const hasUnread = thread.some(msg => msg.to === 'admin' && !msg.read && !msg.deleted);
            const isDeleted = thread.some(msg => msg.deleted);
            
            switch (this.adminInboxTab) {
                case 'inbox':
                    return hasUnread && !isDeleted;
                case 'conversations':
                    return !isDeleted;
                case 'trash':
                    return isDeleted;
                default:
                    return true;
            }
        });

        if (filteredThreads.length === 0) {
            const emptyMessages = {
                inbox: 'No new messages.',
                conversations: 'No conversations yet.',
                trash: 'No deleted messages.'
            };
            
            inboxList.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-text">${emptyMessages[this.adminInboxTab]}</p>
                    <p class="empty-state-subtext">${this.adminInboxTab === 'inbox' ? 'New student messages will appear here.' : this.adminInboxTab === 'trash' ? 'Deleted messages will appear here.' : 'Student conversations will appear here.'}</p>
                </div>
            `;
            return;
        }

        // Sort threads by most recent message
        filteredThreads.sort((a, b) => new Date(b[b.length - 1].timestamp) - new Date(a[a.length - 1].timestamp));

        inboxList.innerHTML = filteredThreads.map(thread => {
            const lastMessage = thread[thread.length - 1];
            const student = this.core.students[lastMessage.from] || { name: lastMessage.from };
            const unread = thread.some(msg => msg.to === 'admin' && !msg.read && !msg.deleted);
            const isDeleted = thread.some(msg => msg.deleted);
            
            return `<div class="inbox-thread ${unread ? 'unread' : ''} ${isDeleted ? 'deleted' : ''}" data-thread="${thread[0].threadId}">
                <div class="thread-info">
                    <div class="thread-avatar">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="thread-content">
                        <div class="thread-header">
                            <h4 class="thread-student">${student.name}</h4>
                            <span class="thread-time">${this.formatMessageTime(lastMessage.timestamp)}</span>
                        </div>
                        <p class="thread-preview">${this.truncateText(lastMessage.message, 100)}</p>
                        <div class="thread-meta">
                            <span class="message-count">${thread.length} message${thread.length !== 1 ? 's' : ''}</span>
                            ${unread ? '<span class="unread-indicator">New</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="thread-actions">
                    <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.platform.adminMessaging.openConversation('${thread[0].threadId}')" title="Open">
                        <i data-lucide="eye"></i> View
                    </button>
                    <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.platform.adminMessaging.deleteAdminThread('${thread[0].threadId}')" title="Delete">
                        <i data-lucide="trash-2"></i> Delete
                    </button>
                </div>
            </div>`;
        }).join('');

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    groupMessagesByThread(messages) {
        const threadsMap = new Map();
        
        messages.forEach(message => {
            const threadId = message.threadId;
            if (!threadsMap.has(threadId)) {
                threadsMap.set(threadId, []);
            }
            threadsMap.get(threadId).push(message);
        });
        
        // Sort messages within each thread by timestamp
        threadsMap.forEach(thread => {
            thread.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        
        return Array.from(threadsMap.values());
    }

    openConversation(threadId) {
        const messages = this.messaging.getMessages('admin');
        const threadMessages = messages.filter(msg => msg.threadId === threadId);
        
        if (threadMessages.length === 0) return;
        
        const firstMessage = threadMessages[0];
        const student = this.core.students[firstMessage.from] || { name: firstMessage.from };
        
        // Update conversation header
        document.getElementById('conversation-student-name').textContent = student.name;
        document.getElementById('conversation-student-username').textContent = `@${firstMessage.from}`;
        
        // Mark messages as read
        threadMessages.forEach(msg => {
            if (msg.to === 'admin') {
                msg.read = true;
            }
        });
        this.messaging.saveMessages();
        
        // Populate messages
        const messagesList = document.getElementById('messages-list');
        messagesList.innerHTML = threadMessages.map(msg => `
            <div class="message ${msg.from === 'admin' ? 'admin-message' : 'student-message'}">
                <div class="message-header">
                    <span class="message-sender">${msg.from === 'admin' ? 'You' : student.name}</span>
                    <span class="message-time">${this.formatMessageTime(msg.timestamp)}</span>
                </div>
                <div class="message-content">
                    <p>${this.escapeHtml(msg.message)}</p>
                </div>
            </div>
        `).join('');
        
        // Show conversation view, hide inbox
        document.getElementById('inbox-list').classList.add('hidden');
        document.getElementById('conversation-view').classList.remove('hidden');
        
        // Store current thread ID for replies
        this.currentThreadId = threadId;
        this.currentStudentUsername = firstMessage.from;
        
        // Scroll to bottom
        messagesList.scrollTop = messagesList.scrollHeight;
        
        // Refresh inbox to update unread counts
        setTimeout(() => this.loadInbox(), 100);
    }

    sendAdminReply() {
        const replyText = document.getElementById('admin-reply-text').value.trim();
        
        if (!replyText) {
            this.core.showNotification('Empty Message', 'Please enter a message before sending', 'warning');
            return;
        }
        
        if (!this.currentThreadId || !this.currentStudentUsername) {
            this.core.showNotification('Error', 'No active conversation found', 'error');
            return;
        }
        
        // Send reply
        this.messaging.sendMessage('admin', this.currentStudentUsername, replyText, this.currentThreadId);
        
        // Clear input
        document.getElementById('admin-reply-text').value = '';
        
        // Refresh conversation
        this.openConversation(this.currentThreadId);
        
        this.core.showNotification('Reply Sent', 'Your reply has been sent successfully', 'success');
    }

    deleteAdminThread(threadId) {
        if (confirm('Are you sure you want to delete this thread?')) {
            const messages = this.messaging.getMessages('admin');
            messages.forEach(msg => {
                if (msg.threadId === threadId) {
                    msg.deleted = true;
                }
            });
            this.messaging.saveMessages();
            this.loadInbox();
            
            // If viewing this thread, go back to inbox
            if (this.currentThreadId === threadId) {
                this.backToInbox();
            }
            
            this.core.showNotification('Thread Deleted', 'Conversation moved to trash', 'success');
        }
    }

    backToInbox() {
        document.getElementById('conversation-view').classList.add('hidden');
        document.getElementById('inbox-list').classList.remove('hidden');
        this.currentThreadId = null;
        this.currentStudentUsername = null;
        this.loadInbox();
    }

    markConversationRead() {
        if (!this.currentThreadId) return;
        
        const messages = this.messaging.getMessages('admin');
        messages.forEach(msg => {
            if (msg.threadId === this.currentThreadId && msg.to === 'admin') {
                msg.read = true;
            }
        });
        this.messaging.saveMessages();
        this.loadInbox();
        
        this.core.showNotification('Marked as Read', 'Conversation marked as read', 'success');
    }

    setupMessagingListeners() {
        // Tab switching
        document.querySelectorAll('.inbox-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update current tab and reload
                this.adminInboxTab = tab.dataset.tab;
                this.loadInbox();
            });
        });
        
        // Back to inbox button
        const backBtn = document.getElementById('back-to-inbox');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToInbox());
        }
        
        // Reply button
        const sendReplyBtn = document.getElementById('send-admin-reply');
        if (sendReplyBtn) {
            sendReplyBtn.addEventListener('click', () => this.sendAdminReply());
        }
        
        // Mark read button
        const markReadBtn = document.getElementById('mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => this.markConversationRead());
        }
        
        // Delete conversation button
        const deleteBtn = document.getElementById('delete-conversation-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.currentThreadId) {
                    this.deleteAdminThread(this.currentThreadId);
                }
            });
        }
        
        // Enter key to send reply
        const replyTextarea = document.getElementById('admin-reply-text');
        if (replyTextarea) {
            replyTextarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAdminReply();
                }
            });
        }
    }

    // Utility methods
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
        
        return date.toLocaleDateString();
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
