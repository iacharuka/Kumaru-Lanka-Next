# 🔐 Kumaru Lanka - Backend & Frontend Integration Guide

## Complete Setup Instructions

### **Backend API Configuration**

#### 1. Database & User Setup

The backend expects a `Users` table with the following schema:

```sql
CREATE TABLE Users (
  Id INT PRIMARY KEY IDENTITY(1,1),
  FullName NVARCHAR(200) NOT NULL,
  Email NVARCHAR(100) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  IsActive BIT DEFAULT 1,
  Role NVARCHAR(50) DEFAULT 'User',
  LastLogin DATETIME,
  CreatedAt DATETIME DEFAULT GETUTCDATE()
);
```

#### 2. Add Sample Users (for testing)

```csharp
// In DbSeeder.cs, add users with hashed passwords
var users = new[]
{
  new User
  {
    FullName = "John Doe",
    Email = "john@example.com",
    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
    IsActive = true,
    Role = "User",
    CreatedAt = DateTime.UtcNow
  },
  new User
  {
    FullName = "Jane Smith",
    Email = "jane@example.com",
    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass456"),
    IsActive = true,
    Role = "User",
    CreatedAt = DateTime.UtcNow
  }
};
```

#### 3. JWT Configuration in `appsettings.json`

```json
{
  "Jwt": {
    "Key": "your-secret-key-min-32-characters-long-here!",
    "Issuer": "kumaru-lanka-api",
    "Audience": "kumaru-lanka-app",
    "ExpiryHours": 24
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=KumaruLankaDb;User Id=sa;Password=YourPassword;"
  }
}
```

#### 4. CORS Configuration in `Program.cs`

Make sure CORS is enabled for the frontend:

```csharp
builder.Services.AddCors(options => options.AddPolicy("AllowFrontend", policy =>
{
  policy.WithOrigins("http://localhost:8000", "http://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader();
}));

app.UseCors("AllowFrontend");
```

#### 5. Run Database Migrations

```bash
cd KumaruLanka.API
dotnet ef database update
```

### **Frontend Configuration**

#### 1. Include Authentication Scripts

In your main `index.html` and all pages that need authentication:

```html
<!-- Include in <head> or before </body> -->
<script src="js/auth.js"></script>
<!-- Optional: Use mock API for testing without backend -->
<!-- <script src="js/mock-api.js"></script> -->
```

#### 2. Check Backend URL

Update the `auth.js` login method if backend is running on a different port:

```javascript
// In auth.js, line ~64
const apiUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' // Your backend port here
  : window.location.origin.replace(':8000', ':5000');
```

#### 3. Pages with Authentication Support

- ✅ `/pages/login.html` - User login
- ✅ `/pages/register.html` - User registration
- ✅ `/pages/forgot-password.html` - Password recovery
- ✅ `/pages/profile.html` - User dashboard (requires login)
- ✅ Navbar - Dynamic login/logout buttons

### **Testing the Integration**

#### Step 1: Start Backend API

```bash
cd KumaruLanka.API
dotnet run
# Output should show: "Now listening on: http://localhost:5000"
```

#### Step 2: Start Frontend Server

```bash
cd kumaru-lanka
python3 -m http.server 8000
# Or use any other local server
```

#### Step 3: Test Login

1. Open `http://localhost:8000`
2. Click "Sign In" button in navbar (top right)
3. Use test credentials:
   - Email: `john@example.com`
   - Password: `Password123`
4. Should see success message and redirect to home page
5. Check navbar for user avatar and dropdown menu

#### Step 4: Test User Menu

After login:
- Click user avatar in navbar
- See dropdown with:
  - 📅 My Bookings
  - ⚙️ Settings
  - 👋 Logout
- Test logout functionality

### **Authentication Flow**

```
┌─────────────────────────────────────────────────────┐
│          KUMARU LANKA AUTH FLOW                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. User visits /pages/login.html                   │
│     ↓                                                │
│  2. Enters email & password                         │
│     ↓                                                │
│  3. Frontend calls POST /api/auth/login              │
│     ↓                                                │
│  4. Backend validates credentials                   │
│     ↓                                                │
│  5. Backend returns JWT token + user data           │
│     ↓                                                │
│  6. Frontend stores token in localStorage           │
│     ↓                                                │
│  7. Navbar updates to show user profile             │
│     ↓                                                │
│  8. User can access protected pages                 │
│     ↓                                                │
│  9. On logout, token is cleared                     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### **API Endpoints**

#### Login Endpoint

**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (Success 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "expiry": "2026-04-25T12:00:00Z"
}
```

**Response (Failure 401):**
```json
{
  "message": "Invalid email or password"
}
```

### **Frontend Authentication Service**

The `AuthService` class provides these methods:

```javascript
// Check if user is logged in
if (auth.isAuthenticated()) {
  console.log('User is authenticated');
}

// Get current user data
const user = auth.user;
console.log(auth.getFullName()); // "John Doe"

// Get auth token
const token = auth.getToken();

// Login
try {
  await auth.login('email@example.com', 'password', rememberMe);
} catch (error) {
  console.error('Login failed:', error);
}

// Logout
auth.logout(); // Redirects to login page

// Require authentication
auth.requireAuth(); // Redirects if not logged in
```

### **Navbar Integration**

The navbar automatically:
- Shows "Sign In" and "Sign Up" buttons for unauthenticated users
- Shows user avatar and dropdown menu for authenticated users
- Displays user's full name in the dropdown
- Provides quick links to bookings, settings, and logout

### **Styling Classes**

Auth-related CSS classes for customization:

```css
.nav-auth              /* Auth buttons container */
.nav-user-menu         /* User menu wrapper */
.nav-user-btn          /* User avatar button */
.nav-user-dropdown     /* Dropdown menu */
.nav-dropdown-item     /* Menu items */

.auth-card            /* Login/Register form card */
.auth-form            /* Form container */
.auth-feedback        /* Success/error messages */
.benefit-badge        /* Feature badges on auth pages */
```

### **Troubleshooting**

#### Issue: Login button not visible

**Solution:** Ensure `loadNavbar()` is called and `auth.js` is loaded before navbar renders.

```html
<script src="js/auth.js"></script>
<script>
  loadNavbar(); // Will check auth status and show appropriate buttons
</script>
```

#### Issue: Token not stored

**Solution:** Check if cookies/localStorage are enabled in browser.

```javascript
// Test localStorage
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should output: value
```

#### Issue: Backend returning 401 Unauthorized

**Solution:** Check:
1. User exists in database
2. Password is hashed correctly (use BCrypt)
3. JWT key matches between frontend and backend
4. CORS is properly configured

#### Issue: CORS errors

**Solution:** Ensure backend allows frontend origin:

```csharp
policy.WithOrigins("http://localhost:8000")
  .AllowAnyMethod()
  .AllowAnyHeader()
  .AllowCredentials();
```

### **Security Checklist**

- ✅ Use HTTPS in production (not HTTP)
- ✅ Set secure JWT key (min 32 characters)
- ✅ Hash passwords with BCrypt
- ✅ Validate all inputs on backend
- ✅ Set token expiration (24 hours)
- ✅ Implement refresh tokens for better security
- ✅ Add CSRF protection
- ✅ Use httpOnly cookies for tokens (not localStorage)
- ✅ Implement rate limiting on login attempts
- ✅ Log authentication events

### **Next Steps**

1. **Implement More Auth Endpoints:**
   - Register: POST `/api/auth/register`
   - Forgot Password: POST `/api/auth/forgot-password`
   - Reset Password: POST `/api/auth/reset-password`
   - Refresh Token: POST `/api/auth/refresh`

2. **Add Protected Routes:**
   - Add [Authorize] attribute to controllers that need authentication
   - Create middleware to validate JWT tokens

3. **Enhance User Profile:**
   - Add ability to update profile information
   - Store user preferences
   - Add avatar upload functionality

4. **Integrate with Bookings:**
   - Link bookings to authenticated users
   - Show user's booking history
   - Allow cancellations

5. **Add Email Verification:**
   - Send confirmation email on registration
   - Verify email before account activation
   - Handle password reset emails

### **Useful Commands**

```bash
# Start backend API
cd KumaruLanka.API
dotnet run

# Start frontend server
cd kumaru-lanka
python3 -m http.server 8000

# Create migration (if DB schema changes)
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# View database (SQL Server Management Studio or Azure Data Studio)
# Server: localhost
# Database: KumaruLankaDb
```

### **Support & Resources**

- JWT Authentication: https://jwt.io
- BCrypt Hashing: https://github.com/BcryptNet/bcrypt.net
- .NET Identity: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity
- CORS in ASP.NET Core: https://learn.microsoft.com/en-us/aspnet/core/security/cors

---

**Last Updated:** April 24, 2026
**Status:** ✅ Complete Integration Ready
