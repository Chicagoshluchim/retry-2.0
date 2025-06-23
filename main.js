// Shiur Gimmel Summer Mivtzah 2025 - Main Application Coordinator
class MivtzahPlatform {    constructor() {
        console.log('MivtzahPlatform constructor starting...');
        
        try {
            // Initialize core
            console.log('Initializing core...');
            this.core = new MivtzahCore();
            console.log('Core initialized successfully');
            
            // Initialize messaging
            console.log('Initializing messaging...');
            this.messaging = new MivtzahMessaging(this.core);
            console.log('Messaging initialized successfully');
            
            // Initialize student and admin modules
            console.log('Initializing student module...');
            this.student = new MivtzahStudent(this.core, this.messaging);
            console.log('Student module initialized successfully');
            
            console.log('Initializing admin module...');
            this.admin = new MivtzahAdmin(this.core, this.messaging);
            console.log('Admin module initialized successfully');
            
            // Bind methods for global access
            this.init = this.init.bind(this);
            this.setActiveTab = this.setActiveTab.bind(this);
            
            console.log('Starting platform init...');
            // Initialize the application
            this.init();
            
            // Override core's showMainApp to include navigation setup
            const originalShowMainApp = this.core.showMainApp.bind(this.core);
            this.core.showMainApp = () => {
                originalShowMainApp();
                this.setupNavigation();
                this.setActiveTab('dashboard');
            };
            
            console.log('MivtzahPlatform constructor completed successfully');
        } catch (error) {
            console.error('Error in MivtzahPlatform constructor:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    // Delegate properties to core
    get loggedInUser() { return this.core.loggedInUser; }
    set loggedInUser(value) { this.core.loggedInUser = value; }
    
    get isAdmin() { return this.core.isAdmin; }
    set isAdmin(value) { this.core.isAdmin = value; }
    
    get activeTab() { return this.core.activeTab; }
    set activeTab(value) { this.core.activeTab = value; }

    get currentWeek() { return this.core.currentWeek; }
    get totalPoints() { return this.core.totalPoints; }    init() {
        console.log('MivtzahPlatform.init() called');
        
        try {
            // Make platform globally accessible for notifications and callbacks
            window.platform = this;
            window.core = this.core;
            window.messaging = this.messaging;
            window.student = this.student;
            window.admin = this.admin;

            // Use DOMContentLoaded or immediate execution if DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeAfterDOM();
                });
            } else {
                this.initializeAfterDOM();
            }
            
            console.log('MivtzahPlatform.init() completed successfully');
        } catch (error) {
            console.error('Error in MivtzahPlatform.init():', error);
            throw error;
        }
    }    initializeAfterDOM() {
        console.log('Initializing after DOM is ready');
        
        try {
            // Show login page
            console.log('Showing login page...');
            this.core.showLoginPage();
            console.log('Login page shown');
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                console.log('Initializing Lucide icons...');
                lucide.createIcons();
                console.log('Lucide icons initialized');
            }
            
            // Set up login/signup buttons after a small delay to ensure DOM is ready
            setTimeout(() => {
                console.log('Setting up login buttons...');
                this.setupLoginButtons();
            }, 50);
            
            console.log('DOM initialization completed');
        } catch (error) {
            console.error('Error in initializeAfterDOM:', error);
            console.error('Stack trace:', error.stack);
            
            // Try to set up buttons anyway
            setTimeout(() => {
                console.log('Attempting emergency button setup...');
                this.setupLoginButtons();
            }, 100);
        }
    }setupLoginButtons() {
        console.log('Setting up login buttons...');
        
        // Get all required elements
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const showSignupBtn = document.getElementById('show-signup');
        const showLoginBtn = document.getElementById('show-login');
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        
        console.log('Button elements found:');
        console.log('- Login button:', !!loginBtn);
        console.log('- Signup button:', !!signupBtn);
        console.log('- Show signup button:', !!showSignupBtn);
        console.log('- Show login button:', !!showLoginBtn);
        
        // Set up main login button
        if (loginBtn) {
            // Clear any existing handlers
            loginBtn.onclick = null;
            loginBtn.replaceWith(loginBtn.cloneNode(true));
            const newLoginBtn = document.getElementById('login-btn');
            
            newLoginBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Login button clicked!');
                this.core.handleLogin();
            };
            
            console.log('Login button handler attached');
        } else {
            console.error('Login button not found!');
        }
        
        // Set up signup button
        if (signupBtn) {
            // Clear any existing handlers
            signupBtn.onclick = null;
            signupBtn.replaceWith(signupBtn.cloneNode(true));
            const newSignupBtn = document.getElementById('signup-btn');
            
            newSignupBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Signup button clicked!');
                this.core.handleSignup();
            };
            
            console.log('Signup button handler attached');
        } else {
            console.error('Signup button not found!');
        }
        
        // Set up form toggle buttons
        if (showSignupBtn) {
            showSignupBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Show signup clicked');
                this.core.showSignup();
            };
        }
        
        if (showLoginBtn) {
            showLoginBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Show login clicked');
                this.core.showLogin();
            };
        }
        
        // Set up enter key handlers
        if (usernameField) {
            usernameField.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.core.handleLogin();
                }
            };
        }
        
        if (passwordField) {
            passwordField.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();                    this.core.handleLogin();
                }
            };
        }
        
        console.log('All login handlers set up successfully');
    }

    setupDashboardButtons() {
        console.log('Setting up dashboard event listeners...');
        
        // Dashboard action buttons
        const navToSubmit = document.getElementById('nav-to-submit');
        const navToTests = document.getElementById('nav-to-tests');
        const navToAuction = document.getElementById('nav-to-auction');
        const contactAdminBtn = document.getElementById('contact-admin-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (navToSubmit) {
            navToSubmit.addEventListener('click', () => this.setActiveTab('submit'));
        }
        if (navToTests) {
            navToTests.addEventListener('click', () => this.setActiveTab('weekly'));
        }
        if (navToAuction) {
            navToAuction.addEventListener('click', () => this.setActiveTab('auction'));
        }
        if (contactAdminBtn) {
            contactAdminBtn.addEventListener('click', () => this.setActiveTab('messages'));
        }
    }

    setupNavigation() {
        // Generate navigation tabs based on user type
        const navTabs = document.getElementById('nav-tabs');
        if (!navTabs) return; // Safety check

        const tabs = this.core.isAdmin ? [
            { id: 'admin-dashboard', label: 'Dashboard', icon: 'trophy' },
            { id: 'admin-students', label: 'Manage Users', icon: 'users' },
            { id: 'admin-messages', label: 'Messages', icon: 'mail' },
            { id: 'admin-auction', label: 'Auction', icon: 'gift' },
            { id: 'admin-settings', label: 'Settings', icon: 'settings' },
            { id: 'admin-reports', label: 'Reports', icon: 'book-open' }
        ]: [
            { id: 'dashboard', label: 'Dashboard', icon: 'trophy' },
            { id: 'submit', label: 'Daily Progress', icon: 'check-circle' },
            { id: 'weekly', label: 'Weekly Tests', icon: 'book-open' },
            { id: 'messages', label: 'Messages', icon: 'message-circle', badge: 'messages-badge' },
            { id: 'auction', label: 'Chinese Auction', icon: 'gift' },
            { id: 'profile', label: 'Profile', icon: 'settings' }
        ];
        
        navTabs.innerHTML = tabs.map(tab => `
            <button class="tab-btn nav-item ${tab.id === this.core.activeTab ? 'active' : ''}"
                     data-tab="${tab.id}">
                <i data-lucide="${tab.icon}"></i>
                <span>${tab.label}</span>
                ${tab.badge ? `<span id="${tab.badge}" class="nav-badge hidden"></span>` : ''}
            </button>
        `).join('');

        // Add click listeners to tab buttons
        const navItems = navTabs.querySelectorAll('.nav-item');
        navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                const tabId = navItem.dataset.tab;
                this.setActiveTab(tabId);
            });
        });

        // Initialize Lucide icons for navigation
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();        }
    }

    setActiveTab(tabId) {
        this.core.activeTab = tabId;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }        // Update content
        this.loadTabContent(tabId);

        // Show appropriate content container
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const newContent = document.getElementById(`${tabId}-content`);
        if (newContent) {
            newContent.classList.remove('hidden');
        }
    }loadTabContent(tabId) {
        switch (tabId) {
            case 'dashboard':
                this.student.loadDashboard();
                break;
            case 'submit':
                this.student.loadDailyProgressForm();
                break;
            case 'weekly':
                this.student.loadWeeklyTestsForm();
                break;
            case 'profile':
                this.student.loadProfile();
                break;
            case 'messages':
                this.student.loadMessages();
                break;
            case 'auction':
                this.student.loadChineseAuction();
                break;            case 'admin-dashboard':
                this.admin.loadAdminDashboard();
                break;
            case 'admin-students':
                this.admin.loadAdminStudents();
                break;
            case 'admin-messages':
                this.admin.loadAdminMessages();
                break;
            case 'admin-auction':
                this.admin.loadAdminAuction();
                break;
            case 'admin-settings':
                this.admin.loadAdminSettings();
                break;
            case 'admin-reports':
                this.admin.loadAdminReports();
                break;
        }
    }

    refreshCurrentTab() {
        this.loadTabContent(this.core.activeTab);
    }

    // Delegate common methods to appropriate modules
    showLoginPage() { return this.core.showLoginPage(); }
    showMainApp() { 
        this.core.showMainApp();
        this.setupNavigation();
        this.setActiveTab('dashboard');
    }
    
    // Delegation methods for backward compatibility
    updateCurrentWeekDisplay() { return this.core.updateCurrentWeekDisplay(); }
    getWeekDates(week) { return this.core.getWeekDates(week); }
    calculateStudentWeekPoints(studentId, week) { return this.core.calculateStudentWeekPoints(studentId, week); }
    getStudentRanking() { return this.core.getStudentRanking(); }
    
    // UI utilities
    showLoading(message) { return this.core.showLoading(message); }
    hideLoading() { return this.core.hideLoading(); }
    showNotification(title, message, type, duration) { 
        return this.core.showNotification(title, message, type, duration); 
    }
    removeNotification(id) { return this.core.removeNotification(id); }

    // Messaging delegation
    deleteThread(threadId) { return this.messaging.deleteThread(threadId); }
    restoreThread(threadId) { return this.messaging.restoreThread(threadId); }
    
    // Admin delegation  
    resolveRequest(requestId) { return this.admin.resolveRequest(requestId); }
    deleteAdminThread(threadId) { return this.admin.deleteAdminThread(threadId); }
    restoreAdminThread(threadId) { return this.admin.restoreAdminThread(threadId); }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mivtzahApp = new MivtzahPlatform();
});
