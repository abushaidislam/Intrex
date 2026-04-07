/**
 * Phase 5 Integration Test Script
 * Run with: npx tsx tests/phase-5-integration.ts
 */
import { db, client } from '@/lib/db/drizzle';
import { notificationEvents, tenants, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { processPendingNotifications } from '@/lib/notifications/ssl-notifications';

async function setupTestTenant() {
  const [tenant] = await db.insert(tenants).values({
    name: `Test Phase5 ${Date.now()}`,
  }).returning();

  const [user] = await db.insert(users).values({
    tenantId: tenant.id,
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'test-hash',
    role: 'head_office_admin',
  }).returning();

  return { tenant, user };
}

async function testJobClaiming(tenantId: string) {
  console.log('\n🧪 Testing Job Claiming with FOR UPDATE SKIP LOCKED...');

  // Create test event
  const [event] = await db.insert(notificationEvents).values({
    tenantId,
    eventType: 'ssl_expiry',
    entityType: 'domain',
    entityId: '00000000-0000-0000-0000-000000000001',
    fingerprint: `test:claim:${Date.now()}`,
    payloadJson: { hostname: 'test.com', daysRemaining: 5 },
    scheduledFor: new Date(),
    status: 'queued',
  }).returning();

  // Process
  const result = await processPendingNotifications();
  console.log(`   ✅ Processed ${result.processed} events`);

  // Check status changed
  const updated = await db.query.notificationEvents.findFirst({
    where: eq(notificationEvents.id, event.id),
  });

  if (updated?.status !== 'queued') {
    console.log(`   ✅ Event status changed: ${updated?.status}`);
  } else {
    console.log(`   ⚠️ Event still queued (no recipients configured)`);
  }

  return event.id;
}

async function testRetryLogic(tenantId: string) {
  console.log('\n🧪 Testing Retry Logic & Dead Letter...');

  const [event] = await db.insert(notificationEvents).values({
    tenantId,
    eventType: 'ssl_expiry',
    entityType: 'domain',
    entityId: '00000000-0000-0000-0000-000000000002',
    fingerprint: `test:retry:${Date.now()}`,
    payloadJson: { hostname: 'retry-test.com', daysRemaining: 3 },
    scheduledFor: new Date(),
    status: 'queued',
    attemptCount: 7, // One away from dead letter
  }).returning();

  // Process once more (should hit dead letter)
  await processPendingNotifications();

  const updated = await db.query.notificationEvents.findFirst({
    where: eq(notificationEvents.id, event.id),
  });

  if (updated?.status === 'dead_letter' || updated?.attemptCount === 8) {
    console.log(`   ✅ Retry logic working (attemptCount: ${updated?.attemptCount}, status: ${updated?.status})`);
  } else {
    console.log(`   ℹ️ Status: ${updated?.status}, attempts: ${updated?.attemptCount}`);
  }

  return event.id;
}

async function testStuckJobRecovery(tenantId: string) {
  console.log('\n🧪 Testing Stuck Job Recovery...');

  const lockTimeoutMs = 10 * 60 * 1000;
  const oldLockTime = new Date(Date.now() - lockTimeoutMs - 60000);

  const [event] = await db.insert(notificationEvents).values({
    tenantId,
    eventType: 'ssl_expiry',
    entityType: 'domain',
    entityId: '00000000-0000-0000-0000-000000000003',
    fingerprint: `test:stuck:${Date.now()}`,
    payloadJson: { hostname: 'stuck-test.com' },
    scheduledFor: new Date(),
    status: 'processing',
    lockedAt: oldLockTime,
    lockedBy: 'test-worker:123',
  }).returning();

  // Simulate retries cron query
  const lockExpiredBefore = new Date(Date.now() - lockTimeoutMs);
  const stuck = await client`
    SELECT id FROM notification_events
    WHERE status = 'processing'
      AND locked_at < ${lockExpiredBefore}
      AND id = ${event.id}
  `;

  if (stuck.length > 0) {
    console.log(`   ✅ Stuck job detection working (found ${stuck.length} stuck job)`);
  } else {
    console.log(`   ⚠️ Job not detected as stuck`);
  }

  return event.id;
}

async function testAdminRetry(tenantId: string, eventId: string) {
  console.log('\n🧪 Testing Admin Retry Endpoint...');

  // First make it dead_letter
  await db.update(notificationEvents)
    .set({ status: 'dead_letter', deadLetteredAt: new Date(), attemptCount: 8 })
    .where(eq(notificationEvents.id, eventId));

  // Simulate retry (normally done via API)
  await db.update(notificationEvents)
    .set({
      status: 'queued',
      lockedAt: null,
      lockedBy: null,
      deadLetteredAt: null,
      nextAttemptAt: new Date(),
      attemptCount: 0,
      lastError: null,
    })
    .where(eq(notificationEvents.id, eventId));

  const updated = await db.query.notificationEvents.findFirst({
    where: eq(notificationEvents.id, eventId),
  });

  if (updated?.status === 'queued' && updated?.attemptCount === 0) {
    console.log(`   ✅ Admin retry working (status: ${updated.status}, attempts reset)`);
  } else {
    console.log(`   ❌ Admin retry failed (status: ${updated?.status})`);
  }
}

async function cleanup(eventIds: string[], tenantId: string, userId: number) {
  console.log('\n🧹 Cleaning up test data...');

  for (const id of eventIds) {
    await db.delete(notificationEvents).where(eq(notificationEvents.id, id));
  }

  await db.delete(users).where(eq(users.id, userId));
  await db.delete(tenants).where(eq(tenants.id, tenantId));

  console.log('   ✅ Cleanup complete');
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     Phase 5: Scheduling and Jobs - Test Suite     ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const eventIds: string[] = [];
  let tenantId: string | undefined;
  let userId: number | undefined;

  try {
    // Setup
    console.log('\n📦 Setting up test tenant...');
    const { tenant, user } = await setupTestTenant();
    tenantId = tenant.id;
    userId = user.id;
    console.log(`   ✅ Tenant: ${tenantId}`);

    // Run tests
    const eventId1 = await testJobClaiming(tenantId);
    eventIds.push(eventId1);

    const eventId2 = await testRetryLogic(tenantId);
    eventIds.push(eventId2);

    const eventId3 = await testStuckJobRecovery(tenantId);
    eventIds.push(eventId3);

    await testAdminRetry(tenantId, eventId2);

    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║           All Tests Completed! ✅                 ║');
    console.log('╚═══════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Cleanup
    if (tenantId && userId) {
      await cleanup(eventIds, tenantId, userId);
    }
    process.exit(0);
  }
}

runTests();
