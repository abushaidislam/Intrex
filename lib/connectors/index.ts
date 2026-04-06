export * from './email';
export * from './telegram';
export * from './whatsapp';
export * from './webhook';

export type ConnectorType = 'email_smtp' | 'telegram_bot' | 'whatsapp_business' | 'webhook';

export interface ConnectorConfigMap {
  email_smtp: import('./email').EmailConfig;
  telegram_bot: import('./telegram').TelegramConfig;
  whatsapp_business: import('./whatsapp').WhatsAppConfig;
  webhook: import('./webhook').WebhookConfig;
}

export type ConnectorConfig<T extends ConnectorType = ConnectorType> = ConnectorConfigMap[T];
