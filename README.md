# Shiur Gimmel Summer Mivtzah 2025 - Complete Tracking System

A comprehensive web-based tracking system for a Jewish yeshiva's 5-week summer learning incentive program.

🌐 **Live Application**: [https://chicagoshluchim.github.io/retry-2.0/](https://chicagoshluchim.github.io/retry-2.0/)

## Program Overview

- **Duration**: 5 weeks (July 1 - August 3, 2025)
- **Participants**: Yeshiva students (bochrim)
- **Goal**: Encourage consistent attendance and serious learning through a points-based system
- **Weeks**: Parshas Chukas, Balak, Pinchas, Matos-Massei, Devarim
- **Schedule**: Sunday-Friday (Shabbos excluded from tracking)
- **Start Date**: Tuesday, July 1st, 2025 (first week is Tue-Fri only)

## Features

### For Students
- **Daily Progress Tracking**: Submit attendance and learning status for all sedarim
- **Weekly Test Scores**: Submit test scores for Girsa and Halacha
- **Real-time Points Calculation**: See current week and total points
- **Leaderboard**: View top performers and personal ranking
- **Chinese Auction**: Purchase tickets with earned points
- **Profile Management**: Edit username/password, view detailed progress
- **Admin Contact**: Send messages to administrators

### For Administrators
- **Student Management**: Add, edit, and delete student accounts
- **Schedule Configuration**: Set which sedarim occur on specific days
- **Manual Point Adjustments**: Override student points when needed
- **Test Score Management**: Edit student test submissions
- **Chinese Auction Management**: Add prizes, manage tickets
- **Reports and Analytics**: Generate CSV reports and view statistics
- **Student Communication**: Handle student requests and messages

## Daily Learning Sessions (Sedarim)

### Chassidus Boker (Morning Chassidus)
- **Points**: 100 per day
- **Critical Rule**: Must attend at least (total days - 1) to pass the week
- **Timing Rule**: Maximum 1 late day per week (≤10 minutes late)
- **Failure**: More than 1 late day = lose ALL Chassidus Boker points for entire week

### Girsa (Gemara Study)
- **Points**: 100 per day + test bonus
- **Requirements**: Must arrive on time AND learn ritzifus (uninterrupted focus) first 25 minutes
- **Test Requirement**: Need ≥70 on weekly test to earn ANY points
- **Test Bonus**: 70-79 = score as bonus points, 80+ = double score as bonus

### Halacha (Jewish Law)
- **Points**: 50 per day + test score
- **Requirements**: Must arrive on time AND learn ritzifus first 20 minutes
- **Test Requirement**: Need ≥70 on weekly test to earn ANY points
- **Test Bonus**: Each point above 70 = +1 bonus point

### Chassidus Erev (Evening Chassidus)
- **Points**: 100 per day
- **Requirements**: Must arrive on time AND learn ritzifus first 25 minutes
- **Single checkbox**: "I attended on time and learned ritzifus"

### Mivtzah Torah (Extra Learning)
- **Points**: 50 per daf (page) learned baal peh (by heart/memorized)
- **Daily tracking**: Number of dafim + which specific texts
- **Any Torah learning that's memorized counts**

## Technical Implementation

### Data Persistence
- Uses localStorage to maintain data between sessions
- All student accounts, progress, and settings persist
- Data survives code updates

### User Interface
- Responsive design for mobile and desktop
- Student portal: Dashboard, daily submission, test scores, profile, Chinese auction
- Admin portal: All management functions, reports, settings
- Success messages for all form submissions
- Real-time leaderboard showing top 3 students + individual rankings

### Security & Validation
- Proper form validation
- Date restrictions (no future submissions)
- Username uniqueness checking
- One-time submission enforcement

## Getting Started

1. Open `index.html` in a web browser
2. **Demo Admin Access**: Username: `admin`, Password: `admin123`
3. **Student Signup**: Click "Don't have an account? Sign up here"

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── core.js             # Core functionality and data management
├── messaging.js        # Messaging system between students and admins
├── student.js          # Student dashboard and features
├── admin.js            # Admin interface and management
├── main.js             # Application coordinator and initialization
├── debug.html          # Debug and testing page
├── MODULAR_STRUCTURE.md # Documentation for modular architecture
└── README.md           # This file
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

## Local Development

Simply open `index.html` in any modern web browser. No build process or server required.

## Data Storage

All data is stored in browser localStorage with the following keys:
- `mivtzah_students` - Student accounts
- `mivtzah_admins` - Admin accounts
- `mivtzah_submissions` - Daily progress and test scores
- `mivtzah_weeklySchedule` - Schedule configuration
- `mivtzah_eventThresholds` - Weekly point goals
- `mivtzah_chineseAuction` - Auction data and tickets
- `mivtzah_adminRequests` - Student messages to admins

## Future Enhancements

- Complete admin functionality
- CSV export capabilities
- Advanced reporting
- Email notifications
- Backup/restore functionality
- Multi-language support
