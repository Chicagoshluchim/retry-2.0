// Shiur Gimmel Summer Mivtzah 2025 - Admin Reports Module
class AdminReports {
    constructor(core) {
        this.core = core;
    }

    loadAdminReports() {
        document.getElementById('admin-reports-container').innerHTML = `
            <div class="admin-reports">
                <div class="reports-header">
                    <h2><i data-lucide="bar-chart-3"></i> Reports & Analytics</h2>
                    <p>Comprehensive reports and data analysis</p>
                </div>

                <div class="reports-navigation">
                    <button class="report-tab-btn active" data-tab="overview">
                        <i data-lucide="pie-chart"></i> Overview
                    </button>
                    <button class="report-tab-btn" data-tab="attendance">
                        <i data-lucide="users"></i> Attendance
                    </button>
                    <button class="report-tab-btn" data-tab="performance">
                        <i data-lucide="trending-up"></i> Performance
                    </button>
                    <button class="report-tab-btn" data-tab="exports">
                        <i data-lucide="download"></i> Data Export
                    </button>
                </div>

                <div class="reports-content">
                    <!-- Overview Tab -->
                    <div id="overview-report" class="report-tab active">
                        <div class="overview-stats">
                            <div class="stat-card">
                                <h4>Total Students</h4>
                                <div class="stat-number" id="total-students">0</div>
                                <div class="stat-change">+0 this week</div>
                            </div>
                            <div class="stat-card">
                                <h4>Active This Week</h4>
                                <div class="stat-number" id="active-students">0</div>
                                <div class="stat-change" id="active-percentage">0%</div>
                            </div>
                            <div class="stat-card">
                                <h4>Total Submissions</h4>
                                <div class="stat-number" id="total-submissions">0</div>
                                <div class="stat-change">This program</div>
                            </div>
                            <div class="stat-card">
                                <h4>Auction Tickets</h4>
                                <div class="stat-number" id="total-tickets">0</div>
                                <div class="stat-change">Total purchased</div>
                            </div>
                        </div>

                        <div class="overview-charts">
                            <div class="chart-container">
                                <h4>Weekly Participation</h4>
                                <div id="participation-chart" class="chart-placeholder">
                                    Weekly participation chart will be displayed here
                                </div>
                            </div>
                            <div class="chart-container">
                                <h4>Points Distribution</h4>
                                <div id="points-chart" class="chart-placeholder">
                                    Points distribution chart will be displayed here
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Attendance Tab -->
                    <div id="attendance-report" class="report-tab">
                        <div class="attendance-filters">
                            <select id="attendance-week-filter">
                                <option value="all">All Weeks</option>
                                ${Object.keys(this.core.parshiyos).map(week => 
                                    `<option value="${week}">${week}</option>`
                                ).join('')}
                            </select>
                            <select id="attendance-seder-filter">
                                <option value="all">All Sedarim</option>
                                <option value="chassidusBoker">Chassidus Boker</option>
                                <option value="girsa">Girsa</option>
                                <option value="halacha">Halacha</option>
                                <option value="chassidusErev">Chassidus Erev</option>
                                <option value="mivtzahTorah">Mivtzah Torah</option>
                            </select>
                            <button class="btn btn-primary" id="generate-attendance-report">
                                <i data-lucide="refresh-cw"></i> Generate Report
                            </button>
                        </div>
                        <div id="attendance-report-results" class="report-results"></div>
                    </div>

                    <!-- Performance Tab -->
                    <div id="performance-report" class="report-tab">
                        <div class="performance-filters">
                            <select id="performance-metric">
                                <option value="total-points">Total Points</option>
                                <option value="weekly-average">Weekly Average</option>
                                <option value="test-scores">Test Scores</option>
                                <option value="attendance-rate">Attendance Rate</option>
                            </select>
                            <select id="performance-timeframe">
                                <option value="all-time">All Time</option>
                                <option value="current-week">Current Week</option>
                                <option value="last-4-weeks">Last 4 Weeks</option>
                            </select>
                            <button class="btn btn-primary" id="generate-performance-report">
                                <i data-lucide="bar-chart"></i> Generate Report
                            </button>
                        </div>
                        <div id="performance-report-results" class="report-results"></div>
                    </div>

                    <!-- Export Tab -->
                    <div id="exports-report" class="report-tab">
                        <div class="export-options">
                            <div class="export-section">
                                <h4><i data-lucide="users"></i> Student Data</h4>
                                <div class="export-buttons">
                                    <button class="btn btn-outline" id="export-all-data-btn">
                                        <i data-lucide="database"></i> Export All Data
                                    </button>
                                    <button class="btn btn-outline" id="export-attendance-btn">
                                        <i data-lucide="calendar-check"></i> Export Attendance & Scores
                                    </button>
                                    <button class="btn btn-outline" id="export-student-progress-btn">
                                        <i data-lucide="trending-up"></i> Export Student Progress
                                    </button>
                                </div>
                            </div>

                            <div class="export-section">
                                <h4><i data-lucide="trophy"></i> Auction Data</h4>
                                <div class="export-buttons">
                                    <button class="btn btn-outline" id="export-auction-tickets-btn">
                                        <i data-lucide="ticket"></i> Export Auction Tickets
                                    </button>
                                </div>
                            </div>

                            <div class="export-section">
                                <h4><i data-lucide="file-text"></i> Custom Reports</h4>
                                <div class="custom-export">
                                    <div class="export-filters">
                                        <label>
                                            <input type="checkbox" checked> Include Student Names
                                        </label>
                                        <label>
                                            <input type="checkbox" checked> Include Points Breakdown
                                        </label>
                                        <label>
                                            <input type="checkbox" checked> Include Test Scores
                                        </label>
                                        <label>
                                            <input type="checkbox"> Include Timestamps
                                        </label>
                                    </div>
                                    <button class="btn btn-primary" id="export-custom-btn">
                                        <i data-lucide="download"></i> Generate Custom Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupReportsListeners();
        this.loadOverviewStats();
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setupReportsListeners() {
        // Tab navigation
        document.querySelectorAll('.report-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchReportTab(tab);
            });
        });

        // Report generation buttons
        const attendanceBtn = document.getElementById('generate-attendance-report');
        if (attendanceBtn) {
            attendanceBtn.addEventListener('click', () => this.generateAttendanceReport());
        }

        const performanceBtn = document.getElementById('generate-performance-report');
        if (performanceBtn) {
            performanceBtn.addEventListener('click', () => this.generatePerformanceReport());
        }

        // Export buttons
        this.setupExportListeners();
    }

    setupExportListeners() {
        // Export all data
        const exportAllBtn = document.getElementById('export-all-data-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllData());
        }

        // Export attendance and scores
        const exportAttendanceBtn = document.getElementById('export-attendance-btn');
        if (exportAttendanceBtn) {
            exportAttendanceBtn.addEventListener('click', () => this.exportAttendanceAndScores());
        }

        // Export auction tickets
        const exportAuctionBtn = document.getElementById('export-auction-tickets-btn');
        if (exportAuctionBtn) {
            exportAuctionBtn.addEventListener('click', () => this.exportAuctionTickets());
        }

        // Export student progress
        const exportProgressBtn = document.getElementById('export-student-progress-btn');
        if (exportProgressBtn) {
            exportProgressBtn.addEventListener('click', () => this.exportStudentProgress());
        }

        // Custom export
        const exportCustomBtn = document.getElementById('export-custom-btn');
        if (exportCustomBtn) {
            exportCustomBtn.addEventListener('click', () => this.exportCustomReport());
        }
    }

    switchReportTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.report-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.report-tab').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-report`).classList.add('active');

        // Load tab-specific data
        if (tab === 'overview') {
            this.loadOverviewStats();
        }
    }

    loadOverviewStats() {
        const totalStudents = Object.keys(this.core.students).length;
        const currentWeek = this.core.getCurrentWeek();
        
        // Calculate active students this week
        const activeStudents = new Set();
        Object.keys(this.core.submissions).forEach(key => {
            if (key.includes(`_${currentWeek}_`)) {
                const username = key.split('_')[0];
                activeStudents.add(username);
            }
        });

        // Calculate total submissions
        const totalSubmissions = Object.keys(this.core.submissions).length;

        // Calculate total auction tickets
        const totalTickets = Object.values(this.core.chineseAuction.tickets || {})
            .reduce((sum, tickets) => sum + tickets, 0);

        // Update display
        document.getElementById('total-students').textContent = totalStudents;
        document.getElementById('active-students').textContent = activeStudents.size;
        document.getElementById('active-percentage').textContent = 
            totalStudents > 0 ? `${Math.round((activeStudents.size / totalStudents) * 100)}%` : '0%';
        document.getElementById('total-submissions').textContent = totalSubmissions;
        document.getElementById('total-tickets').textContent = totalTickets;
    }

    generateAttendanceReport() {
        const week = document.getElementById('attendance-week-filter').value;
        const seder = document.getElementById('attendance-seder-filter').value;
        
        this.core.showLoading('Generating attendance report...');

        setTimeout(() => {
            const reportData = this.calculateAttendanceData(week, seder);
            this.displayAttendanceReport(reportData);
            this.core.hideLoading();
        }, 1000);
    }

    calculateAttendanceData(weekFilter, sederFilter) {
        const data = {
            students: [],
            summary: {
                totalStudents: 0,
                attendanceRate: 0,
                byWeek: {},
                bySeder: {}
            }
        };

        Object.entries(this.core.students).forEach(([username, student]) => {
            const studentData = {
                name: student.name,
                username: username,
                attendance: {},
                totalDays: 0,
                attendedDays: 0
            };

            // Process submissions
            Object.entries(this.core.submissions).forEach(([key, submission]) => {
                if (!key.startsWith(username + '_')) return;
                
                const [, week, date] = key.split('_');
                
                // Apply week filter
                if (weekFilter !== 'all' && week !== weekFilter) return;
                
                // Process each seder
                Object.keys(submission).forEach(sederType => {
                    if (sederType === 'manual_adjustments') return;
                    
                    // Apply seder filter
                    if (sederFilter !== 'all' && sederType !== sederFilter) return;
                    
                    const sederData = submission[sederType];
                    if (sederData && sederData.attended !== undefined) {
                        const key = `${week}_${date}_${sederType}`;
                        studentData.attendance[key] = sederData.attended;
                        studentData.totalDays++;
                        if (sederData.attended) {
                            studentData.attendedDays++;
                        }
                    }
                });
            });

            studentData.attendanceRate = studentData.totalDays > 0 ? 
                (studentData.attendedDays / studentData.totalDays * 100).toFixed(1) : 0;
            
            data.students.push(studentData);
        });

        // Calculate summary
        data.summary.totalStudents = data.students.length;
        data.summary.attendanceRate = data.students.length > 0 ?
            (data.students.reduce((sum, s) => sum + parseFloat(s.attendanceRate), 0) / data.students.length).toFixed(1) : 0;

        return data;
    }

    displayAttendanceReport(data) {
        const container = document.getElementById('attendance-report-results');
        
        container.innerHTML = `
            <div class="report-summary">
                <h4>Attendance Summary</h4>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="label">Total Students:</span>
                        <span class="value">${data.summary.totalStudents}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Average Attendance Rate:</span>
                        <span class="value">${data.summary.attendanceRate}%</span>
                    </div>
                </div>
            </div>

            <div class="report-table">
                <table class="attendance-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Username</th>
                            <th>Total Sessions</th>
                            <th>Attended</th>
                            <th>Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.students.map(student => `
                            <tr>
                                <td>${student.name}</td>
                                <td>${student.username}</td>
                                <td>${student.totalDays}</td>
                                <td>${student.attendedDays}</td>
                                <td>
                                    <div class="attendance-rate ${this.getAttendanceClass(student.attendanceRate)}">
                                        ${student.attendanceRate}%
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getAttendanceClass(rate) {
        if (rate >= 90) return 'excellent';
        if (rate >= 75) return 'good';
        if (rate >= 60) return 'fair';
        return 'poor';
    }

    generatePerformanceReport() {
        const metric = document.getElementById('performance-metric').value;
        const timeframe = document.getElementById('performance-timeframe').value;
        
        this.core.showLoading('Generating performance report...');

        setTimeout(() => {
            const reportData = this.calculatePerformanceData(metric, timeframe);
            this.displayPerformanceReport(reportData, metric);
            this.core.hideLoading();
        }, 1000);
    }

    calculatePerformanceData(metric, timeframe) {
        const data = [];

        Object.entries(this.core.students).forEach(([username, student]) => {
            const studentData = {
                name: student.name,
                username: username,
                value: 0,
                details: {}
            };

            switch (metric) {
                case 'total-points':
                    studentData.value = this.calculateStudentTotalPoints(username);
                    break;
                case 'weekly-average':
                    studentData.value = this.calculateWeeklyAverage(username, timeframe);
                    break;
                case 'test-scores':
                    studentData.value = this.calculateAverageTestScore(username);
                    break;
                case 'attendance-rate':
                    studentData.value = this.calculateAttendanceRate(username, timeframe);
                    break;
            }

            data.push(studentData);
        });

        // Sort by value descending
        data.sort((a, b) => b.value - a.value);

        return data;
    }

    calculateStudentTotalPoints(username) {
        let totalPoints = 0;
        Object.keys(this.core.parshiyos).forEach(week => {
            totalPoints += this.core.calculateStudentWeekPoints(username, week);
        });
        return totalPoints;
    }

    calculateWeeklyAverage(username, timeframe) {
        const weeks = this.getWeeksForTimeframe(timeframe);
        let totalPoints = 0;
        let weekCount = 0;

        weeks.forEach(week => {
            const weekPoints = this.core.calculateStudentWeekPoints(username, week);
            if (weekPoints > 0) {
                totalPoints += weekPoints;
                weekCount++;
            }
        });

        return weekCount > 0 ? Math.round(totalPoints / weekCount) : 0;
    }

    calculateAverageTestScore(username) {
        const testScores = [];
        
        Object.entries(this.core.submissions).forEach(([key, submission]) => {
            if (!key.startsWith(username + '_')) return;
            
            Object.values(submission).forEach(sederData => {
                if (sederData && sederData.testScore && sederData.testScore > 0) {
                    testScores.push(sederData.testScore);
                }
            });
        });

        return testScores.length > 0 ? 
            Math.round(testScores.reduce((sum, score) => sum + score, 0) / testScores.length) : 0;
    }

    calculateAttendanceRate(username, timeframe) {
        const weeks = this.getWeeksForTimeframe(timeframe);
        let totalSessions = 0;
        let attendedSessions = 0;

        weeks.forEach(week => {
            Object.entries(this.core.submissions).forEach(([key, submission]) => {
                if (!key.startsWith(`${username}_${week}_`)) return;
                
                Object.values(submission).forEach(sederData => {
                    if (sederData && sederData.attended !== undefined) {
                        totalSessions++;
                        if (sederData.attended) {
                            attendedSessions++;
                        }
                    }
                });
            });
        });

        return totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    }

    getWeeksForTimeframe(timeframe) {
        const allWeeks = Object.keys(this.core.parshiyos);
        
        switch (timeframe) {
            case 'current-week':
                return [this.core.getCurrentWeek()];
            case 'last-4-weeks':
                const currentIndex = allWeeks.indexOf(this.core.getCurrentWeek());
                return allWeeks.slice(Math.max(0, currentIndex - 3), currentIndex + 1);
            default: // all-time
                return allWeeks;
        }
    }

    displayPerformanceReport(data, metric) {
        const container = document.getElementById('performance-report-results');
        const metricLabels = {
            'total-points': 'Total Points',
            'weekly-average': 'Weekly Average Points',
            'test-scores': 'Average Test Score',
            'attendance-rate': 'Attendance Rate (%)'
        };

        container.innerHTML = `
            <div class="report-summary">
                <h4>Performance Report: ${metricLabels[metric]}</h4>
            </div>

            <div class="report-table">
                <table class="performance-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Student Name</th>
                            <th>Username</th>
                            <th>${metricLabels[metric]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((student, index) => `
                            <tr>
                                <td class="rank">${index + 1}</td>
                                <td>${student.name}</td>
                                <td>${student.username}</td>
                                <td class="metric-value">
                                    <div class="performance-score ${this.getPerformanceClass(student.value, metric)}">
                                        ${student.value}${metric === 'attendance-rate' ? '%' : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getPerformanceClass(value, metric) {
        switch (metric) {
            case 'attendance-rate':
                if (value >= 90) return 'excellent';
                if (value >= 75) return 'good';
                if (value >= 60) return 'fair';
                return 'poor';
            case 'test-scores':
                if (value >= 90) return 'excellent';
                if (value >= 80) return 'good';
                if (value >= 70) return 'fair';
                return 'poor';
            default:
                return 'neutral';
        }
    }

    // Export Methods
    exportAllData() {
        this.core.showLoading('Exporting all system data...');
        
        const allData = {
            students: this.core.students,
            submissions: this.core.submissions,
            chineseAuction: this.core.chineseAuction,
            systemSettings: this.core.loadData('systemSettings') || {},
            parshiyos: this.core.parshiyos,
            exportMetadata: {
                exportDate: new Date().toISOString(),
                exportType: 'complete_system_backup',
                version: '2025.1'
            }
        };

        this.downloadDataAsJSON(allData, 'complete-system-data');
        this.core.hideLoading();
        this.core.showNotification('Export Complete', 'All system data exported successfully', 'success');
    }

    exportAttendanceAndScores() {
        this.core.showLoading('Preparing attendance and test scores...');
        
        try {
            const attendanceData = [];
            
            // Header row
            attendanceData.push([
                'Student Name', 'Username', 'Week', 'Date', 'Seder Type', 
                'Attended', 'Test Score', 'Points Earned', 'Late Submission'
            ]);

            // Process all submissions
            Object.entries(this.core.submissions).forEach(([key, submission]) => {
                const [username, week, date] = key.split('_');
                const student = this.core.students[username];
                
                if (student && submission) {
                    // Process each seder type
                    ['chassidusBoker', 'girsa', 'halacha', 'chassidusErev', 'mivtzahTorah'].forEach(seder => {
                        if (submission[seder]) {
                            attendanceData.push([
                                student.name || username,
                                username,
                                week,
                                date,
                                this.formatSederName(seder),
                                submission[seder].attended ? 'Yes' : 'No',
                                submission[seder].testScore || '',
                                submission[seder].points || 0,
                                submission[seder].late ? 'Yes' : 'No'
                            ]);
                        }
                    });
                }
            });

            this.downloadArrayAsCSV(attendanceData, 'shiur-gimmel-attendance-scores');
            this.core.hideLoading();
            this.core.showNotification('Export Complete', 'Attendance and test scores exported successfully', 'success');
        } catch (error) {
            this.core.hideLoading();
            this.core.showNotification('Export Failed', 'Error exporting attendance data: ' + error.message, 'error');
        }
    }

    exportAuctionTickets() {
        this.core.showLoading('Preparing auction ticket data...');
        
        try {
            const ticketData = [];
            
            // Header row
            ticketData.push(['Student Name', 'Username', 'Tickets Purchased', 'Total Points Spent']);

            // Process auction tickets
            const tickets = this.core.chineseAuction.tickets || {};
            Object.entries(tickets).forEach(([username, ticketCount]) => {
                const student = this.core.students[username];
                if (student) {
                    ticketData.push([
                        student.name || username,
                        username,
                        ticketCount,
                        ticketCount * 100 // Assuming 100 points per ticket
                    ]);
                }
            });

            // Add summary row
            const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);
            ticketData.push(['', 'TOTAL', totalTickets, totalTickets * 100]);

            this.downloadArrayAsCSV(ticketData, 'shiur-gimmel-auction-tickets');
            this.core.hideLoading();
            this.core.showNotification('Export Complete', 'Auction ticket data exported successfully', 'success');
        } catch (error) {
            this.core.hideLoading();
            this.core.showNotification('Export Failed', 'Error exporting auction data: ' + error.message, 'error');
        }
    }

    exportStudentProgress() {
        this.core.showLoading('Preparing student progress report...');
        
        try {
            const progressData = [];
            
            // Header row
            progressData.push([
                'Student Name', 'Username', 'Total Points', 'Weeks Participated', 
                'Average Daily Points', 'Best Week', 'Total Submissions', 'Auction Tickets'
            ]);

            // Process each student
            Object.entries(this.core.students).forEach(([username, student]) => {
                const studentSubmissions = Object.entries(this.core.submissions)
                    .filter(([key]) => key.startsWith(username + '_'));
                
                const totalPoints = this.calculateStudentTotalPoints(username);

                const weeksParticipated = new Set(
                    studentSubmissions.map(([key]) => key.split('_')[1])
                ).size;

                const avgDailyPoints = studentSubmissions.length > 0 ? 
                    (totalPoints / studentSubmissions.length).toFixed(1) : 0;

                const auctionTickets = this.core.chineseAuction.tickets?.[username] || 0;

                progressData.push([
                    student.name || username,
                    username,
                    totalPoints,
                    weeksParticipated,
                    avgDailyPoints,
                    'Week data needed', // Could be enhanced to calculate best week
                    studentSubmissions.length,
                    auctionTickets
                ]);
            });

            this.downloadArrayAsCSV(progressData, 'shiur-gimmel-student-progress');
            this.core.hideLoading();
            this.core.showNotification('Export Complete', 'Student progress report exported successfully', 'success');
        } catch (error) {
            this.core.hideLoading();
            this.core.showNotification('Export Failed', 'Error exporting progress data: ' + error.message, 'error');
        }
    }

    exportCustomReport() {
        const includeNames = document.querySelector('input[type="checkbox"]').checked;
        // Add custom export logic based on selected filters
        this.core.showNotification('Coming Soon', 'Custom report export feature coming soon', 'info');
    }

    // Helper methods
    formatSederName(seder) {
        const names = {
            chassidusBoker: 'Chassidus Boker',
            girsa: 'Girsa',
            halacha: 'Halacha',
            chassidusErev: 'Chassidus Erev',
            mivtzahTorah: 'Mivtzah Torah'
        };
        return names[seder] || seder;
    }

    downloadArrayAsCSV(data, filename) {
        // Convert array to CSV string
        const csvContent = data.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                const cellStr = String(cell || '');
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return '"' + cellStr.replace(/"/g, '""') + '"';
                }
                return cellStr;
            }).join(',')
        ).join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    downloadDataAsJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminReports };
} else {
    // Browser environment
    window.AdminReports = AdminReports;
}
