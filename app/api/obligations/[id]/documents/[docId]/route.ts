import { db } from '@/lib/db/drizzle';
import { obligationDocuments, obligationInstances } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, docId } = await params;

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

  const document = await db
    .select()
    .from(obligationDocuments)
    .where(
      and(
        eq(obligationDocuments.id, docId),
        eq(obligationDocuments.obligationInstanceId, id)
      )
    )
    .limit(1);

  if (document.length === 0) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  // In production: Generate signed download URL from Supabase Storage or S3
  // For MVP: Return document metadata with mock download URL
  return Response.json({
    document: document[0],
    downloadUrl: `/api/obligations/${id}/documents/${docId}/download`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, docId } = await params;

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

  const document = await db
    .select()
    .from(obligationDocuments)
    .where(
      and(
        eq(obligationDocuments.id, docId),
        eq(obligationDocuments.obligationInstanceId, id)
      )
    )
    .limit(1);

  if (document.length === 0) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  // In production: Delete from Supabase Storage or S3 first
  // await supabase.storage.from('documents').remove([document[0].storageKey]);

  await db
    .delete(obligationDocuments)
    .where(eq(obligationDocuments.id, docId));

  return Response.json({ success: true });
}
