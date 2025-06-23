<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Shiur Gimmel Summer Mivtzah 2025 - Copilot Instructions

This is a JavaScript web application for tracking a Jewish yeshiva's summer learning program. The system manages student progress, points calculation, and administrative functions.

## Code Style Guidelines

- Use modern ES6+ JavaScript features
- Follow consistent naming conventions (camelCase for variables and functions)
- Use descriptive variable and function names
- Add comments for complex business logic
- Maintain consistent indentation (4 spaces)

## Key Technical Details

- **Data Persistence**: All data stored in localStorage with prefix `mivtzah_`
- **Points Calculation**: Complex rules for different sedarim (learning sessions)
- **Date Handling**: Week-based system with Shabbos exclusions
- **User Roles**: Students and admins with different interfaces

## Business Logic Rules

### Points Calculation
- Chassidus Boker: 100 points/day, max 1 late day per week
- Girsa: 100 points/day + test bonus (need 70+ test score)
- Halacha: 50 points/day + bonus points (need 70+ test score)
- Chassidus Erev: 100 points/day
- Mivtzah Torah: 50 points per daf learned

### Data Validation
- No future date submissions
- One submission per day per student
- Username uniqueness
- Password minimum 6 characters

## Architecture Notes

- Single-page application with tab-based navigation
- State management through class properties
- Event-driven updates
- Responsive design with mobile support

## When Adding Features

- Always save data to localStorage after modifications
- Update UI immediately after data changes
- Include proper error handling and user feedback
- Follow existing patterns for form validation
- Maintain consistency with existing UI components

## Testing Considerations

- Test with demo admin account (admin/admin123)
- Verify localStorage persistence
- Check responsive design on different screen sizes
- Validate points calculation accuracy
- Test edge cases (late submissions, test score boundaries)
