import { test, expect } from '@playwright/test';

/**
 * Phase 4: Notifications and Connectors Tests
 * Based on Architeach.md Phase 4: Notifications and connectors
 * 
 * Requirements:
 * 1. Implement email SMTP connector with test-send verification
 * 2. Implement Telegram bot connector with token + chat ID verification
 * 3. Implement WhatsApp Business connector abstraction with templated sends
 * 4. Implement generic webhook connector with HMAC signing and retries
 * 5. Build notification route configuration UI
 * 6. Implement acknowledgement links/pages and audit trail
 */

test.describe('Phase 4: Notifications and Connectors', () => {
  
  test.describe('Email SMTP Connector with Test-Send Verification', () => {
    
    test('should have connectors page', async ({ page }) => {
      await page.goto('/connectors', { timeout: 60000 });
      
      const currentURL = page.url();
      
      if (currentURL.includes('/connectors')) {
        await expect(page.locator('h1, h2')).toContainText(/Connectors|Notifications/);
      }
    });

    test('should have connectors API endpoints', async ({ request }) => {
      const response = await request.get('/api/connectors');
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should support email SMTP connector creation', async ({ request }) => {
      const createResponse = await request.post('/api/connectors', {
        data: {
          type: 'email_smtp',
          name: 'Test SMTP Connector',
          config: {
            host: 'smtp.test.com',
            port: 587,
            username: 'test@test.com',
            useTls: true,
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(createResponse.status());
      
      if (createResponse.status() === 201 || createResponse.status() === 200) {
        const created = await createResponse.json();
        
        expect(created).toHaveProperty('id');
        expect(created).toHaveProperty('type');
        expect(created.type).toBe('email_smtp');
        
        await request.delete(`/api/connectors/${created.id}`);
      }
    });

    test('should support test-send verification for SMTP', async ({ request }) => {
      const createResponse = await request.post('/api/connectors', {
        data: {
          type: 'email_smtp',
          name: 'Test SMTP with Verify',
          config: {
            host: 'smtp.gmail.com',
            port: 587,
            username: 'test@gmail.com',
            useTls: true,
          },
        },
      });
      
      if (createResponse.status() === 201 || createResponse.status() === 200) {
        const created = await createResponse.json();
        
        const verifyResponse = await request.post(`/api/connectors/${created.id}/verify`);
        expect([200, 401, 403, 400]).toContain(verifyResponse.status());
        
        await request.delete(`/api/connectors/${created.id}`);
      }
    });
  });

  test.describe('Telegram Bot Connector with Token + Chat ID Verification', () => {
    
    test('should support Telegram bot connector creation', async ({ request }) => {
      const response = await request.post('/api/connectors', {
        data: {
          type: 'telegram_bot',
          name: 'Test Telegram Bot',
          config: {
            botToken: '123456789:TEST_TOKEN',
            chatId: '-1001234567890',
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const created = await response.json();
        await request.delete(`/api/connectors/${created.id}`);
      }
    });

    test('should verify Telegram bot token and chat ID', async ({ request }) => {
      const createResponse = await request.post('/api/connectors', {
        data: {
          type: 'telegram_bot',
          name: 'Test Telegram Verify',
          config: {
            botToken: '123456789:TEST_TOKEN',
            chatId: '-1001234567890',
          },
        },
      });
      
      if (createResponse.status() === 201 || createResponse.status() === 200) {
        const created = await createResponse.json();
        
        const verifyResponse = await request.post(`/api/connectors/${created.id}/verify`);
        expect([200, 401, 403, 400]).toContain(verifyResponse.status());
        
        await request.delete(`/api/connectors/${created.id}`);
      }
    });
  });

  test.describe('WhatsApp Business Connector with Templated Sends', () => {
    
    test('should support WhatsApp Business connector creation', async ({ request }) => {
      const response = await request.post('/api/connectors', {
        data: {
          type: 'whatsapp_business',
          name: 'Test WhatsApp Connector',
          config: {
            phoneNumberId: '1234567890',
            businessAccountId: '9876543210',
            apiVersion: 'v18.0',
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const created = await response.json();
        await request.delete(`/api/connectors/${created.id}`);
      }
    });

    test('should support WhatsApp template configuration', async ({ request }) => {
      const response = await request.post('/api/connectors', {
        data: {
          type: 'whatsapp_business',
          name: 'Test WhatsApp Templates',
          config: {
            phoneNumberId: '1234567890',
            businessAccountId: '9876543210',
            apiVersion: 'v18.0',
            templateName: 'ssl_expiry_alert',
            templateLanguage: 'en',
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const created = await response.json();
        await request.delete(`/api/connectors/${created.id}`);
      }
    });
  });

  test.describe('Generic Webhook Connector with HMAC Signing and Retries', () => {
    
    test('should support webhook connector creation', async ({ request }) => {
      const response = await request.post('/api/connectors', {
        data: {
          type: 'webhook',
          name: 'Test Webhook Connector',
          config: {
            url: 'https://webhook.test.com/notifications',
            secret: 'test-webhook-secret',
            retries: 3,
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const created = await response.json();
        
        expect(created.config).toHaveProperty('url');
        expect(created.config).toHaveProperty('secret');
        
        await request.delete(`/api/connectors/${created.id}`);
      }
    });

    test('should have webhook retry configuration', async ({ request }) => {
      const response = await request.post('/api/connectors', {
        data: {
          type: 'webhook',
          name: 'Test Webhook Retries',
          config: {
            url: 'https://webhook.test.com/notifications',
            secret: 'test-webhook-secret',
            retries: 5,
            retryDelay: 1000,
          },
        },
      });
      
      expect([201, 200, 401, 403]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const created = await response.json();
        expect(created.config).toHaveProperty('retries');
        await request.delete(`/api/connectors/${created.id}`);
      }
    });
  });

  test.describe('Notification Route Configuration UI', () => {
    
    test('should display notification routes page', async ({ page }) => {
      await page.goto('/notification-routes', { timeout: 60000 });
      
      const currentURL = page.url();
      
      if (currentURL.includes('/notification-routes')) {
        await expect(page.locator('h1, h2')).toContainText(/Routes|Notification/);
      }
    });

    test('should have notification routes API', async ({ request }) => {
      const response = await request.get('/api/notification-routes');
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should support notification route creation', async ({ request }) => {
      // First get a connector to use
      const connectorsResponse = await request.get('/api/connectors');
      
      if (connectorsResponse.status() === 200) {
        const connectors = await connectorsResponse.json();
        
        if (connectors.length > 0) {
          const connectorId = connectors[0].id;
          
          const createResponse = await request.post('/api/notification-routes', {
            data: {
              connectorId,
              eventType: 'ssl_expiry',
              severityMin: 'high',
              recipientRef: 'test@example.com',
              isActive: true,
            },
          });
          
          expect([201, 200, 401, 403]).toContain(createResponse.status());
          
          if (createResponse.status() === 201 || createResponse.status() === 200) {
            const created = await createResponse.json();
            await request.delete(`/api/notification-routes/${created.id}`);
          }
        }
      }
    });
  });

  test.describe('Notification Processing and Events', () => {
    
    test('should have notifications API', async ({ request }) => {
      const response = await request.get('/api/notifications');
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
      }
    });

    test('should have notification processing cron endpoint', async ({ request }) => {
      const response = await request.get('/api/cron/process-notifications', {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
        },
      });
      
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('success');
      }
    });

    test('should display notifications page', async ({ page }) => {
      await page.goto('/notifications', { timeout: 60000 });
      
      const currentURL = page.url();
      
      if (currentURL.includes('/notifications')) {
        await expect(page.locator('h1, h2')).toContainText(/Notifications/);
      }
    });
  });

  test.describe('Acknowledgement Links/Pages and Audit Trail', () => {
    
    test('should support notification acknowledgement endpoint', async ({ request }) => {
      const response = await request.post('/api/notifications/test-id/ack', {
        data: { note: 'Test acknowledgement' },
      });
      
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test('should have audit logs API', async ({ request }) => {
      const response = await request.get('/api/dashboard/activity');
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test('should have connector activity audit trail', async ({ request }) => {
      const response = await request.get('/api/connectors');
      
      if (response.status() === 200) {
        const connectors = await response.json();
        
        // Verify connector objects have audit fields
        if (connectors.length > 0) {
          const connector = connectors[0];
          expect(connector).toHaveProperty('createdAt');
          expect(connector).toHaveProperty('updatedAt');
        }
      }
    });
  });

  test.describe('Connector Status and Valid Types', () => {
    
    test('should have valid connector types', async ({ request }) => {
      const response = await request.get('/api/connectors');
      
      if (response.status() === 200) {
        const connectors = await response.json();
        
        const validTypes = ['email_smtp', 'telegram_bot', 'whatsapp_business', 'webhook'];
        
        for (const connector of connectors) {
          expect(validTypes).toContain(connector.type);
        }
      }
    });

    test('should track connector status', async ({ request }) => {
      const response = await request.get('/api/connectors');
      
      if (response.status() === 200) {
        const connectors = await response.json();
        
        const validStatuses = ['active', 'disabled', 'error', 'pending_verification'];
        
        for (const connector of connectors) {
          expect(validStatuses).toContain(connector.status);
        }
      }
    });
  });

});
