export interface WhatsAppConfig {
  provider: 'twilio' | 'messagebird' | 'meta' | 'custom';
  accountSid?: string;
  authToken?: string;
  phoneNumberId?: string;
  accessToken?: string;
  fromNumber?: string;
  apiKey?: string;
  customEndpoint?: string;
}

export interface WhatsAppMessage {
  to: string;
  templateName?: string;
  templateLanguage?: string;
  variables?: Record<string, string>;
  text?: string;
}

export async function verifyWhatsAppConnection(
  config: WhatsAppConfig
): Promise<{ success: boolean; message: string }> {
  switch (config.provider) {
    case 'twilio':
      return verifyTwilio(config);
    case 'messagebird':
      return verifyMessageBird(config);
    case 'meta':
      return verifyMeta(config);
    case 'custom':
      return { success: true, message: 'Custom provider - manual verification required' };
    default:
      return { success: false, message: 'Unknown provider' };
  }
}

async function verifyTwilio(config: WhatsAppConfig): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Failed to verify Twilio credentials',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Twilio account verified: ${data.friendly_name}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify Twilio',
    };
  }
}

async function verifyMessageBird(config: WhatsAppConfig): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://rest.messagebird.com/balance', {
      headers: {
        Authorization: `AccessKey ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Failed to verify MessageBird credentials',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `MessageBird verified. Balance: ${data.amount} ${data.currency}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify MessageBird',
    };
  }
}

async function verifyMeta(config: WhatsAppConfig): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}?access_token=${config.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Failed to verify Meta credentials',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Meta WhatsApp API verified: ${data.display_phone_number}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify Meta',
    };
  }
}

export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  switch (config.provider) {
    case 'twilio':
      return sendTwilioMessage(config, message);
    case 'messagebird':
      return sendMessageBirdMessage(config, message);
    case 'meta':
      return sendMetaMessage(config, message);
    case 'custom':
      return sendCustomMessage(config, message);
    default:
      return { success: false, error: 'Unknown provider' };
  }
}

async function sendTwilioMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const to = message.to.startsWith('whatsapp:') ? message.to : `whatsapp:${message.to}`;
    const from = config.fromNumber?.startsWith('whatsapp:')
      ? config.fromNumber
      : `whatsapp:${config.fromNumber}`;

    const body = new URLSearchParams();
    body.append('To', to);
    body.append('From', from || '');
    body.append('Body', message.text || 'Notification from Compliance OS');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message via Twilio',
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send Twilio message',
    };
  }
}

async function sendMessageBirdMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch('https://conversations.messagebird.com/v1/send', {
      method: 'POST',
      headers: {
        Authorization: `AccessKey ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: message.to,
        from: config.fromNumber,
        type: 'text',
        content: {
          text: message.text || 'Notification from Compliance OS',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message via MessageBird',
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send MessageBird message',
    };
  }
}

async function sendMetaMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to,
    };

    if (message.templateName) {
      payload.type = 'template';
      payload.template = {
        name: message.templateName,
        language: {
          code: message.templateLanguage || 'en',
        },
        components: message.variables
          ? [
              {
                type: 'body',
                parameters: Object.entries(message.variables).map(([_, value]) => ({
                  type: 'text',
                  text: value,
                })),
              },
            ]
          : undefined,
      };
    } else {
      payload.type = 'text';
      payload.text = {
        body: message.text || 'Notification from Compliance OS',
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message via Meta',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send Meta message',
    };
  }
}

async function sendCustomMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(config.customEndpoint || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey || ''}`,
      },
      body: JSON.stringify({
        to: message.to,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message via custom provider',
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId || data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send custom message',
    };
  }
}
