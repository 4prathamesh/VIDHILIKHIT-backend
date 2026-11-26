const app = require('./src/app');
const config = require('./src/config/env');
const { pool } = require('./src/config/db');

async function startServer() {
  try {
    // Verify database connectivity (non-blocking so calculation & i18n APIs work even before MySQL starts)
    try {
      const connection = await pool.getConnection();
      console.log(`✅ Connected to MySQL database "${config.db.name}" on ${config.db.host}:${config.db.port}`);
      connection.release();
    } catch (dbError) {
      console.warn(`\n⚠️  [DATABASE WARNING] Could not connect to MySQL at ${config.db.host}:${config.db.port}`);
      console.warn(`   Error: ${dbError.code || dbError.message || 'MySQL service is not running or port 3306 is not open.'}`);
      console.warn(`   👉 Note: Calculation APIs (Kundali, Numerology, Matchmaking, i18n) work without MySQL.`);
      console.warn(`   👉 For Auth & Profile database features: Start XAMPP / MySQL service and run "npm run migrate".\n`);
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Vidhilikhit Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📡 Base URL: http://localhost:${config.port}/api/v1`);
      console.log(`🌐 Health Check: http://localhost:${config.port}/api/v1/health\n`);
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
    const errorDetails = error.code || error.message || JSON.stringify(error);
    console.error('❌ Failed to start server:', errorDetails);
    process.exit(1);
  }
}

startServer();

