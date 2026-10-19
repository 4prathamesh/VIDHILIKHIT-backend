const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const { pool, query } = require('../src/config/db');
const runMigrations = require('../src/scripts/migrate.js');

let server;
let baseUrl;

// Helper function to perform HTTP requests in test
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

describe('Vidhilikhit Birth Details Backend API Integration Tests', () => {
  before(async () => {
    // Run migrations
    await runMigrations();

    // Clean test database tables
    await query('DELETE FROM password_resets');
    await query('DELETE FROM user_profiles');
    await query('DELETE FROM users');

    // Start ephemeral test server on random port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`🧪 Test server running at ${baseUrl}`);
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });

  // ==========================================
  // Step 2: Account Creation Tests
  // ==========================================
  describe('Step 2: Account Creation', () => {
    test('Should REJECT registration if termsAccepted is false', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Test User',
        email: 'terms.rejected@example.com',
        mobileNumber: '9876543210',
        password: 'Password123!',
        termsAccepted: false,
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /terms and conditions must be accepted/i);
    });

    test('Should REJECT registration if termsAccepted is omitted', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Test User',
        email: 'terms.missing@example.com',
        mobileNumber: '9876543210',
        password: 'Password123!',
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test('Should successfully register user with exact time of birth when termsAccepted is true', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        mobileNumber: '+919876543210',
        password: 'SecurePassword123!',
        termsAccepted: true,
        birthDetails: {
          dob: '1995-08-25',
          tobChoice: 'exact',
          tobTime: '14:30:00',
          gender: 'male',
          pob: 'Pune, Maharashtra',
        },
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.fullName, 'Aarav Sharma');
      assert.strictEqual(res.body.data.user.email, 'aarav.sharma@example.com');
      assert.strictEqual(res.body.data.user.termsAccepted, true);
      assert.strictEqual(res.body.data.user.birthDetails.tobChoice, 'exact');
      assert.strictEqual(res.body.data.user.birthDetails.tobTime, '14:30:00');
      assert.ok(res.body.data.token, 'Expected JWT token to be generated');
    });

    test('Should store tobTime as NULL when tobChoice is not_sure', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Priya Patel',
        email: 'priya.patel@example.com',
        mobileNumber: '+919876543211',
        password: 'SecurePassword123!',
        termsAccepted: true,
        birthDetails: {
          dob: '1998-12-10',
          tobChoice: 'not_sure',
          tobTime: '10:00:00', // Even if provided, not_sure must store null
          gender: 'female',
          pob: 'Ahmedabad, Gujarat',
        },
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.user.birthDetails.tobChoice, 'not_sure');
      assert.strictEqual(res.body.data.user.birthDetails.tobTime, null);
    });

    test('Should REJECT registration with duplicate email (409 Conflict)', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Duplicate User',
        email: 'aarav.sharma@example.com',
        mobileNumber: '+919876543299',
        password: 'Password123!',
        termsAccepted: true,
      });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    });
  });

  // ==========================================
  // Step 3: Login and JWT Tests
  // ==========================================
  describe('Step 3: Login and JWT Authentication', () => {
    let authToken;

    test('Should REJECT login with incorrect password (401 Unauthorized)', async () => {
      const res = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.sharma@example.com',
        password: 'WrongPassword!',
      });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /invalid email or password/i);
    });

    test('Should successfully login with valid credentials and return JWT', async () => {
      const res = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.sharma@example.com',
        password: 'SecurePassword123!',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token, 'Expected JWT token');
      assert.strictEqual(res.body.data.user.email, 'aarav.sharma@example.com');
      authToken = res.body.data.token;
    });

    test('Should allow access to protected profile endpoint with valid JWT', async () => {
      const res = await request('GET', '/api/v1/users/profile', null, authToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.fullName, 'Aarav Sharma');
      assert.strictEqual(res.body.data.birthDetails.tobChoice, 'exact');
    });

    test('Should REJECT access to protected profile without token (401 Unauthorized)', async () => {
      const res = await request('GET', '/api/v1/users/profile');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test('Should REJECT access with invalid token (401 Unauthorized)', async () => {
      const res = await request('GET', '/api/v1/users/profile', null, 'invalid.token.payload');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  // ==========================================
  // Step 4: Forgot Password Tests
  // ==========================================
  describe('Step 4: Forgot and Reset Password', () => {
    let resetToken;

    test('Should initiate password reset for registered email and return token in debug mode', async () => {
      const res = await request('POST', '/api/v1/auth/forgot-password', {
        email: 'aarav.sharma@example.com',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.devDebug.rawToken, 'Expected dev debug token for verification');
      resetToken = res.body.data.devDebug.rawToken;
    });

    test('Should REJECT password reset with invalid token (400 Bad Request)', async () => {
      const res = await request('POST', '/api/v1/auth/reset-password', {
        token: 'invalid-nonexistent-token-12345',
        newPassword: 'BrandNewPassword999!',
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /invalid or has expired/i);
    });

    test('Should successfully reset password with valid token', async () => {
      const res = await request('POST', '/api/v1/auth/reset-password', {
        token: resetToken,
        newPassword: 'BrandNewPassword999!',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.match(res.body.message, /password has been reset successfully/i);
    });

    test('Should PREVENT reusing the same reset token twice (single-use constraint)', async () => {
      const res = await request('POST', '/api/v1/auth/reset-password', {
        token: resetToken,
        newPassword: 'AnotherPassword123!',
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test('Should fail login with old password and succeed with new password', async () => {
      // Old password fails
      const failRes = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.sharma@example.com',
        password: 'SecurePassword123!',
      });
      assert.strictEqual(failRes.status, 401);

      // New password succeeds
      const successRes = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.sharma@example.com',
        password: 'BrandNewPassword999!',
      });
      assert.strictEqual(successRes.status, 200);
      assert.ok(successRes.body.data.token);
    });
  });

  // ==========================================
  // Step 5: Profile Editing Tests
  // ==========================================
  describe('Step 5: Profile Editing', () => {
    let authToken;

    before(async () => {
      const loginRes = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.sharma@example.com',
        password: 'BrandNewPassword999!',
      });
      authToken = loginRes.body.data.token;
    });

    test('Should update profile to approximate time of birth with valid time', async () => {
      const res = await request(
        'PUT',
        '/api/v1/users/profile',
        {
          fullName: 'Aarav S. Sharma',
          gender: 'male',
          dob: '1995-08-25',
          tobChoice: 'approximate',
          tobTime: '07:15:00',
          pob: 'Mumbai, Maharashtra',
        },
        authToken
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.fullName, 'Aarav S. Sharma');
      assert.strictEqual(res.body.data.birthDetails.tobChoice, 'approximate');
      assert.strictEqual(res.body.data.birthDetails.tobTime, '07:15:00');
      assert.strictEqual(res.body.data.birthDetails.pob, 'Mumbai, Maharashtra');
    });

    test('Should update profile to not_sure and ensure tobTime is set to null in DB', async () => {
      const res = await request(
        'PUT',
        '/api/v1/users/profile',
        {
          tobChoice: 'not_sure',
        },
        authToken
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.birthDetails.tobChoice, 'not_sure');
      assert.strictEqual(res.body.data.birthDetails.tobTime, null);
    });

    test('Should REJECT updating to exact time if tobTime is missing', async () => {
      const res = await request(
        'PUT',
        '/api/v1/users/profile',
        {
          tobChoice: 'exact',
          tobTime: null,
        },
        authToken
      );

      assert.strictEqual(res.status, 422);
      assert.strictEqual(res.body.success, false);
    });
  });

  // ==========================================
  // Step 6: OAuth 2.0 Tests
  // ==========================================
  describe('Step 6: OAuth 2.0 Integration', () => {
    test('Should return Google OAuth authorization redirect URL', async () => {
      const res = await request('GET', '/api/v1/auth/oauth/google', null, null);
      // When requested without text/html, it redirects (302) or returns URL
      assert.ok([200, 302].includes(res.status));
      if (res.status === 302) {
        assert.match(res.headers.location, /accounts\.google\.com/);
      } else {
        assert.match(res.body.data.authUrl, /accounts\.google\.com/);
      }
    });

    test('Should authenticate/create OAuth user via OAuth token profile endpoint and return JWT', async () => {
      const res = await request('POST', '/api/v1/auth/oauth/google/token', {
        providerId: 'google_oauth_sub_1092837465',
        email: 'google.user@example.com',
        name: 'Google User Test',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token, 'Expected JWT token');
      assert.strictEqual(res.body.data.user.email, 'google.user@example.com');
      assert.strictEqual(res.body.data.user.authProvider, 'google');

      // Verify that this OAuth token can access protected profile routes
      const profileRes = await request('GET', '/api/v1/users/profile', null, res.body.data.token);
      assert.strictEqual(profileRes.status, 200);
      assert.strictEqual(profileRes.body.data.fullName, 'Google User Test');
    });
  });
});

