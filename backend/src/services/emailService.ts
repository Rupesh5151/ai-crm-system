/**
 * Email Service
 * Direct email sending via Nodemailer (for immediate sends)
 * Uses SMTP configuration from environment
 */
import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } from '../config/env';
import logger from '../utils/logger';

// Create transporter if SMTP is configured
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn('SMTP not configured. Emails will be logged but not sent.');
    return null;
  }

  return nodemailer.createTransporter({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email directly via SMTP
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      logger.info(`[EMAIL LOG] To: ${options.to} | Subject: ${options.subject}`);
      return true; // Pretend success in dev mode
    }

    const result = await transporter.sendMail({
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    logger.info(`Email sent: ${result.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmailDirect = async (to: string, name: string): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI CRM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px;">
                  <h1 style="color: #4f46e5; margin: 0 0 20px 0; font-size: 28px;">Welcome to AI CRM!</h1>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi ${name},
                  </p>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Welcome to your AI-powered CRM system. We're excited to help you manage leads more efficiently with intelligent scoring and automated insights.
                  </p>
                  <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <p style="color: #4338ca; margin: 0; font-weight: 600;">Getting Started:</p>
                    <ul style="color: #374151; margin: 10px 0 0 0; padding-left: 20px;">
                      <li>Add your first lead</li>
                      <li>Explore the AI scoring dashboard</li>
                      <li>Set up your sales pipeline</li>
                    </ul>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
                    Need help? Reply to this email or contact our support team.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                    AI CRM System &copy; 2024. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to AI CRM!',
    html,
  });
};

/**
 * Send lead assignment notification
 */
export const sendLeadAssignmentEmail = async (
  to: string,
  leadName: string,
  leadCompany: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h2 style="color: #4f46e5;">New Lead Assigned</h2>
      <p>A new lead has been assigned to you:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${leadName}</p>
        <p style="margin: 5px 0 0 0; color: #6b7280;">${leadCompany}</p>
      </div>
      <a href="#" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
        View Lead
      </a>
    </div>
  `;

  return sendEmail({
    to,
    subject: `New Lead Assigned: ${leadName}`,
    html,
  });
};

export default {
  sendEmail,
  sendWelcomeEmailDirect,
  sendLeadAssignmentEmail,
};

