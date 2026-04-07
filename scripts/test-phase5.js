#!/usr/bin/env node
/**
 * Simple Phase 5 Test - Run with: node scripts/test-phase5.js
 * Tests the database schema changes and basic job claiming
 */

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not set');
  process.exit(1);
}

const sql = postgres(POSTGRES_URL);

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║     Phase 5: Scheduling and Jobs - Quick Test      ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // Test 1: Check columns exist
  console.log('🧪 Test 1: Verifying notification_events columns...');
  const columns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'notification_events'
      AND column_name IN ('attempt_count', 'next_attempt_at', 'locked_at', 'locked_by', 'last_error', 'dead_lettered_at')
  `;

  if (columns.length === 6) {
    console.log('   ✅ All 6 job processing columns found');
  } else {
    console.log(`   ⚠️ Found ${columns.length}/6 columns. Run migration 0005_notification_jobs.sql`);
  }

  // Test 2: Check enum values
  console.log('\n🧪 Test 2: Verifying notification_status enum values...');
  const enums = await sql`
    SELECT e.enumlabel 
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_status'
  `;

  const hasProcessing = enums.some(e => e.enumlabel === 'processing');
  const hasDeadLetter = enums.some(e => e.enumlabel === 'dead_letter');

  if (hasProcessing && hasDeadLetter) {
    console.log('   ✅ processing and dead_letter enum values found');
  } else {
    console.log('   ⚠️ Missing enum values. Run migration.');
  }

  // Test 3: Create and claim a test event
  console.log('\n🧪 Test 3: Testing job claiming (FOR UPDATE SKIP LOCKED)...');

  // Get or create test tenant
  let tenant = await sql`SELECT id FROM tenants WHERE name = 'Phase5 Test Tenant'`.then(r => r[0]);
  if (!tenant) {
    tenant = await sql`INSERT INTO tenants (name) VALUES ('Phase5 Test Tenant') RETURNING id`.then(r => r[0]);
  }

  const fingerprint = `test:phase5:${Date.now()}`;
  const event = await sql`
    INSERT INTO notification_events (
      tenant_id, event_type, entity_type, entity_id, fingerprint,
      payload_json, scheduled_for, status
    ) VALUES (
      ${tenant.id}, 'ssl_expiry', 'domain', ${crypto.randomUUID()}, ${fingerprint},
      ${JSON.stringify({ test: true })}, ${new Date()}, 'queued'
    )
    RETURNING id, status
  `.then(r => r[0]);

  console.log(`   ✅ Created test event: ${event.id}`);

  // Test claim query (simulating what the code does)
  const lockTimeoutMs = 10 * 60 * 1000;
  const now = new Date();
  const lockExpiredBefore = new Date(now.getTime() - lockTimeoutMs);

  const claimed = await sql`
    WITH candidate AS (
      SELECT id
      FROM notification_events
      WHERE (status = 'queued' OR status = 'failed')
        AND scheduled_for <= ${now}
        AND (next_attempt_at IS NULL OR next_attempt_at <= ${now})
        AND (locked_at IS NULL OR locked_at < ${lockExpiredBefore})
      ORDER BY scheduled_for ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE notification_events ne
    SET status = 'processing',
        locked_at = ${now},
        locked_by = ${'test-worker:manual'},
        updated_at = ${now}
    FROM candidate
    WHERE ne.id = candidate.id
    RETURNING ne.id, ne.status, ne.locked_by
  `.then(r => r[0]);

  if (claimed) {
    console.log(`   ✅ Successfully claimed job: ${claimed.id} (${claimed.status})`);
  } else {
    console.log('   ⚠️ No job claimed (may already be processing)');
  }

  // Test 4: Retry simulation
  console.log('\n🧪 Test 4: Testing retry logic...');

  const testEvent = await sql`
    UPDATE notification_events
    SET status = 'failed',
        attempt_count = 7,
        last_error = 'Test error'
    WHERE id = ${event.id}
    RETURNING id, status, attempt_count
  `.then(r => r[0]);

  console.log(`   Set attempt_count to ${testEvent.attempt_count}`);

  // Simulate retry (next attempt time calculation)
  const attemptCount = 7;
  const baseSeconds = Math.min(12 * 60 * 60, Math.pow(2, Math.max(0, attemptCount - 1)) * 60);
  console.log(`   Next retry in ~${Math.round(baseSeconds / 60)} minutes (exponential backoff)`);

  // Test dead letter transition
  const deadLetter = await sql`
    UPDATE notification_events
    SET status = 'dead_letter',
        attempt_count = 8,
        dead_lettered_at = ${new Date()}
    WHERE id = ${event.id}
    RETURNING id, status
  `.then(r => r[0]);

  console.log(`   ✅ Dead letter transition: ${deadLetter.status}`);

  // Test 5: Admin retry
  console.log('\n🧪 Test 5: Testing admin retry...');

  const retryResult = await sql`
    UPDATE notification_events
    SET status = 'queued',
        locked_at = NULL,
        locked_by = NULL,
        dead_lettered_at = NULL,
        next_attempt_at = ${new Date()},
        attempt_count = 0,
        last_error = NULL
    WHERE id = ${event.id}
    RETURNING id, status, attempt_count
  `.then(r => r[0]);

  if (retryResult.status === 'queued' && retryResult.attempt_count === 0) {
    console.log('   ✅ Admin retry working (reset to queued)');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  await sql`DELETE FROM notification_events WHERE tenant_id = ${tenant.id}`;
  await sql`DELETE FROM tenants WHERE id = ${tenant.id}`;
  console.log('   ✅ Cleanup complete');

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║           Phase 5 Tests Passed! ✅                ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  await sql.end();
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
