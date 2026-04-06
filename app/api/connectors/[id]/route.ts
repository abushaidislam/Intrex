import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { connectors, activityLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateConnectorSchema, testConnectorSchema } from '@/lib/connectors/validation';
import {
  verifyEmailConnection,
  sendTestEmail,
  verifyTelegramBot,
  sendTestTelegramMessage,
  verifyWhatsAppConnection,
  sendWhatsAppMessage,
  verifyWebhookEndpoint,
} from '@/lib/connectors';
import { encrypt, decrypt } from '@/lib/crypto';
import { ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const connector = await db.query.connectors.findFirst({
    where: and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)),
  });

  if (!connector) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  let config = {};
  try {
    config = JSON.parse(decrypt(connector.configEncryptedJson));
  } catch {
    config = {};
  }

  return NextResponse.json({
    connector: {
      ...connector,
      config,
      configEncryptedJson: undefined,
      secretEncryptedJson: undefined,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const existingConnector = await db.query.connectors.findFirst({
    where: and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)),
  });

  if (!existingConnector) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  const body = await request.json();
  const validated = updateConnectorSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};

  if (validated.data.name) {
    updates.name = validated.data.name;
  }

  if (validated.data.status) {
    updates.status = validated.data.status;
  }

  if (validated.data.config) {
    const configData = validated.data.config;
    updates.configEncryptedJson = encrypt(JSON.stringify(configData));
    updates.secretEncryptedJson = encrypt(
      JSON.stringify(extractSecrets(existingConnector.type, configData))
    );

    let verificationResult: { success: boolean; message: string } = {
      success: false,
      message: 'Unknown connector type',
    };

    switch (existingConnector.type) {
      case 'email_smtp': {
        const emailConfig = configData as { host: string; port: number; secure: boolean; auth: { user: string; pass: string }; fromEmail: string; fromName: string };
        verificationResult = await verifyEmailConnection(emailConfig);
        break;
      }
      case 'telegram_bot': {
        const telegramConfig = configData as { botToken: string; chatId: string };
        verificationResult = await verifyTelegramBot(telegramConfig);
        break;
      }
      case 'whatsapp_business': {
        const whatsappConfig = configData as { provider: 'twilio' | 'messagebird' | 'meta' | 'custom'; accountSid?: string; authToken?: string; phoneNumberId?: string; accessToken?: string; fromNumber?: string; apiKey?: string; customEndpoint?: string };
        verificationResult = await verifyWhatsAppConnection(whatsappConfig);
        break;
      }
      case 'webhook': {
        const webhookConfig = configData as { url: string; secret: string; headers?: Record<string, string>; retryAttempts?: number; retryDelayMs?: number };
        verificationResult = await verifyWebhookEndpoint(webhookConfig);
        break;
      }
    }

    updates.status = verificationResult.success ? 'active' : 'error';
    updates.lastVerifiedAt = verificationResult.success ? new Date() : null;
  }

  const [updated] = await db
    .update(connectors)
    .set(updates)
    .where(and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)))
    .returning();

  await db.insert(activityLogs).values({
    tenantId,
    userId: user.id,
    actorType: 'user',
    action: ActivityType.UPDATE_CONNECTOR,
    entityType: 'connector',
    entityId: id,
    beforeJson: { name: existingConnector.name, status: existingConnector.status },
    afterJson: { name: updated.name, status: updated.status },
  });

  let config = {};
  try {
    config = JSON.parse(decrypt(updated.configEncryptedJson));
  } catch {
    config = {};
  }

  return NextResponse.json({
    connector: {
      ...updated,
      config,
      configEncryptedJson: undefined,
      secretEncryptedJson: undefined,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const existingConnector = await db.query.connectors.findFirst({
    where: and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)),
  });

  if (!existingConnector) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  await db
    .delete(connectors)
    .where(and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)));

  await db.insert(activityLogs).values({
    tenantId,
    userId: user.id,
    actorType: 'user',
    action: ActivityType.UPDATE_CONNECTOR,
    entityType: 'connector',
    entityId: id,
    beforeJson: { name: existingConnector.name, type: existingConnector.type },
  });

  return NextResponse.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const existingConnector = await db.query.connectors.findFirst({
    where: and(eq(connectors.id, id), eq(connectors.tenantId, tenantId)),
  });

  if (!existingConnector) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  const body = await request.json();
  const validated = testConnectorSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  let config: Record<string, unknown> = {};
  try {
    config = JSON.parse(decrypt(existingConnector.configEncryptedJson));
  } catch {
    return NextResponse.json({ error: 'Failed to decrypt config' }, { status: 500 });
  }

  let testResult: { success: boolean; message: string; messageId?: string | number } = {
    success: false,
    message: 'Unknown connector type',
  };

  switch (existingConnector.type) {
    case 'email_smtp':
      testResult = await sendTestEmail(
        config as unknown as import('@/lib/connectors/email').EmailConfig,
        validated.data.testRecipient || user.email || ''
      );
      break;
    case 'telegram_bot':
      testResult = await sendTestTelegramMessage(
        config as unknown as import('@/lib/connectors/telegram').TelegramConfig
      );
      break;
    case 'whatsapp_business':
      if (validated.data.testRecipient) {
        const result = await sendWhatsAppMessage(
          config as unknown as import('@/lib/connectors/whatsapp').WhatsAppConfig,
          { to: validated.data.testRecipient, text: 'Test message from Compliance OS' }
        );
        testResult = {
          success: result.success,
          message: result.error || 'Message sent successfully',
          messageId: result.messageId,
        };
      } else {
        testResult = { success: false, message: 'Test recipient (phone number) required' };
      }
      break;
    case 'webhook':
      const webhookResult = await verifyWebhookEndpoint(
        config as unknown as import('@/lib/connectors/webhook').WebhookConfig
      );
      testResult = {
        success: webhookResult.success,
        message: webhookResult.message,
      };
      break;
  }

  await db.insert(activityLogs).values({
    tenantId,
    userId: user.id,
    actorType: 'user',
    action: ActivityType.SEND_NOTIFICATION,
    entityType: 'connector',
    entityId: id,
    afterJson: { testResult: testResult.success, message: testResult.message },
  });

  return NextResponse.json({ testResult });
}

function extractSecrets(
  type: string,
  config: Record<string, unknown>
): Record<string, string> {
  const secrets: Record<string, string> = {};

  switch (type) {
    case 'email_smtp':
      secrets.password = (config.auth as { pass?: string })?.pass || '';
      break;
    case 'telegram_bot':
      secrets.botToken = config.botToken as string;
      break;
    case 'whatsapp_business':
      secrets.authToken = config.authToken as string;
      secrets.accessToken = config.accessToken as string;
      secrets.apiKey = config.apiKey as string;
      break;
    case 'webhook':
      secrets.secret = config.secret as string;
      break;
  }

  return secrets;
}
