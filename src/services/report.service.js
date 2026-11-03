// Assumption: Report catalog provides 6 specialized Vedic reports with INR pricing.
const reportDao = require('../daos/report.dao');

const REPORT_CATALOG = [
  {
    id: 'kundali',
    title: 'Full Kundali Report',
    description: 'Complete analysis of your birth chart with detailed insights.',
    iconKey: 'report_kundali',
    isFree: true,
    pdfAvailable: true,
  },
  {
    id: 'career',
    title: 'Career Report',
    description: 'Opportunities, growth periods and guidance for your profession.',
    iconKey: 'report_career',
    isFree: false,
    price: 299,
    currency: 'INR',
  },
  {
    id: 'marriage',
    title: 'Marriage & Relationship Report',
    description: 'Compatibility, timing and guidance for a happy relationship.',
    iconKey: 'report_marriage',
    isFree: false,
    price: 399,
    currency: 'INR',
  },
  {
    id: 'finance',
    title: 'Finance Report',
    description: 'Wealth, financial stability and auspicious periods.',
    iconKey: 'report_finance',
    isFree: false,
    price: 299,
    currency: 'INR',
  },
  {
    id: 'health',
    title: 'Health Report',
    description: 'Insights on health, well-being and lifestyle guidance.',
    iconKey: 'report_health',
    isFree: false,
    price: 249,
    currency: 'INR',
  },
  {
    id: 'dasha',
    title: 'Dasha Report',
    description: 'Detailed analysis of your planetary periods and their effects.',
    iconKey: 'report_dasha',
    isFree: false,
    price: 299,
    currency: 'INR',
  },
];

class ReportService {
  getCatalog() {
    return { reports: REPORT_CATALOG };
  }

  async generateReport(userId, { reportType, profileId, format = 'pdf' }) {
    const reportJobId = await reportDao.createJob(userId, profileId, reportType, format);

    // Simulate async generation in background (completes in ~3 seconds)
    setTimeout(async () => {
      try {
        const downloadUrl = `https://cdn.vidhilikhit.com/generated-reports/${profileId}_${reportType}_report.pdf`;
        await reportDao.updateJobStatus(reportJobId, 'ready', downloadUrl);
      } catch (e) {
        console.warn('Async report generation note:', e.message);
      }
    }, 3000);

    return {
      reportJobId,
      status: 'processing',
      estimatedTimeSeconds: 8,
    };
  }

  async getStatus(reportJobId) {
    const job = await reportDao.getJobById(reportJobId);
    if (!job) {
      const err = new Error('Report job not found.');
      err.statusCode = 404;
      throw err;
    }

    // Auto-mark ready if enough time passed
    const elapsedSeconds = (Date.now() - new Date(job.createdAt).getTime()) / 1000;
    let status = job.status;
    let downloadUrl = job.downloadUrl;

    if (status === 'processing' && elapsedSeconds >= 3) {
      status = 'ready';
      downloadUrl = `https://cdn.vidhilikhit.com/generated-reports/${job.profileId}_${job.reportType}_report.pdf`;
      await reportDao.updateJobStatus(reportJobId, 'ready', downloadUrl);
    }

    return {
      reportJobId: job.reportJobId,
      status,
      downloadUrl: status === 'ready' ? downloadUrl : null,
      generatedAt: job.completedAt || job.createdAt,
    };
  }
}

module.exports = new ReportService();

