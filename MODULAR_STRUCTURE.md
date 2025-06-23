# Shiur Gimmel Summer Mivtzah 2025 - Modular Structure

This application has been refactored into a modular architecture for better maintainability and organization.

## File Structure

### Core Modules
- **`core.js`** - Core functionality (authentication, data management, utilities)
- **`messaging.js`** - Messaging system shared between student and admin
- **`student.js`** - Student-specific functionality (dashboard, submissions, profile)
- **`admin.js`** - Admin-specific functionality (user management, requests, settings)
- **`main.js`** - Main application coordinator that initializes and coordinates all modules

### Other Files
- **`index.html`** - Main HTML structure
- **`styles.css`** - CSS styles (unchanged)
- **`script.js`** - Original monolithic file (can be removed/archived)

## Module Responsibilities

### Core Module (`MivtzahCore`)
- Authentication (login/signup/logout)
- Data persistence (localStorage)
- Points calculation
- User management data structures
- UI utilities (loading, notifications)
- Date and week management

### Messaging Module (`MivtzahMessaging`)
- Message data management
- Thread management
- Student inbox UI generation
- Message composition and sending
- Read/unread state management

### Student Module (`MivtzahStudent`)
- Dashboard functionality
- Daily progress form
- Weekly test submission
- Profile management
- Contact admin form
- Chinese auction participation

### Admin Module (`MivtzahAdmin`)
- Admin dashboard
- Student/user management
- Student request handling
- Chinese auction management
- Reports and settings
- Admin messaging interface

### Main Coordinator (`MivtzahPlatform`)
- Initializes all modules
- Coordinates between modules
- Handles navigation and tab switching
- Provides delegation methods for backward compatibility
- Sets up global event listeners

## Benefits of Modular Structure

1. **Separation of Concerns** - Each module has a clear, focused responsibility
2. **Maintainability** - Easier to find and modify specific functionality
3. **Reusability** - Modules can be reused or extended independently
4. **Testing** - Individual modules can be tested in isolation
5. **Collaboration** - Multiple developers can work on different modules
6. **Code Organization** - Related functionality is grouped together

## Usage

The application automatically initializes when the DOM loads:

```javascript
// All modules are globally accessible:
window.platform   // Main coordinator
window.core       // Core functionality  
window.messaging  // Messaging system
window.student    // Student features
window.admin      // Admin features
```

## Loading Order

The modules must be loaded in the correct order (as specified in `index.html`):

1. `core.js` - Base functionality
2. `messaging.js` - Depends on core
3. `student.js` - Depends on core and messaging
4. `admin.js` - Depends on core and messaging  
5. `main.js` - Coordinates all modules

## Backward Compatibility

The `MivtzahPlatform` class provides delegation methods to maintain compatibility with existing HTML event handlers and global function calls.

## Future Enhancements

This modular structure makes it easy to:
- Add new student or admin features
- Implement real-time messaging
- Add more sophisticated reporting
- Integrate with external APIs
- Add unit tests for individual modules
- Implement lazy loading for better performance
