import { z } from 'zod';

export const emailConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  auth: z.object({
    user: z.string().min(1),
    pass: z.string().min(1),
  }),
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
});

export const telegramConfigSchema = z.object({
  botToken: z.string().min(1),
  chatId: z.string().min(1),
});

export const whatsappConfigSchema = z.object({
  provider: z.enum(['twilio', 'messagebird', 'meta', 'custom']),
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
  fromNumber: z.string().optional(),
  apiKey: z.string().optional(),
  customEndpoint: z.string().url().optional(),
});

export const webhookConfigSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(16),
  headers: z.record(z.string()).optional(),
  retryAttempts: z.number().int().min(1).max(10).optional(),
  retryDelayMs: z.number().int().min(100).optional(),
});

export const connectorBaseSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(['email_smtp', 'telegram_bot', 'whatsapp_business', 'webhook']),
});

export const createConnectorSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email_smtp'),
    name: z.string().min(1).max(120),
    config: emailConfigSchema,
  }),
  z.object({
    type: z.literal('telegram_bot'),
    name: z.string().min(1).max(120),
    config: telegramConfigSchema,
  }),
  z.object({
    type: z.literal('whatsapp_business'),
    name: z.string().min(1).max(120),
    config: whatsappConfigSchema,
  }),
  z.object({
    type: z.literal('webhook'),
    name: z.string().min(1).max(120),
    config: webhookConfigSchema,
  }),
]);

export const updateConnectorSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(['active', 'disabled', 'pending_verification']).optional(),
  config: z.union([emailConfigSchema, telegramConfigSchema, whatsappConfigSchema, webhookConfigSchema]).optional(),
});

export const testConnectorSchema = z.object({
  testRecipient: z.string().optional(),
});

export const notificationRouteSchema = z.object({
  connectorId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  eventType: z.enum(['obligation_due', 'obligation_overdue', 'ssl_expiry', 'ssl_failure', 'digest']),
  severityMin: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  recipientRef: z.string().min(1).max(255),
});

export const acknowledgeNotificationSchema = z.object({
  note: z.string().optional(),
});
