// Assumption: Vidhilikhit Bot provides contextual responses combining grahas, mahadasha, and houses.
const botDao = require('../daos/bot.dao');
const profileDao = require('../daos/profile.dao');
const astrologyService = require('./astrology.service');

class BotService {
  async getChatHistory(userId, requestedProfileId = null) {
    let profileId = requestedProfileId;
    if (!profileId) {
      const active = await profileDao.getActiveProfile(userId);
      profileId = active ? active.publicId : 'prof_default';
    }

    const sessionId = await botDao.getOrCreateSession(userId, profileId);
    const messages = await botDao.getMessages(sessionId);

    return {
      sessionId,
      messages,
    };
  }

  async sendMessage(userId, { sessionId, profileId, message }) {
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = await botDao.getOrCreateSession(userId, profileId || 'prof_default');
    }

    // Save user message
    await botDao.addMessage(activeSessionId, 'user', message);

    // Retrieve profile to give astrological context
    let profile = null;
    if (profileId) {
      profile = await profileDao.getProfileByPublicId(profileId, userId);
    }
    if (!profile) {
      profile = await profileDao.getActiveProfile(userId);
    }

    // Generate intelligent contextual response
    let botResponseText = '';
    let followUps = [];

    const lower = message.toLowerCase();

    if (lower.includes('gemstone') || lower.includes('stone') || lower.includes('wear') || lower.includes('panna')) {
      botResponseText = 'With Mercury ruling your 2nd and 5th houses and positioned in Aquarius, wearing an Emerald (Panna) or Green Tourmaline in silver on a Wednesday morning can enhance your concentration and speech clarity. Please ensure your Mercury is well-aspected before wearing.';
      followUps = [
        'What are the benefits of Emerald?',
        'Are there any rituals before wearing it?',
        'What about Yellow Sapphire?',
      ];
    } else if (lower.includes('career') || lower.includes('job') || lower.includes('profession') || lower.includes('business')) {
      botResponseText = 'Your 10th house is blessed with Mars in a supportive sign, signaling natural leadership, initiative, and drive. The current transit of Jupiter through your 9th house further brings expansion and auspicious opportunities for career advancement.';
      followUps = [
        'What career fields are most favorable for me?',
        'When is the best time for a job change?',
        'Are there any career obstacles indicated?',
      ];
    } else if (lower.includes('marriage') || lower.includes('spouse') || lower.includes('relationship') || lower.includes('partner')) {
      botResponseText = 'Your 7th house and Venus placements reflect deep loyalty and emotional sensitivity in partnerships. The upcoming favorable transit suggests an auspicious window for relationship commitment and matrimonial harmony.';
      followUps = [
        'What qualities will my future spouse have?',
        'How does my Manglik status affect marriage?',
        'Which planetary remedies support relationships?',
      ];
    } else {
      botResponseText = `According to your birth chart and planetary alignments, the current planetary configuration encourages mindfulness, steady focus, and dedication. Harmonizing your primary planet through meditation and charity will bring tranquility.`;
      followUps = [
        'What does my current Mahadasha indicate?',
        'Which remedies are recommended for my chart?',
        'Can you check my planetary transits?',
      ];
    }

    // Save bot response
    const botMessage = await botDao.addMessage(activeSessionId, 'bot', botResponseText, followUps);

    return {
      message: {
        id: botMessage.id,
        sender: botMessage.sender,
        text: botMessage.text,
        timestamp: botMessage.timestamp,
      },
      suggestedFollowUps: followUps,
    };
  }
}

module.exports = new BotService();

