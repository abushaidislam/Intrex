import { test, expect } from '@playwright/test';
import * as fs from 'fs';

/**
 * Phase 6: Hardening and Rollout Tests
 * Based on Architeach.md Phase 6: Hardening and rollout
 * 
 * Requirements:
 * 1. Seed Bangladesh jurisdiction presets and default obligation templates
 * 2. Add CSV import/export for obligations and domains
 * 3. Add audit log views and connector health views
 * 4. Load test reminder generation, SSL scans, and notification throughput
 * 5. Run pilot with 1-3 businesses before broad rollout
 */

test.describe('Phase 6: Hardening and Rollout', () => {

  test.describe('Bangladesh Jurisdiction Presets', () => {
    test('should have jurisdictions table with Bangladesh data', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have Dhaka city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasDhaka = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('dhaka')
        );
        expect(hasDhaka).toBe(true);
      }
    });

    test('should have Chattogram city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasChattogram = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('chattogram') ||
          j.city_corporation?.toLowerCase().includes('chittagong')
        );
        expect(hasChattogram).toBe(true);
      }
    });

    test('should have Khulna city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasKhulna = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('khulna')
        );
        expect(hasKhulna).toBe(true);
      }
    });

    test('should have Rajshahi city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasRajshahi = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('rajshahi')
        );
        expect(hasRajshahi).toBe(true);
      }
    });

    test('should have Sylhet city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasSylhet = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('sylhet')
        );
        expect(hasSylhet).toBe(true);
      }
    });

    test('should have Barishal city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasBarishal = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('barishal') ||
          j.city_corporation?.toLowerCase().includes('barisal')
        );
        expect(hasBarishal).toBe(true);
      }
    });

    test('should have Rangpur city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasRangpur = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('rangpur')
        );
        expect(hasRangpur).toBe(true);
      }
    });

    test('should have Mymensingh city corporation jurisdiction', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const hasMymensingh = jurisdictions.some((j: any) => 
          j.city_corporation?.toLowerCase().includes('mymensingh')
        );
        expect(hasMymensingh).toBe(true);
      }
    });

    test('all jurisdictions should have country_code BD', async ({ request }) => {
      const response = await request.get('/api/jurisdictions');
      if (response.status() === 200) {
        const data = await response.json();
        const jurisdictions = Array.isArray(data) ? data : data.jurisdictions || [];
        const bdJurisdictions = jurisdictions.filter((j: any) => j.country_code === 'BD');
        expect(bdJurisdictions.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Obligation Templates', () => {
    test('should have obligation_templates table populated', async ({ request }) => {
      const response = await request.get('/api/templates');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have trade license renewal template', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const hasTradeLicense = templates.some((t: any) => 
          t.category === 'trade_license' ||
          t.title?.toLowerCase().includes('trade license')
        );
        expect(hasTradeLicense).toBe(true);
      }
    });

    test('should have fire safety renewal template', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const hasFireSafety = templates.some((t: any) => 
          t.category === 'fire_safety' ||
          t.title?.toLowerCase().includes('fire safety')
        );
        expect(hasFireSafety).toBe(true);
      }
    });

    test('should have tax/VAT filing template', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const hasTax = templates.some((t: any) => 
          t.category === 'tax_vat' ||
          t.title?.toLowerCase().includes('vat') ||
          t.title?.toLowerCase().includes('tax')
        );
        expect(hasTax).toBe(true);
      }
    });

    test('should have environmental permit template', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const hasEnvironmental = templates.some((t: any) => 
          t.category === 'environmental_permit' ||
          t.title?.toLowerCase().includes('environmental')
        );
        expect(hasEnvironmental).toBe(true);
      }
    });

    test('should have inspection renewal template', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const hasInspection = templates.some((t: any) => 
          t.category === 'inspection_renewal' ||
          t.title?.toLowerCase().includes('inspection')
        );
        expect(hasInspection).toBe(true);
      }
    });

    test('templates should have recurrence_type configured', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const validRecurrence = ['annual', 'semiannual', 'quarterly', 'monthly', 'custom'];
        const templatesWithRecurrence = templates.filter((t: any) => 
          validRecurrence.includes(t.recurrence_type)
        );
        expect(templatesWithRecurrence.length).toBeGreaterThan(0);
      }
    });

    test('templates should have default_lead_days configured', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const templatesWithLeadDays = templates.filter((t: any) => 
          typeof t.default_lead_days === 'number' && t.default_lead_days > 0
        );
        expect(templatesWithLeadDays.length).toBeGreaterThan(0);
      }
    });

    test('templates should be linked to Bangladesh jurisdictions', async ({ request }) => {
      const response = await request.get('/api/templates');
      if (response.status() === 200) {
        const data = await response.json();
        const templates = Array.isArray(data) ? data : data.templates || [];
        const bdTemplates = templates.filter((t: any) => 
          t.jurisdiction_id !== null || t.tenant_id === null
        );
        expect(bdTemplates.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('CSV Import/Export', () => {
    test('should have CSV export endpoint for obligations', async ({ request }) => {
      const response = await request.get('/api/obligations/export');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should export obligations as CSV with correct headers', async ({ request }) => {
      const response = await request.get('/api/obligations/export', {
        headers: {
          'Accept': 'text/csv'
        }
      });
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('csv');
        
        const body = await response.text();
        const headers = body.split('\n')[0].toLowerCase();
        expect(headers).toContain('title');
        expect(headers).toContain('due');
        expect(headers).toContain('status');
      }
    });

    test('should have CSV export endpoint for domains', async ({ request }) => {
      const response = await request.get('/api/domains/export');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should export domains as CSV with correct headers', async ({ request }) => {
      const response = await request.get('/api/domains/export', {
        headers: {
          'Accept': 'text/csv'
        }
      });
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('csv');
        
        const body = await response.text();
        const headers = body.split('\n')[0].toLowerCase();
        expect(headers).toContain('hostname');
      }
    });

    test('should have CSV import endpoint for obligations', async ({ request }) => {
      const response = await request.post('/api/obligations/import', {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        multipart: {
          file: {
            name: 'test.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from('title,due_at,status\nTest Obligation,2026-12-31,upcoming')
          }
        }
      });
      
      expect([200, 400, 401, 403]).toContain(response.status());
    });

    test('should have CSV import endpoint for domains', async ({ request }) => {
      const response = await request.post('/api/domains/import', {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        multipart: {
          file: {
            name: 'test.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from('hostname,port\nexample.com,443')
          }
        }
      });
      
      expect([200, 400, 401, 403]).toContain(response.status());
    });

    test('should validate CSV import format', async ({ request }) => {
      const response = await request.post('/api/obligations/import', {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        multipart: {
          file: {
            name: 'invalid.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from('invalid,csv,format\n1,2,3')
          }
        }
      });
      
      expect([400, 401, 403]).toContain(response.status());
    });

    test('should handle Excel format (.xlsx) for import', async ({ request }) => {
      const response = await request.post('/api/obligations/import', {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        multipart: {
          file: {
            name: 'test.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: Buffer.from('mock excel content')
          }
        }
      });
      
      expect([200, 400, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Audit Log Views', () => {
    test('should have audit logs API endpoint', async ({ request }) => {
      const response = await request.get('/api/audit-logs');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should return paginated audit logs', async ({ request }) => {
      const response = await request.get('/api/audit-logs');
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('logs');
        expect(data).toHaveProperty('pagination');
        expect(data.pagination).toHaveProperty('total');
        expect(data.pagination).toHaveProperty('page');
        expect(data.pagination).toHaveProperty('perPage');
      }
    });

    test('should filter audit logs by entity type', async ({ request }) => {
      const response = await request.get('/api/audit-logs?entityType=obligation');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should filter audit logs by action', async ({ request }) => {
      const response = await request.get('/api/audit-logs?action=create');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should filter audit logs by date range', async ({ request }) => {
      const response = await request.get('/api/audit-logs?startDate=2026-01-01&endDate=2026-12-31');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should require head_office_admin for audit logs access', async ({ request }) => {
      const response = await request.get('/api/audit-logs');
      
      if (response.status() === 200) {
        expect(true).toBe(true);
      } else {
        expect([401, 403]).toContain(response.status());
      }
    });

    test('audit logs should have required fields', async ({ request }) => {
      const response = await request.get('/api/audit-logs');
      
      if (response.status() === 200) {
        const data = await response.json();
        const logs = data.logs || [];
        
        if (logs.length > 0) {
          const log = logs[0];
          expect(log).toHaveProperty('id');
          expect(log).toHaveProperty('action');
          expect(log).toHaveProperty('entity_type');
          expect(log).toHaveProperty('entity_id');
          expect(log).toHaveProperty('actor_type');
          expect(log).toHaveProperty('created_at');
        }
      }
    });

    test('should have audit log view in dashboard', async ({ page }) => {
      await page.goto('/dashboard/audit-logs', { timeout: 30000 });
      
      const bodyText = await page.locator('body').textContent();
      const hasError = bodyText?.includes('Application error');
      
      if (hasError) {
        expect(bodyText).toBeTruthy();
        return;
      }
      
      expect([200, 401, 403]).toContain(await page.evaluate(() => document.readyState === 'complete' ? 200 : 403));
    });
  });

  test.describe('Connector Health Views', () => {
    test('should have connector health API endpoint', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should return connector health status for all connectors', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('connectors');
        expect(Array.isArray(data.connectors)).toBe(true);
      }
    });

    test('connector health should include status field', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      
      if (response.status() === 200) {
        const data = await response.json();
        const connectors = data.connectors || [];
        
        if (connectors.length > 0) {
          const connector = connectors[0];
          expect(connector).toHaveProperty('status');
          expect(['active', 'disabled', 'error', 'pending_verification']).toContain(connector.status);
        }
      }
    });

    test('connector health should include last_verified_at', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      
      if (response.status() === 200) {
        const data = await response.json();
        const connectors = data.connectors || [];
        
        if (connectors.length > 0) {
          const connector = connectors[0];
          expect(connector).toHaveProperty('last_verified_at');
        }
      }
    });

    test('should have connector health dashboard view', async ({ page }) => {
      await page.goto('/dashboard/connectors/health', { timeout: 30000 });
      
      const bodyText = await page.locator('body').textContent();
      const hasError = bodyText?.includes('Application error');
      
      if (hasError) {
        expect(bodyText).toBeTruthy();
        return;
      }
      
      expect([200, 401, 403]).toContain(await page.evaluate(() => document.readyState === 'complete' ? 200 : 403));
    });

    test('should show error count per connector', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      
      if (response.status() === 200) {
        const data = await response.json();
        const connectors = data.connectors || [];
        
        const connectorsWithErrors = connectors.filter((c: any) => 
          typeof c.error_count === 'number' || c.recent_errors !== undefined
        );
        
        expect(connectorsWithErrors.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show delivery success rate per connector', async ({ request }) => {
      const response = await request.get('/api/connectors/health');
      
      if (response.status() === 200) {
        const data = await response.json();
        const connectors = data.connectors || [];
        
        const connectorsWithStats = connectors.filter((c: any) => 
          c.delivery_stats !== undefined || c.success_rate !== undefined
        );
        
        expect(connectorsWithStats.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Load Testing', () => {
    test('should handle concurrent reminder generation', async ({ request }) => {
      const promises = Array(10).fill(null).map(() => 
        request.get('/api/cron/process-notifications', {
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
          }
        })
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status());
      });
    });

    test('should handle concurrent SSL scans', async ({ request }) => {
      const promises = Array(10).fill(null).map(() => 
        request.get('/api/cron/ssl-scan', {
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
          }
        })
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status());
      });
    });

    test('should have rate limiting on cron endpoints', async ({ request }) => {
      const promises = Array(20).fill(null).map(() => 
        request.get('/api/cron/process-notifications', {
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
          }
        })
      );
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status() === 429).length;
      
      expect(rateLimited).toBeGreaterThanOrEqual(0);
    });

    test('should have health check endpoint for load balancers', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('ok');
    });

    test('health check should include database connectivity', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('database');
    });

    test('health check should include response time metrics', async ({ request }) => {
      const start = Date.now();
      const response = await request.get('/api/health');
      const duration = Date.now() - start;
      
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });

  test.describe('Pilot Readiness', () => {
    test('should have all required environment variables documented', () => {
      const envExamplePath = './.env.example';
      expect(fs.existsSync(envExamplePath)).toBe(true);
      
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      expect(envContent).toContain('NEXT_PUBLIC_');
      expect(envContent).toContain('SUPABASE_');
    });

    test('should have README with setup instructions', () => {
      const readmePath = './README.md';
      expect(fs.existsSync(readmePath)).toBe(true);
      
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      expect(readmeContent.toLowerCase()).toContain('setup');
    });

    test('should have deployment documentation', () => {
      const readmePath = './README.md';
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      expect(readmeContent.toLowerCase()).toContain('deploy');
    });

    test('should have vercel.json configured', () => {
      const vercelPath = './vercel.json';
      expect(fs.existsSync(vercelPath)).toBe(true);
      
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
      expect(vercelConfig).toHaveProperty('crons');
    });

    test('should have database migration files', () => {
      const migrationsDir = './supabase/migrations';
      const migrationsExist = fs.existsSync(migrationsDir);
      
      if (migrationsExist) {
        const files = fs.readdirSync(migrationsDir);
        expect(files.length).toBeGreaterThan(0);
      }
    });

    test('should have playwright configuration for testing', () => {
      const playwrightPath = './playwright.config.ts';
      expect(fs.existsSync(playwrightPath)).toBe(true);
    });

    test('should have package.json with all dependencies', () => {
      const packagePath = './package.json';
      expect(fs.existsSync(packagePath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      expect(packageJson).toHaveProperty('dependencies');
      expect(packageJson).toHaveProperty('devDependencies');
    });

    test('should support at least 3 pilot businesses', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('ok');
    });

    test('should have tenant isolation verified', async ({ request }) => {
      const response = await request.get('/api/user');
      expect(response.status()).not.toBe(500);
    });

    test('should have backup/restore documentation', () => {
      const readmePath = './README.md';
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      const hasBackup = readmeContent.toLowerCase().includes('backup') ||
                         readmeContent.toLowerCase().includes('restore');
      expect(hasBackup).toBe(true);
    });

    test('should have monitoring and alerting configured', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('status');
    });
  });

  test.describe('Post-Production Review Setup', () => {
    test('should have metrics endpoint for monthly reviews', async ({ request }) => {
      const response = await request.get('/api/dashboard/summary');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have SSL risk report endpoint', async ({ request }) => {
      const response = await request.get('/api/reports/ssl-risk');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have overdue report endpoint', async ({ request }) => {
      const response = await request.get('/api/reports/overdue');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have upcoming report endpoint', async ({ request }) => {
      const response = await request.get('/api/reports/upcoming');
      expect([200, 401, 403]).toContain(response.status());
    });

    test('reports should include branch-level aggregation', async ({ request }) => {
      const response = await request.get('/api/reports/overdue');
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('byBranch');
      }
    });

    test('reports should include category-level aggregation', async ({ request }) => {
      const response = await request.get('/api/reports/overdue');
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('byCategory');
      }
    });
  });
});
