// Shiur Gimmel Summer Mivtzah 2025 - Student Module
class MivtzahStudent {
    constructor(core, messaging) {
        this.core = core;
        this.messaging = messaging;
        this.isComposing = false;
        this.isSubmittingContact = false;
    }

    get currentWeekPoints() {
        return this.core.calculateStudentWeekPoints(this.core.loggedInUser, this.core.currentWeek);
    }    // Dashboard functionality
    loadDashboard() {
        // The dashboard content section already exists in HTML, just update the data
        this.updateDashboardStats();
        this.updateWeeklyProgress();
        this.updateLeaderboard();
        
        // Set up dashboard button event listeners
        this.setupDashboardButtons();
    }updateDashboardStats() {
        const totalPointsEl = document.getElementById('total-points');
        const weekPointsEl = document.getElementById('week-points');
        const eventGoalEl = document.getElementById('event-goal');
        
        if (totalPointsEl) totalPointsEl.textContent = this.core.totalPoints;
        if (weekPointsEl) weekPointsEl.textContent = this.currentWeekPoints;
        if (eventGoalEl) eventGoalEl.textContent = this.core.eventThresholds[this.core.currentWeek];

        // Update event goal card color
        const eventGoalCard = document.getElementById('event-goal-card');
        if (eventGoalCard) {
            const hasReachedGoal = this.currentWeekPoints >= this.core.eventThresholds[this.core.currentWeek];
            eventGoalCard.className = `stat-card ${hasReachedGoal ? 'success' : 'red'}`;
        }
    }    updateWeeklyProgress() {
        const progressContainer = document.getElementById('weekly-progress');
        if (!progressContainer) return;
        
        const sedarim = ['chassidusBoker', 'girsa', 'halacha', 'chassidusErev'];

        progressContainer.innerHTML = sedarim.map(seder => {
            const weekDates = this.core.getWeekDates(this.core.currentWeek);
            const totalDays = weekDates.filter(date =>
                this.core.weeklySchedule[this.core.currentWeek]?.[date]?.[seder]).length;

            const submissions_for_seder = this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.[seder] || {};
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
    }    updateLeaderboard() {
        const rankings = this.core.getStudentRanking();
        const leaderboardContainer = document.getElementById('leaderboard');
        if (!leaderboardContainer) return;

        leaderboardContainer.innerHTML = rankings.map((student, index) => {
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
            return `
                <div class="leaderboard-item ${rankClass}">
                    <div class="leaderboard-left">
                        <div class="rank-badge ${rankClass}">${index + 1}</div>
                        <span class="leaderboard-name">${student.name}</span>
                    </div>
                    <span class="leaderboard-points">${student.points}</span>
                </div>
            `;
        }).join('');        // Update user rank display
        const userRankContainer = document.getElementById('user-rank');
        if (!userRankContainer) return;
        
        const currentRank = rankings.findIndex(student => student.studentId === this.core.loggedInUser) + 1;
        
        if (!this.core.isAdmin && currentRank > 0) {
            userRankContainer.innerHTML = `
                <p class="user-rank-text">
                    Your Rank: #${currentRank} out of ${rankings.length} students
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
        const weekDates = this.core.getWeekDates(this.core.currentWeek);

        // Get available dates (no submissions yet)
        const availableDates = weekDates.filter(date => {
            const hasSubmission = this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.chassidusBoker?.[date] ||
                this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.girsa?.[date] ||
                this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.halacha?.[date] ||
                this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.chassidusErev?.[date] ||
                this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek]?.mivtzahTorah?.[date];
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
            .filter(seder => this.core.weeklySchedule[this.core.currentWeek]?.[selectedDate]?.[seder.key])
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
            this.core.showNotification('Missing Date', 'Please select a date for your submission.', 'warning');
            return;
        }

        // Show loading overlay
        this.core.showLoading('Saving your progress...');

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
            if (!this.core.submissions[this.core.loggedInUser]) {
                this.core.submissions[this.core.loggedInUser] = {};
            }
            if (!this.core.submissions[this.core.loggedInUser][this.core.currentWeek]) {
                this.core.submissions[this.core.loggedInUser][this.core.currentWeek] = {};
            }

            sedarim.forEach(seder => {
                if (!this.core.submissions[this.core.loggedInUser][this.core.currentWeek][seder]) {
                    this.core.submissions[this.core.loggedInUser][this.core.currentWeek][seder] = {};
                }
                this.core.submissions[this.core.loggedInUser][this.core.currentWeek][seder][selectedDate] = dailyData[seder];
            });

            if (!this.core.submissions[this.core.loggedInUser][this.core.currentWeek].mivtzahTorah) {
                this.core.submissions[this.core.loggedInUser][this.core.currentWeek].mivtzahTorah = {};
            }
            this.core.submissions[this.core.loggedInUser][this.core.currentWeek].mivtzahTorah[selectedDate] = dailyData.mivtzahTorah;

            this.core.saveData('submissions', this.core.submissions);

            // Hide loading and show success notification
            this.core.hideLoading();
            this.core.showNotification(
                'Progress Saved!',
                'Your daily progress has been submitted successfully.',
                'success'
            );

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.platform.setActiveTab('dashboard');
            }, 1500);
        }, 800);
    }

    // Weekly Tests Form
    loadWeeklyTestsForm() {
        const container = document.getElementById('weekly-tests-container');
        const existingData = this.core.submissions[this.core.loggedInUser]?.[this.core.currentWeek];
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
                <h4>Parshas ${this.core.parshiyos[this.core.currentWeek].name} Test Scores</h4>
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
            this.core.showNotification('Missing Scores', 'Please enter at least one test score.', 'warning');
            return;
        }

        // Show loading overlay
        this.core.showLoading('Saving test scores...');

        // Simulate processing time
        setTimeout(() => {
            if (!this.core.submissions[this.core.loggedInUser]) {
                this.core.submissions[this.core.loggedInUser] = {};
            }
            if (!this.core.submissions[this.core.loggedInUser][this.core.currentWeek]) {
                this.core.submissions[this.core.loggedInUser][this.core.currentWeek] = {};
            }

            this.core.submissions[this.core.loggedInUser][this.core.currentWeek].girsaTest = parseInt(girsaScore) || 0;
            this.core.submissions[this.core.loggedInUser][this.core.currentWeek].halachaTest = parseInt(halachaScore) || 0;

            this.core.saveData('submissions', this.core.submissions);

            // Hide loading and show success notification
            this.core.hideLoading();
            this.core.showNotification(
                'Test Scores Saved!',
                'Your test scores have been submitted successfully.',
                'success'
            );

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.platform.setActiveTab('dashboard');
            }, 1500);
        }, 800);
    }

    // Profile Management
    loadProfile() {
        const container = document.getElementById('profile-container');
        container.innerHTML = `
            <div class="profile-tabs">
                <div class="profile-tab-nav">
                    <button class="profile-tab-btn active" data-tab="info">Profile Info</button>
                    <button class="profile-tab-btn" data-tab="progress">Detailed Progress</button>
                    <button class="profile-tab-btn" data-tab="contact">Contact Admin</button>
                </div>
                <div class="profile-tab-content">
                    <div id="profile-info-content">${this.generateProfileInfo()}</div>
                    <div id="profile-progress-content" class="hidden">${this.generateDetailedProgress()}</div>
                    <div id="profile-contact-content" class="hidden">${this.generateContactForm()}</div>
                </div>
            </div>
        `;
        this.setupProfileTabs();
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
                        <p style="color: #111827;">${this.core.students[this.core.loggedInUser]?.name} (Admin only can change)</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-weight: 500; color: #374151; font-size: 0.875rem;">Username</label>
                        <p style="color: #111827;">${this.core.loggedInUser}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-weight: 500; color: #374151; font-size: 0.875rem;">Total Points</label>
                        <p style="color: #2563eb; font-size: 1.25rem; font-weight: bold;">${this.core.totalPoints}</p>
                    </div>
                </div>

                <div id="profile-edit" class="hidden">
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" id="edit-username" value="${this.core.loggedInUser}">
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

    generateDetailedProgress() {
        try {
            return `
                <div class="progress-details">
                    <h4>Detailed Progress by Week</h4>
                    <p style="color: #6b7280; margin-bottom: 1.5rem;">Coming soon! This will show your detailed progress for each week.</p>
                    <div class="empty-state">
                        <p class="empty-state-text">Detailed progress view is being developed.</p>
                        <p class="empty-state-subtext">Check back later for comprehensive week-by-week breakdowns.</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error in generateDetailedProgress:', error);
            return `<div style="color: red; padding: 20px;">Error generating detailed progress: ${error.message}</div>`;
        }
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

    setupProfileTabs() {
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

    setupProfileEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEditProfile());
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelProfileEdit());
        }

        // Save profile button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfileChanges());
        }

        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendContactMessage());
        }
    }

    handleEditProfile() {
        document.getElementById('profile-view').classList.add('hidden');
        document.getElementById('profile-edit').classList.remove('hidden');
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    }

    cancelProfileEdit() {
        document.getElementById('profile-edit').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        const editBtn = document.getElementById('edit-profile-btn') || document.getElementById('cancel-edit-btn');
        if (editBtn) {
            editBtn.style.display = 'inline-flex';
        }
        // Reset form values
        document.getElementById('edit-username').value = this.core.loggedInUser;
        document.getElementById('edit-password').value = '';
    }

    saveProfileChanges() {
        const newUsername = document.getElementById('edit-username').value.trim();
        const newPassword = document.getElementById('edit-password').value;

        if (!newUsername) {
            this.core.showNotification('Invalid Username', 'Username cannot be empty.', 'warning');
            return;
        }

        // Check if username already exists (and it's not the current user)
        if (newUsername !== this.core.loggedInUser && (this.core.students[newUsername] || this.core.admins[newUsername])) {
            this.core.showNotification('Username Taken', 'This username is already in use.', 'error');
            return;
        }

        // Update student data
        const studentData = { ...this.core.students[this.core.loggedInUser] };

        // If username changed, create new entry and delete old one
        if (newUsername !== this.core.loggedInUser) {
            studentData.username = newUsername;
            this.core.students[newUsername] = studentData;
            delete this.core.students[this.core.loggedInUser];

            // Update submissions data
            if (this.core.submissions[this.core.loggedInUser]) {
                this.core.submissions[newUsername] = this.core.submissions[this.core.loggedInUser];
                delete this.core.submissions[this.core.loggedInUser];
            }

            // Update Chinese auction data
            if (this.core.chineseAuction.tickets[this.core.loggedInUser]) {
                this.core.chineseAuction.tickets[newUsername] = this.core.chineseAuction.tickets[this.core.loggedInUser];
                delete this.core.chineseAuction.tickets[this.core.loggedInUser];
            }

            this.core.loggedInUser = newUsername;
        }

        // Update password if provided
        if (newPassword) {
            if (newPassword.length < 6) {
                this.core.showNotification('Invalid Password', 'Password must be at least 6 characters.', 'warning');
                return;
            }
            this.core.students[this.core.loggedInUser].password = newPassword;
        }

        // Save all data
        this.core.saveData('students', this.core.students);
        this.core.saveData('submissions', this.core.submissions);
        this.core.saveData('chineseAuction', this.core.chineseAuction);

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

    sendContactMessage() {
        console.log('sendContactMessage called');

        const subjectElement = document.getElementById('contact-subject');
        const messageElement = document.getElementById('contact-message');

        if (!subjectElement || !messageElement) {
            this.core.showNotification('Error', 'Contact form elements not found. Please try again.', 'error');
            return;
        }

        const subject = subjectElement.value.trim();
        const message = messageElement.value.trim();

        if (!subject || !message) {
            this.core.showNotification('Missing Information', 'Please fill in both subject and message', 'warning');
            return;
        }

        // Show loading overlay
        this.core.showLoading('Sending message...');

        // Simulate processing time (remove in production)
        setTimeout(() => {
            // Success - create the request
            const newRequest = {
                id: Date.now(),
                studentId: this.core.loggedInUser,
                studentName: this.core.students[this.core.loggedInUser]?.name,
                studentUsername: this.core.loggedInUser,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString(),
                resolved: false
            };

            this.core.adminRequests.push(newRequest);
            this.core.saveData('adminRequests', this.core.adminRequests);

            // Clear form
            subjectElement.value = '';
            messageElement.value = '';

            // Hide loading and show success notification
            this.core.hideLoading();
            this.core.showNotification(
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
        const userTickets = this.core.chineseAuction.tickets[this.core.loggedInUser] || {};
        const totalTicketsCost = Object.values(userTickets).reduce((sum, qty) => sum + (qty * 10), 0);
        const availablePoints = this.core.totalPoints - totalTicketsCost;

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

                ${!this.core.chineseAuction.isOpen ? `
                    <div class="warning-message">
                        <p class="warning-text">The auction is currently closed.</p>
                    </div>
                ` : ''}

                <div class="prizes-grid">
                    ${this.core.chineseAuction.prizes.length > 0 ?
                        this.core.chineseAuction.prizes.map(prize => this.generatePrizeCard(prize, userTickets, availablePoints)).join('') :
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

        if (this.core.chineseAuction.isOpen) {
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
                    ${this.core.chineseAuction.isOpen ? `
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
                const currentTickets = this.core.chineseAuction.tickets[this.core.loggedInUser]?.[prizeId] || 0;
                this.updateTickets(prizeId, currentTickets + 1);
            });
        });
    }

    updateTickets(prizeId, newQuantity) {
        const cost = newQuantity * 10;
        const currentTickets = this.core.chineseAuction.tickets[this.core.loggedInUser] || {};
        const currentCost = Object.values(currentTickets).reduce((sum, qty) => sum + (qty * 10), 0);
        const otherTicketsCost = currentCost - ((currentTickets[prizeId] || 0) * 10);
        const totalNewCost = otherTicketsCost + cost;

        if (totalNewCost > this.core.totalPoints) {
            alert('Not enough points!');
            return;
        }

        if (!this.core.chineseAuction.tickets[this.core.loggedInUser]) {
            this.core.chineseAuction.tickets[this.core.loggedInUser] = {};
        }

        if (newQuantity <= 0) {
            delete this.core.chineseAuction.tickets[this.core.loggedInUser][prizeId];
        } else {
            this.core.chineseAuction.tickets[this.core.loggedInUser][prizeId] = newQuantity;
        }

        this.core.saveData('chineseAuction', this.core.chineseAuction);

        const successMessage = document.getElementById('auction-success-message');
        successMessage.classList.remove('hidden');

        setTimeout(() => {
            successMessage.classList.add('hidden');
            this.loadChineseAuction(); // Refresh the display
        }, 2000);
    }

    // Messages wrapper
    loadMessages() {
        const container = document.getElementById('messages-container');
        container.innerHTML = this.messaging.generateInboxUI('student');
        this.messaging.updateMessagesBadge();
        this.messaging.setupMessagesEventListeners();
    }

    setupDashboardButtons() {
        console.log('Setting up dashboard event listeners...');
        
        // Dashboard action buttons
        const navToSubmit = document.getElementById('nav-to-submit');
        const navToTests = document.getElementById('nav-to-tests');
        const navToAuction = document.getElementById('nav-to-auction');
        const contactAdminBtn = document.getElementById('contact-admin-btn');
        
        if (navToSubmit) {
            navToSubmit.addEventListener('click', () => {
                // Access the main platform instance to switch tabs
                if (window.platform) {
                    window.platform.setActiveTab('submit');
                }
            });
        }
        if (navToTests) {
            navToTests.addEventListener('click', () => {
                if (window.platform) {
                    window.platform.setActiveTab('weekly');
                }
            });
        }
        if (navToAuction) {
            navToAuction.addEventListener('click', () => {
                if (window.platform) {
                    window.platform.setActiveTab('auction');
                }
            });
        }
        if (contactAdminBtn) {
            contactAdminBtn.addEventListener('click', () => {
                if (window.platform) {
                    window.platform.setActiveTab('messages');
                }
            });
        }
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MivtzahStudent };
} else {
    // Browser environment
    window.MivtzahStudent = MivtzahStudent;
}
