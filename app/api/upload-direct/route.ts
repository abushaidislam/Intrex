import { db } from '@/lib/db/drizzle';
import { obligationDocuments, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// POST /api/upload-direct?key=<storageKey>
// Uploads a file directly to local storage (MVP)
// In production: Use Supabase Storage, S3, or similar

// Set RLS context for the current user/tenant
async function setRLSContext(userId: number, tenantId: string) {
  await db.execute(`SET app.current_user_id = '${userId}'`);
  await db.execute(`SET app.current_tenant_id = '${tenantId}'`);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.tenantId) {
    return Response.json({ error: 'User not associated with a tenant' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const storageKey = searchParams.get('key');

  if (!storageKey) {
    return Response.json({ error: 'Missing storage key' }, { status: 400 });
  }

  try {
    // Set RLS context before database operations
    await setRLSContext(user.id, user.tenantId);

    // Get form data with file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Parse storage key to create subdirectory structure
    // storageKey format: tenants/{tenantId}/obligations/{obligationId}/{timestamp}_{filename}
    const keyParts = storageKey.split('/');
    const tenantId = keyParts[1];
    const obligationId = keyParts[3];

    // Create tenant/obligation subdirectory
    const fileDir = join(uploadDir, 'tenants', tenantId, 'obligations', obligationId);
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true });
    }

    // Extract filename from storage key
    const filename = keyParts[keyParts.length - 1];
    const filePath = join(fileDir, filename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Log activity
    await db.insert(activityLogs).values({
      tenantId: user.tenantId!,
      userId: user.id,
      action: 'FILE_UPLOADED',
      entityType: 'obligation_document',
      entityId: obligationId,
      afterJson: { 
        storageKey, 
        filename: file.name, 
        sizeBytes: file.size,
        uploadedBy: user.id 
      },
    });

    return Response.json({
      success: true,
      storageKey,
      path: filePath,
      size: file.size,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
