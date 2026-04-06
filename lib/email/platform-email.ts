import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface PlatformEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Get platform email configuration from environment variables
 */
export function getPlatformEmailConfig(): PlatformEmailConfig {
  const host = process.env.PLATFORM_SMTP_HOST;
  const port = parseInt(process.env.PLATFORM_SMTP_PORT || '587', 10);
  const secure = process.env.PLATFORM_SMTP_SECURE === 'true';
  const user = process.env.PLATFORM_SMTP_USER;
  const pass = process.env.PLATFORM_SMTP_PASS;
  const from = process.env.PLATFORM_EMAIL_FROM || `Compliance OS <${user}>`;

  if (!host || !user || !pass) {
    throw new Error('Platform email not configured. Please set PLATFORM_SMTP_HOST, PLATFORM_SMTP_USER, and PLATFORM_SMTP_PASS environment variables.');
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from,
  };
}

/**
 * Create nodemailer transporter for platform email
 */
export async function createPlatformEmailTransporter() {
  const config = getPlatformEmailConfig();
  
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
}

/**
 * Send email using platform SMTP
 */
export async function sendPlatformEmail(
  message: EmailMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getPlatformEmailConfig();
    const transporter = await createPlatformEmailTransporter();
    
    const result = await transporter.sendMail({
      from: config.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Platform Email] Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Verify platform email connection
 */
export async function verifyPlatformEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createPlatformEmailTransporter();
    await transporter.verify();
    return { success: true, message: 'Platform SMTP connection verified successfully' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during verification',
    };
  }
}
