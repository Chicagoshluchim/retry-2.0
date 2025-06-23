// Shiur Gimmel Summer Mivtzah 2025 - Complete System
class MivtzahPlatform {
    constructor() {
        this.currentWeek = 'chukas';
        this.loggedInUser = null;
        this.isAdmin = false;
        this.activeTab = 'login';
        this.isSubmittingContact = false;

        // Initialize data structures with localStorage persistence
        this.initializeData();

        // Bind methods
        this.init = this.init.bind(this);
        this.saveData = this.saveData.bind(this);
        this.loadData = this.loadData.bind(this);

        // Initialize the application
        this.init();
    }

    // Data structure definitions
    get parshiyos() {
        return {
            chukas: { name: 'Chukas', weekNum: 1, startDate: '2025-07-01', endDate: '2025-07-04' },
            balak: { name: 'Balak', weekNum: 2, startDate: '2025-07-06', endDate: '2025-07-11' },
            pinchas: { name: 'Pinchas', weekNum: 3, startDate: '2025-07-13', endDate: '2025-07-18' },
            'matos-massei': { name: 'Matos-Massei', weekNum: 4, startDate: '2025-07-20', endDate: '2025-07-25' },
            devarim: { name: 'Devarim', weekNum: 5, startDate: '2025-07-27', endDate: '2025-08-01' }
        };
    }

    initializeData() {
        // Load data from localStorage or initialize with defaults
        this.students = this.loadData('students') || {};
        this.admins = this.loadData('admins') || {
            'admin': { username: 'admin', password: 'admin123', name: 'Main Admin' }
        };

        this.weeklySchedule = this.loadData('weeklySchedule') || this.getDefaultSchedule();
        this.submissions = this.loadData('submissions') || {};
        this.eventThresholds = this.loadData('eventThresholds') || {
            chukas: 1500, balak: 1500, pinchas: 1500, 'matos-massei': 1500, devarim: 1500
        };
        this.adminRequests = this.loadData('adminRequests') || [];
        this.chineseAuction = this.loadData('chineseAuction') || {
            prizes: [],
            tickets: {},
            isOpen: true,
            endDate: '2025-08-05'
        };
    }

    getDefaultSchedule() {
        const schedule = {};
        Object.keys(this.parshiyos).forEach(week => {
            schedule[week] = {};
            const weekDates = this.getWeekDates(week);
            weekDates.forEach(date => {
                schedule[week][date] = {
                    chassidusBoker: true,
                    girsa: true,
                    halacha: true,
                    chassidusErev: true
                };
            });
        });
        return schedule;
    }

    saveData(key, data) {
        try {
            localStorage.setItem(`mivtzah_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(`mivtzah_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }
    init() {
        // Make platform globally accessible for notifications
        window.platform = this;

        this.setupEventListeners();
        this.showLoginPage();
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        // Login/Signup
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('signup-btn').addEventListener('click', () => this.handleSignup());
        document.getElementById('show-signup').addEventListener('click', () => this.showSignup());
        document.getElementById('show-login').addEventListener('click', () => this.showLogin());

        // Header controls
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('week-selector').addEventListener('change', (e) => {
            this.currentWeek = e.target.value;
            this.updateCurrentWeekDisplay();
            this.refreshCurrentTab();
        }); // Dashboard action buttons
        document.getElementById('nav-to-submit').addEventListener('click', () => this.setActiveTab('submit'));
        document.getElementById('nav-to-tests').addEventListener('click', () => this.setActiveTab('weekly'));
        document.getElementById('nav-to-auction').addEventListener('click', () => this.setActiveTab('auction'));
        document.getElementById('contact-admin-btn').addEventListener('click', () => {
            this.setActiveTab('messages');
            // Open compose modal after messages tab loads
            setTimeout(() => {
                const composeBtn = document.getElementById('student-compose-btn');
                if (composeBtn) {
                    composeBtn.click();
                }
            }, 200);
        });

        // Enter key support for login
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        document.getElementById('signup-confirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSignup();
        });
    }

    showLoginPage() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.setupNavigation();
        this.updateCurrentWeekDisplay();
    }

    showSignup() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('login-description').textContent = 'Create your account';
        this.clearErrors();
    }

    showLogin() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('login-description').textContent = 'Sign in to track your progress';
        this.clearErrors();
    }

    clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('signup-error').textContent = '';
    }
    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showNotification('Missing Information', 'Please fill in all fields', 'warning');
            return;
        }

        // Show loading overlay
        this.showLoading('Signing in...');

        // Simulate processing time for better UX
        setTimeout(() => {
            if (this.admins[username] && this.admins[username].password === password) {
                this.loggedInUser = username;
                this.isAdmin = true;
                this.activeTab = 'admin-dashboard';
                this.hideLoading();
                this.showMainApp();
                this.setActiveTab('admin-dashboard');
                this.showNotification('Welcome!', `Logged in as ${this.admins[username].name}`, 'success');
            } else if (this.students[username] && this.students[username].password === password) {
                this.loggedInUser = username;
                this.isAdmin = false;
                this.activeTab = 'dashboard';
                this.hideLoading();
                this.showMainApp();
                this.setActiveTab('dashboard');
                this.showNotification('Welcome!', `Logged in as ${this.students[username].name}`, 'success');
            } else {
                this.hideLoading();
                this.showNotification('Login Failed', 'Invalid username or password', 'error');
            }
        }, 800);
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;

        if (!name || !username || !password || !confirmPassword) {
            document.getElementById('signup-error').textContent = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById('signup-error').textContent = 'Passwords do not match';
            return;
        }

        if (this.students[username] || this.admins[username]) {
            document.getElementById('signup-error').textContent = 'Username already exists';
            return;
        }

        if (password.length < 6) {
            document.getElementById('signup-error').textContent = 'Password must be at least 6 characters';
            return;
        }

        this.students[username] = {
            name: name,
            username: username,
            password: password
        };
        this.saveData('students', this.students);

        this.loggedInUser = username;
        this.isAdmin = false;
        this.activeTab = 'dashboard';
        this.showMainApp();
        this.setActiveTab('dashboard');
    }

    logout() {
        this.loggedInUser = null;
        this.isAdmin = false;
        this.activeTab = 'login';
        this.showLoginPage();
        this.clearLoginForm();
    }

    clearLoginForm() {
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-username').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm').value = '';
        this.clearErrors();
        this.showLogin();
    }

    setupNavigation() {
        const navTabs = document.getElementById('nav-tabs');
        const tabs = this.isAdmin ? [
            { id: 'admin-dashboard', label: 'Dashboard', icon: 'trophy' },
            { id: 'admin-students', label: 'Manage Users', icon: 'users' },
            { id: 'admin-settings', label: 'Settings', icon: 'settings' },
            { id: 'admin-messages', label: 'Messages', icon: 'mail' },
            { id: 'admin-auction', label: 'Chinese Auction', icon: 'gift' },
            { id: 'admin-reports', label: 'Reports', icon: 'book-open' }] : [
                { id: 'dashboard', label: 'Dashboard', icon: 'trophy' },
                { id: 'submit', label: 'Daily Progress', icon: 'check-circle' },
                { id: 'weekly', label: 'Weekly Tests', icon: 'book-open' },
                { id: 'messages', label: 'Messages', icon: 'message-circle', badge: 'messages-badge' },
                { id: 'auction', label: 'Chinese Auction', icon: 'gift' },
                { id: 'profile', label: 'Profile', icon: 'settings' }
            ];
        navTabs.innerHTML = tabs.map(tab => `
            <button class="tab-btn ${tab.id === this.activeTab ? 'active' : ''}"
                     data-tab="${tab.id}">
                <i data-lucide="${tab.icon}"></i>
                <span>${tab.label}</span>
                ${tab.badge ? `<span id="${tab.badge}" class="nav-badge hidden"></span>` : ''}
            </button>
        `).join('');

        // Add click listeners to tab buttons
        navTabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTab(btn.dataset.tab);
            });
        });
        // Update header
        document.getElementById('header-title').textContent =
            this.isAdmin ? 'Admin Panel' : 'Shiur Gimmel Summer Mivtzah';
        document.getElementById('header-subtitle').textContent =
            this.isAdmin ? 'Summer Mivtzah Management' : `Welcome back, ${this.students[this.loggedInUser]?.name}!`;
        // Update messages badge for students
        if (!this.isAdmin) {
            this.updateMessagesBadge();
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    setActiveTab(tabId) {
        this.activeTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show active content
        const activeContent = document.getElementById(`${tabId}-content`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        // Load tab-specific content
        this.loadTabContent(tabId);
    }

    loadTabContent(tabId) {
        switch (tabId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'submit':
                this.loadDailyProgressForm();
                break;
            case 'weekly':
                this.loadWeeklyTestsForm();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'messages':
                this.loadMessages();
                // Mark all messages as read when opening messages tab
                setTimeout(() => {
                    this.updateMessagesBadge();
                }, 100);
                break;
            case 'auction':
                this.loadChineseAuction();
                break;
            case 'admin-dashboard':
                this.loadAdminDashboard();
                break;
            case 'admin-students':
                this.loadAdminStudents();
                break;
            case 'admin-settings':
                this.loadAdminSettings();
                break;
            case 'admin-messages':
                this.loadAdminMessages();
                break;
            case 'admin-auction':
                this.loadAdminAuction();
                break;
            case 'admin-reports':
                this.loadAdminReports();
                break;
        }
    }

    refreshCurrentTab() {
        this.loadTabContent(this.activeTab);
    }

    updateCurrentWeekDisplay() {
        document.getElementById('current-parsha').textContent = this.parshiyos[this.currentWeek].name;
        document.getElementById('week-selector').value = this.currentWeek;
    }

    // Date utilities
    getWeekDates(week) {
        const start = new Date(this.parshiyos[week].startDate);
        const end = new Date(this.parshiyos[week].endDate);
        const dates = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 6) { // Exclude Saturday (Shabbos)
                dates.push(new Date(d).toISOString().split('T')[0]);
            }
        }
        return dates;
    }

    // Points calculation
    calculateStudentWeekPoints(studentId, week) {
        const weekSubmissions = this.submissions[studentId]?.[week] || {};
        let totalPoints = 0;
        const weekDates = this.getWeekDates(week);

        // Chassidus Boker - need all but 1 day, max 1 late
        const chassidusBokerDays = weekSubmissions.chassidusBoker || {};
        const chassidusBokerEntries = Object.entries(chassidusBokerDays);
        const lateDays = chassidusBokerEntries.filter(([date, day]) => day.attended && day.late).length;

        if (lateDays <= 1) {
            const attendedDays = chassidusBokerEntries.filter(([date, day]) => day.attended).length;
            totalPoints += attendedDays * 100;
        }

        // Girsa - need test ≥70
        const girsaDays = weekSubmissions.girsa || {};
        const girsaEntries = Object.entries(girsaDays).filter(([date, day]) =>
            day.attended && day.onTime && day.ritzifus &&
            weekDates.includes(date) &&
            this.weeklySchedule[week]?.[date]?.girsa
        );
        const girsaTestScore = weekSubmissions.girsaTest || 0;

        if (girsaTestScore >= 70) {
            totalPoints += girsaEntries.length * 100;
            if (girsaTestScore >= 80) {
                totalPoints += girsaTestScore * 2;
            } else {
                totalPoints += girsaTestScore;
            }
        }

        // Halacha - need test ≥70
        const halachaDays = weekSubmissions.halacha || {};
        const halachaEntries = Object.entries(halachaDays).filter(([date, day]) =>
            day.attended && day.onTime && day.ritzifus &&
            weekDates.includes(date) &&
            this.weeklySchedule[week]?.[date]?.halacha
        );
        const halachaTestScore = weekSubmissions.halachaTest || 0;

        if (halachaTestScore >= 70) {
            totalPoints += halachaEntries.length * 50;
            totalPoints += Math.max(0, halachaTestScore - 70);
        }

        // Chassidus Erev
        const chassidusErevDays = weekSubmissions.chassidusErev || {};
        const chassidusErevEntries = Object.entries(chassidusErevDays).filter(([date, day]) =>
            day.attended && day.onTime && day.ritzifus &&
            weekDates.includes(date) &&
            this.weeklySchedule[week]?.[date]?.chassidusErev
        );
        totalPoints += chassidusErevEntries.length * 100;

        // Mivtzah Torah
        const mivtzahTorahDays = weekSubmissions.mivtzahTorah || {};
        const totalDafim = Object.values(mivtzahTorahDays).reduce((sum, day) => sum + (day.dafim || 0), 0);
        totalPoints += totalDafim * 50;

        return totalPoints;
    }

    calculateWeekPoints(week) {
        if (!this.loggedInUser || this.isAdmin) return 0;
        return this.calculateStudentWeekPoints(this.loggedInUser, week);
    }

    get currentWeekPoints() {
        return this.calculateWeekPoints(this.currentWeek);
    }

    get totalPoints() {
        if (!this.loggedInUser || this.isAdmin) return 0;
        return Object.keys(this.parshiyos).reduce((sum, parsha) =>
            sum + this.calculateWeekPoints(parsha), 0);
    }

    getStudentRanking() {
        const rankings = Object.keys(this.students)
            .map(studentId => ({
                id: studentId,
                name: this.students[studentId].name,
                totalPoints: Object.keys(this.parshiyos).reduce((sum, parsha) =>
                    sum + this.calculateStudentWeekPoints(studentId, parsha), 0)
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints);

        const currentStudentRank = rankings.findIndex(student => student.id === this.loggedInUser) + 1;
        return {
            rankings: rankings.slice(0, 3),
            currentRank: currentStudentRank,
            totalStudents: rankings.length
        };
    }

    // Dashboard content
    loadDashboard() {
        this.updateDashboardStats();
        this.updateWeeklyProgress();
        this.updateLeaderboard();
    }

    updateDashboardStats() {
        document.getElementById('total-points').textContent = this.totalPoints;
        document.getElementById('week-points').textContent = this.currentWeekPoints;
        document.getElementById('event-goal').textContent = this.eventThresholds[this.currentWeek];

        // Update event goal card color
        const eventGoalCard = document.getElementById('event-goal-card');
        const hasReachedGoal = this.currentWeekPoints >= this.eventThresholds[this.currentWeek];
        eventGoalCard.className = `stat-card ${hasReachedGoal ? 'success' : 'red'}`;
    }

    updateWeeklyProgress() {
        const progressContainer = document.getElementById('weekly-progress');
        const sedarim = ['chassidusBoker', 'girsa', 'halacha', 'chassidusErev'];

        progressContainer.innerHTML = sedarim.map(seder => {
            const weekDates = this.getWeekDates(this.currentWeek);
            const totalDays = weekDates.filter(date =>
                this.weeklySchedule[this.currentWeek]?.[date]?.[seder]).length;

            const submissions_for_seder = this.submissions[this.loggedInUser]?.[this.currentWeek]?.[seder] || {};
            let completed = 0;

            if (seder === 'chassidusBoker') {
                completed = Object.values(submissions_for_seder).filter(day => day.attended).length;
            } else {
                completed = Object.values(submissions_for_seder).filter(day =>
                    day.attended && day.onTime && day.ritzifus).length;
            }

            const percentage = totalDays > 0 ? (completed / totalDays) * 100 : 0;
            const displayName = seder.replace(/([A-Z])/g, ' $1').toLowerCase();

            return `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label">${displayName}</span>
                        <span>${completed}/${totalDays} days</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateLeaderboard() {
        const { rankings, currentRank, totalStudents } = this.getStudentRanking();
        const leaderboardContainer = document.getElementById('leaderboard');

        leaderboardContainer.innerHTML = rankings.map((student, index) => {
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
            return `
                <div class="leaderboard-item ${rankClass}">
                    <div class="leaderboard-left">
                        <div class="rank-badge ${rankClass}">${index + 1}</div>
                        <span class="leaderboard-name">${student.name}</span>
                    </div>
                    <span class="leaderboard-points">${student.totalPoints}</span>
                </div>
            `;
        }).join('');

        // Update user rank display
        const userRankContainer = document.getElementById('user-rank');
        if (!this.isAdmin && currentRank > 0) {
            userRankContainer.innerHTML = `
                <p class="user-rank-text">
                    Your Rank: #${currentRank} out of ${totalStudents} students
                </p>
            `;
            userRankContainer.style.display = 'block';
        } else {
            userRankContainer.style.display = 'none';
        }
    }

    // Daily Progress Form
    loadDailyProgressForm() {
        const container = document.getElementById('daily-form-container');
        const today = new Date().toISOString().split('T')[0];
        const weekDates = this.getWeekDates(this.currentWeek);

        // Get available dates (no submissions yet)
        const availableDates = weekDates.filter(date => {
            const hasSubmission = this.submissions[this.loggedInUser]?.[this.currentWeek]?.chassidusBoker?.[date] ||
                this.submissions[this.loggedInUser]?.[this.currentWeek]?.girsa?.[date] ||
                this.submissions[this.loggedInUser]?.[this.currentWeek]?.halacha?.[date] ||
                this.submissions[this.loggedInUser]?.[this.currentWeek]?.chassidusErev?.[date] ||
                this.submissions[this.loggedInUser]?.[this.currentWeek]?.mivtzahTorah?.[date];
            return !hasSubmission;
        });

        if (availableDates.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="empty-state">
                        <p class="empty-state-text">No available dates for submission.</p>
                        <p class="empty-state-subtext">You have either submitted for all available days or there are no past/current days available.</p>
                    </div>
                </div>
            `;
            return;
        }

        const selectedDate = availableDates.includes(today) ? today : availableDates[0];

        container.innerHTML = `
            <div id="success-message" class="success-message hidden">
                <p class="success-text">Progress saved successfully! Redirecting to dashboard...</p>
            </div>

            <div class="card">
                <h4>Select Date</h4>
                <select id="date-selector" class="week-selector">
                    ${availableDates.map(date => `
                        <option value="${date}" ${date === selectedDate ? 'selected' : ''}>
                            ${new Date(date).toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric'
        })}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div class="form-grid" id="seder-forms">
                ${this.generateSederForms(selectedDate)}
            </div>

            ${this.generateMivtzahTorahForm()}

            <div class="form-actions">
                <button id="save-progress-btn" class="btn btn-primary">Save Progress</button>
            </div>
        `;

        // Setup event listeners
        document.getElementById('date-selector').addEventListener('change', (e) => {
            const newDate = e.target.value;
            document.getElementById('seder-forms').innerHTML = this.generateSederForms(newDate);
            this.setupFormEventListeners();
        });

        document.getElementById('save-progress-btn').addEventListener('click', () => {
            this.saveDailyProgress();
        });

        this.setupFormEventListeners();
    }

    generateSederForms(selectedDate) {
        const sedarim = [
            {
                key: 'chassidusBoker',
                title: 'Chassidus Boker',
                className: 'chassidus-boker',
                points: '100 points per day (fail week if more than 1 late day)',
                hasTimingOptions: true
            },
            {
                key: 'girsa',
                title: 'Girsa',
                className: 'girsa',
                points: '100 points per day (need test ≥70)',
                hasTimingOptions: false
            },
            {
                key: 'halacha',
                title: 'Halacha',
                className: 'halacha',
                points: '50 points per day (need test ≥70)',
                hasTimingOptions: false
            },
            {
                key: 'chassidusErev',
                title: 'Chassidus Erev',
                className: 'chassidus-erev',
                points: '100 points per day',
                hasTimingOptions: false,
                singleCheckbox: true
            }
        ];

        return sedarim
            .filter(seder => this.weeklySchedule[this.currentWeek]?.[selectedDate]?.[seder.key])
            .map(seder => {
                if (seder.singleCheckbox) {
                    return `
                        <div class="form-card ${seder.className}">
                            <h4>${seder.title}</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-item">
                                    <input type="checkbox" id="${seder.key}-all" data-seder="${seder.key}">
                                    <span>I attended on time and learned ritzifus first 25 min</span>
                                </label>
                                <p class="form-description">${seder.points}</p>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="form-card ${seder.className}">
                        <h4>${seder.title}</h4>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" id="${seder.key}-attended" data-seder="${seder.key}">
                                <span>I attended ${seder.title}</span>
                            </label>
                            <div id="${seder.key}-details" class="checkbox-nested hidden">
                                ${seder.hasTimingOptions ? `
                                    <label class="checkbox-item">
                                        <input type="radio" name="${seder.key}-timing" value="onTime" data-seder="${seder.key}">
                                        <span>I was on time</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="radio" name="${seder.key}-timing" value="late" data-seder="${seder.key}">
                                        <span>I was up to 10 min late (max 1 per week)</span>
                                    </label>
                                ` : `
                                    <label class="checkbox-item">
                                        <input type="checkbox" id="${seder.key}-onTime" data-seder="${seder.key}">
                                        <span>I arrived on time</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" id="${seder.key}-ritzifus" data-seder="${seder.key}">
                                        <span>I learned ritzifus first ${seder.key === 'girsa' ? '25' : '20'} min</span>
                                    </label>
                                `}
                            </div>
                            <p class="form-description">${seder.points}</p>
                        </div>
                    </div>
                `;
            }).join('');
    }

    generateMivtzahTorahForm() {
        return `
            <div class="card">
                <h4 style="color: #dc2626;">Mivtzah Torah</h4>
                <div class="textarea-group">
                    <label for="dafim-count">How many dafim did you learn today?</label>
                    <input type="number" id="dafim-count" min="0" step="1" placeholder="0">
                </div>
                <div class="textarea-group">
                    <label for="which-dafim">Which dafim did you learn? (e.g., "Berachos 2a, 2b")</label>
                    <textarea id="which-dafim" rows="3" placeholder="List the specific dafim you learned today..."></textarea>
                </div>
                <p class="form-description">50 points per daf baal peh</p>
            </div>
        `;
    }

    setupFormEventListeners() {
        // Handle attendance checkboxes
        document.querySelectorAll('input[id$="-attended"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const seder = e.target.dataset.seder;
                const detailsDiv = document.getElementById(`${seder}-details`);
                if (e.target.checked) {
                    detailsDiv.classList.remove('hidden');
                } else {
                    detailsDiv.classList.add('hidden');
                    // Clear nested checkboxes
                    detailsDiv.querySelectorAll('input').forEach(input => {
                        input.checked = false;
                    });
                }
            });
        });
    }
    saveDailyProgress() {
        const selectedDate = document.getElementById('date-selector').value;

        if (!selectedDate) {
            this.showNotification('Missing Date', 'Please select a date for your submission.', 'warning');
            return;
        }

        // Show loading overlay
        this.showLoading('Saving your progress...');

        const dailyData = {
            chassidusBoker: { attended: false, onTime: false, late: false },
            girsa: { attended: false, onTime: false, ritzifus: false },
            halacha: { attended: false, onTime: false, ritzifus: false },
            chassidusErev: { attended: false, onTime: false, ritzifus: false },
            mivtzahTorah: { dafim: 0, whichDafim: '' }
        };

        // Collect form data
        const sedarim = ['chassidusBoker', 'girsa', 'halacha', 'chassidusErev'];

        sedarim.forEach(seder => {
            if (seder === 'chassidusErev') {
                const allCheckbox = document.getElementById(`${seder}-all`);
                if (allCheckbox && allCheckbox.checked) {
                    dailyData[seder] = { attended: true, onTime: true, ritzifus: true };
                }
            } else if (seder === 'chassidusBoker') {
                const attendedCheckbox = document.getElementById(`${seder}-attended`);
                if (attendedCheckbox && attendedCheckbox.checked) {
                    dailyData[seder].attended = true;
                    const timingRadio = document.querySelector(`input[name="${seder}-timing"]:checked`);
                    if (timingRadio) {
                        if (timingRadio.value === 'onTime') {
                            dailyData[seder].onTime = true;
                        } else {
                            dailyData[seder].late = true;
                        }
                    }
                }
            } else {
                const attendedCheckbox = document.getElementById(`${seder}-attended`);
                if (attendedCheckbox && attendedCheckbox.checked) {
                    dailyData[seder].attended = true;
                    const onTimeCheckbox = document.getElementById(`${seder}-onTime`);
                    const ritzifusCheckbox = document.getElementById(`${seder}-ritzifus`);
                    if (onTimeCheckbox) dailyData[seder].onTime = onTimeCheckbox.checked;
                    if (ritzifusCheckbox) dailyData[seder].ritzifus = ritzifusCheckbox.checked;
                }
            }
        });

        // Mivtzah Torah
        const dafimCount = document.getElementById('dafim-count');
        const whichDafim = document.getElementById('which-dafim');
        if (dafimCount && whichDafim) {
            dailyData.mivtzahTorah = {
                dafim: parseInt(dafimCount.value) || 0,
                whichDafim: whichDafim.value
            };
        }

        // Simulate processing time
        setTimeout(() => {
            // Save to submissions
            if (!this.submissions[this.loggedInUser]) {
                this.submissions[this.loggedInUser] = {};
            }
            if (!this.submissions[this.loggedInUser][this.currentWeek]) {
                this.submissions[this.loggedInUser][this.currentWeek] = {};
            }

            sedarim.forEach(seder => {
                if (!this.submissions[this.loggedInUser][this.currentWeek][seder]) {
                    this.submissions[this.loggedInUser][this.currentWeek][seder] = {};
                }
                this.submissions[this.loggedInUser][this.currentWeek][seder][selectedDate] = dailyData[seder];
            });

            if (!this.submissions[this.loggedInUser][this.currentWeek].mivtzahTorah) {
                this.submissions[this.loggedInUser][this.currentWeek].mivtzahTorah = {};
            }
            this.submissions[this.loggedInUser][this.currentWeek].mivtzahTorah[selectedDate] = dailyData.mivtzahTorah;

            this.saveData('submissions', this.submissions);

            // Hide loading and show success notification
            this.hideLoading();
            this.showNotification(
                'Progress Saved!',
                'Your daily progress has been submitted successfully.',
                'success'
            );

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                this.setActiveTab('dashboard');
            }, 1500);
        }, 800);
    }

    // Weekly Tests Form
    loadWeeklyTestsForm() {
        const container = document.getElementById('weekly-tests-container');
        const existingData = this.submissions[this.loggedInUser]?.[this.currentWeek];
        const hasSubmitted = existingData && (existingData.girsaTest > 0 || existingData.halachaTest > 0);

        container.innerHTML = `
            <div id="test-success-message" class="success-message hidden">
                <p class="success-text">Test scores saved successfully! Redirecting to dashboard...</p>
            </div>

            ${hasSubmitted ? `
                <div class="warning-message">
                    <p class="warning-text">You have already submitted test scores for this week. Contact admin for any changes.</p>
                </div>
            ` : ''}

            <div class="card">
                <h4>Parshas ${this.parshiyos[this.currentWeek].name} Test Scores</h4>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">Submit your weekly test scores. You need 70+ to earn points for daily attendance.</p>

                <div class="form-grid">
                    <div class="form-card girsa">
                        <h4>Girsa Test</h4>
                        <div class="textarea-group">
                            <label for="girsa-test-score">Test Score (0-100)</label>
                            <input type="number" id="girsa-test-score" min="0" max="100"
                                   value="${existingData?.girsaTest || ''}"
                                   placeholder="Enter your score" ${hasSubmitted ? 'disabled' : ''}>
                        </div>
                        <div class="form-description">
                            <p>• Need 70+ to earn daily points</p>
                            <p>• 70-79: Regular points (e.g., 75 = +75 points)</p>
                            <p>• 80+: Double points (e.g., 85 = +170 points)</p>
                        </div>
                    </div>

                    <div class="form-card halacha">
                        <h4>Halacha Test</h4>
                        <div class="textarea-group">
                            <label for="halacha-test-score">Test Score (0-100)</label>
                            <input type="number" id="halacha-test-score" min="0" max="100"
                                   value="${existingData?.halachaTest || ''}"
                                   placeholder="Enter your score" ${hasSubmitted ? 'disabled' : ''}>
                        </div>
                        <div class="form-description">
                            <p>• Need 70+ to earn daily points</p>
                            <p>• Each point above 70 = +1 point</p>
                        </div>
                    </div>
                </div>

                ${!hasSubmitted ? `
                    <div class="form-actions">
                        <button id="save-test-scores-btn" class="btn btn-primary">Save Test Scores</button>
                    </div>
                ` : ''}
            </div>
        `;

        if (!hasSubmitted) {
            document.getElementById('save-test-scores-btn').addEventListener('click', () => {
                this.saveTestScores();
            });
        }
    }
    saveTestScores() {
        const girsaScore = document.getElementById('girsa-test-score').value;
        const halachaScore = document.getElementById('halacha-test-score').value;

        // Validate input
        if (!girsaScore && !halachaScore) {
            this.showNotification('Missing Scores', 'Please enter at least one test score.', 'warning');
            return;
        }

        // Show loading overlay
        this.showLoading('Saving test scores...');

        // Simulate processing time
        setTimeout(() => {
            if (!this.submissions[this.loggedInUser]) {
                this.submissions[this.loggedInUser] = {};
            }
            if (!this.submissions[this.loggedInUser][this.currentWeek]) {
                this.submissions[this.loggedInUser][this.currentWeek] = {};
            }

            this.submissions[this.loggedInUser][this.currentWeek].girsaTest = parseInt(girsaScore) || 0;
            this.submissions[this.loggedInUser][this.currentWeek].halachaTest = parseInt(halachaScore) || 0;

            this.saveData('submissions', this.submissions);

            // Hide loading and show success notification
            this.hideLoading();
            this.showNotification(
                'Test Scores Saved!',
                'Your test scores have been submitted successfully.',
                'success'
            );

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                this.setActiveTab('dashboard');
            }, 1500);
        }, 800);
    }

    // --- Messaging System ---
    getMessages() {
        return JSON.parse(localStorage.getItem('mivtzah_messages') || '[]');
    }

    saveMessages(messages) {
        localStorage.setItem('mivtzah_messages', JSON.stringify(messages));
    }

    getThreadsForUser(username, role) {
        const messages = this.getMessages();
        const threads = {};
        messages.forEach(msg => {
            if (msg.from === username || msg.to === username) {
                if (!threads[msg.threadId]) threads[msg.threadId] = [];
                threads[msg.threadId].push(msg);
            }
        });
        return Object.values(threads).sort((a, b) => {
            const aLast = a[a.length - 1].timestamp;
            const bLast = b[b.length - 1].timestamp;
            return bLast.localeCompare(aLast);
        });
    }
    getUnreadCount(username) {
        const messages = this.getMessages();
        return messages.filter(msg => msg.to === username && !msg.read && !msg.deleted).length;
    }
    markThreadRead(threadId, username) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && msg.to === username && !msg.read && !msg.deleted) {
                msg.read = true;
                changed = true;
            }
        });
        if (changed) this.saveMessages(messages);
    } sendMessage({ from, to, body, senderRole, threadId = null }) {
        const messages = this.getMessages();
        const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        if (!threadId) {
            threadId = `${from}-${to}-${Date.now()}`;
        }
        messages.push({
            id, threadId, from, to, body, senderRole,
            timestamp: new Date().toISOString(),
            read: false,
            deleted: false // Add deleted flag
        });
        this.saveMessages(messages);
        return threadId;
    }
    getThreadsForUser(username, role, filter = 'all') {
        const messages = this.getMessages();
        const threads = {};

        messages.forEach(msg => {
            if (msg.from === username || msg.to === username) {
                // Skip deleted messages for inbox and all tabs
                if (filter !== 'trash' && msg.deleted) return;
                // Only show deleted messages in trash tab
                if (filter === 'trash' && !msg.deleted) return;

                // For inbox tab, only include threads with unread messages
                if (filter === 'inbox') {
                    // Check if this message or any in its thread is unread and not deleted
                    const threadMessages = messages.filter(m =>
                        m.threadId === msg.threadId &&
                        (m.from === username || m.to === username)
                    );
                    const hasUnread = threadMessages.some(m =>
                        m.to === username && !m.read && !m.deleted
                    );
                    if (!hasUnread) return;
                }

                if (!threads[msg.threadId]) threads[msg.threadId] = [];
                threads[msg.threadId].push(msg);
            }
        });

        return Object.values(threads).sort((a, b) => {
            const aLast = a[a.length - 1].timestamp;
            const bLast = b[b.length - 1].timestamp;
            return bLast.localeCompare(aLast);
        });
    }

    deleteMessage(messageId, username) {
        const messages = this.getMessages();
        const message = messages.find(msg => msg.id === messageId);
        if (message && (message.from === username || message.to === username)) {
            message.deleted = true;
            this.saveMessages(messages);
            return true;
        }
        return false;
    }

    restoreMessage(messageId, username) {
        const messages = this.getMessages();
        const message = messages.find(msg => msg.id === messageId);
        if (message && (message.from === username || message.to === username)) {
            message.deleted = false;
            this.saveMessages(messages);
            return true;
        }
        return false;
    }
    // Profile Management
    loadProfile() {
        const container = document.getElementById('profile-container');
        container.innerHTML = `
            <div class="profile-tabs">
                <div class="profile-tab-nav">
                    <button class="profile-tab-btn active" data-tab="info">Profile Info</button>
                    <button class="profile-tab-btn" data-tab="progress">Detailed Progress</button>
                </div>
                <div class="profile-tab-content">
                    <div id="profile-info-content">${this.generateProfileInfo()}</div>
                    <div id="profile-progress-content" class="hidden">${this.generateDetailedProgress()}</div>
                </div>
            </div>
        `;
        this.setupProfileTabs();
    }

    // Messages Management
    loadMessages() {
        const container = document.getElementById('messages-container');
        container.innerHTML = this.generateInboxUI('student');
        this.updateMessagesBadge();
        this.setupMessagesEventListeners();
    } generateInboxUI(role) {
        const username = this.loggedInUser;

        // Initialize inbox tab state if not exists
        if (!this.inboxTab) {
            this.inboxTab = 'inbox';
        }

        // Get counts for each tab
        const inboxThreads = this.getThreadsForUser(username, role, 'inbox');
        const allThreads = this.getThreadsForUser(username, role, 'all');
        const trashThreads = this.getThreadsForUser(username, role, 'trash');
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
                    ${this.generateInboxTabContent(username, role)}
                </div>
            </div>

            <div id="student-compose-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>New Message to Admin</h4>
                        <button id="close-student-compose-modal" class="btn-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label>Subject</label>
                            <input type="text" id="student-compose-subject" placeholder="What do you need help with?" class="full-width">
                        </div>
                        <div class="input-group">
                            <label>Message</label>
                            <textarea id="student-compose-message" rows="4" placeholder="Type your message..." class="full-width"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-student-compose" class="btn btn-outline">Cancel</button>
                        <button id="send-student-compose" class="btn btn-primary">Send Message</button>
                    </div>
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
                <p class="empty-state-subtext">${this.inboxTab === 'inbox' ? 'New messages will appear here.' : this.inboxTab === 'trash' ? 'Deleted messages will appear here.' : 'Start a conversation with the admin!'}</p>
            </div>`;
        }

        return `
            <div class="inbox-list">
                ${threads.map(thread => {
            const lastMsg = thread[thread.length - 1]; // For student inbox, conversations are always with Admin
            const conversationWith = 'Admin';
            // But show who sent the last message in the snippet
            const lastMsgSender = lastMsg.from === username ? 'You: ' : '';
            const unread = thread.some(msg => msg.to === username && !msg.read && !msg.deleted);
            const isDeleted = thread.some(msg => msg.deleted);
            return `<div class="inbox-thread ${unread ? 'unread' : ''} ${isDeleted ? 'deleted' : ''}" data-thread="${thread[0].threadId}">
                        <div class="thread-content">
                            <div class="thread-title">${conversationWith}</div>
                            <div class="thread-snippet">${lastMsgSender}${lastMsg.body.slice(0, lastMsgSender ? 55 : 60)}...</div>
                            <div class="thread-time">${new Date(lastMsg.timestamp).toLocaleString()}</div>
                        </div>
                        ${unread ? '<span class="unread-dot"></span>' : ''}
                        <div class="thread-actions">
                            ${this.inboxTab === 'trash' ? `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.mivtzahApp.restoreThread('${thread[0].threadId}')" title="Restore">
                                    <i data-lucide="undo"></i> Restore
                                </button>
                            ` : `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.mivtzahApp.deleteThread('${thread[0].threadId}')" title="Delete">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            `}
                        </div>
                    </div>`;
        }).join('')}
            </div>
        `;
    }
    updateInboxBadge(role) {
        const badge = document.getElementById('profile-inbox-badge');
        if (!badge) return;
        const count = this.getUnreadCount(this.loggedInUser);
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    updateMessagesBadge() {
        const badge = document.getElementById('messages-badge');
        if (!badge) return;
        const count = this.getUnreadCount(this.loggedInUser);
        badge.textContent = count > 0 ? count : '';
        if (count > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } setupProfileTabs() {
        document.querySelectorAll('.profile-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {

                // Update active tab
                document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show/hide content - only target profile-specific content
                const tabId = btn.dataset.tab;
                document.querySelectorAll('.profile-tab-content > div').forEach(content => {
                    if (content.id === `profile-${tabId}-content`) {
                        content.classList.remove('hidden');
                    } else if (content.id && content.id.startsWith('profile-')) {
                        content.classList.add('hidden');
                    }
                });

                // Re-setup event listeners for the newly visible tab
                setTimeout(() => this.setupProfileEventListeners(), 100);
            });
        });

        // Setup event listeners for the current tab content
        this.setupProfileEventListeners();
    }

    generateProfileInfo() {
        return `
            <div id="profile-success-message" class="success-message hidden">
                <p class="success-text">Profile updated successfully!</p>
            </div>

            <div class="profile-info-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4>Profile Information</h4>
                    <button id="edit-profile-btn" class="btn btn-primary">Edit Profile</button>
                </div>

                <div id="profile-view">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-weight: 500; color: #374151; font-size: 0.875rem;">Name</label>
                        <p style="color: #111827;">${this.students[this.loggedInUser]?.name} (Admin only can change)</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-weight: 500; color: #374151; font-size: 0.875rem;">Username</label>
                        <p style="color: #111827;">${this.loggedInUser}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-weight: 500; color: #374151; font-size: 0.875rem;">Total Points</label>
                        <p style="color: #2563eb; font-size: 1.25rem; font-weight: bold;">${this.totalPoints}</p>
                    </div>
                </div>

                <div id="profile-edit" class="hidden">
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" id="edit-username" value="${this.loggedInUser}">
                    </div>
                    <div class="input-group">
                        <label>New Password (leave blank to keep current)</label>
                        <input type="password" id="edit-password" placeholder="Enter new password">
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button id="save-profile-btn" class="btn btn-success">Save Changes</button>
                        <button id="cancel-edit-btn" class="btn btn-outline">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }
    setupProfileEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', this.handleEditProfile.bind(this));
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.cancelProfileEdit.bind(this));
        }

        // Save profile button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.saveProfileChanges.bind(this));
        }
    }

    setupMessagesEventListeners() {
        // Student compose message
        const composeBtn = document.getElementById('student-compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                document.getElementById('student-compose-modal').classList.remove('hidden');
                document.getElementById('student-compose-subject').focus();
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
        document.querySelectorAll('.inbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.inbox-tab-btn').forEach(b => b.classList.remove('active'));
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
        document.querySelectorAll('.inbox-thread').forEach(threadEl => {
            threadEl.addEventListener('click', (e) => {
                // Prevent clicking action buttons from triggering thread view
                if (e.target.closest('.thread-action-btn')) return;

                const threadId = threadEl.dataset.thread;
                this.showThreadView(threadId, 'student');
            });
        });

        // Reply button
        const replyBtn = document.getElementById('inbox-reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                // Prevent multiple rapid replies
                if (this.isReplying) return;
                this.isReplying = true;

                const threadId = replyBtn.dataset.thread;
                const input = document.getElementById('inbox-reply-input');
                const body = input.value.trim();
                if (body) {
                    this.sendMessage({
                        from: this.loggedInUser,
                        to: 'admin',
                        body,
                        senderRole: 'student',
                        threadId
                    });
                    input.value = '';
                    // Refresh the thread view only (don't reset to inbox)
                    this.showThreadView(threadId, 'student');
                    this.updateMessagesBadge();

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
                // Show the inbox tabs and message list again
                document.querySelector('.inbox-tabs').classList.remove('hidden');
                // Reinitialize Lucide icons after clearing
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }
    }

    hideStudentComposeModal() {
        document.getElementById('student-compose-modal').classList.add('hidden');
        // Clear form
        document.getElementById('student-compose-subject').value = '';
        document.getElementById('student-compose-message').value = '';
    }
    sendStudentCompose() {
        // Prevent multiple sends
        if (this.isComposing) return;
        this.isComposing = true;

        const subject = document.getElementById('student-compose-subject').value.trim();
        const message = document.getElementById('student-compose-message').value.trim();

        if (!subject || !message) {
            this.showNotification('Missing Information', 'Please fill in both subject and message', 'warning');
            this.isComposing = false;
            return;
        }

        this.showLoading('Sending message...');

        setTimeout(() => {
            const threadId = this.sendMessage({
                from: this.loggedInUser,
                to: 'admin',
                body: `${subject}\n\n${message}`,
                senderRole: 'student',
                threadId: null
            });
            this.hideLoading();
            this.hideStudentComposeModal();
            this.showNotification('Message Sent!', 'Your message has been sent to the admin.', 'success');

            // Reset compose flag
            this.isComposing = false;
            // Refresh inbox without opening the thread
            setTimeout(() => {
                this.loadMessages();
                // Switch to All tab to show the sent message
                const allTab = document.querySelector('.inbox-tab-btn[data-tab="all"]');
                if (allTab) {
                    allTab.click();
                }
            }, 600);
        }, 800);
    }
    showThreadView(threadId, role) {
        const username = this.loggedInUser;
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
            return `<div class="inbox-msg ${isMe ? 'me' : 'them'}">
                <div class="msg-body">${msg.body}</div>
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

        this.setupMessagesEventListeners();
    }

    removeProfileEventListeners() {
        // This is a placeholder - in a more complex app we'd track listeners to remove them
        // For now, we'll rely on the fact that addEventListener won't duplicate identical listeners
    }

    handleEditProfile() {
        document.getElementById('profile-view').classList.add('hidden');
        document.getElementById('profile-edit').classList.remove('hidden');
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.textContent = 'Cancel';
            editBtn.id = 'cancel-edit-btn';
        }
    }

    cancelProfileEdit() {
        document.getElementById('profile-edit').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        const editBtn = document.getElementById('edit-profile-btn') || document.getElementById('cancel-edit-btn');
        if (editBtn) {
            editBtn.textContent = 'Edit Profile';
            editBtn.id = 'edit-profile-btn';
        }
        // Reset form values
        document.getElementById('edit-username').value = this.loggedInUser;
        document.getElementById('edit-password').value = '';
    }

    saveProfileChanges() {
        const newUsername = document.getElementById('edit-username').value.trim();
        const newPassword = document.getElementById('edit-password').value;

        if (!newUsername) {
            alert('Username cannot be empty');
            return;
        }

        // Check if username already exists (and it's not the current user)
        if (newUsername !== this.loggedInUser && (this.students[newUsername] || this.admins[newUsername])) {
            alert('Username already exists');
            return;
        }

        // Update student data
        const studentData = { ...this.students[this.loggedInUser] };

        // If username changed, create new entry and delete old one
        if (newUsername !== this.loggedInUser) {
            studentData.username = newUsername;
            this.students[newUsername] = studentData;
            delete this.students[this.loggedInUser];

            // Update submissions data
            if (this.submissions[this.loggedInUser]) {
                this.submissions[newUsername] = this.submissions[this.loggedInUser];
                delete this.submissions[this.loggedInUser];
            }

            // Update auction tickets
            if (this.chineseAuction.tickets[this.loggedInUser]) {
                this.chineseAuction.tickets[newUsername] = this.chineseAuction.tickets[this.loggedInUser];
                delete this.chineseAuction.tickets[this.loggedInUser];
            }

            this.loggedInUser = newUsername;
        }

        // Update password if provided
        if (newPassword) {
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            this.students[this.loggedInUser].password = newPassword;
        }

        // Save all data
        this.saveData('students', this.students);
        this.saveData('submissions', this.submissions);
        this.saveData('chineseAuction', this.chineseAuction);

        // Show success message
        const successMessage = document.getElementById('profile-success-message');
        successMessage.classList.remove('hidden');

        // Cancel edit mode
        this.cancelProfileEdit();

        // Reload profile content to show updated data
        setTimeout(() => {
            successMessage.classList.add('hidden');
            this.loadProfile();
        }, 2000);
    }
    generateDetailedProgress() {
        try {
            const progress = {};
            Object.keys(this.parshiyos).forEach(week => {
                const weekData = this.submissions[this.loggedInUser]?.[week] || {};
                const weekDates = this.getWeekDates(week);

                progress[week] = {
                    points: this.calculateStudentWeekPoints(this.loggedInUser, week),
                    girsaTest: weekData.girsaTest || 0,
                    halachaTest: weekData.halachaTest || 0,
                    dailySubmissions: this.getDailySubmissionDetails(weekData, weekDates)
                };
            });

            const html = `
                <div class="progress-details">
                    <h4>Detailed Progress by Week</h4>
                    ${Object.entries(progress).map(([week, data]) => `
                        <div class="week-progress-card">
                            <h5 class="week-progress-header">Parshas ${this.parshiyos[week].name}</h5>
                            <div class="week-progress-stats">
                                <div class="week-stat">
                                    <p class="week-stat-label">Total Points</p>
                                    <p class="week-stat-value">${data.points}</p>
                                </div>
                                <div class="week-stat">
                                    <p class="week-stat-label">Girsa Test</p>
                                    <p class="week-stat-value">${data.girsaTest || 'Not submitted'}</p>
                                </div>
                                <div class="week-stat">
                                    <p class="week-stat-label">Halacha Test</p>
                                    <p class="week-stat-value">${data.halachaTest || 'Not submitted'}</p>
                                </div>
                            </div>

                            <div class="daily-progress-section">
                                <h6 style="font-weight: 600; margin: 1rem 0 0.5rem 0; color: #374151;">Daily Progress</h6>
                                ${data.dailySubmissions.length > 0 ? `
                                    <div class="daily-submissions-grid">
                                        ${data.dailySubmissions.map(day => `
                                            <div class="daily-submission-card">
                                                <div class="daily-submission-date">
                                                    ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div class="daily-submission-details">
                                                    ${day.chassidusBoker ? `<div class="seder-status chassidus-boker">
                                                        Chassidus Boker: ${day.chassidusBoker.attended ?
                    (day.chassidusBoker.onTime ? '✓ On Time' : day.chassidusBoker.late ? '⚠ Late' : '✓ Attended')
                    : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.girsa ? `<div class="seder-status girsa">
                                                        Girsa: ${day.girsa.attended && day.girsa.onTime && day.girsa.ritzifus ? '✓ Complete' :
                    day.girsa.attended ? '⚠ Partial' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.halacha ? `<div class="seder-status halacha">
                                                        Halacha: ${day.halacha.attended && day.halacha.onTime && day.halacha.ritzifus ? '✓ Complete' :
                    day.halacha.attended ? '⚠ Partial' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.chassidusErev ? `<div class="seder-status chassidus-erev">
                                                        Chassidus Erev: ${day.chassidusErev.attended && day.chassidusErev.onTime && day.chassidusErev.ritzifus ? '✓ Complete' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.mivtzahTorah && day.mivtzahTorah.dafim > 0 ? `<div class="seder-status mivtzah-torah">
                                                        Mivtzah Torah: ${day.mivtzahTorah.dafim} dafim
                                                        ${day.mivtzahTorah.whichDafim ? `<br><small>${day.mivtzahTorah.whichDafim}</small>` : ''}
                                                    </div>` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="week-submissions-text">No daily submissions yet</p>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            console.log('Generated detailed progress HTML length:', html.length);
            return html;

            // Original complex content (commented out for testing)
            /*
            const progress = {};
            Object.keys(this.parshiyos).forEach(week => {
                const weekData = this.submissions[this.loggedInUser]?.[week] || {};
                const weekDates = this.getWeekDates(week);

                progress[week] = {
                    points: this.calculateStudentWeekPoints(this.loggedInUser, week),
                    girsaTest: weekData.girsaTest || 0,
                    halachaTest: weekData.halachaTest || 0,
                    dailySubmissions: this.getDailySubmissionDetails(weekData, weekDates)
                };
            });

            const html = `
                <div class="progress-details">
                    <h4>Detailed Progress by Week</h4>
                    ${Object.entries(progress).map(([week, data]) => `
                        <div class="week-progress-card">
                            <h5 class="week-progress-header">Parshas ${this.parshiyos[week].name}</h5>
                            <div class="week-progress-stats">
                                <div class="week-stat">
                                    <p class="week-stat-label">Total Points</p>
                                    <p class="week-stat-value">${data.points}</p>
                                </div>
                                <div class="week-stat">
                                    <p class="week-stat-label">Girsa Test</p>
                                    <p class="week-stat-value">${data.girsaTest || 'Not submitted'}</p>
                                </div>
                                <div class="week-stat">
                                    <p class="week-stat-label">Halacha Test</p>
                                    <p class="week-stat-value">${data.halachaTest || 'Not submitted'}</p>
                                </div>
                            </div>

                            <div class="daily-progress-section">
                                <h6 style="font-weight: 600; margin: 1rem 0 0.5rem 0; color: #374151;">Daily Progress</h6>
                                ${data.dailySubmissions.length > 0 ? `
                                    <div class="daily-submissions-grid">
                                        ${data.dailySubmissions.map(day => `
                                            <div class="daily-submission-card">
                                                <div class="daily-submission-date">
                                                    ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div class="daily-submission-details">
                                                    ${day.chassidusBoker ? `<div class="seder-status chassidus-boker">
                                                        Chassidus Boker: ${day.chassidusBoker.attended ?
                    (day.chassidusBoker.onTime ? '✓ On Time' : day.chassidusBoker.late ? '⚠ Late' : '✓ Attended')
                    : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.girsa ? `<div class="seder-status girsa">
                                                        Girsa: ${day.girsa.attended && day.girsa.onTime && day.girsa.ritzifus ? '✓ Complete' :
                    day.girsa.attended ? '⚠ Partial' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.halacha ? `<div class="seder-status halacha">
                                                        Halacha: ${day.halacha.attended && day.halacha.onTime && day.halacha.ritzifus ? '✓ Complete' :
                    day.halacha.attended ? '⚠ Partial' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.chassidusErev ? `<div class="seder-status chassidus-erev">
                                                        Chassidus Erev: ${day.chassidusErev.attended && day.chassidusErev.onTime && day.chassidusErev.ritzifus ? '✓ Complete' : '✗ Absent'}
                                                    </div>` : ''}
                                                    ${day.mivtzahTorah && day.mivtzahTorah.dafim > 0 ? `<div class="seder-status mivtzah-torah">
                                                        Mivtzah Torah: ${day.mivtzahTorah.dafim} dafim
                                                        ${day.mivtzahTorah.whichDafim ? `<br><small>${day.mivtzahTorah.whichDafim}</small>` : ''}
                                                    </div>` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="week-submissions-text">No daily submissions yet</p>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            console.log('Generated detailed progress HTML length:', html.length);
            return html;
            */
        } catch (error) {
            console.error('Error in generateDetailedProgress:', error);
            return `<div style="color: red; padding: 20px;">Error generating detailed progress: ${error.message}</div>`;
        }
    } getDailySubmissionDetails(weekData, weekDates) {
        const dailySubmissions = [];

        weekDates.forEach(date => {
            const dayData = {
                date: date,
                chassidusBoker: weekData.chassidusBoker?.[date],
                girsa: weekData.girsa?.[date],
                halacha: weekData.halacha?.[date],
                chassidusErev: weekData.chassidusErev?.[date],
                mivtzahTorah: weekData.mivtzahTorah?.[date]
            };

            // Only include days that have some submission data
            if (dayData.chassidusBoker || dayData.girsa || dayData.halacha || dayData.chassidusErev || dayData.mivtzahTorah) {
                dailySubmissions.push(dayData);
            }
        });

        return dailySubmissions;
    }
    generateContactForm() {
        try {
            const html = `
                <div id="contact-success-message" class="success-message hidden">
                    <p class="success-text">Message sent to admin successfully!</p>
                </div>

                <div class="contact-form">
                    <h4>Contact Admin</h4>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="input-group">
                            <label>Subject</label>
                            <input type="text" id="contact-subject" placeholder="What do you need help with?">
                        </div>
                        <div class="input-group">
                            <label>Message</label>
                            <textarea id="contact-message" rows="4" placeholder="Describe your issue or request in detail..."></textarea>
                        </div>
                        <button id="send-message-btn" class="btn btn-primary">
                            <i data-lucide="message-circle"></i>
                            Send Message
                        </button>
                    </div>
                </div>
            `;

            console.log('Generated contact form HTML length:', html.length);
            return html;
        } catch (error) {
            console.error('Error in generateContactForm:', error);
            return `<div style="color: red; padding: 20px;">Error generating contact form: ${error.message}</div>`;
        }
    }
    sendContactMessage() {
        console.log('sendContactMessage called');

        const subjectElement = document.getElementById('contact-subject');
        const messageElement = document.getElementById('contact-message');

        if (!subjectElement || !messageElement) {
            this.showNotification('Error', 'Contact form elements not found. Please try again.', 'error');
            return;
        }

        const subject = subjectElement.value.trim();
        const message = messageElement.value.trim();

        if (!subject || !message) {
            this.showNotification('Missing Information', 'Please fill in both subject and message', 'warning');
            return;
        }

        // Show loading overlay
        this.showLoading('Sending message...');

        // Simulate processing time (remove in production)
        setTimeout(() => {
            // Success - create the request
            const newRequest = {
                id: Date.now(),
                studentId: this.loggedInUser,
                studentName: this.students[this.loggedInUser]?.name,
                studentUsername: this.loggedInUser,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString(),
                resolved: false
            };

            this.adminRequests.push(newRequest);
            this.saveData('adminRequests', this.adminRequests);

            // Clear form
            subjectElement.value = '';
            messageElement.value = '';

            // Hide loading and show success notification
            this.hideLoading();
            this.showNotification(
                'Message Sent!',
                'Your message has been sent to the admin successfully.',
                'success'
            );

            console.log('Contact message sent successfully');
        }, 800); // Simulated delay for UX
    }

    // Chinese Auction
    loadChineseAuction() {
        const container = document.getElementById('auction-container');
        const userTickets = this.chineseAuction.tickets[this.loggedInUser] || {};
        const totalTicketsCost = Object.values(userTickets).reduce((sum, qty) => sum + (qty * 10), 0);
        const availablePoints = this.totalPoints - totalTicketsCost;

        container.innerHTML = `
            <div id="auction-success-message" class="success-message hidden">
                <p class="success-text">Tickets updated successfully!</p>
            </div>

            <div class="card">
                <div class="auction-header">
                    <h3>Chinese Auction</h3>
                    <div class="auction-points">
                        <p class="auction-points-label">Available Points</p>
                        <p class="auction-points-value">${availablePoints}</p>
                    </div>
                </div>

                ${!this.chineseAuction.isOpen ? `
                    <div class="warning-message">
                        <p class="warning-text">The auction is currently closed.</p>
                    </div>
                ` : ''}

                <div class="prizes-grid">
                    ${this.chineseAuction.prizes.length > 0 ?
                this.chineseAuction.prizes.map(prize => this.generatePrizeCard(prize, userTickets, availablePoints)).join('') :
                `
                    <div class="empty-state">
                        <p class="empty-state-text">No prizes available yet.</p>
                        <p class="empty-state-subtext">Check back later for exciting prizes!</p>
                    </div>
                    `
            }
                </div>
            </div>
        `;

        if (this.chineseAuction.isOpen) {
            this.setupAuctionEventListeners();
        }
    }

    generatePrizeCard(prize, userTickets, availablePoints) {
        const currentTickets = userTickets[prize.id] || 0;

        return `
            <div class="prize-card">
                ${prize.image ? `<img src="${prize.image}" alt="${prize.name}" class="prize-image">` : ''}
                <h4 class="prize-name">${prize.name}</h4>
                <p class="prize-description">${prize.description}</p>
                <div class="prize-actions">
                    <span class="prize-cost">10 points per ticket</span>
                    ${this.chineseAuction.isOpen ? `
                        <div class="ticket-controls">
                            <input type="number" min="0" value="${currentTickets}"
                                   class="ticket-input" data-prize-id="${prize.id}">
                            <button class="btn btn-primary ticket-btn" data-prize-id="${prize.id}" data-action="add"
                                    ${availablePoints < 10 ? 'disabled' : ''}>+1</button>
                        </div>
                    ` : ''}
                </div>
                ${currentTickets > 0 ? `
                    <p class="ticket-count">You have ${currentTickets} tickets</p>
                ` : ''}
            </div>
        `;
    }

    setupAuctionEventListeners() {
        document.querySelectorAll('.ticket-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const prizeId = e.target.dataset.prizeId;
                const newQuantity = parseInt(e.target.value) || 0;
                this.updateTickets(prizeId, newQuantity);
            });
        });

        document.querySelectorAll('.ticket-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prizeId = e.target.dataset.prizeId;
                const currentTickets = this.chineseAuction.tickets[this.loggedInUser]?.[prizeId] || 0;
                this.updateTickets(prizeId, currentTickets + 1);
            });
        });
    }

    updateTickets(prizeId, newQuantity) {
        const cost = newQuantity * 10;
        const currentTickets = this.chineseAuction.tickets[this.loggedInUser] || {};
        const currentCost = Object.values(currentTickets).reduce((sum, qty) => sum + (qty * 10), 0);
        const otherTicketsCost = currentCost - ((currentTickets[prizeId] || 0) * 10);
        const totalNewCost = otherTicketsCost + cost;

        if (totalNewCost > this.totalPoints) {
            alert('Not enough points!');
            return;
        }

        if (!this.chineseAuction.tickets[this.loggedInUser]) {
            this.chineseAuction.tickets[this.loggedInUser] = {};
        }

        if (newQuantity <= 0) {
            delete this.chineseAuction.tickets[this.loggedInUser][prizeId];
        } else {
            this.chineseAuction.tickets[this.loggedInUser][prizeId] = newQuantity;
        }

        this.saveData('chineseAuction', this.chineseAuction);

        const successMessage = document.getElementById('auction-success-message');
        successMessage.classList.remove('hidden');

        setTimeout(() => {
            successMessage.classList.add('hidden');
            this.loadChineseAuction(); // Refresh the display
        }, 2000);
    }

    // Admin sections (placeholder implementations)
    loadAdminDashboard() {
        document.getElementById('admin-dashboard-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Admin Dashboard</h2>
                <p>Full admin features coming soon!</p>
            </div>
        `;
    }

    loadAdminStudents() {
        const container = document.getElementById('admin-students-container');
        const users = Object.values(this.students);

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
            this.showNotification('Missing Information', 'Please fill in all fields.', 'warning');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Invalid Password', 'Password must be at least 6 characters.', 'warning');
            return;
        }

        if (this.students[username] || this.admins[username]) {
            this.showNotification('User Exists', 'This username is already taken.', 'error');
            return;
        }

        this.students[username] = { name, username, password };
        this.saveData('students', this.students);
        this.showNotification('User Created', `User "${name}" has been successfully created.`, 'success');
        this.closeCreateUserModal();
        this.loadAdminStudents(); // Refresh the user list
    }

    handleDeleteUser(username) {
        if (confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
            // Delete user and associated data
            delete this.students[username];
            delete this.submissions[username];
            if (this.chineseAuction.tickets[username]) {
                delete this.chineseAuction.tickets[username];
            }

            this.saveData('students', this.students);
            this.saveData('submissions', this.submissions);
            this.saveData('chineseAuction', this.chineseAuction);

            this.showNotification('User Deleted', `User "${username}" has been deleted.`, 'success');
            this.loadAdminStudents(); // Refresh the user list
        }
    }


    loadAdminSettings() {
        document.getElementById('admin-settings-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Settings</h2>
                <p>Admin settings coming soon!</p>
            </div>
        `;
    }

    loadAdminRequests() {
        const container = document.getElementById('admin-requests-container');

        container.innerHTML = `
            <div class="card">
                <h3>Student Requests</h3>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">Manage messages and requests from students</p>

                ${this.adminRequests.length > 0 ? `
                    <div class="requests-list">
                        ${this.adminRequests
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
                                            <button class="btn btn-success btn-sm" onclick="window.mivtzahApp.resolveRequest(${request.id})">
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
        const request = this.adminRequests.find(req => req.id === requestId);
        if (request) {
            request.resolved = true;
            this.saveData('adminRequests', this.adminRequests);
            this.loadAdminRequests(); // Refresh the display
        }
    }

    loadAdminAuction() {
        document.getElementById('admin-auction-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Chinese Auction Management</h2>
                <p>Auction management coming soon!</p>
            </div>
        `;
    }

    loadAdminReports() {
        document.getElementById('admin-reports-container').innerHTML = `
            <div class="admin-placeholder">
                <h2>Reports</h2>
                <p>Reporting system coming soon!</p>
            </div>
        `;
    }
    // UI Utilities for loading and notifications
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('show');
        overlay.classList.add('hidden');
    }

    showNotification(title, message, type = 'success', duration = 4000) {
        const container = document.getElementById('notification-container');
        const notificationId = `notification-${Date.now()}`;

        // Icon mapping
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = notificationId;

        notification.innerHTML = `
            <i data-lucide="${icons[type]}" class="notification-icon ${type}"></i>
            <div class="notification-content">
                <p class="notification-title">${title}</p>
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close" onclick="window.platform.removeNotification('${notificationId}')">
                <i data-lucide="x"></i>
            </button>
        `;

        container.appendChild(notification);

        // Initialize Lucide icons for the new notification
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notificationId);
            }, duration);
        }

        return notificationId;
    }

    removeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // Thread management (delete/restore)
    deleteThread(threadId) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && (msg.from === this.loggedInUser || msg.to === this.loggedInUser)) {
                msg.deleted = true;
                changed = true;
            }
        });
        if (changed) {
            this.saveMessages(messages);
            this.showNotification('Thread Deleted', 'Conversation moved to trash', 'success');
            this.refreshInboxTab();
            this.updateMessagesBadge();
        }
    }

    // Add the missing refreshInboxTab method
    refreshInboxTab() {
        const tabContent = document.querySelector('.inbox-tabs .inbox-tab-content');
        if (tabContent) {
            tabContent.innerHTML = this.generateInboxTabContent(this.loggedInUser, 'student');
            // Ensure inbox tabs are visible
            document.querySelector('.inbox-tabs').classList.remove('hidden');

            // Update tab counts
            const inboxThreads = this.getThreadsForUser(this.loggedInUser, 'student', 'inbox');
            const allThreads = this.getThreadsForUser(this.loggedInUser, 'student', 'all');
            const trashThreads = this.getThreadsForUser(this.loggedInUser, 'student', 'trash');

            document.querySelector('.inbox-tabs .inbox-tab-btn[data-tab="inbox"]').innerHTML =
                `Inbox ${inboxThreads.length > 0 ? `(${inboxThreads.length})` : ''}`;
            document.querySelector('.inbox-tabs .inbox-tab-btn[data-tab="all"]').innerHTML =
                `All ${allThreads.length > 0 ? `(${allThreads.length})` : ''}`;
            document.querySelector('.inbox-tabs .inbox-tab-btn[data-tab="trash"]').innerHTML =
                `Trash ${trashThreads.length > 0 ? `(${trashThreads.length})` : ''}`;

            this.setupMessagesEventListeners();
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    restoreThread(threadId) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && (msg.from === this.loggedInUser || msg.to === this.loggedInUser)) {
                msg.deleted = false;
                changed = true;
            }
        });
        if (changed) {
            this.saveMessages(messages);
            this.showNotification('Thread Restored', 'Conversation restored from trash', 'success');
            this.refreshInboxTab();
            this.updateMessagesBadge();
        }
    }

    // Admin messaging system
    loadAdminMessages() {
        const container = document.getElementById('admin-messages-container');
        container.innerHTML = this.generateAdminInboxUI();
        this.setupAdminMessagesEventListeners();
    }

    generateAdminInboxUI() {
        // Initialize admin inbox tab state if not exists
        if (!this.adminInboxTab) {
            this.adminInboxTab = 'inbox';
        }

        // Get counts for each tab
        const inboxThreads = this.getThreadsForUser('admin', 'admin', 'inbox');
        const allThreads = this.getThreadsForUser('admin', 'admin', 'all');
        const trashThreads = this.getThreadsForUser('admin', 'admin', 'trash');

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
                                ${Object.keys(this.students).map(username => `
                                    <option value="${username}">${this.students[username].name} (${username})</option>
                                `).join('')}
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
    }

    generateAdminInboxTabContent() {
        const threads = this.getThreadsForUser('admin', 'admin', this.adminInboxTab);

        if (!threads.length) {
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
            const lastMsg = thread[thread.length - 1];
            // For admin inbox, show the student name
            const otherUser = lastMsg.from === 'admin' ? lastMsg.to : lastMsg.from;
            const studentName = this.students[otherUser]?.name || otherUser;
            const conversationWith = `${studentName} (${otherUser})`;
            // Show who sent the last message in the snippet
            const lastMsgSender = lastMsg.from === 'admin' ? 'You: ' : '';
            const unread = thread.some(msg => msg.to === 'admin' && !msg.read && !msg.deleted);
            const isDeleted = thread.some(msg => msg.deleted);

            return `<div class="inbox-thread ${unread ? 'unread' : ''} ${isDeleted ? 'deleted' : ''}" data-thread="${thread[0].threadId}">
                        <div class="thread-content">
                            <div class="thread-title">${conversationWith}</div>
                            <div class="thread-snippet">${lastMsgSender}${lastMsg.body.slice(0, lastMsgSender ? 55 : 60)}...</div>
                            <div class="thread-time">${new Date(lastMsg.timestamp).toLocaleString()}</div>
                        </div>
                        ${unread ? '<span class="unread-dot"></span>' : ''}
                        <div class="thread-actions">
                            ${this.adminInboxTab === 'trash' ? `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.mivtzahApp.restoreAdminThread('${thread[0].threadId}')" title="Restore">
                                    <i data-lucide="undo"></i> Restore
                                </button>
                            ` : `
                                <button class="btn btn-outline btn-sm thread-action-btn" onclick="window.mivtzahApp.deleteAdminThread('${thread[0].threadId}')" title="Delete">
                                    <i data-lucide="trash-2"></i> Delete
                                </button>
                            `}
                        </div>
                    </div>`;
        }).join('')}
            </div>
        `;
    }

    setupAdminMessagesEventListeners() {
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

        // Admin inbox tab switching
        document.querySelectorAll('.admin-inbox-tabs .inbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.admin-inbox-tabs .inbox-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update inbox tab state
                this.adminInboxTab = btn.dataset.tab;

                // Refresh tab content
                this.refreshAdminInboxTab();

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
    }

    hideAdminComposeModal() {
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

        const recipient = document.getElementById('admin-compose-recipient').value.trim();
        const subject = document.getElementById('admin-compose-subject').value.trim();
        const message = document.getElementById('admin-compose-message').value.trim();

        if (!recipient || !subject || !message) {
            this.showNotification('Missing Information', 'Please fill in all fields', 'warning');
            this.isAdminComposing = false;
            return;
        }

        this.showLoading('Sending message...');

        setTimeout(() => {
            const threadId = this.sendMessage({
                from: 'admin',
                to: recipient,
                body: `${subject}\n\n${message}`,
                senderRole: 'admin',
                threadId: null
            });

            this.hideLoading();
            this.hideAdminComposeModal();
            this.showNotification('Message Sent!', `Your message has been sent to ${this.students[recipient]?.name || recipient}.`, 'success');

            // Reset compose flag
            this.isAdminComposing = false;

            // Refresh admin inbox
            setTimeout(() => {
                this.loadAdminMessages();
                // Switch to All tab to show the sent message
                const allTab = document.querySelector('.admin-inbox-tabs .inbox-tab-btn[data-tab="all"]');
                if (allTab) {
                    allTab.click();
                }
            }, 600);
        }, 800);
    }

    showAdminThreadView(threadId) {
        const threads = this.getThreadsForUser('admin', 'admin');
        const thread = threads.find(t => t[0].threadId === threadId);
        if (!thread) return;

        // Mark as read
        this.markThreadRead(threadId, 'admin');

        // Update admin inbox tab and refresh tabs after marking as read
        this.refreshAdminInboxTab();

        // Get the other user
        const otherUser = thread[0].from === 'admin' ? thread[0].to : thread[0].from;
        const studentName = this.students[otherUser]?.name || otherUser;

        // Render messages
        const messagesHtml = thread.map(msg => {
            const isMe = msg.from === 'admin';
            return `<div class="inbox-msg ${isMe ? 'me' : 'them'}">
                <div class="msg-body">${msg.body}</div>
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
                    this.sendMessage({
                        from: 'admin',
                        to: recipient,
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
        const backBtn = document.getElementById('back-to-admin-messages');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('admin-inbox-thread-view').innerHTML = '';
                // Show the inbox tabs and message list again
                document.querySelector('.admin-inbox-tabs').classList.remove('hidden');
                // Reinitialize Lucide icons after clearing
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }

        this.setupAdminMessagesEventListeners();
    }

    deleteAdminThread(threadId) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && (msg.from === 'admin' || msg.to === 'admin')) {
                msg.deleted = true;
                changed = true;
            }
        });
        if (changed) {
            this.saveMessages(messages);
            this.showNotification('Thread Deleted', 'Conversation moved to trash', 'success');
            this.refreshAdminInboxTab();
        }
    }

    restoreAdminThread(threadId) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.threadId === threadId && (msg.from === 'admin' || msg.to === 'admin')) {
                msg.deleted = false;
                changed = true;
            }
        });
        if (changed) {
            this.saveMessages(messages);
            this.showNotification('Thread Restored', 'Conversation restored from trash', 'success');
            this.refreshAdminInboxTab();
        }
    }

    refreshAdminInboxTab() {
        const tabContent = document.querySelector('.admin-inbox-tabs .inbox-tab-content');
        if (tabContent) {
            tabContent.innerHTML = this.generateAdminInboxTabContent();
            // Ensure inbox tabs are visible
            document.querySelector('.admin-inbox-tabs').classList.remove('hidden');

            // Update tab counts
            const inboxThreads = this.getThreadsForUser('admin', 'admin', 'inbox');
            const allThreads = this.getThreadsForUser('admin', 'admin', 'all');
            const trashThreads = this.getThreadsForUser('admin', 'admin', 'trash');

            document.querySelector('.admin-inbox-tabs .inbox-tab-btn[data-tab="inbox"]').innerHTML =
                `Inbox ${inboxThreads.length > 0 ? `(${inboxThreads.length})` : ''}`;
            document.querySelector('.admin-inbox-tabs .inbox-tab-btn[data-tab="all"]').innerHTML =
                `All ${allThreads.length > 0 ? `(${allThreads.length})` : ''}`;
            document.querySelector('.admin-inbox-tabs .inbox-tab-btn[data-tab="trash"]').innerHTML =
                `Trash ${trashThreads.length > 0 ? `(${trashThreads.length})` : ''}`;

            this.setupAdminMessagesEventListeners();
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mivtzahApp = new MivtzahPlatform();
});