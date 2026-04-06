import crypto from 'crypto';

export interface WebhookConfig {
  url: string;
  secret: string;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface WebhookPayload {
  eventId: string;
  tenantId: string;
  eventType: string;
  severity: string;
  branch?: {
    id: string;
    name: string;
  };
  entity: {
    type: string;
    id: string;
    hostname?: string;
    title?: string;
  };
  timing: {
    dueAt?: string;
    certificateExpiresAt?: string;
    daysRemaining?: number;
  };
  dashboardUrl: string;
  timestamp: string;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  signature?: string;
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function sendWebhook(
  config: WebhookConfig,
  payload: WebhookPayload,
  attemptNumber: number = 1
): Promise<WebhookResult> {
  const maxRetries = config.retryAttempts ?? 3;
  const baseDelay = config.retryDelayMs ?? 1000;

  try {
    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, config.secret);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Attempt': attemptNumber.toString(),
      'X-Webhook-Timestamp': Date.now().toString(),
      ...config.headers,
    };

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      if (attemptNumber < maxRetries) {
        const delay = baseDelay * Math.pow(2, attemptNumber - 1);
        await sleep(delay);
        return sendWebhook(config, payload, attemptNumber + 1);
      }

      return {
        success: false,
        statusCode: response.status,
        responseBody: truncateResponse(responseBody),
        error: `HTTP ${response.status}: ${response.statusText}`,
        signature,
      };
    }

    return {
      success: true,
      statusCode: response.status,
      responseBody: truncateResponse(responseBody),
      signature,
    };
  } catch (error) {
    if (attemptNumber < maxRetries) {
      const delay = baseDelay * Math.pow(2, attemptNumber - 1);
      await sleep(delay);
      return sendWebhook(config, payload, attemptNumber + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending webhook',
    };
  }
}

export async function verifyWebhookEndpoint(
  config: WebhookConfig
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  try {
    const testPayload: WebhookPayload = {
      eventId: 'test-' + crypto.randomUUID(),
      tenantId: 'test-tenant',
      eventType: 'test',
      severity: 'low',
      entity: {
        type: 'test',
        id: 'test-entity',
      },
      timing: {
        daysRemaining: 30,
      },
      dashboardUrl: 'https://app.example.com/test',
      timestamp: new Date().toISOString(),
    };

    const result = await sendWebhook(config, testPayload);

    if (result.success) {
      return {
        success: true,
        message: `Webhook endpoint verified (HTTP ${result.statusCode})`,
        statusCode: result.statusCode,
      };
    } else {
      return {
        success: false,
        message: result.error || `Webhook verification failed (HTTP ${result.statusCode})`,
        statusCode: result.statusCode,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify webhook',
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncateResponse(body: string, maxLength: number = 1000): string {
  if (body.length <= maxLength) return body;
  return body.substring(0, maxLength) + '... [truncated]';
}
