// Assumption: Dashboard retrieves active profile for personalized rashi, lagna, and daily panchang snippet.
const userDao = require('../daos/user.dao');
const profileDao = require('../daos/profile.dao');
const astrologyService = require('./astrology.service');

class DashboardService {
  async getDashboardSummary(userId) {
    const user = await userDao.findById(userId);
    const activeProfile = await profileDao.getActiveProfile(userId);

    let rashi = 'Aries (Mesha)';
    let lagna = 'Taurus (Vrishabha)';

    if (activeProfile) {
      try {
        const overview = await astrologyService.getKundaliOverview(activeProfile);
        rashi = `${overview.summary.rashi.english} (${overview.summary.rashi.sanskrit})`;
        lagna = `${overview.summary.lagna.english} (${overview.summary.lagna.sanskrit})`;
      } catch (e) {
        console.warn('Dashboard overview calculation note:', e.message);
      }
    }

    const firstName = user?.fullName?.split(' ')[0] || 'User';

    return {
      user: {
        firstName,
        fullName: user?.fullName || 'User',
        avatarUrl: user?.avatarUrl || activeProfile?.avatarUrl || 'https://cdn.vidhilikhit.com/avatars/default.jpg',
      },
      unreadNotificationsCount: 2,
      kundaliCard: {
        isReady: true,
        title: 'Your Kundali is Ready',
        subtitle: 'Explore your birth chart and personalized insights.',
        rashi,
        lagna,
      },
      dailyPanchangSnippet: {
        tithi: 'Shukla Dashami',
        nakshatra: 'Ashwini',
        auspiciousTime: '11:45 AM – 12:30 PM (Abhijit)',
      },
      vidhilikhitBotBanner: {
        title: 'Ask Our\nVidhilikhit Bot',
        subtitle: 'Get answers to your\nquestions anytime.',
        promptSuggestion: 'What does my 10th house say about my career?',
      },
    };
  }
}

module.exports = new DashboardService();

