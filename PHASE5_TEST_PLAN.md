# Phase 5 Test Plan

## 1. Database Migration Test

```bash
# Apply migration
npx drizzle-kit migrate

# Verify columns exist
psql $POSTGRES_URL -c "\d notification_events"
# Should show: attempt_count, next_attempt_at, locked_at, locked_by, last_error, dead_lettered_at
```

## 2. Job Claiming Test (Multi-worker safe)

```bash
# Create test notification via API
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "eventType": "ssl_expiry",
    "entityType": "domain",
    "entityId": "test-domain-id",
    "payload": {"hostname": "test.com", "daysRemaining": 5}
  }'

# Trigger processing
curl "http://localhost:3000/api/cron/process-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 3. Retry & Dead-Letter Test

Simulate repeated failures by creating notification without recipients:

```bash
# Create notification (will fail to send due to no recipients configured)
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "eventType": "ssl_expiry",
    "entityType": "domain", 
    "entityId": "test-retry-id",
    "payload": {"hostname": "retry-test.com", "daysRemaining": 3}
  }'

# Run processing multiple times to trigger retries
for i in {1..10}; do
  curl "http://localhost:3000/api/cron/process-notifications" \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  echo "Attempt $i done"
done

# Check if notification became dead_letter
psql $POSTGRES_URL -c "
  SELECT id, status, attempt_count, dead_lettered_at 
  FROM notification_events 
  WHERE status = 'dead_letter';
"
```

## 4. Admin Retry Endpoint Test

```bash
# Retry a dead_letter notification
curl -X POST "http://localhost:3000/api/notifications/DEAD_LETTER_ID/retry" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{"resetAttempts": true}'

# Expected: { "success": true, "event": {...} }
```

## 5. Stuck Job Recovery Test

```bash
# Manually create a stuck processing job
psql $POSTGRES_URL -c "
  UPDATE notification_events 
  SET status = 'processing', 
      locked_at = NOW() - INTERVAL '15 minutes',
      locked_by = 'test-worker:999'
  WHERE id = 'YOUR_EVENT_ID';
"

# Run retries cron to unlock
curl "http://localhost:3000/api/cron/retries" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Verify status changed back to 'queued'
psql $POSTGRES_URL -c "
  SELECT id, status, locked_at, locked_by 
  FROM notification_events 
  WHERE id = 'YOUR_EVENT_ID';
"
```

## 6. Structured Logging Verification

Check logs output JSON format:

```bash
# Run any cron and check logs
curl "http://localhost:3000/api/cron/ssl-scan" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Logs should show:
# {"job":"cron_ssl_scan","action":"start","domainsFound":5,"timestamp":"2026-04-07T..."}
# {"job":"cron_ssl_scan","action":"complete","checked":5,"timestamp":"2026-04-07T..."}
```

## 7. Vercel Cron Config Test

```bash
# Verify vercel.json syntax
npx vercel --version

# Deploy and check cron schedules in Vercel dashboard
```

## Expected Results

| Test | Expected Result |
|------|-----------------|
| Migration | All columns added successfully |
| Job Claiming | No duplicate processing, row locked properly |
| Retry Logic | Exponential backoff, attempt_count increments |
| Dead Letter | After 8 attempts, status = 'dead_letter' |
| Admin Retry | POST /retry resets to 'queued' |
| Stuck Recovery | Old 'processing' jobs become 'queued' |
| Logs | All JSON formatted with job/action/timestamp |
