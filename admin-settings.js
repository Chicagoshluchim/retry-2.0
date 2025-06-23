// Shiur Gimmel Summer Mivtzah 2025 - Admin Settings Module
class AdminSettings {
    constructor(core) {
        this.core = core;
    }

    loadAdminSettings() {
        document.getElementById('admin-settings-container').innerHTML = `
            <div class="admin-settings">
                <div class="settings-header">
                    <h2><i data-lucide="settings"></i> System Settings</h2>
                    <p>Configure system-wide settings and preferences</p>
                </div>

                <div class="settings-sections">
                    <!-- General Settings -->
                    <div class="settings-section">
                        <h3><i data-lucide="sliders"></i> General Settings</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label for="system-name">System Name</label>
                                <input type="text" id="system-name" value="Shiur Gimmel Summer Mivtzah 2025" placeholder="System display name">
                            </div>
                            
                            <div class="setting-item">
                                <label for="current-week">Current Week</label>
                                <select id="current-week">
                                    ${this.generateWeekOptions()}
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <label for="auto-backup">Auto Backup</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="auto-backup" checked>
                                    <span class="toggle-slider"></span>
                                </div>
                                <small>Automatically backup data daily</small>
                            </div>
                        </div>
                    </div>

                    <!-- Points Configuration -->
                    <div class="settings-section">
                        <h3><i data-lucide="target"></i> Points Configuration</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label for="chassidus-boker-points">Chassidus Boker (Daily)</label>
                                <input type="number" id="chassidus-boker-points" value="100" min="0" max="500">
                            </div>
                            
                            <div class="setting-item">
                                <label for="girsa-points">Girsa (Daily)</label>
                                <input type="number" id="girsa-points" value="100" min="0" max="500">
                            </div>
                            
                            <div class="setting-item">
                                <label for="halacha-points">Halacha (Daily)</label>
                                <input type="number" id="halacha-points" value="50" min="0" max="500">
                            </div>
                            
                            <div class="setting-item">
                                <label for="chassidus-erev-points">Chassidus Erev (Daily)</label>
                                <input type="number" id="chassidus-erev-points" value="100" min="0" max="500">
                            </div>
                            
                            <div class="setting-item">
                                <label for="mivtzah-torah-points">Mivtzah Torah (Per Daf)</label>
                                <input type="number" id="mivtzah-torah-points" value="50" min="0" max="100">
                            </div>
                            
                            <div class="setting-item">
                                <label for="test-bonus-threshold">Test Score Bonus Threshold</label>
                                <input type="number" id="test-bonus-threshold" value="70" min="0" max="100">
                                <small>Minimum test score for bonus points</small>
                            </div>
                        </div>
                    </div>

                    <!-- Auction Settings -->
                    <div class="settings-section">
                        <h3><i data-lucide="trophy"></i> Chinese Auction Settings</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label for="ticket-cost">Ticket Cost (Points)</label>
                                <input type="number" id="ticket-cost" value="100" min="10" max="1000">
                            </div>
                            
                            <div class="setting-item">
                                <label for="auction-enabled">Auction Enabled</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="auction-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <label for="max-tickets-per-student">Max Tickets Per Student</label>
                                <input type="number" id="max-tickets-per-student" value="50" min="1" max="200">
                            </div>
                        </div>
                    </div>

                    <!-- Data Management -->
                    <div class="settings-section">
                        <h3><i data-lucide="database"></i> Data Management</h3>
                        <div class="settings-actions">
                            <button class="btn btn-primary" id="backup-data-btn">
                                <i data-lucide="download"></i> Backup All Data
                            </button>
                            
                            <button class="btn btn-outline" id="import-data-btn">
                                <i data-lucide="upload"></i> Import Data
                            </button>
                            
                            <button class="btn btn-warning" id="reset-weekly-data-btn">
                                <i data-lucide="refresh-cw"></i> Reset Current Week
                            </button>
                            
                            <button class="btn btn-danger" id="clear-all-data-btn">
                                <i data-lucide="trash-2"></i> Clear All Data
                            </button>
                        </div>
                    </div>

                    <!-- Notification Settings -->
                    <div class="settings-section">
                        <h3><i data-lucide="bell"></i> Notifications</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label for="email-notifications">Email Notifications</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="email-notifications">
                                    <span class="toggle-slider"></span>
                                </div>
                                <small>Send email updates to administrators</small>
                            </div>
                            
                            <div class="setting-item">
                                <label for="admin-email">Admin Email</label>
                                <input type="email" id="admin-email" placeholder="admin@yeshiva.edu">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Save Settings Button -->
                <div class="settings-footer">
                    <button class="btn btn-success btn-lg" id="save-settings-btn">
                        <i data-lucide="save"></i> Save All Settings
                    </button>
                    <button class="btn btn-outline" id="reset-settings-btn">
                        <i data-lucide="rotate-ccw"></i> Reset to Defaults
                    </button>
                </div>
            </div>
        `;

        this.setupSettingsListeners();
        this.loadCurrentSettings();
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    generateWeekOptions() {
        const weeks = Object.keys(this.core.parshiyos);
        const currentWeek = this.core.getCurrentWeek();
        
        return weeks.map(week => 
            `<option value="${week}" ${week === currentWeek ? 'selected' : ''}>${week}</option>`
        ).join('');
    }

    setupSettingsListeners() {
        // Save settings
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Reset settings
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Data management actions
        const backupBtn = document.getElementById('backup-data-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.backupAllData());
        }

        const importBtn = document.getElementById('import-data-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        const resetWeekBtn = document.getElementById('reset-weekly-data-btn');
        if (resetWeekBtn) {
            resetWeekBtn.addEventListener('click', () => this.resetWeeklyData());
        }

        const clearAllBtn = document.getElementById('clear-all-data-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    loadCurrentSettings() {
        const settings = this.core.loadData('systemSettings') || {};
        
        // Load general settings
        if (settings.systemName) {
            document.getElementById('system-name').value = settings.systemName;
        }
        
        if (settings.autoBackup !== undefined) {
            document.getElementById('auto-backup').checked = settings.autoBackup;
        }

        // Load points configuration
        if (settings.pointsConfig) {
            const config = settings.pointsConfig;
            if (config.chassidusBoker) document.getElementById('chassidus-boker-points').value = config.chassidusBoker;
            if (config.girsa) document.getElementById('girsa-points').value = config.girsa;
            if (config.halacha) document.getElementById('halacha-points').value = config.halacha;
            if (config.chassidusErev) document.getElementById('chassidus-erev-points').value = config.chassidusErev;
            if (config.mivtzahTorah) document.getElementById('mivtzah-torah-points').value = config.mivtzahTorah;
            if (config.testBonusThreshold) document.getElementById('test-bonus-threshold').value = config.testBonusThreshold;
        }

        // Load auction settings
        if (settings.auctionConfig) {
            const config = settings.auctionConfig;
            if (config.ticketCost) document.getElementById('ticket-cost').value = config.ticketCost;
            if (config.enabled !== undefined) document.getElementById('auction-enabled').checked = config.enabled;
            if (config.maxTicketsPerStudent) document.getElementById('max-tickets-per-student').value = config.maxTicketsPerStudent;
        }

        // Load notification settings
        if (settings.notifications) {
            const config = settings.notifications;
            if (config.emailEnabled !== undefined) document.getElementById('email-notifications').checked = config.emailEnabled;
            if (config.adminEmail) document.getElementById('admin-email').value = config.adminEmail;
        }
    }

    saveSettings() {
        this.core.showLoading('Saving settings...');

        const settings = {
            systemName: document.getElementById('system-name').value,
            currentWeek: document.getElementById('current-week').value,
            autoBackup: document.getElementById('auto-backup').checked,
            pointsConfig: {
                chassidusBoker: parseInt(document.getElementById('chassidus-boker-points').value),
                girsa: parseInt(document.getElementById('girsa-points').value),
                halacha: parseInt(document.getElementById('halacha-points').value),
                chassidusErev: parseInt(document.getElementById('chassidus-erev-points').value),
                mivtzahTorah: parseInt(document.getElementById('mivtzah-torah-points').value),
                testBonusThreshold: parseInt(document.getElementById('test-bonus-threshold').value)
            },
            auctionConfig: {
                ticketCost: parseInt(document.getElementById('ticket-cost').value),
                enabled: document.getElementById('auction-enabled').checked,
                maxTicketsPerStudent: parseInt(document.getElementById('max-tickets-per-student').value)
            },
            notifications: {
                emailEnabled: document.getElementById('email-notifications').checked,
                adminEmail: document.getElementById('admin-email').value
            },
            lastUpdated: new Date().toISOString()
        };

        this.core.saveData('systemSettings', settings);

        setTimeout(() => {
            this.core.hideLoading();
            this.core.showNotification('Settings Saved', 'All settings have been saved successfully', 'success');
        }, 1000);
    }

    resetSettings() {
        const confirmed = confirm('Are you sure you want to reset all settings to default values? This will not affect student data.');
        if (!confirmed) return;

        this.core.removeData('systemSettings');
        this.loadCurrentSettings();
        this.core.showNotification('Settings Reset', 'All settings have been reset to defaults', 'info');
    }

    backupAllData() {
        this.core.showLoading('Creating backup...');

        const backup = {
            students: this.core.students,
            submissions: this.core.submissions,
            chineseAuction: this.core.chineseAuction,
            systemSettings: this.core.loadData('systemSettings') || {},
            parshiyos: this.core.parshiyos,
            exportDate: new Date().toISOString(),
            version: '2025.1'
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `shiur-gimmel-backup-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setTimeout(() => {
            this.core.hideLoading();
            this.core.showNotification('Backup Complete', 'System backup has been downloaded', 'success');
        }, 1000);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    const confirmed = confirm('Are you sure you want to import this data? This will overwrite all current data.');
                    if (!confirmed) return;

                    this.core.showLoading('Importing data...');

                    // Import each data type
                    if (backup.students) {
                        this.core.students = backup.students;
                        this.core.saveData('students', backup.students);
                    }
                    
                    if (backup.submissions) {
                        this.core.submissions = backup.submissions;
                        this.core.saveData('submissions', backup.submissions);
                    }
                    
                    if (backup.chineseAuction) {
                        this.core.chineseAuction = backup.chineseAuction;
                        this.core.saveData('chineseAuction', backup.chineseAuction);
                    }
                    
                    if (backup.systemSettings) {
                        this.core.saveData('systemSettings', backup.systemSettings);
                    }

                    setTimeout(() => {
                        this.core.hideLoading();
                        this.core.showNotification('Import Complete', 'Data has been imported successfully', 'success');
                        location.reload(); // Refresh to load new data
                    }, 1500);

                } catch (error) {
                    this.core.showNotification('Import Failed', 'Invalid backup file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetWeeklyData() {
        const currentWeek = this.core.getCurrentWeek();
        const confirmed = confirm(`Are you sure you want to reset all data for ${currentWeek}? This will remove all submissions and progress for the current week.`);
        if (!confirmed) return;

        this.core.showLoading('Resetting weekly data...');

        // Remove all submissions for current week
        Object.keys(this.core.submissions).forEach(key => {
            if (key.includes(`_${currentWeek}_`)) {
                delete this.core.submissions[key];
            }
        });

        this.core.saveData('submissions', this.core.submissions);

        setTimeout(() => {
            this.core.hideLoading();
            this.core.showNotification('Week Reset', `All data for ${currentWeek} has been reset`, 'success');
        }, 1000);
    }

    clearAllData() {
        const confirmed = confirm('⚠️ DANGER ⚠️\n\nThis will permanently delete ALL system data including:\n- All students\n- All submissions\n- All auction data\n- All settings\n\nThis action CANNOT be undone.\n\nType "DELETE ALL" to confirm:');
        
        if (confirmed !== 'DELETE ALL') {
            this.core.showNotification('Action Cancelled', 'Data clearing cancelled', 'info');
            return;
        }

        this.core.showLoading('Clearing all data...');

        // Clear all localStorage data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mivtzah_')) {
                localStorage.removeItem(key);
            }
        });

        setTimeout(() => {
            this.core.hideLoading();
            this.core.showNotification('All Data Cleared', 'System has been reset', 'info');
            location.reload(); // Refresh to reset application
        }, 2000);
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminSettings };
} else {
    // Browser environment
    window.AdminSettings = AdminSettings;
}
