const app = require('./src/app');
const config = require('./src/config/env');
const { pool } = require('./src/config/db');

async function startServer() {
  try {
    // Verify database connectivity
    const connection = await pool.getConnection();
    console.log(`✅ Connected to MySQL database "${config.db.name}" on ${config.db.host}:${config.db.port}`);
    connection.release();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Vidhilikhit Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📡 Base URL: http://localhost:${config.port}/api/v1`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down server...');
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await pool.end();
          console.log('MySQL connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing MySQL pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

