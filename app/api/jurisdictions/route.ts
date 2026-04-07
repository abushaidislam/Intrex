import { db } from '@/lib/db/drizzle';
import { jurisdictions, obligationTemplates } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

// GET handler for jurisdictions
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('countryCode') || 'BD';

  const jurisdictionList = await db
    .select()
    .from(jurisdictions)
    .where(eq(jurisdictions.countryCode, countryCode))
    .orderBy(jurisdictions.cityCorporation);

  return Response.json({
    jurisdictions: jurisdictionList,
    count: jurisdictionList.length,
  });
}
