# 📚 Authentication API Reference

## AuthService Methods

### Initialization
```javascript
// AuthService is automatically instantiated as 'auth' global variable
// Already available in all pages that include auth.js
```

### Session Management
```javascript
// Check if user is authenticated
if (auth.isAuthenticated()) {
  console.log('User is logged in');
}

// Check if token is expired
if (auth.isTokenExpired()) {
  console.log('Token needs refresh');
}

// Get current user data
const user = auth.user;
console.log(user.firstName, user.email);

// Get user's full name
const name = auth.getFullName(); // "John Doe"

// Get user's initials
const initials = auth.getUserInitials(); // "JD"

// Require authentication (redirect if not logged in)
auth.requireAuth();
```

### Authentication Methods

#### Login
```javascript
try {
  const result = await auth.login('john@example.com', 'Password123', true);
  console.log('Login successful:', result);
  // result includes: token, fullName, email, role, expiry
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password
- `remember` (boolean, optional): Save token to localStorage (default: false, uses sessionStorage)

**Returns:** Promise<{token, fullName, email, role, expiry}>

#### Register
```javascript
try {
  const result = await auth.register({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    password: 'Password123',
    subscribeNewsletter: true
  });
  console.log('Registration successful:', result);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

**Parameters:**
- `firstName` (string, required): User's first name
- `lastName` (string, required): User's last name
- `email` (string, required): User's email
- `phone` (string, optional): User's phone number
- `password` (string, required): User's password (min 8 chars)
- `subscribeNewsletter` (boolean, optional): Newsletter subscription

**Returns:** Promise<registration response>

#### Forgot Password
```javascript
try {
  const result = await auth.forgotPassword('john@example.com');
  console.log('Reset link sent:', result);
} catch (error) {
  console.error('Request failed:', error.message);
}
```

**Parameters:**
- `email` (string, required): User's email address

**Returns:** Promise<{message, resetToken}> or similar

#### Reset Password
```javascript
try {
  const result = await auth.resetPassword('token-from-email', 'NewPassword123');
  console.log('Password reset successful:', result);
} catch (error) {
  console.error('Reset failed:', error.message);
}
```

**Parameters:**
- `token` (string, required): Reset token from email link
- `password` (string, required): New password

**Returns:** Promise<{message}>

#### Logout
```javascript
// Logout immediately
auth.logout();
// Note: This clears token/user and redirects to login page
```

### Token Management
```javascript
// Get stored token
const token = auth.getToken();

// Set token (usually done by login method)
auth.setToken('jwt-token-here', true); // true = save to localStorage

// Remove token (usually done by logout method)
auth.removeToken();
```

### User Data Management
```javascript
// Get user object
const user = auth.getUser();

// Set user data (usually done by login method)
auth.setUser({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'User'
});

// Remove user data (usually done by logout method)
auth.removeUser();
```

## Using Auth in HTML Forms

### Login Form Example
```html
<form id="loginForm">
  <input type="email" id="email" required>
  <input type="password" id="password" required>
  <input type="checkbox" id="remember"> Remember me
  <button type="submit">Sign In</button>
</form>

<script src="js/auth.js"></script>
<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      await auth.login(email, password, remember);
      window.location.href = '/'; // Redirect to home
    } catch (error) {
      alert('❌ ' + error.message);
    }
  });
</script>
```

### Register Form Example
```html
<form id="registerForm">
  <input type="text" id="firstName" required>
  <input type="text" id="lastName" required>
  <input type="email" id="email" required>
  <input type="password" id="password" required minlength="8">
  <input type="checkbox" id="subscribe"> Subscribe to newsletter
  <button type="submit">Create Account</button>
</form>

<script src="js/auth.js"></script>
<script>
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await auth.register({
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        subscribeNewsletter: document.getElementById('subscribe').checked
      });
      alert('✓ Account created! Redirecting to login...');
      setTimeout(() => window.location.href = '/pages/login.html', 2000);
    } catch (error) {
      alert('❌ ' + error.message);
    }
  });
</script>
```

### Forgot Password Form Example
```html
<form id="forgotForm">
  <input type="email" id="email" required>
  <button type="submit">Send Reset Link</button>
</form>

<script src="js/auth.js"></script>
<script>
  document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await auth.forgotPassword(document.getElementById('email').value);
      alert('✓ Reset link sent! Check your email.');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  });
</script>
```

## Protecting Pages

### Require Authentication
```html
<script src="js/auth.js"></script>
<script>
  // At top of page - redirect to login if not authenticated
  auth.requireAuth();
</script>
```

### Show/Hide Content Based on Auth Status
```html
<script src="js/auth.js"></script>
<script>
  if (auth.isAuthenticated()) {
    document.getElementById('userContent').style.display = 'block';
  } else {
    document.getElementById('loginPrompt').style.display = 'block';
  }
</script>
```

## Making Authenticated API Calls

```javascript
// Get token for use in other API calls
const token = auth.getToken();

// Make authenticated request to backend
fetch('http://localhost:5000/api/bookings', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Bookings:', data))
.catch(error => console.error('Error:', error));
```

## Error Handling

```javascript
try {
  await auth.login(email, password);
} catch (error) {
  // error.message contains user-friendly message from backend
  console.error('Auth error:', error.message);
  
  // Common errors:
  // - "Invalid email or password"
  // - "User already exists"
  // - "Email not found"
  // - "Unable to connect to server"
}
```

## Storage Configuration

### Current Setup
- Tokens stored in `sessionStorage` by default (cleared on browser close)
- Can be configured to use `localStorage` via `remember` parameter in login

### To Change Default Storage
Edit `/js/auth.js`, modify `setToken()` method:
```javascript
// Current (sessionStorage by default)
setToken(token, remember = false) {
  if (remember) {
    localStorage.setItem(this.TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }
}

// To use localStorage always
setToken(token, remember = false) {
  localStorage.setItem(this.TOKEN_KEY, token);
}
```

## API Base URLs

The AuthService automatically detects the correct backend URL:

```javascript
// Local development
http://localhost:5000

// Production (frontend on port 8000)
// Converts 8000 to 5000 automatically

// Custom backend
// Edit line ~64 in auth.js to set specific URL
```

## Debugging

```javascript
// Log current auth state
console.log('Authenticated:', auth.isAuthenticated());
console.log('Token:', auth.getToken());
console.log('User:', auth.user);
console.log('User name:', auth.getFullName());

// Check localStorage
console.log('Storage content:', {
  token: localStorage.getItem('authToken') || sessionStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('userData') || '{}')
});
```

## Best Practices

1. **Always include error handling:**
   ```javascript
   try {
     await auth.login(...);
   } catch (error) {
     // Show user-friendly error
   }
   ```

2. **Use auth.requireAuth() on protected pages:**
   ```javascript
   auth.requireAuth(); // Redirect if not logged in
   ```

3. **Check auth status before showing content:**
   ```javascript
   if (auth.isAuthenticated()) {
     // Show user content
   }
   ```

4. **Store token securely (production):**
   - Use httpOnly cookies instead of localStorage
   - Implement refresh token rotation
   - Never store in localStorage if possible

5. **Handle token expiration:**
   ```javascript
   if (auth.isTokenExpired()) {
     auth.logout(); // Force re-login
   }
   ```

---

**Reference Guide for Kumaru Lanka Authentication System**
