import { db } from '@/lib/db/drizzle';
import { obligationDocuments, obligationInstances, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Note: In production, integrate with Supabase Storage or S3 for actual file storage
// This is a presigned URL generator mock for the MVP

const presignSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const validated = presignSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  // Verify obligation exists and belongs to user's tenant
  const obligation = await db
    .select()
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.id, id),
        eq(obligationInstances.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (obligation.length === 0) {
    return Response.json({ error: 'Obligation not found' }, { status: 404 });
  }

  const { filename, mimeType, sizeBytes } = validated.data;

  // Generate storage key
  const storageKey = `tenants/${user.tenantId}/obligations/${id}/${Date.now()}_${filename}`;

  // In production: Generate presigned URL from Supabase Storage or S3
  // For MVP: Return mock presigned URL and save document record

  // Create document record
  const [document] = await db
    .insert(obligationDocuments)
    .values({
      obligationInstanceId: id,
      storageKey,
      filename,
      mimeType,
      sizeBytes,
      uploadedByUserId: user.id,
    })
    .returning();

  // Log activity
  await db.insert(activityLogs).values({
    tenantId: user.tenantId!,
    userId: user.id,
    action: 'UPLOAD_DOCUMENT',
    entityType: 'obligation_document',
    entityId: document.id,
    afterJson: { obligationId: id, filename, sizeBytes },
  });

  // Return presigned URL info
  // In production, this would be a real presigned URL from your storage provider
  return Response.json({
    document,
    uploadUrl: `/api/upload-direct?key=${encodeURIComponent(storageKey)}`,
    // Or in production with Supabase:
    // uploadUrl: await supabase.storage.from('documents').createSignedUploadUrl(storageKey),
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify obligation belongs to user's tenant
  const obligation = await db
    .select()
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.id, id),
        eq(obligationInstances.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (obligation.length === 0) {
    return Response.json({ error: 'Obligation not found' }, { status: 404 });
  }

  const documents = await db
    .select()
    .from(obligationDocuments)
    .where(eq(obligationDocuments.obligationInstanceId, id))
    .orderBy(obligationDocuments.createdAt);

  return Response.json(documents);
}
