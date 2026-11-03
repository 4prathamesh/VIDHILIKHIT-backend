// Assumption: Profiles are formatted with friendly dates, times, and relationship titles.
const profileDao = require('../daos/profile.dao');
const userDao = require('../daos/user.dao');

class ProfileService {
  /**
   * Helper to format profile into API specification shape.
   */
  formatProfile(p) {
    const dobObj = new Date(p.dob);
    const dobFormatted = isNaN(dobObj.getTime())
      ? p.dob
      : dobObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Format TOB e.g. "10:30 AM"
    const tobParts = (p.tob || '10:30:00').split(':');
    let h = parseInt(tobParts[0], 10);
    const m = tobParts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const tobFormatted = `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    const tobShort = `${String(parseInt(tobParts[0], 10)).padStart(2, '0')}:${m}`;

    // Date place string e.g. "15 Mar 1995 • Mumbai"
    const city = (p.pob || 'Mumbai').split(',')[0].trim();
    const datePlaceStr = `${dobFormatted} • ${city}`;

    return {
      id: p.publicId,
      name: p.name,
      relationship: p.relationship || 'self',
      gender: p.gender || 'male',
      dob: p.dob,
      dobFormatted,
      tob: tobShort,
      tobFormatted,
      pob: p.pob,
      datePlaceStr,
      avatarUrl: p.avatarUrl || 'https://cdn.vidhilikhit.com/avatars/default.jpg',
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      timeZone: p.timeZone || 'Asia/Kolkata',
      isActive: Boolean(p.isActive),
    };
  }

  /**
   * Returns all profiles for current user.
   */
  async getProfiles(userId) {
    const user = await userDao.findById(userId);
    const profiles = await profileDao.getProfilesByUserId(userId);
    const active = profiles.find((p) => p.isActive === 1 || p.publicId === user.activeProfileId) || profiles[0];

    return {
      activeProfileId: active ? active.publicId : null,
      profiles: profiles.map((p) => {
        const item = this.formatProfile(p);
        item.isActive = active ? p.publicId === active.publicId : false;
        return item;
      }),
    };
  }

  /**
   * Switches active profile.
   */
  async activateProfile(userId, profilePublicId) {
    const updated = await profileDao.setActiveProfile(userId, profilePublicId);
    return {
      activeProfileId: profilePublicId,
      profileName: updated.name,
    };
  }

  /**
   * Adds new profile for user.
   */
  async addProfile(userId, data) {
    const created = await profileDao.createProfile(userId, data);
    const formatted = this.formatProfile(created);
    return {
      id: formatted.id,
      name: formatted.name,
      relationship: formatted.relationship,
      gender: formatted.gender,
      dobFormatted: formatted.dobFormatted,
      tobFormatted: formatted.tobFormatted,
      pob: formatted.pob,
      datePlaceStr: formatted.datePlaceStr,
      avatarUrl: formatted.avatarUrl,
      isActive: formatted.isActive,
    };
  }

  /**
   * Updates an existing profile.
   */
  async updateProfile(userId, profilePublicId, data) {
    const updated = await profileDao.updateProfile(userId, profilePublicId, data);
    const formatted = this.formatProfile(updated);
    return {
      id: formatted.id,
      name: formatted.name,
      gender: formatted.gender,
      dobFormatted: formatted.dobFormatted,
      tobFormatted: formatted.tobFormatted,
      pob: formatted.pob,
    };
  }
}

module.exports = new ProfileService();

