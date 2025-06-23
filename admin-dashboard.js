// Shiur Gimmel Summer Mivtzah 2025 - Admin Dashboard Module
class AdminDashboard {
    constructor(core) {
        this.core = core;
    }

    loadAdminDashboard() {
        const currentWeek = this.core.getCurrentWeek();
        const weekInfo = this.core.parshiyos[currentWeek] || {};
        const eventThreshold = this.core.getEventThreshold(currentWeek);
        
        document.getElementById('admin-dashboard-container').innerHTML = `
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <div class="current-week-info">
                        <div class="week-card">
                            <h3>Current Week: ${currentWeek}</h3>
                            <p><strong>Parsha:</strong> ${weekInfo.parsha || 'Not set'}</p>
                            <p><strong>Event Goal:</strong> ${eventThreshold} points</p>
                            <p class="week-dates">${weekInfo.dates || 'Dates not configured'}</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-controls">
                    <div class="filter-controls">
                        <label>Filter by Week:</label>
                        <select id="week-filter" class="week-selector">
                            <option value="all">All Weeks</option>
                            ${Object.keys(this.core.parshiyos).map(week => 
                                `<option value="${week}" ${week === currentWeek ? 'selected' : ''}>${week}</option>`
                            ).join('')}
                        </select>
                        
                        <label>Filter by Status:</label>
                        <select id="status-filter" class="status-selector">
                            <option value="all">All Students</option>
                            <option value="passed">Passed Goal</option>
                            <option value="failed">Below Goal</option>
                            <option value="no-submission">No Submission</option>
                        </select>
                        
                        <button id="refresh-dashboard" class="btn btn-outline">
                            <i data-lucide="refresh-cw"></i> Refresh
                        </button>
                    </div>
                    
                    <div class="export-controls">
                        <button id="export-current-view" class="btn btn-primary">
                            <i data-lucide="download"></i> Export Current View
                        </button>
                        <button id="export-all-data" class="btn btn-outline">
                            <i data-lucide="database"></i> Export All Data
                        </button>
                    </div>
                </div>

                <div class="students-tracking-table">
                    <div id="students-table-container">
                        <!-- Table will be populated by loadStudentsTable -->
                    </div>
                </div>

                <div class="dashboard-stats-summary">
                    <div id="dashboard-summary">
                        <!-- Summary stats will be populated -->
                    </div>
                </div>
            </div>
        `;

        // Load the students table
        this.loadStudentsTable();
        
        // Set up event listeners
        this.setupDashboardListeners();
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    loadStudentsTable() {
        const weekFilter = document.getElementById('week-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const currentWeek = this.core.getCurrentWeek();
        const targetWeek = weekFilter === 'all' ? currentWeek : weekFilter;
        
        const students = Object.keys(this.core.students);
        const tableData = [];
        
        students.forEach(username => {
            const student = this.core.students[username];
            if (!student) return;
            
            const weekData = this.getStudentWeekData(username, targetWeek);
            const totalPoints = this.calculateStudentPoints(username);
            const auctionTickets = this.core.chineseAuction.tickets?.[username] || 0;
            
            // Apply status filter
            if (statusFilter !== 'all') {
                const passedGoal = weekData.weekPoints >= weekData.eventThreshold;
                if (statusFilter === 'passed' && !passedGoal) return;
                if (statusFilter === 'failed' && (passedGoal || weekData.weekPoints === 0)) return;
                if (statusFilter === 'no-submission' && weekData.weekPoints > 0) return;
            }
            
            tableData.push({
                username,
                name: student.name,
                weekPoints: weekData.weekPoints,
                totalPoints,
                auctionTickets,
                eventThreshold: weekData.eventThreshold,
                passedGoal: weekData.weekPoints >= weekData.eventThreshold,
                submissions: weekData.submissions,
                week: targetWeek
            });
        });
        
        // Sort by total points descending
        tableData.sort((a, b) => b.totalPoints - a.totalPoints);
        
        const container = document.getElementById('students-table-container');
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="students-tracking-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Student Name</th>
                            <th>Username</th>
                            <th>${weekFilter === 'all' ? 'Current Week' : `Week ${targetWeek}`} Points</th>
                            <th>Total Points</th>
                            <th>Goal (${this.core.getEventThreshold(targetWeek)})</th>
                            <th>Status</th>
                            <th>Auction Tickets</th>
                            <th>Submissions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.length === 0 ? `
                            <tr>
                                <td colspan="10" class="no-data">No students match the current filters</td>
                            </tr>
                        ` : tableData.map((student, index) => `
                            <tr class="student-row ${student.passedGoal ? 'passed-goal' : student.weekPoints > 0 ? 'below-goal' : 'no-submission'}">
                                <td class="rank">${index + 1}</td>
                                <td class="student-name">${student.name}</td>
                                <td class="username">${student.username}</td>
                                <td class="week-points">
                                    <span class="points-value">${student.weekPoints}</span>
                                </td>
                                <td class="total-points">
                                    <span class="points-highlight">${student.totalPoints}</span>
                                </td>
                                <td class="goal-threshold">${student.eventThreshold}</td>
                                <td class="status">
                                    <span class="status-badge ${student.passedGoal ? 'passed' : student.weekPoints > 0 ? 'below' : 'none'}">
                                        ${student.passedGoal ? '✅ Passed' : student.weekPoints > 0 ? '⚠️ Below Goal' : '❌ No Submission'}
                                    </span>
                                </td>
                                <td class="auction-tickets">${student.auctionTickets}</td>
                                <td class="submissions">
                                    <div class="submission-breakdown">
                                        ${student.submissions.map(sub => `
                                            <span class="submission-item" title="${sub.seder}: ${sub.points} pts">
                                                ${this.getSedarAbbrev(sub.seder)}: ${sub.points}
                                            </span>
                                        `).join('')}
                                    </div>
                                </td>
                                <td class="actions">
                                    <button class="btn btn-sm btn-primary view-details-btn" data-username="${student.username}" title="View Details">
                                        <i data-lucide="eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Update summary stats
        this.updateDashboardSummary(tableData, targetWeek);
        
        // Setup table event listeners
        this.setupTableListeners();
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Helper methods
    calculateStudentPoints(username) {
        return this.core.calculateTotalPoints(username);
    }

    getStudentWeekData(username, week) {
        const submissions = [];
        let weekPoints = 0;
        const eventThreshold = this.core.getEventThreshold(week);
        
        // Get all submissions for this student and week
        Object.keys(this.core.submissions).forEach(key => {
            if (key.startsWith(`${username}_${week}_`)) {
                const submission = this.core.submissions[key];
                if (submission) {
                    Object.keys(submission).forEach(seder => {
                        if (seder !== 'manual_adjustments' && submission[seder]) {
                            const points = submission[seder].points || 0;
                            weekPoints += points;
                            submissions.push({
                                seder,
                                points,
                                attended: submission[seder].attended,
                                testScore: submission[seder].testScore
                            });
                        }
                    });
                }
            }
        });
        
        return {
            weekPoints,
            eventThreshold,
            submissions
        };
    }

    getSedarAbbrev(seder) {
        const abbrevs = {
            chassidusBoker: 'CB',
            girsa: 'G',
            halacha: 'H',
            chassidusErev: 'CE',
            mivtzahTorah: 'MT'
        };
        return abbrevs[seder] || seder;
    }

    updateDashboardSummary(tableData, week) {
        const container = document.getElementById('dashboard-summary');
        const passedStudents = tableData.filter(s => s.passedGoal).length;
        const belowGoalStudents = tableData.filter(s => !s.passedGoal && s.weekPoints > 0).length;
        const noSubmissionStudents = tableData.filter(s => s.weekPoints === 0).length;
        const totalStudents = tableData.length;
        const averageWeekPoints = totalStudents > 0 ? Math.round(tableData.reduce((sum, s) => sum + s.weekPoints, 0) / totalStudents) : 0;
        const totalTickets = tableData.reduce((sum, s) => sum + s.auctionTickets, 0);
        
        container.innerHTML = `
            <div class="summary-cards">
                <div class="summary-card passed">
                    <h4>Passed Goal</h4>
                    <div class="summary-number">${passedStudents}</div>
                    <div class="summary-percentage">${totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0}%</div>
                </div>
                <div class="summary-card below">
                    <h4>Below Goal</h4>
                    <div class="summary-number">${belowGoalStudents}</div>
                    <div class="summary-percentage">${totalStudents > 0 ? Math.round((belowGoalStudents / totalStudents) * 100) : 0}%</div>
                </div>
                <div class="summary-card none">
                    <h4>No Submission</h4>
                    <div class="summary-number">${noSubmissionStudents}</div>
                    <div class="summary-percentage">${totalStudents > 0 ? Math.round((noSubmissionStudents / totalStudents) * 100) : 0}%</div>
                </div>
                <div class="summary-card average">
                    <h4>Average Week Points</h4>
                    <div class="summary-number">${averageWeekPoints}</div>
                    <div class="summary-label">Week ${week}</div>
                </div>
                <div class="summary-card tickets">
                    <h4>Total Auction Tickets</h4>
                    <div class="summary-number">${totalTickets}</div>
                    <div class="summary-label">All Students</div>
                </div>
            </div>
        `;
    }

    setupDashboardListeners() {
        // Week and status filter changes
        const weekFilter = document.getElementById('week-filter');
        const statusFilter = document.getElementById('status-filter');
        const refreshBtn = document.getElementById('refresh-dashboard');
        
        if (weekFilter) {
            weekFilter.addEventListener('change', () => this.loadStudentsTable());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadStudentsTable());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.core.showNotification('Refreshing', 'Updating dashboard data...', 'info');
                this.loadStudentsTable();
            });
        }
        
        // Export buttons
        const exportCurrentBtn = document.getElementById('export-current-view');
        const exportAllBtn = document.getElementById('export-all-data');
        
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => this.exportCurrentView());
        }
        
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllStudentData());
        }
    }

    setupTableListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                // Access the main admin instance for student details modal
                if (window.platform && window.platform.admin) {
                    window.platform.admin.openStudentDetailsModal(username);
                }
            });
        });
    }

    // Export methods
    exportCurrentView() {
        this.core.showLoading('Exporting current view...');
        
        try {
            const weekFilter = document.getElementById('week-filter')?.value || 'all';
            const statusFilter = document.getElementById('status-filter')?.value || 'all';
            const currentWeek = this.core.getCurrentWeek();
            const targetWeek = weekFilter === 'all' ? currentWeek : weekFilter;
            
            const exportData = [];
            
            // Header row
            exportData.push([
                'Rank', 'Student Name', 'Username', `Week ${targetWeek} Points`, 
                'Total Points', 'Goal Threshold', 'Status', 'Auction Tickets',
                'Chassidus Boker', 'Girsa', 'Halacha', 'Chassidus Erev', 'Mivtzah Torah',
                'Export Date', 'Filter Applied'
            ]);
            
            const students = Object.keys(this.core.students);
            const tableData = [];
            
            students.forEach(username => {
                const student = this.core.students[username];
                if (!student) return;
                
                const weekData = this.getStudentWeekData(username, targetWeek);
                const totalPoints = this.calculateStudentPoints(username);
                const auctionTickets = this.core.chineseAuction.tickets?.[username] || 0;
                
                // Apply status filter
                if (statusFilter !== 'all') {
                    const passedGoal = weekData.weekPoints >= weekData.eventThreshold;
                    if (statusFilter === 'passed' && !passedGoal) return;
                    if (statusFilter === 'failed' && (passedGoal || weekData.weekPoints === 0)) return;
                    if (statusFilter === 'no-submission' && weekData.weekPoints > 0) return;
                }
                
                tableData.push({
                    username,
                    name: student.name,
                    weekPoints: weekData.weekPoints,
                    totalPoints,
                    auctionTickets,
                    eventThreshold: weekData.eventThreshold,
                    passedGoal: weekData.weekPoints >= weekData.eventThreshold,
                    submissions: weekData.submissions
                });
            });
            
            // Sort by total points descending
            tableData.sort((a, b) => b.totalPoints - a.totalPoints);
            
            // Add data rows
            tableData.forEach((student, index) => {
                const submissionPoints = {
                    chassidusBoker: 0,
                    girsa: 0,
                    halacha: 0,
                    chassidusErev: 0,
                    mivtzahTorah: 0
                };
                
                student.submissions.forEach(sub => {
                    submissionPoints[sub.seder] = sub.points;
                });
                
                exportData.push([
                    index + 1,
                    student.name,
                    student.username,
                    student.weekPoints,
                    student.totalPoints,
                    student.eventThreshold,
                    student.passedGoal ? 'Passed' : student.weekPoints > 0 ? 'Below Goal' : 'No Submission',
                    student.auctionTickets,
                    submissionPoints.chassidusBoker,
                    submissionPoints.girsa,
                    submissionPoints.halacha,
                    submissionPoints.chassidusErev,
                    submissionPoints.mivtzahTorah,
                    new Date().toLocaleDateString(),
                    `Week: ${weekFilter}, Status: ${statusFilter}`
                ]);
            });
            
            this.downloadArrayAsCSV(exportData, `shiur-gimmel-dashboard-week-${targetWeek}-${new Date().toISOString().split('T')[0]}`);
            this.core.hideLoading();
            this.core.showNotification('Export Complete', 'Dashboard data exported successfully', 'success');
        } catch (error) {
            this.core.hideLoading();
            this.core.showNotification('Export Failed', 'Error exporting dashboard data: ' + error.message, 'error');
        }
    }

    exportAllStudentData() {
        this.core.showLoading('Exporting all student data...');
        
        try {
            const exportData = [];
            
            // Header row
            exportData.push([
                'Student Name', 'Username', 'Registration Date', 'Total Points', 'Auction Tickets',
                'Week', 'Week Points', 'Goal Met', 'Chassidus Boker', 'Girsa', 'Halacha', 
                'Chassidus Erev', 'Mivtzah Torah', 'Manual Adjustments'
            ]);
            
            // Process each student
            Object.entries(this.core.students).forEach(([username, student]) => {
                const totalPoints = this.calculateStudentPoints(username);
                const auctionTickets = this.core.chineseAuction.tickets?.[username] || 0;
                const manualAdjustments = this.getExistingManualAdjustments(username);
                
                // Get all weeks this student has data for
                const studentWeeks = new Set();
                Object.keys(this.core.submissions).forEach(key => {
                    if (key.startsWith(username + '_')) {
                        const parts = key.split('_');
                        if (parts.length >= 2) {
                            studentWeeks.add(parts[1]);
                        }
                    }
                });
                
                // If no submissions, add one row with totals
                if (studentWeeks.size === 0) {
                    exportData.push([
                        student.name, username, 
                        new Date(student.createdAt || Date.now()).toLocaleDateString(),
                        totalPoints, auctionTickets, 'No Submissions', 0, 'No', 0, 0, 0, 0, 0, manualAdjustments
                    ]);
                } else {
                    // Add row for each week
                    studentWeeks.forEach(week => {
                        const weekData = this.getStudentWeekData(username, week);
                        const submissionPoints = {
                            chassidusBoker: 0, girsa: 0, halacha: 0, chassidusErev: 0, mivtzahTorah: 0
                        };
                        
                        weekData.submissions.forEach(sub => {
                            submissionPoints[sub.seder] = sub.points;
                        });
                        
                        exportData.push([
                            student.name, username,
                            new Date(student.createdAt || Date.now()).toLocaleDateString(),
                            totalPoints, auctionTickets, week, weekData.weekPoints,
                            weekData.weekPoints >= weekData.eventThreshold ? 'Yes' : 'No',
                            submissionPoints.chassidusBoker, submissionPoints.girsa,
                            submissionPoints.halacha, submissionPoints.chassidusErev,
                            submissionPoints.mivtzahTorah, manualAdjustments
                        ]);
                    });
                }
            });
            
            this.downloadArrayAsCSV(exportData, `shiur-gimmel-complete-data-${new Date().toISOString().split('T')[0]}`);
            this.core.hideLoading();
            this.core.showNotification('Export Complete', 'Complete student data exported successfully', 'success');
        } catch (error) {
            this.core.hideLoading();
            this.core.showNotification('Export Failed', 'Error exporting student data: ' + error.message, 'error');
        }
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

    downloadArrayAsCSV(data, filename) {
        const csvContent = data.map(row => 
            row.map(field => {
                // Handle fields that might contain commas or quotes
                if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            }).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
