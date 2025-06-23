// Shiur Gimmel Summer Mivtzah 2025 - Admin User Management Module
class AdminUserManagement {
    constructor(core) {
        this.core = core;
    }

    // Helper methods for student calculations
    calculateStudentPoints(username) {
        return this.core.calculateTotalPoints(username);
    }

    getStudentSubmissionCount(username) {
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
    }

    getStudentDetailedBreakdown(username) {
        const student = this.core.students[username];
        if (!student) return null;

        const breakdown = {
            username: username,
            name: student.name,
            totalPoints: this.calculateStudentPoints(username),
            auctionTickets: this.core.chineseAuction.tickets?.[username] || 0,
            submissionCount: this.getStudentSubmissionCount(username),
            registrationDate: new Date(student.createdAt || Date.now()).toLocaleDateString(),
            weeklyBreakdown: [],
            sedarimStats: {
                chassidusBoker: { days: 0, points: 0, testScores: [] },
                girsa: { days: 0, points: 0, testScores: [] },
                halacha: { days: 0, points: 0, testScores: [] },
                chassidusErev: { days: 0, points: 0, testScores: [] },
                mivtzahTorah: { days: 0, points: 0, totalDafim: 0, testScores: [] }
            }
        };

        // Process all weeks for this student
        Object.keys(this.core.parshiyos).forEach(week => {
            const weekPoints = this.core.calculateStudentWeekPoints(username, week);
            const weekSubmissions = this.core.submissions[username]?.[week] || {};
            
            breakdown.weeklyBreakdown.push({
                week: week,
                weekNum: this.core.parshiyos[week].weekNum,
                points: weekPoints,
                submissions: Object.keys(weekSubmissions).filter(key => 
                    !['girsaTest', 'halachaTest'].includes(key) && typeof weekSubmissions[key] === 'object'
                ).length
            });

            // Aggregate sedarim stats
            Object.keys(breakdown.sedarimStats).forEach(seder => {
                const sederData = weekSubmissions[seder];
                if (sederData && typeof sederData === 'object') {
                    const days = Object.keys(sederData).length;
                    const points = Object.values(sederData).reduce((sum, day) => sum + (day.points || 0), 0);
                    
                    breakdown.sedarimStats[seder].days += days;
                    breakdown.sedarimStats[seder].points += points;
                    
                    if (seder === 'mivtzahTorah') {
                        breakdown.sedarimStats[seder].totalDafim += Object.values(sederData)
                            .reduce((sum, day) => sum + (day.dafim || 0), 0);
                    }
                }
                
                // Add test scores
                const testScore = weekSubmissions[`${seder}Test`];
                if (testScore && breakdown.sedarimStats[seder]) {
                    breakdown.sedarimStats[seder].testScores.push(testScore);
                }
            });
        });

        return breakdown;
    }

    // Student Management
    loadAdminStudents() {
        const container = document.getElementById('admin-students-container');
        const users = Object.entries(this.core.students);

        container.innerHTML = `
            <div class="students-section">
                <div class="section-header">
                    <h2>Manage Users</h2>
                    <button id="add-user-btn" class="btn btn-primary">
                        <i data-lucide="user-plus"></i> Add New User
                    </button>
                </div>

                <div class="users-grid">
                    ${users.length === 0 ? `
                        <div class="empty-state">
                            <p class="empty-state-text">No students registered yet.</p>
                            <p class="empty-state-subtext">Add users to start tracking their progress.</p>
                        </div>
                    ` : users.map(([username, student]) => {
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
                                <input type="text" id="new-user-name" required class="full-width">
                            </div>
                            <div class="input-row">
                                <div class="input-group">
                                    <label>Username</label>
                                    <input type="text" id="new-user-username" required class="full-width">
                                </div>
                                <div class="input-group">
                                    <label>Password</label>
                                    <input type="password" id="new-user-password" required class="full-width">
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
                            </div>
                            <div class="input-row">
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
                </div>
            </div>
        `;

        this.setupStudentManagementListeners();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setupStudentManagementListeners() {
        // Modal controls
        const addUserBtn = document.getElementById('add-user-btn');
        const closeAddBtn = document.getElementById('close-add-user-modal');
        const cancelAddBtn = document.getElementById('cancel-add-user');

        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                document.getElementById('add-user-modal').classList.remove('hidden');
                document.getElementById('new-user-name').focus();
            });
        }

        [closeAddBtn, cancelAddBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('add-user-modal').classList.add('hidden');
                    this.clearAddUserForm();
                });
            }
        });

        const closeEditBtn = document.getElementById('close-edit-user-modal');
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
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => {
                document.getElementById('student-details-modal').classList.add('hidden');
            });
        }

        // Save buttons
        const saveAddBtn = document.getElementById('save-add-user');
        if (saveAddBtn) {
            saveAddBtn.addEventListener('click', () => this.createUser());
        }

        const saveEditBtn = document.getElementById('save-edit-user');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => this.updateUser());
        }

        // View details, edit and delete buttons
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
    }

    createUser() {
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
    }

    openEditUserModal(username) {
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
    }

    openStudentDetailsModal(username) {
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
                <div class="stats-grid">
                    ${Object.entries(breakdown.sedarimStats).map(([seder, stats]) => `
                        <div class="stat-overview-card">
                            <div class="stat-header">
                                ${this.getSedarIcon(seder)}
                                <h4>${this.getSedarDisplayName(seder)}</h4>
                            </div>
                            <div class="stat-numbers">
                                <div class="stat-item">
                                    <span class="stat-label">Days</span>
                                    <span class="stat-value">${stats.days}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Points</span>
                                    <span class="stat-value">${stats.points}</span>
                                </div>
                                ${seder === 'mivtzahTorah' ? `
                                    <div class="stat-item">
                                        <span class="stat-label">Dafim</span>
                                        <span class="stat-value">${stats.totalDafim}</span>
                                    </div>
                                ` : ''}
                                ${stats.testScores.length > 0 ? `
                                    <div class="stat-item">
                                        <span class="stat-label">Avg Test</span>
                                        <span class="stat-value">${Math.round(stats.testScores.reduce((a, b) => a + b, 0) / stats.testScores.length)}%</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Weekly Breakdown -->
                <div class="weekly-breakdown">
                    <h3>Weekly Progress</h3>
                    <div class="weeks-grid">
                        ${breakdown.weeklyBreakdown.map(week => `
                            <div class="week-card ${this.getWeekScoreClass(week.points)}">
                                <div class="week-header">
                                    <h4>Week ${week.weekNum}</h4>
                                    <span class="week-name">${week.week}</span>
                                </div>
                                <div class="week-stats">
                                    <div class="week-points">${week.points} pts</div>
                                    <div class="week-submissions">${week.submissions} submissions</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Show modal
        document.getElementById('student-details-modal').classList.remove('hidden');

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateUser() {
        const originalUsername = document.getElementById('edit-user-original-username').value;
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
            // Delete user account
            delete this.core.students[username];
            
            // Delete submissions
            if (this.core.submissions[username]) {
                delete this.core.submissions[username];
            }
            
            // Delete auction tickets
            if (this.core.chineseAuction.tickets && this.core.chineseAuction.tickets[username]) {
                delete this.core.chineseAuction.tickets[username];
            }

            // Save updated data
            this.core.saveData('students', this.core.students);
            this.core.saveData('submissions', this.core.submissions);
            this.core.saveData('chineseAuction', this.core.chineseAuction);

            // Refresh the view
            this.loadAdminStudents();

            this.core.hideLoading();
            this.core.showNotification('User Deleted', 'User and all associated data have been deleted', 'success');
        }, 500);
    }

    handlePointAdjustment(username) {
        const adjustmentType = document.getElementById(`adjustment-type-${username}`).value;
        const amount = parseInt(document.getElementById(`adjustment-amount-${username}`).value);
        const reason = document.getElementById(`adjustment-reason-${username}`).value.trim() || 'Manual adjustment by admin';

        if (isNaN(amount) || amount < 0) {
            this.core.showNotification('Invalid Amount', 'Please enter a valid positive number', 'warning');
            return;
        }

        this.core.showLoading('Applying adjustment...');

        setTimeout(() => {
            // Ensure submissions structure exists
            if (!this.core.submissions[username]) {
                this.core.submissions[username] = {};
            }
            if (!this.core.submissions[username]['manual_adjustments']) {
                this.core.submissions[username]['manual_adjustments'] = {};
            }

            // Calculate points based on adjustment type
            let pointsToAdd = 0;
            if (adjustmentType === 'add') {
                pointsToAdd = amount;
            } else if (adjustmentType === 'subtract') {
                pointsToAdd = -amount;
            } else if (adjustmentType === 'set') {
                // For set total, we need to calculate what adjustment is needed
                const currentTotal = this.calculateStudentPoints(username);
                const currentManualAdjustments = this.getExistingManualAdjustments(username);
                const basePoints = currentTotal - currentManualAdjustments;
                
                // Clear existing manual adjustments and set new total
                this.core.submissions[username]['manual_adjustments'] = {};
                pointsToAdd = amount - basePoints;
            }

            // Add the adjustment record
            const adjustmentId = `adj_${Date.now()}`;
            this.core.submissions[username]['manual_adjustments'][adjustmentId] = {
                date: new Date().toISOString().split('T')[0],
                points: pointsToAdd,
                type: 'manual_adjustment',
                reason: reason,
                adjustedBy: this.core.loggedInUser,
                originalAmount: amount,
                adjustmentType: adjustmentType
            };

            // Save the changes
            this.core.saveData('submissions', this.core.submissions);

            // Clear form and refresh view
            document.getElementById(`adjustment-amount-${username}`).value = '';
            document.getElementById(`adjustment-reason-${username}`).value = '';
            this.loadAdminStudents();

            this.core.hideLoading();
            this.core.showNotification('Points Adjusted', `Successfully ${adjustmentType === 'set' ? 'set' : adjustmentType + 'ed'} points for ${this.core.students[username].name}`, 'success');
        }, 500);
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

    clearAddUserForm() {
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-username').value = '';
        document.getElementById('new-user-password').value = '';
    }

    clearEditUserForm() {
        document.getElementById('edit-user-original-username').value = '';
        document.getElementById('edit-user-name').value = '';
        document.getElementById('edit-user-username').value = '';
        document.getElementById('edit-user-password').value = '';
    }

    // Helper methods for student details modal
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

    getSedarDisplayName(seder) {
        const names = {
            chassidusBoker: 'Chassidus Boker',
            girsa: 'Girsa',
            halacha: 'Halacha',
            chassidusErev: 'Chassidus Erev',
            mivtzahTorah: 'Mivtzah Torah'
        };
        return names[seder] || seder;
    }

    getWeekScoreClass(points) {
        if (points >= 1500) return 'excellent';
        if (points >= 1000) return 'good';
        if (points >= 500) return 'average';
        return 'needs-improvement';
    }
}
