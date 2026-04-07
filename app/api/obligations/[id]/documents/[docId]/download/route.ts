import { db } from '@/lib/db/drizzle';
import { obligationDocuments, obligationInstances } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { supabaseAdmin } from '@/lib/supabase';

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

  // Generate signed URL for download from Supabase Storage
  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUrl(document[0].storageKey, 60); // 60 seconds expiry

  if (signedUrlError) {
    console.error('Supabase signed URL error:', signedUrlError);
    return Response.json({ 
      error: 'Failed to generate download URL',
      details: signedUrlError.message 
    }, { status: 500 });
  }

  // Redirect to the signed URL
  return Response.redirect(signedUrlData.signedUrl);
}
