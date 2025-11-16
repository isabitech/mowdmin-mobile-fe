# Mowdmin Mobile Backend - Authentication API Documentation

## Base URL
```
http://localhost:3000/api/auth
```

## Overview
The authentication system provides secure user registration, login, password management, and profile creation functionality. All authentication endpoints return standardized JSON responses with success/error status indicators.

---

## 📄 Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

---

## 🔐 Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "MySecure123@",
  "language": "EN"
}
```

**Request Body Validation:**
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 6 characters, must include:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)
- `language`: Optional, enum: "EN", "FR", "DE" (defaults to "EN")

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "language": "EN",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or missing required fields
- `400 Bad Request`: Email already exists

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get access token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "MySecure123@"
}
```

**Request Body Validation:**
- `email`: Required, valid email format, must exist in database
- `password`: Required, must meet complexity requirements

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "language": "EN",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or missing required fields
- `401 Unauthorized`: Invalid email or password

---

### 3. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset token via email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Request Body Validation:**
- `email`: Required, valid email format, must exist in database

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset token sent to your email"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `404 Not Found`: Email not found

**Email Content:**
- Subject: "Password Reset - Mowdministries"
- Body: Contains 4-digit numeric token
- Token expires in 10 minutes

---

### 4. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using token received via email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "token": "1234",
  "newPassword": "NewSecure123@",
  "confirmPassword": "NewSecure123@"
}
```

**Request Body Validation:**
- `email`: Required, valid email format
- `token`: Required, 4-digit token from email
- `newPassword`: Required, must meet password complexity requirements
- `confirmPassword`: Required, must match `newPassword`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, password mismatch, or invalid/expired token
- `404 Not Found`: User not found

---

### 5. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change password for authenticated users

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "currentPassword": "MySecure123@",
  "newPassword": "NewSecure456#",
  "confirmPassword": "NewSecure456#"
}
```

**Request Body Validation:**
- `email`: Required, valid email format
- `currentPassword`: Required, must match current user password
- `newPassword`: Required, must meet password complexity requirements
- `confirmPassword`: Required, must match `newPassword`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, password mismatch, or incorrect current password
- `404 Not Found`: User not found

---

## 🔒 Authentication Middleware

For protected routes, include the JWT token in the Authorization header:

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Middleware Response Errors:
- `401 Unauthorized`: Missing or invalid token
- `401 Unauthorized`: Token expired
- `401 Unauthorized`: User no longer exists

---

## 🧾 User Profile Management

### Create/Update User Profile

**Endpoint:** `POST /api/auth/profile/:userId`

**Description:** Create or update user profile information

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `userId`: UUID of the user

**Request Body:**
```json
{
  "displayName": "John D",
  "bio": "Software developer passionate about mobile apps",
  "location": "New York, USA",
  "phoneNumber": "+1234567890",
  "birthdate": "1990-01-15"
}
```

**Request Body Fields:**
- `displayName`: Optional, string
- `bio`: Optional, text
- `location`: Optional, string
- `phoneNumber`: Optional, string
- `birthdate`: Optional, date (YYYY-MM-DD format)
- `photoUrl`: Optional, handled via file upload

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "displayName": "John D",
    "bio": "Software developer passionate about mobile apps",
    "location": "New York, USA",
    "phoneNumber": "+1234567890",
    "birthdate": "1990-01-15T00:00:00.000Z",
    "photoUrl": "http://localhost:3000/uploads/profile-photo-123.jpg",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  }
}
```

---

## 📧 Email Notifications

The system automatically sends emails for:

1. **Welcome Email**: Sent after successful registration
2. **Password Reset Email**: Sent with 4-digit token (expires in 10 minutes)

**Email Configuration:**
- Sender: "Mowdministries" <isabitechng@gmail.com>
- SMTP: Brevo (smtp-relay.brevo.com:587)

---

## 🔑 JWT Token Details

**Token Configuration:**
- Algorithm: HS256
- Expiration: 1 day (configurable via JWT_EXPIRES_IN env var)
- Secret: Stored in JWT_SECRET environment variable

**Token Payload:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "iat": 1637000000,
  "exp": 1637086400
}
```

---

## 📊 Database Schema

### User Model
```javascript
{
  id: UUID (Primary Key),
  name: STRING,
  email: STRING (Unique, Not Null),
  password: STRING (Hashed),
  language: ENUM('EN', 'FR', 'DE'),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Profile Model
```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key to User),
  displayName: STRING,
  photoUrl: STRING,
  phoneNumber: STRING,
  bio: TEXT,
  location: STRING,
  birthdate: DATE,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Token Model (for password reset)
```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key to User),
  type: ENUM('refresh', 'reset', 'verify'),
  token: STRING (Hashed),
  expiresAt: TIMESTAMP,
  revoked: BOOLEAN,
  createdAt: TIMESTAMP
}
```

---

## 🛠️ Error Codes & Messages

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Validation Error | Missing required fields, invalid format, or business logic violations |
| 401 | Unauthorized | Invalid credentials, missing/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found (user, email, etc.) |
| 500 | Server Error | Internal server error |

---

## 🚀 Testing Examples

### Using cURL:

#### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123@",
    "language": "EN"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123@"
  }'
```

#### Request password reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## 📝 Notes

1. All passwords are automatically hashed using bcrypt with salt rounds of 10
2. JWT tokens are generated using the user's ID and have a configurable expiration time
3. Password reset tokens are 4-digit numeric codes that expire in 10 minutes
4. Email notifications are sent asynchronously and failures are logged but don't affect API responses
5. User profiles are optional and can be created/updated separately from user registration
6. The system supports multiple languages (EN, FR, DE) for internationalization
7. All timestamps are in UTC format

This API follows RESTful principles and provides comprehensive error handling and validation for secure user authentication and profile management.