// Assumption: DashboardController handles /home/dashboard endpoint with authentication.
const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const summary = await dashboardService.getDashboardSummary(req.user.userId);
      return success(res, summary, 'Dashboard fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();

