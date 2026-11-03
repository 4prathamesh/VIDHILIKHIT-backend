// Assumption: Bot DAO manages chat sessions and message logs in MySQL tables.
const { query } = require('../config/db');
const crypto = require('crypto');

class BotDao {
  generateSessionId() {
    return `chat_ses_${crypto.randomBytes(3).toString('hex')}`;
  }

  generateMessageId() {
    return `msg_${crypto.randomBytes(3).toString('hex')}`;
  }

  async getOrCreateSession(userId, profileId) {
    const rows = await query(
      `SELECT session_id AS sessionId 
       FROM chat_sessions 
       WHERE user_id = ? AND profile_id = ? 
       ORDER BY updated_at DESC 
       LIMIT 1`,
      [userId, profileId]
    );

    if (rows[0]) return rows[0].sessionId;

    const newSessionId = this.generateSessionId();
    await query(
      `INSERT INTO chat_sessions (session_id, user_id, profile_id, title)
       VALUES (?, ?, ?, 'Vedic Consultation')`,
      [newSessionId, userId, profileId]
    );

    // Seed default introductory exchange per spec
    await this.addMessage(newSessionId, 'user', 'What does my birth chart say about my career?');
    await this.addMessage(
      newSessionId,
      'bot',
      "Your birth chart shows a strong inclination towards creative and analytical work. Jupiter's influence supports growth through knowledge, while Mercury indicates good communication skills. A career in design, technology or research can bring success."
    );
    await this.addMessage(newSessionId, 'user', 'When is a good time for marriage?');
    await this.addMessage(
      newSessionId,
      'bot',
      'Based on your current planetary transits, 2027–2028 shows favorable indications for marriage. It is always best to consider a detailed analysis with your full kundali.'
    );

    return newSessionId;
  }

  async getMessages(sessionId) {
    const rows = await query(
      `SELECT message_id AS id, sender, text, created_at AS createdAt 
       FROM chat_messages 
       WHERE session_id = ? 
       ORDER BY id ASC`,
      [sessionId]
    );

    return rows.map((m) => {
      const d = new Date(m.createdAt);
      let h = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return {
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: `${String(h).padStart(2, '0')}:${mins} ${ampm}`,
      };
    });
  }

  async addMessage(sessionId, sender, text, followUps = null) {
    const messageId = this.generateMessageId();
    await query(
      `INSERT INTO chat_messages (message_id, session_id, sender, text, suggested_follow_ups)
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, sessionId, sender, text, followUps ? JSON.stringify(followUps) : null]
    );

    await query('UPDATE chat_sessions SET updated_at = NOW() WHERE session_id = ?', [sessionId]);

    const d = new Date();
    let h = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    return {
      id: messageId,
      sender,
      text,
      timestamp: `${String(h).padStart(2, '0')}:${mins} ${ampm}`,
    };
  }
}

module.exports = new BotDao();

