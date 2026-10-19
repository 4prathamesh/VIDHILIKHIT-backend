const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initializes or returns the nodemailer transporter.
   */
  async getTransporter() {
    if (this.transporter) return this.transporter;

    if (config.nodeEnv === 'production') {
      // Production SMTP configuration can be loaded from env
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // In development / test, create a fake ethereal test account or fallback to console
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (e) {
        // Fallback dummy transport
        this.transporter = {
          sendMail: async (mailOptions) => {
            console.log('📧 [Mock Email Service] Email dispatch:', mailOptions);
            return { messageId: 'mock-email-id' };
          },
        };
      }
    }
    return this.transporter;
  }

  /**
   * Sends password reset email with the raw token.
   * @param {string} toEmail
   * @param {string} rawToken
   */
  async sendPasswordResetEmail(toEmail, rawToken) {
    const resetUrl = `${config.passwordReset.frontendUrl}/reset-password?token=${rawToken}`;

    console.log(`\n======================================================`);
    console.log(`🔑 PASSWORD RESET REQUEST FOR: ${toEmail}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`🎟️ Raw Reset Token: ${rawToken}`);
    console.log(`⏳ Expires in: ${config.passwordReset.expiresInMinutes} minutes`);
    console.log(`======================================================\n`);

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: '"Vidhilikhit Support" <no-reply@vidhilikhit.com>',
        to: toEmail,
        subject: 'Password Reset Request - Vidhilikhit',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below or copy the token to reset your password:</p>
            <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a></p>
            <p>Or use this token directly in API requests:</p>
            <code>${rawToken}</code>
            <p>This token will expire in ${config.passwordReset.expiresInMinutes} minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      if (info && nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
        console.log('📬 Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (err) {
      console.warn('Email dispatch warning (continuing execution):', err.message);
    }
  }
}

module.exports = new EmailService();

