# Vidhilikhit REST API Backend

A production-grade REST API backend built with **Node.js**, **Express.js**, and **MySQL** for a birth-details-based user system. Implements layered architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ DAOs), parameterized queries, bcrypt password hashing, JWT sessions, single-use SHA-256 password reset tokens, and OAuth 2.0.

---

## 🏗️ Architecture & Project Structure

```
VIDHILIKHIT-backend/
├── src/
│   ├── config/             # DB connection pool, environment configuration
│   │   ├── db.js
│   │   └── env.js
│   ├── routes/             # Route definitions & middleware mounting
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── index.js
│   ├── controllers/        # Request parsing and standardized HTTP responses
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── services/           # Business logic, hashing, tokens, email
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   └── email.service.js
│   ├── daos/               # Data Access Objects (Parameterized MySQL queries)
│   │   ├── user.dao.js
│   │   └── passwordReset.dao.js
│   ├── middlewares/        # JWT auth guard, Joi validation, error handling
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── validations/        # Joi schema definitions
│   │   ├── auth.validation.js
│   │   └── user.validation.js
│   ├── utils/              # Standard response helper & token/crypto utilities
│   │   ├── response.js
│   │   └── token.js
│   ├── migrations/         # SQL schema migration script
│   │   └── 001_initial_schema.sql
│   ├── scripts/            # Migration runner
│   │   └── migrate.js
│   └── app.js              # Express app initialization
├── tests/                  # Integration test suite (Node.js test runner)
│   └── api.test.js
├── postman/                # Postman collection & local environment
│   ├── Vidhilikhit_API.postman_collection.json
│   └── Vidhilikhit_Local.postman_environment.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js               # Application entry point
```

---

## ⚡ Quick Setup Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended, tested on v22)
- **MySQL Server** (v8.0+ running on port 3306)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```
Ensure your database credentials match your MySQL setup:
```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vidhilikhit_db

# JWT Secret
JWT_SECRET=super_secret_jwt_key_vidhilikhit_2026_change_in_production
JWT_EXPIRES_IN=24h

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=60
APP_FRONTEND_URL=http://localhost:3000

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/oauth/google/callback
```

### 4. Database Migration
Run the automated migration runner to create `vidhilikhit_db` and all required tables:
```bash
npm run migrate
```

### 5. Running the Application
```bash
# Start server in production mode
npm start

# Or start with automatic reloading (Node.js --watch)
npm run dev
```
The server will start at: `http://localhost:5000` (API base: `http://localhost:5000/api/v1`).

### 6. Running Integration Tests
Execute the comprehensive end-to-end integration test suite:
```bash
npm test
```

---

## 📖 API Documentation

Base URL: `http://localhost:5000/api/v1`

### Standard Response Formats

#### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation description",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "termsAccepted",
      "message": "You must accept the terms and conditions to create an account."
    }
  ]
}
```

---

### Time of Birth (TOB) 3-Option Model Rules

The system implements a strict 3-option model for birth times:

| `tobChoice` | `tobTime` | Database State | Behavior |
|---|---|---|---|
| `'exact'` | `"14:30:00"` | `tob_choice = 'exact'`, `tob_time = '14:30:00'` | Accepted & stored |
| `'exact'` | `null` / omitted | *Rejected (422)* | `tobTime` is required when exact |
| `'approximate'` | `"06:45:00"` | `tob_choice = 'approximate'`, `tob_time = '06:45:00'` | Accepted & stored |
| `'approximate'` | `null` / omitted | *Rejected (422)* | `tobTime` is required when approximate |
| `'not_sure'` | Any or `null` | `tob_choice = 'not_sure'`, `tob_time = NULL` | Valid; `tobTime` is forced to `NULL` |

---

### Endpoints Reference

#### 1. System Health
- **Method:** `GET`
- **Path:** `/api/v1/health`
- **Auth:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Vidhilikhit API is healthy and operational.",
  "timestamp": "2026-10-19T16:45:00.000Z"
}
```

---

#### 2. Account Creation (Registration)
- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Auth:** None
- **Request Body:**
```json
{
  "fullName": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "mobileNumber": "+919876543210",
  "password": "SecurePassword123!",
  "termsAccepted": true,
  "birthDetails": {
    "dob": "1995-08-25",
    "tobChoice": "exact",
    "tobTime": "14:30:00",
    "gender": "male",
    "pob": "Pune, Maharashtra, India"
  }
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": 1,
      "fullName": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "mobileNumber": "+919876543210",
      "termsAccepted": true,
      "authProvider": "local",
      "birthDetails": {
        "dob": "1995-08-25",
        "tobChoice": "exact",
        "tobTime": "14:30:00",
        "gender": "male",
        "pob": "Pune, Maharashtra, India"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Cases:**
  - `400 Bad Request`: `termsAccepted` is `false` or omitted (`"terms and conditions must be accepted"`).
  - `409 Conflict`: Email already exists.
  - `422 Unprocessable Entity`: Input validation failure (e.g. invalid email format, short password, missing `tobTime` when `tobChoice` is `exact`).

---

#### 3. Login
- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Auth:** None
- **Request Body:**
```json
{
  "email": "aarav.sharma@example.com",
  "password": "SecurePassword123!"
}
```
- **Success Response (200 OK):** Returns user details and signed Bearer JWT token.
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Cases:**
  - `401 Unauthorized`: Incorrect email or password.
  - `400 Bad Request`: Account was created via OAuth without local password.

---

#### 4. Forgot Password
- **Method:** `POST`
- **Path:** `/api/v1/auth/forgot-password`
- **Auth:** None
- **Request Body:**
```json
{
  "email": "aarav.sharma@example.com"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "If the provided email is registered, a password reset link has been dispatched.",
  "data": {
    "devDebug": {
      "rawToken": "07a473d2c585dfb7d773dde8003a3b1364395a38b5c0e12bf3234c1beb464f28",
      "expiresInMinutes": 60
    }
  }
}
```
*Note: In production environments, `devDebug` is omitted, and the single-use token is only delivered via email.*

---

#### 5. Reset Password
- **Method:** `POST`
- **Path:** `/api/v1/auth/reset-password`
- **Auth:** None
- **Request Body:**
```json
{
  "token": "07a473d2c585dfb7d773dde8003a3b1364395a38b5c0e12bf3234c1beb464f28",
  "newPassword": "NewStrongPassword456!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password has been reset successfully. You may now log in with your new password.",
  "data": null
}
```
- **Error Cases:**
  - `400 Bad Request`: Token is invalid, expired, or already used.
  - `422 Unprocessable Entity`: New password is shorter than 6 characters.

---

#### 6. Get User Profile
- **Method:** `GET`
- **Path:** `/api/v1/users/profile`
- **Auth:** `Bearer <JWT_TOKEN>`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully.",
  "data": {
    "id": 1,
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "mobileNumber": "+919876543210",
    "termsAccepted": true,
    "authProvider": "local",
    "birthDetails": {
      "dob": "1995-08-25",
      "tobChoice": "exact",
      "tobTime": "14:30:00",
      "gender": "male",
      "pob": "Pune, Maharashtra, India"
    }
  }
}
```
- **Error Cases:**
  - `401 Unauthorized`: Token missing, expired, or tampered.

---

#### 7. Update User Profile
- **Method:** `PUT`
- **Path:** `/api/v1/users/profile`
- **Auth:** `Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "fullName": "Aarav S. Sharma",
  "gender": "male",
  "dob": "1995-08-25",
  "tobChoice": "approximate",
  "tobTime": "07:15:00",
  "pob": "Mumbai, Maharashtra, India"
}
```
- **Success Response (200 OK):** Returns updated profile.
- **Error Cases:**
  - `401 Unauthorized`: Bearer token invalid or missing.
  - `422 Unprocessable Entity`: Validation failure (e.g. `tobChoice: "exact"` without providing `tobTime`).

---

#### 8. OAuth 2.0 (Google)

##### A. Initiate OAuth Flow
- **Method:** `GET`
- **Path:** `/api/v1/auth/oauth/google`
- **Behavior:** Redirects browser (302) to Google OAuth consent screen, or returns JSON containing `{ "authUrl": "..." }` when `Accept: application/json` header is supplied.

##### B. OAuth Code Callback
- **Method:** `GET`
- **Path:** `/api/v1/auth/oauth/google/callback?code=AUTH_CODE`
- **Behavior:** Exchanges code with Google, fetches Google profile, links/creates user in MySQL, and returns application JWT token.

##### C. Direct OAuth Token / Profile Login (Mobile & SPA & Postman)
- **Method:** `POST`
- **Path:** `/api/v1/auth/oauth/google/token`
- **Request Body:**
```json
{
  "providerId": "google_sub_1092837465",
  "email": "user@gmail.com",
  "name": "Google User"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Google OAuth login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📮 Postman Collection

Import the included files located in the `postman/` directory:
1. `postman/Vidhilikhit_API.postman_collection.json`
2. `postman/Vidhilikhit_Local.postman_environment.json`

The collection includes automated test scripts that dynamically capture and assign `authToken`, `resetToken`, and `userId` environment variables as you execute requests in order.

