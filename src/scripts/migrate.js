const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/env');

async function runMigrations() {
  console.log('🔄 Starting database migration...');

  // Step 1: Connect to server without specific database to create it if needed
  const rootConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    console.log(`🔨 Ensuring database "${config.db.name}" exists...`);
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Database "${config.db.name}" is ready.`);
  } finally {
    await rootConn.end();
  }

  // Step 2: Connect to the specific database and run migration statements
  const dbConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    multipleStatements: true,
  });

  try {
    const migrationsDir = path.resolve(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const migrationFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationFile, 'utf8');
      console.log(`📄 Executing migration script: ${file}...`);
      await dbConn.query(sql);
      console.log(`✅ Finished: ${file}`);
    }
    console.log('🎉 All migrations executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await dbConn.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
