// Assumption: ReportController provides catalog, initiates generation with 202 Accepted, and checks status.
const reportService = require('../services/report.service');
const { success } = require('../utils/response');

class ReportController {
  getCatalog(req, res) {
    const catalog = reportService.getCatalog();
    return success(res, catalog, 'Report catalog fetched successfully', 200);
  }

  async generateReport(req, res, next) {
    try {
      const { reportType, profileId, format } = req.body;
      const result = await reportService.generateReport(req.user.userId, {
        reportType,
        profileId,
        format,
      });
      return success(res, result, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generation initiated`, 202);
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { reportJobId } = req.params;
      const status = await reportService.getStatus(reportJobId);
      return success(res, status, 'Report status fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();

