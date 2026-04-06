import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { connectors, notificationRoutes, activityLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createConnectorSchema } from '@/lib/connectors/validation';
import {
  verifyEmailConnection,
  sendTestEmail,
  verifyTelegramBot,
  sendTestTelegramMessage,
  verifyWhatsAppConnection,
  verifyWebhookEndpoint,
} from '@/lib/connectors';
import { encrypt, decrypt } from '@/lib/crypto';
import { ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const results = await db.query.connectors.findMany({
    where: eq(connectors.tenantId, tenantId),
    orderBy: (connectors, { desc }) => [desc(connectors.createdAt)],
  });

  const connectorsWithDecryptedConfig = results.map((connector) => {
    let config = {};
    try {
      config = JSON.parse(decrypt(connector.configEncryptedJson));
    } catch {
      config = {};
    }

    return {
      ...connector,
      config,
      configEncryptedJson: undefined,
      secretEncryptedJson: undefined,
    };
  });

  return NextResponse.json({ connectors: connectorsWithDecryptedConfig });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const body = await request.json();
  const validated = createConnectorSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const { type, name, config } = validated.data;

  let verificationResult: { success: boolean; message: string } = {
    success: false,
    message: 'Unknown connector type',
  };

  switch (type) {
    case 'email_smtp':
      verificationResult = await verifyEmailConnection(config);
      break;
    case 'telegram_bot':
      verificationResult = await verifyTelegramBot(config);
      break;
    case 'whatsapp_business':
      verificationResult = await verifyWhatsAppConnection(config);
      break;
    case 'webhook':
      verificationResult = await verifyWebhookEndpoint(config);
      break;
  }

  const encryptedConfig = encrypt(JSON.stringify(config));
  const encryptedSecrets = encrypt(JSON.stringify(extractSecrets(type, config)));

  const [newConnector] = await db
    .insert(connectors)
    .values({
      tenantId,
      type,
      name,
      status: verificationResult.success ? 'active' : 'error',
      configEncryptedJson: encryptedConfig,
      secretEncryptedJson: encryptedSecrets,
      lastVerifiedAt: verificationResult.success ? new Date() : null,
    })
    .returning();

  await db.insert(activityLogs).values({
    tenantId,
    userId: user.id,
    actorType: 'user',
    action: ActivityType.CREATE_CONNECTOR,
    entityType: 'connector',
    entityId: newConnector.id,
    afterJson: { type, name, status: newConnector.status },
  });

  return NextResponse.json(
    {
      connector: {
        ...newConnector,
        config,
        configEncryptedJson: undefined,
        secretEncryptedJson: undefined,
      },
      verification: verificationResult,
    },
    { status: 201 }
  );
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
