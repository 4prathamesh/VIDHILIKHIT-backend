// Assumption: Comprehensive integration tests covering all flows in vidhilikhit_api_specification.md.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const { pool, query } = require('../src/config/db');

let server;
let baseUrl;
let authToken;
let activeProfileId;
let newProfileId;
let matchId;
let reportJobId;
let chatSessionId;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers }, (res) => {
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
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

describe('Vidhilikhit Vedic Astrology Complete API Specification Tests', () => {
  before(async () => {
    // Clean test records
    await query('DELETE FROM chat_messages');
    await query('DELETE FROM chat_sessions');
    await query('DELETE FROM report_jobs');
    await query('DELETE FROM matchmaking_records');
    await query('DELETE FROM profiles');
    await query('DELETE FROM user_profiles');
    await query('DELETE FROM users');

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

  // Flow 1: Authentication & User Setup
  describe('Flow 1: Authentication & User Setup', () => {
    test('POST /api/v1/auth/register registers user and returns tokens & active profile', async () => {
      const res = await request('POST', '/api/v1/auth/register', {
        fullName: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        password: 'Password@123',
        gender: 'male',
        dob: '1995-03-15',
        tob: '10:30',
        tobChoice: 'exact',
        pob: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timeZone: 'Asia/Kolkata',
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'User registered successfully');
      assert.ok(res.body.timestamp, 'Expected standard timestamp envelope');
      assert.strictEqual(res.body.data.user.fullName, 'Aarav Mehta');
      assert.ok(res.body.data.tokens.accessToken, 'Expected accessToken');
      assert.ok(res.body.data.tokens.refreshToken, 'Expected refreshToken');
      assert.ok(res.body.data.user.activeProfileId, 'Expected activeProfileId');
      activeProfileId = res.body.data.user.activeProfileId;
    });

    test('POST /api/v1/auth/login logs in user and returns tokens', async () => {
      const res = await request('POST', '/api/v1/auth/login', {
        email: 'aarav.mehta@example.com',
        password: 'Password@123',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Login successful');
      assert.ok(res.body.data.tokens.accessToken);
      authToken = res.body.data.tokens.accessToken;
    });

    test('GET /api/v1/auth/me returns authenticated user details and active profile', async () => {
      const res = await request('GET', '/api/v1/auth/me', null, authToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'User profile retrieved successfully');
      assert.strictEqual(res.body.data.user.email, 'aarav.mehta@example.com');
      assert.strictEqual(res.body.data.user.fullName, 'Aarav Mehta');
      assert.ok(res.body.data.activeProfile);
      assert.strictEqual(res.body.data.activeProfile.id, activeProfileId);
      assert.strictEqual(res.body.data.activeProfile.relationship, 'self');
    });

    test('GET /auth/me (without /api/v1 prefix) rewrites and succeeds', async () => {
      const res = await request('GET', '/auth/me', null, authToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.email, 'aarav.mehta@example.com');
    });

    test('GET /api/v1/auth/me rejects request without token (401)', async () => {
      const res = await request('GET', '/api/v1/auth/me', null, null);

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  // Flow 2: Multiple Profiles & Family Switcher
  describe('Flow 2: Multiple Profiles & Family Switcher', () => {
    test('GET /api/v1/profiles returns family profiles with activeProfileId', async () => {
      const res = await request('GET', '/api/v1/profiles', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.profiles.length >= 1);
      assert.strictEqual(res.body.data.activeProfileId, activeProfileId);
      const first = res.body.data.profiles[0];
      assert.ok(first.dobFormatted);
      assert.ok(first.tobFormatted);
      assert.ok(first.datePlaceStr);
    });

    test('POST /api/v1/profiles adds a new family profile', async () => {
      const res = await request(
        'POST',
        '/api/v1/profiles',
        {
          name: 'Riya Mehta',
          relationship: 'spouse',
          gender: 'female',
          dob: '1998-08-22',
          tob: '14:15',
          pob: 'Pune, Maharashtra, India',
          latitude: 18.5204,
          longitude: 73.8567,
          timeZone: 'Asia/Kolkata',
        },
        authToken
      );

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.name, 'Riya Mehta');
      assert.strictEqual(res.body.data.relationship, 'spouse');
      newProfileId = res.body.data.id;
    });

    test('POST /api/v1/profiles/:id/activate switches active profile', async () => {
      const res = await request('POST', `/api/v1/profiles/${newProfileId}/activate`, null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.activeProfileId, newProfileId);
    });

    test('PUT /api/v1/profiles/:id updates profile details', async () => {
      const res = await request(
        'PUT',
        `/api/v1/profiles/${newProfileId}`,
        {
          name: 'Riya A. Mehta',
          pob: 'Pune, India',
        },
        authToken
      );
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.name, 'Riya A. Mehta');
    });
  });

  // Flow 3: Home Dashboard & Notifications
  describe('Flow 3: Home Dashboard', () => {
    test('GET /api/v1/home/dashboard returns dashboard summary with Panchang snippet', async () => {
      const res = await request('GET', '/api/v1/home/dashboard', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.kundaliCard.isReady);
      assert.ok(res.body.data.dailyPanchangSnippet.tithi);
      assert.ok(res.body.data.vidhilikhitBotBanner.title);
    });
  });

  // Flow 4: My Kundali (Calculations & Charts)
  describe('Flow 4: My Kundali (Calculations & Charts)', () => {
    test('GET /api/v1/kundali/overview returns summary, lagna, rashi, and houses', async () => {
      const res = await request('GET', `/api/v1/kundali/overview?profileId=${activeProfileId}`, null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.summary.rashi.english);
      assert.ok(res.body.data.summary.lagna.english);
      assert.strictEqual(res.body.data.chart.houses.length, 12);
    });

    test('GET /api/v1/kundali/grahas returns 9 planetary positions', async () => {
      const res = await request('GET', '/api/v1/kundali/grahas', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.grahas.length, 9);
      const sun = res.body.data.grahas.find((g) => g.id === 'sun');
      assert.ok(sun.sign);
      assert.ok(sun.degree);
    });

    test('GET /api/v1/kundali/bhavas returns 12 houses analysis', async () => {
      const res = await request('GET', '/api/v1/kundali/bhavas', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.bhavas.length, 12);
    });

    test('GET /api/v1/kundali/vargas returns divisional charts list D1-D12', async () => {
      const res = await request('GET', '/api/v1/kundali/vargas', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.vargas.length, 6);
    });

    test('GET /api/v1/kundali/yogas returns detected yogas', async () => {
      const res = await request('GET', '/api/v1/kundali/yogas', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.totalYogasDetected >= 1);
    });

    test('GET /api/v1/kundali/dasha returns Vimshottari Mahadasha timeline', async () => {
      const res = await request('GET', '/api/v1/kundali/dasha', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.currentMahadasha.planet);
      assert.ok(res.body.data.currentAntardasha.planet);
    });

    test('GET /api/v1/kundali/chart-render/d1.svg returns rendered SVG image', async () => {
      const res = await request('GET', '/api/v1/kundali/chart-render/d1.svg', null, null);
      assert.strictEqual(res.status, 200);
      assert.match(res.headers['content-type'], /image\/svg\+xml/);
      assert.match(res.body, /<svg/);
    });
  });

  // Flow 5: Matchmaking & Kundali Milan
  describe('Flow 5: Matchmaking & Kundali Milan', () => {
    test('POST /api/v1/matchmaking/calculate calculates compatibility and 36 Gunas', async () => {
      const res = await request(
        'POST',
        '/api/v1/matchmaking/calculate',
        {
          person1: {
            name: 'Alivia Mondal',
            gender: 'female',
            dob: '1995-03-15',
            tob: '10:30',
            pob: 'Mumbai, Maharashtra, India',
            latitude: 19.0760,
            longitude: 72.8777,
            timeZone: 'Asia/Kolkata',
          },
          person2: {
            name: 'Aarav Sharma',
            gender: 'male',
            dob: '1994-11-20',
            tob: '14:15',
            pob: 'Pune, Maharashtra, India',
            latitude: 18.5204,
            longitude: 73.8567,
            timeZone: 'Asia/Kolkata',
          },
        },
        authToken
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.matchId);
      assert.ok(res.body.data.overall.gunasObtained);
      assert.strictEqual(res.body.data.overall.gunasTotal, 36);
      assert.strictEqual(res.body.data.highlights.length, 4);
      matchId = res.body.data.matchId;
    });

    test('POST /api/v1/matchmaking/calculate also accepts { boy, girl } payload', async () => {
      const res = await request(
        'POST',
        '/api/v1/matchmaking/calculate',
        {
          boy: {
            name: 'Aarav Mehta',
            dob: '1995-03-15',
            tob: '10:30',
            tobChoice: 'exact',
            pob: 'Mumbai, Maharashtra, India',
            latitude: 19.076,
            longitude: 72.8777,
          },
          girl: {
            name: 'Pooja Sharma',
            dob: '1996-08-22',
            tob: '14:15',
            tobChoice: 'exact',
            pob: 'Pune, Maharashtra, India',
            latitude: 18.5204,
            longitude: 73.8567,
          },
        },
        authToken
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.matchId);
      assert.ok(res.body.data.overall.gunasObtained);
    });

    test('GET /api/v1/matchmaking/:matchId/details returns 8 Ashtakootas & 7 aspects', async () => {
      const res = await request('GET', `/api/v1/matchmaking/${matchId}/details`, null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.detailedAspects.length, 7);
      assert.strictEqual(res.body.data.ashtakootaGunas.length, 8);
      assert.ok(res.body.data.overallRecommendation.verdict);
    });
  });

  // Flow 6: Daily Guidance & Panchang
  describe('Flow 6: Daily Guidance & Panchang', () => {
    test('GET /api/v1/guidance/forecast returns daily guidance and panchang', async () => {
      const res = await request('GET', '/api/v1/guidance/forecast?timeframe=Today', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.timeframe, 'Today');
      assert.ok(res.body.data.panchang.tithi);
      assert.ok(res.body.data.luckyElements.colorName);
    });
  });

  // Flow 7: Specialized Astrology Reports
  describe('Flow 7: Specialized Astrology Reports', () => {
    test('GET /api/v1/reports/catalog returns report catalog with INR prices', async () => {
      const res = await request('GET', '/api/v1/reports/catalog', null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.reports.length, 6);
    });

    test('POST /api/v1/reports/generate initiates async report generation', async () => {
      const res = await request(
        'POST',
        '/api/v1/reports/generate',
        {
          reportType: 'career',
          profileId: activeProfileId,
          format: 'pdf',
        },
        authToken
      );
      assert.strictEqual(res.status, 202);
      assert.ok(res.body.data.reportJobId);
      reportJobId = res.body.data.reportJobId;
    });

    test('GET /api/v1/reports/status/:reportJobId returns status and downloadUrl', async () => {
      const res = await request('GET', `/api/v1/reports/status/${reportJobId}`, null, authToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.reportJobId, reportJobId);
    });
  });

  // Flow 8: Ask Vidhilikhit Bot
  describe('Flow 8: Ask Vidhilikhit Bot', () => {
    test('GET /api/v1/bot/chat/history returns active session and chat messages', async () => {
      const res = await request('GET', `/api/v1/bot/chat/history?profileId=${activeProfileId}`, null, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.sessionId);
      assert.ok(res.body.data.messages.length >= 1);
      chatSessionId = res.body.data.sessionId;
    });

    test('POST /api/v1/bot/chat/send delivers contextual response and follow-ups', async () => {
      const res = await request(
        'POST',
        '/api/v1/bot/chat/send',
        {
          sessionId: chatSessionId,
          profileId: activeProfileId,
          message: 'Which gemstone should I wear for focus and career growth?',
        },
        authToken
      );
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.message.text);
      assert.ok(res.body.data.suggestedFollowUps.length >= 1);
    });
  });

  // Flow 9: Utility APIs (Locations)
  describe('Flow 9: Utility APIs (Locations)', () => {
    test('GET /api/v1/locations/autocomplete returns predictions with lat, lng, and tz', async () => {
      const res = await request('GET', '/api/v1/locations/autocomplete?query=Mum');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.predictions.length >= 1);
      const first = res.body.data.predictions[0];
      assert.strictEqual(first.mainText, 'Mumbai');
      assert.strictEqual(first.timeZone, 'Asia/Kolkata');
      assert.strictEqual(first.gmtOffset, '+05:30');
    });
  });
});

