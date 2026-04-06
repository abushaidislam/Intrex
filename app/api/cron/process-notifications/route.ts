import { processPendingNotifications } from '@/lib/notifications/ssl-notifications';

export const dynamic = 'force-dynamic';

// GET /api/cron/process-notifications - Process pending notification events
// This endpoint is called by Vercel Cron every 5 minutes
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processPendingNotifications();

    console.log(`[Notification Cron] Processed ${result.processed} notifications, sent: ${result.sent}, failed: ${result.failed}`);

    return Response.json({
      success: true,
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Notification Cron] Fatal error:', error);
    return Response.json(
      { 
        error: 'Notification processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
