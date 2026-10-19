const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'vidhilikhit_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'vidhilikhit_jwt_secret_default_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  passwordReset: {
    expiresInMinutes: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES, 10) || 60,
    frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/oauth/google/callback',
    },
  },
};

