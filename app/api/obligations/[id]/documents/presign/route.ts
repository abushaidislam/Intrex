import { db } from '@/lib/db/drizzle';
import { obligationDocuments, obligationInstances, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const presignSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive(),
});

// Set RLS context for the current user/tenant
async function setRLSContext(userId: number, tenantId: string) {
  await db.execute(`SET app.current_user_id = '${userId}'`);
  await db.execute(`SET app.current_tenant_id = '${tenantId}'`);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.tenantId) {
      return Response.json({ error: 'User not associated with a tenant' }, { status: 403 });
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

    // Set RLS context before database operations
    await setRLSContext(user.id, user.tenantId);

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

    // Create document record in database
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

    // Generate signed URL from Supabase Storage
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUploadUrl(storageKey);

    if (signedUrlError) {
      console.error('Supabase signed URL error:', signedUrlError);
      return Response.json({ 
        error: 'Failed to generate upload URL',
        details: signedUrlError.message
      }, { status: 500 });
    }

    return Response.json({
      document,
      uploadUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
    });
  } catch (error) {
    console.error('Presign error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return Response.json({ 
      error: 'Failed to generate upload URL',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'UNKNOWN'
    }, { status: 500 });
  }
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
