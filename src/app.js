const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { error } = require('./utils/response');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vidhilikhit Birth Details API',
    docs: '/api/v1/health',
  });
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

