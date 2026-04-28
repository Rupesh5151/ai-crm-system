/**
 * BullMQ Email Queue Setup
 * Handles background email processing with Redis
 */
import { Queue, Worker, Job } from 'bullmq';
import { REDIS_URL } from '../config/env';
import logger from '../utils/logger';

// Connection config for Redis
const connection = {
  url: REDIS_URL,
};

// Email queue
export const emailQueue = new Queue('email-queue', { connection });

// Email job types
export type EmailJobData = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

/**
 * Add email job to queue
 */
export const addEmailJob = async (data: EmailJobData, delay?: number) => {
  const job = await emailQueue.add('send-email', data, {
    delay,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });

  logger.info(`Email job ${job.id} added to queue`);
  return job;
};

/**
 * Add welcome email job
 */
export const sendWelcomeEmail = async (to: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to AI CRM!</h2>
      <p>Hi ${name},</p>
      <p>Welcome to your AI-powered CRM system. Start managing leads efficiently with AI-driven insights.</p>
      <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  `;

  return addEmailJob({
    to,
    subject: 'Welcome to AI CRM!',
    html,
  });
};

/**
 * Add follow-up reminder email
 */
export const sendFollowUpEmail = async (to: string, leadName: string, days: number) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Follow-up Reminder</h2>
      <p>Hi there,</p>
      <p>This is a reminder to follow up with <strong>${leadName}</strong>.</p>
      <p>It has been ${days} days since your last interaction.</p>
      <a href="#" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
        View Lead
      </a>
    </div>
  `;

  return addEmailJob({
    to,
    subject: `Follow-up Reminder: ${leadName}`,
    html,
  });
};

/**
 * Process email jobs (this would be in a separate worker process in production)
 */
export const createEmailWorker = () => {
  const worker = new Worker(
    'email-queue',
    async (job: Job<EmailJobData>) => {
      const { to, subject, html } = job.data;

      // In production, this would use nodemailer to send actual emails
      logger.info(`Processing email job ${job.id}: ${subject} to ${to}`);

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info(`Email sent successfully: ${subject} to ${to}`);
      return { sent: true, to, subject };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed:`, err);
  });

  return worker;
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await emailQueue.close();
});

process.on('SIGINT', async () => {
  await emailQueue.close();
});

