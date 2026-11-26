const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
const i18nMiddleware = require('./middlewares/i18n.middleware');
const { error } = require('./utils/response');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nMiddleware);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vidhilikhit Birth Details API',
    docs: '/api/v1/health',
  });
});

// Backward compatibility & convenience URL rewrite for requests without /api/v1 prefix
app.use((req, res, next) => {
  if (
    !req.url.startsWith('/api/v1') &&
    (req.url.startsWith('/auth') ||
      req.url.startsWith('/me') ||
      req.url.startsWith('/profiles') ||
      req.url.startsWith('/home') ||
      req.url.startsWith('/kundali') ||
      req.url.startsWith('/matchmaking') ||
      req.url.startsWith('/guidance') ||
      req.url.startsWith('/reports') ||
      req.url.startsWith('/numerology') ||
      req.url.startsWith('/i18n') ||
      req.url.startsWith('/bot') ||
      req.url.startsWith('/locations') ||
      req.url.startsWith('/users'))
  ) {
    req.url = '/api/v1' + req.url;
  }
  next();
});

// API v1 routes
app.use('/api/v1', routes);

// Handle 404 for unknown endpoints
app.use((req, res) => {
  return error(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, null, 404);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;

