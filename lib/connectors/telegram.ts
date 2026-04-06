export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface TelegramMessage {
  text: string;
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disableNotification?: boolean;
}

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export async function verifyTelegramBot(
  config: TelegramConfig
): Promise<{ success: boolean; message: string; botInfo?: { username: string; firstName: string } }> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${config.botToken}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        message: data.description || 'Failed to verify bot token',
      };
    }

    return {
      success: true,
      message: `Bot verified: @${data.result.username}`,
      botInfo: {
        username: data.result.username,
        firstName: data.result.first_name,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify Telegram bot',
    };
  }
}

export async function sendTestTelegramMessage(
  config: TelegramConfig
): Promise<{ success: boolean; message: string; messageId?: number }> {
  try {
    const result = await sendTelegramMessage(config, {
      text: `🔔 *Compliance OS - Telegram Connector Test*\n\nThis is a test message from your notification system.\nIf you received this, your Telegram connector is working correctly!\n\n_-sent at ${new Date().toISOString()}_`,
      parseMode: 'Markdown',
    });

    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Failed to send test message',
      };
    }

    return {
      success: true,
      message: 'Test message sent successfully',
      messageId: result.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test message',
    };
  }
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  message: TelegramMessage
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const payload: Record<string, unknown> = {
      chat_id: config.chatId,
      text: message.text,
      disable_notification: message.disableNotification ?? false,
    };

    if (message.parseMode) {
      payload.parse_mode = message.parseMode;
    }

    const response = await fetch(`${TELEGRAM_API_BASE}${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || 'Failed to send Telegram message',
      };
    }

    return {
      success: true,
      messageId: data.result.message_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send Telegram message',
    };
  }
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}
