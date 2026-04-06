import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function createEmailTransporter(config: EmailConfig) {
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

export async function verifyEmailConnection(
  config: EmailConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createEmailTransporter(config);
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified successfully' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during verification',
    };
  }
}

export async function sendTestEmail(
  config: EmailConfig,
  toEmail: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
  try {
    const transporter = await createEmailTransporter(config);
    
    const result = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: toEmail,
      subject: 'Compliance OS - Email Connector Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Connector Test</h2>
          <p>This is a test email from your Compliance OS notification system.</p>
          <p>If you received this email, your SMTP connector is configured correctly.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br />
            Connector: Email SMTP
          </p>
        </div>
      `,
      text: `Email Connector Test\n\nThis is a test email from your Compliance OS notification system.\nIf you received this email, your SMTP connector is configured correctly.\n\nSent at: ${new Date().toISOString()}`,
    });

    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test email',
    };
  }
}

export async function sendEmail(
  config: EmailConfig,
  message: EmailMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = await createEmailTransporter(config);
    
    const result = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
