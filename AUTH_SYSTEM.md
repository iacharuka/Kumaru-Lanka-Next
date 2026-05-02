# 🔐 Kumaru Lanka Authentication System

## Overview

The Kumaru Lanka authentication system provides a complete user authentication flow with professional UI matching the admin dashboard design. It includes login, registration, password recovery, and profile management pages.

## Files Created

### Authentication Pages

1. **pages/login.html**
   - User login page with email/password form
   - Remember me functionality
   - Social login buttons (Google, Facebook)
   - Forgot password link
   - Redirect to home on successful login
   - Form validation and error messages

2. **pages/register.html**
   - New user registration page
   - First name, last name, email, phone fields
   - Password strength indicator
   - Password confirmation validation
   - Terms & conditions checkbox
   - Newsletter subscription option
   - Social signup buttons
   - Redirect to login on successful registration

3. **pages/forgot-password.html**
   - Password recovery page
   - Email verification flow
   - Success confirmation message
   - Resend email option

4. **pages/profile.html**
   - User account dashboard
   - Profile information editing
   - Booking history and status
   - Preference settings
   - Logout functionality
   - Account deletion option

### Authentication Service

**js/auth.js** - AuthService class for managing authentication
- Token management (localStorage/sessionStorage)
- User data storage
- Login/Register/Forgot password/Reset password methods
- Session checking and validation
- Helper methods for user info retrieval

## Key Features

### 1. Professional Design
- Matching admin card-based UI
- Mobile-responsive layout
- Gradient backgrounds
- Professional color scheme

### 2. Form Validation
- Email format validation
- Password requirements (8+ chars, uppercase, numbers)
- Password confirmation matching
- Real-time validation feedback
- Touch-friendly form fields (44px minimum height)

### 3. Security Features
- Token-based authentication
- Remember me option (localStorage)
- Secure password storage (sessionStorage)
- Token expiration checking
- Session validation on protected routes

### 4. User Experience
- Clear feedback messages (✓ success, ✗ errors)
- Loading states on form submission
- Smooth transitions and animations
- Mobile hamburger navigation integration
- Proper autocomplete hints for forms

## Integration Guide

### 1. Include AuthService in Your Pages

```html
<script src="../js/auth.js"></script>
```

### 2. Check Authentication

```javascript
// Require user to be logged in
auth.requireAuth();

// Check if user is authenticated
if (auth.isAuthenticated()) {
  // User is logged in
}
```

### 3. Access User Data

```javascript
// Get current user
const user = auth.user;
console.log(auth.getFullName()); // "John Doe"
console.log(auth.getUserInitials()); // "JD"

// Get authentication token
const token = auth.getToken();
```

### 4. Login

```javascript
// Manual login (for programmatic login)
try {
  const result = await auth.login('user@example.com', 'password123', true);
  console.log('Logged in as:', result.user.firstName);
} catch (error) {
  console.error('Login failed:', error);
}
```

### 5. Logout

```javascript
// Logout user
auth.logout(); // Redirects to login page
```

## API Endpoints Required

Your backend should implement these endpoints:

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

### POST /api/auth/register
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "subscribeNewsletter": true
}
```
**Response:**
```json
{
  "message": "Registration successful",
  "userId": "1"
}
```

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "Reset link sent to email"
}
```

### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```
**Response:**
```json
{
  "message": "Password reset successful"
}
```

## Navigation Links

### Add to Navbar
```html
<!-- In nav-links -->
<li><a href="../pages/login.html" id="authLink">Login</a></li>
<li><a href="../pages/register.html" id="registerLink">Register</a></li>
<li id="profileLink" style="display:none;">
  <a href="../pages/profile.html" id="profileAvatarLink">Profile</a>
</li>
```

### JavaScript for Dynamic Navigation
```javascript
// After loading auth service
function updateAuthNavigation() {
  if (auth.isAuthenticated()) {
    document.getElementById('authLink').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
    document.getElementById('profileLink').style.display = 'block';
  } else {
    document.getElementById('authLink').style.display = 'block';
    document.getElementById('registerLink').style.display = 'block';
    document.getElementById('profileLink').style.display = 'none';
  }
}

updateAuthNavigation();
```

## Styling Details

### Color Variables Used
- `--primary`: #e07b39 (Orange)
- `--green-dark`: #1a2e1a (Dark Green)
- `--border`: Subtle borders
- `--bg-white`: White backgrounds
- `--text-muted`: Gray text

### Responsive Breakpoints
- Mobile: < 768px (full width forms)
- Tablet: 768px - 1023px (adjusted card width)
- Desktop: 1024px+ (optimal card width 420px max)

### Key Components
- `.auth-card`: Main form container
- `.auth-form`: Form wrapper with proper spacing
- `.auth-checkbox`: Custom checkbox styling
- `.auth-feedback`: Status message display
- `.password-strength`: Visual strength indicator

## Testing Checklist

- [ ] Login page loads correctly on all devices
- [ ] Form validation works (empty fields, invalid email)
- [ ] Password strength indicator displays correctly
- [ ] "Remember me" checkbox functionality
- [ ] Forgot password link navigation
- [ ] Social login buttons show coming soon
- [ ] Registration form validation works
- [ ] Password confirmation matching
- [ ] Terms checkbox required
- [ ] Profile page loads after login
- [ ] Logout functionality works
- [ ] Mobile hamburger menu includes auth links
- [ ] All buttons are touch-friendly (44px minimum)
- [ ] Form inputs have proper font size (16px on mobile)

## Future Enhancements

1. **Two-Factor Authentication**
   - SMS/Email verification
   - TOTP support

2. **Social Login**
   - Google OAuth integration
   - Facebook OAuth integration

3. **Email Verification**
   - Confirmation on registration
   - Resend option

4. **Advanced Profile**
   - Avatar upload
   - Account preferences
   - Address book
   - Saved payment methods

5. **Booking Integration**
   - Link bookings to user account
   - Booking history and receipts
   - Cancellation management

6. **API Rate Limiting**
   - Prevent brute force attempts
   - Implement CAPTCHA

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Store tokens securely (implemented with sessionStorage/localStorage)
3. ✅ Validate all inputs on backend
4. ✅ Implement password hashing (backend responsibility)
5. ✅ Set token expiration times
6. ✅ Implement CORS properly
7. ✅ Use httpOnly cookies for sensitive tokens (recommended)
8. ✅ Implement rate limiting on login attempts

## Troubleshooting

### User stays on login page after successful login
- Check if token is being stored correctly
- Verify redirect URL is correct
- Check browser console for JavaScript errors

### Password strength indicator not working
- Ensure input ID matches `#registerPassword`
- Check that password requirements in regex match your policy

### Auth service not found
- Ensure `js/auth.js` is loaded before using it
- Check script tag order in HTML

### Forms not submitting
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Check CORS headers on backend

## Support & Contribution

For issues or improvements, please:
1. Check the console for error messages
2. Verify all API endpoints are implemented
3. Test on multiple devices
4. Update backend to implement required endpoints
