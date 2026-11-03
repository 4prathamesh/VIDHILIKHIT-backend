// Assumption: Report DAO manages async report generation jobs and status updates in MySQL.
const { query } = require('../config/db');
const crypto = require('crypto');

class ReportDao {
  generateJobId() {
    return `rep_job_${crypto.randomBytes(3).toString('hex')}`;
  }

  async createJob(userId, profileId, reportType, format = 'pdf') {
    const reportJobId = this.generateJobId();
    await query(
      `INSERT INTO report_jobs 
       (report_job_id, user_id, profile_id, report_type, format, status, estimated_time_seconds)
       VALUES (?, ?, ?, ?, ?, 'processing', 8)`,
      [reportJobId, userId, profileId, reportType, format]
    );

    return reportJobId;
  }

  async updateJobStatus(reportJobId, status, downloadUrl) {
    await query(
      `UPDATE report_jobs 
       SET status = ?, download_url = ?, completed_at = NOW() 
       WHERE report_job_id = ?`,
      [status, downloadUrl, reportJobId]
    );
  }

  async getJobById(reportJobId) {
    const rows = await query(
      `SELECT report_job_id AS reportJobId, user_id AS userId, profile_id AS profileId,
              report_type AS reportType, format, status, download_url AS downloadUrl,
              estimated_time_seconds AS estimatedTimeSeconds, created_at AS createdAt,
              completed_at AS completedAt
       FROM report_jobs 
       WHERE report_job_id = ?
       LIMIT 1`,
      [reportJobId]
    );
    return rows[0] || null;
  }
}

module.exports = new ReportDao();

