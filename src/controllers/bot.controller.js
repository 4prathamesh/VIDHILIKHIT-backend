// Assumption: BotController routes manage chat history and AI consultation exchanges.
const botService = require('../services/bot.service');
const { success } = require('../utils/response');

class BotController {
  async getChatHistory(req, res, next) {
    try {
      const { profileId } = req.query;
      const history = await botService.getChatHistory(req.user.userId, profileId);
      return success(res, history, 'Chat history fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { sessionId, profileId, message } = req.body;
      const result = await botService.sendMessage(req.user.userId, {
        sessionId,
        profileId,
        message,
      });
      return success(res, result, 'Message processed successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BotController();

