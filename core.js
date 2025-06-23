// Shiur Gimmel Summer Mivtzah 2025 - Core System
class MivtzahCore {
    constructor() {
        this.currentWeek = 'chukas';
        this.loggedInUser = null;
        this.isAdmin = false;
        this.activeTab = 'login';

        // Initialize data structures with localStorage persistence
        this.initializeData();

        // Bind methods
        this.saveData = this.saveData.bind(this);
        this.loadData = this.loadData.bind(this);
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
    }    initializeData() {
        // Load data from localStorage or initialize with defaults
        this.students = this.loadData('students') || {
            'student1': { name: 'Test Student', username: 'student1', password: 'password123' },
            'demo': { name: 'Demo Student', username: 'demo', password: 'demo123' }
        };
        this.admins = this.loadData('admins') || {
            'admin': { username: 'admin', password: 'admin123', name: 'Main Admin' }
        };

        console.log('Initialized students:', Object.keys(this.students));
        console.log('Initialized admins:', Object.keys(this.admins));        this.weeklySchedule = this.loadData('weeklySchedule') || this.getDefaultSchedule();
        this.submissions = this.loadData('submissions') || this.getDefaultSubmissions();
        this.eventThresholds = this.loadData('eventThresholds') || {
            chukas: 1500, balak: 1500, pinchas: 1500, 'matos-massei': 1500, devarim: 1500
        };
        this.adminRequests = this.loadData('adminRequests') || [];
        this.chineseAuction = this.loadData('chineseAuction') || {
            prizes: [],
            tickets: { 'student1': 3, 'demo': 5 }, // Default tickets for testing
            isOpen: true,
            endDate: '2025-08-05'
        };
    }    getDefaultSchedule() {
        // Generate schedule for all weeks with proper date structure
        const schedule = {};
        
        Object.keys(this.parshiyos).forEach(week => {
            schedule[week] = {};
            const weekDates = this.getWeekDates(week);
            
            weekDates.forEach(date => {
                const dayOfWeek = new Date(date).getDay();
                // Include all weekdays (Sunday=0 to Thursday=4, exclude Friday=5 and Saturday=6)
                if (dayOfWeek >= 0 && dayOfWeek <= 4) {
                    schedule[week][date] = {
                        chassidusBoker: true,
                        girsa: true,
                        halacha: true,
                        chassidusErev: true,
                        mivtzahTorah: true
                    };
                }
            });
        });
        
        return schedule;
    }

    getDefaultSubmissions() {
        // Return default test data for demo purposes
        return {
            'student1': {
                'chukas': {
                    'chassidusBoker': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true, late: false },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true, late: false },
                        '2025-07-03': { attended: true, onTime: false, ritzifus: true, late: true }
                    },
                    'girsa': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true },
                        '2025-07-03': { attended: true, onTime: true, ritzifus: false }
                    },
                    'girsaTest': 85,
                    'halacha': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true }
                    },
                    'halachaTest': 75,
                    'chassidusErev': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true }
                    },
                    'mivtzahTorah': {
                        '2025-07-01': { attended: true, dafim: 2 },
                        '2025-07-02': { attended: true, dafim: 1 }
                    }
                }
            },
            'demo': {
                'chukas': {
                    'chassidusBoker': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true, late: false },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true, late: false }
                    },
                    'girsa': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true },
                        '2025-07-02': { attended: true, onTime: true, ritzifus: true }
                    },
                    'girsaTest': 78,
                    'halacha': {
                        '2025-07-01': { attended: true, onTime: true, ritzifus: true }
                    },
                    'halachaTest': 88
                },
                'balak': {
                    'chassidusBoker': {
                        '2025-07-06': { attended: true, onTime: true, ritzifus: true, late: false }
                    },
                    'girsa': {
                        '2025-07-06': { attended: true, onTime: true, ritzifus: true }
                    },
                    'girsaTest': 92
                }
            }
        };
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
            console.error('Error loading data:', error);            return null;
        }
    }

    // Authentication methods
    handleLogin() {
        console.log('handleLogin called');
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        
        if (!usernameField || !passwordField) {
            console.error('Login form fields not found');
            alert('Login form fields not found');
            return;
        }
        
        const username = usernameField.value.trim();
        const password = passwordField.value;        console.log('Login attempt:', username);
        console.log('Available students:', Object.keys(this.students));
        console.log('Available admins:', Object.keys(this.admins));

        if (!username || !password) {
            this.showError('Please enter both username and password.');
            return;
        }

        this.clearErrors();
        
        // Check admin credentials first
        console.log('Checking admin credentials...');
        if (this.admins[username] && this.admins[username].password === password) {
            console.log('Admin login successful');
            this.loggedInUser = username;
            this.isAdmin = true;
            this.showMainApp();
            this.showNotification('Welcome Back!', `Admin ${this.admins[username].name} logged in successfully`, 'success');
            return;
        }
        
        // Check student credentials
        console.log('Checking student credentials...');
        console.log('Student exists:', !!this.students[username]);
        if (this.students[username]) {
            console.log('Student password match:', this.students[username].password === password);
            console.log('Expected password:', this.students[username].password);
            console.log('Provided password:', password);
        }
        
        if (this.students[username] && this.students[username].password === password) {
            console.log('Student login successful');
            this.loggedInUser = username;
            this.isAdmin = false;
            this.showMainApp();
            this.showNotification('Welcome Back!', `${this.students[username].name} logged in successfully`, 'success');
            return;
        }

        this.showError('Invalid username or password.');
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;

        if (!name || !username || !password || !confirmPassword) {
            this.showError('All fields are required.', true);
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match.', true);
            return;
        }

        if (this.students[username] || this.admins[username]) {
            this.showError('Username already exists.', true);
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.', true);
            return;
        }

        // Create new student account
        this.students[username] = {
            name: name,
            username: username,
            password: password
        };

        this.saveData('students', this.students);
        this.showLogin();
        this.clearLoginForm();
        alert('Account created successfully! Please log in.');
    }

    logout() {
        this.loggedInUser = null;
        this.isAdmin = false;
        this.activeTab = 'login';
        this.clearLoginForm();
        this.showLoginPage();
    }

    clearLoginForm() {        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-username').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm').value = '';
        this.clearErrors();
    }    // UI State Management
    showLoginPage() {
        const authContainer = document.querySelector('.auth-container');
        const mainApp = document.getElementById('main-app');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
    }    showMainApp() {
        const authContainer = document.querySelector('.auth-container');
        const mainApp = document.getElementById('main-app');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Set active tab based on user type
        if (this.isAdmin) {
            this.activeTab = 'admin-dashboard';
            // Trigger the dashboard tab for admins
            setTimeout(() => {
                const adminDashboardTab = document.querySelector('.tab-btn[data-tab="admin-dashboard"]');
                if (adminDashboardTab) {
                    adminDashboardTab.click();
                } else {
                    // Fallback: try to show admin dashboard content directly
                    this.showAdminDashboard();
                }
            }, 100);
        } else {
            this.activeTab = 'dashboard';
            // Trigger the dashboard tab for students
            setTimeout(() => {
                const dashboardTab = document.querySelector('.tab-btn[data-tab="dashboard"]');
                if (dashboardTab) {
                    dashboardTab.click();
                }
            }, 100);
        }
    }

    showAdminDashboard() {
        // Helper method to ensure admin dashboard is shown
        const adminDashboardContainer = document.getElementById('admin-dashboard-container');
        if (adminDashboardContainer && window.mivtzahApp && window.mivtzahApp.admin) {
            window.mivtzahApp.admin.loadAdminDashboard();
        }
    }showSignup() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        this.clearErrors();
    }

    showLogin() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        this.clearErrors();
    }    clearErrors() {
        const errorElement = document.getElementById('error-message');
        const signupErrorElement = document.getElementById('signup-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
        if (signupErrorElement) {
            signupErrorElement.textContent = '';
            signupErrorElement.classList.add('hidden');
        }
    }

    showError(message, isSignup = false) {
        const errorElement = document.getElementById(isSignup ? 'signup-error' : 'error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    // Utility methods
    getWeekDates(week) {
        const weekData = this.parshiyos[week];
        const start = new Date(weekData.startDate);
        const end = new Date(weekData.endDate);
        const dates = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 6) { // Exclude Saturday (Shabbos)
                dates.push(d.toISOString().split('T')[0]);
            }
        }

        return dates;
    }    // Points calculation methods
    calculateTotalPoints(username) {
        const student = this.students[username];
        if (!student) return 0;

        let totalPoints = 0;

        // Calculate points from all weeks and sedarim
        Object.keys(this.parshiyos).forEach(week => {
            totalPoints += this.calculateStudentWeekPoints(username, week);
        });

        // Add manual adjustments from the submissions structure
        if (this.submissions[username] && this.submissions[username].manual_adjustments) {
            Object.values(this.submissions[username].manual_adjustments).forEach(adjustment => {
                totalPoints += adjustment.points || 0;
            });
        }

        // Legacy: Add manual adjustments from student record (for backward compatibility)
        if (student.manualAdjustments) {
            student.manualAdjustments.forEach(adjustment => {
                const adjustmentPoints = adjustment.newTotal - adjustment.previousTotal;
                // Only add if this adjustment isn't already in submissions
                if (!this.submissions[username]?.manual_adjustments?.[`adj_${adjustment.date}`]) {
                    totalPoints += adjustmentPoints;
                }
            });
        }

        return totalPoints;
    }calculateStudentWeekPoints(username, week) {
        const studentData = this.submissions[username]?.[week] || {};
        let totalPoints = 0;

        // Chassidus Boker calculation
        const chassidusBokerData = studentData.chassidusBoker || {};
        const lateDays = Object.values(chassidusBokerData).filter(day => day?.late).length;
        if (lateDays <= 1) {
            const attendedDays = Object.values(chassidusBokerData).filter(day => day?.attended).length;
            totalPoints += attendedDays * 100;
        }

        // Girsa calculation
        const girsaData = studentData.girsa || {};
        const girsaAttendedOnTime = Object.values(girsaData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += girsaAttendedOnTime * 100;

        // Girsa test bonus
        const girsaTestScore = studentData.girsaTest || 0;
        if (girsaTestScore >= 70) {
            totalPoints += 100;
            if (girsaTestScore >= 80) {
                totalPoints += 100;
            }
        }

        // Halacha calculation
        const halachaData = studentData.halacha || {};
        const halachaAttendedOnTime = Object.values(halachaData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += halachaAttendedOnTime * 50;

        // Halacha test bonus
        const halachaTestScore = studentData.halachaTest || 0;
        if (halachaTestScore >= 70) {
            totalPoints += 50;
        }

        // Chassidus Erev calculation
        const chassidusErevData = studentData.chassidusErev || {};
        const chassidusErevComplete = Object.values(chassidusErevData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += chassidusErevComplete * 100;

        // Mivtzah Torah calculation
        const mivtzahTorahData = studentData.mivtzahTorah || {};
        const totalDafim = Object.values(mivtzahTorahData).reduce((sum, day) => 
            sum + (day?.dafim || 0), 0
        );
        totalPoints += totalDafim * 50;

        return totalPoints;
    }    getSedarimPoints(seder, data) {
        const basePoints = {
            chassidusBoker: 100,
            girsa: 100,
            halacha: 50,
            chassidusErev: 100,
            mivtzahTorah: 50
        };

        let points = basePoints[seder] || 0;

        // For chassidus boker, only get points if not late (or less than 2 late days per week)
        if (seder === 'chassidusBoker' && data.late) {
            // This will be handled at the week level
            points = 100; // Base points, late calculation happens in week calculation
        }

        // For girsa, need attended, onTime and ritzifus
        if (seder === 'girsa') {
            if (data.attended && data.onTime && data.ritzifus) {
                points = 100;
            } else {
                points = 0;
            }
        }

        // For halacha, need attended, onTime and ritzifus
        if (seder === 'halacha') {
            if (data.attended && data.onTime && data.ritzifus) {
                points = 50;
            } else {
                points = 0;
            }
        }

        // For chassidus erev, need attended, onTime and ritzifus
        if (seder === 'chassidusErev') {
            if (data.attended && data.onTime && data.ritzifus) {
                points = 100;
            } else {
                points = 0;
            }
        }

        // Add daf learned points for Mivtzah Torah
        if (seder === 'mivtzahTorah' && data.dafim) {
            points = data.dafim * 50; // 50 points per daf
        }

        return points;
    }

    calculateStudentWeekPoints(studentId, week) {
        const studentData = this.submissions[studentId]?.[week] || {};
        let totalPoints = 0;

        // Chassidus Boker calculation
        const chassidusBokerData = studentData.chassidusBoker || {};
        const lateDays = Object.values(chassidusBokerData).filter(day => day?.late).length;
        if (lateDays <= 1) {
            const attendedDays = Object.values(chassidusBokerData).filter(day => day?.attended).length;
            totalPoints += attendedDays * 100;
        }

        // Girsa calculation
        const girsaData = studentData.girsa || {};
        const girsaAttendedOnTime = Object.values(girsaData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += girsaAttendedOnTime * 100;

        // Girsa test bonus
        const girsaTestScore = studentData.girsaTest || 0;
        if (girsaTestScore >= 70) {
            totalPoints += 100;
            if (girsaTestScore >= 80) {
                totalPoints += 100;
            }
        }

        // Halacha calculation
        const halachaData = studentData.halacha || {};
        const halachaAttendedOnTime = Object.values(halachaData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += halachaAttendedOnTime * 50;

        // Halacha test bonus
        const halachaTestScore = studentData.halachaTest || 0;
        if (halachaTestScore >= 70) {
            totalPoints += 50;
        }

        // Chassidus Erev calculation
        const chassidusErevData = studentData.chassidusErev || {};
        const chassidusErevComplete = Object.values(chassidusErevData).filter(day => 
            day?.attended && day?.onTime && day?.ritzifus
        ).length;
        totalPoints += chassidusErevComplete * 100;

        // Mivtzah Torah calculation
        const mivtzahTorahData = studentData.mivtzahTorah || {};
        const totalDafim = Object.values(mivtzahTorahData).reduce((sum, day) => 
            sum + (day?.dafim || 0), 0
        );
        totalPoints += totalDafim * 50;

        return totalPoints;
    }

    calculateWeekPoints(week) {
        let totalPoints = 0;
        Object.keys(this.students).forEach(studentId => {
            totalPoints += this.calculateStudentWeekPoints(studentId, week);
        });
        return totalPoints;
    }    get totalPoints() {
        return this.calculateTotalPoints(this.loggedInUser);
    }    getStudentRanking() {
        const studentPoints = [];
        Object.keys(this.students).forEach(studentId => {
            const totalPoints = this.calculateTotalPoints(studentId);
            studentPoints.push({
                studentId,
                name: this.students[studentId].name,
                points: totalPoints
            });
        });

        studentPoints.sort((a, b) => b.points - a.points);
        return studentPoints;
    }

    // Week and threshold utility methods
    getCurrentWeek() {
        return this.currentWeek;
    }

    getEventThreshold(week) {
        return this.eventThresholds[week] || 1500;
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
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MivtzahCore };
} else {
    // Browser environment
    window.MivtzahCore = MivtzahCore;
}
