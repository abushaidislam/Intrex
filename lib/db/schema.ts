import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const appRoleEnum = pgEnum('app_role', [
  'head_office_admin',
  'branch_manager',
  'operator',
]);

export const obligationCategoryEnum = pgEnum('obligation_category', [
  'trade_license',
  'fire_safety',
  'tax_vat',
  'environmental_permit',
  'inspection_renewal',
]);

export const obligationStatusEnum = pgEnum('obligation_status', [
  'upcoming',
  'due_today',
  'overdue',
  'completed',
  'waived',
]);

export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

export const connectorTypeEnum = pgEnum('connector_type', [
  'email_smtp',
  'telegram_bot',
  'whatsapp_business',
  'webhook',
]);

export const connectorStatusEnum = pgEnum('connector_status', [
  'active',
  'disabled',
  'error',
  'pending_verification',
]);

export const sslCheckStatusEnum = pgEnum('ssl_check_status', [
  'ok',
  'warning',
  'expired',
  'handshake_failed',
  'dns_failed',
  'timeout',
  'hostname_mismatch',
]);

export const notificationEventTypeEnum = pgEnum('notification_event_type', [
  'obligation_due',
  'obligation_overdue',
  'ssl_expiry',
  'ssl_failure',
  'digest',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'queued',
  'processing',
  'sent',
  'failed',
  'cancelled',
  'acked',
  'dead_letter',
]);

// Tenants (Businesses)
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  defaultTimezone: varchar('default_timezone', { length: 64 }).notNull().default('Asia/Dhaka'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeProductId: varchar('stripe_product_id', { length: 255 }),
  planName: varchar('plan_name', { length: 100 }),
  subscriptionStatus: varchar('subscription_status', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Users (modified from original)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: appRoleEnum('role').notNull().default('operator'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Branches under tenants
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  addressLine: text('address_line'),
  cityCorporation: varchar('city_corporation', { length: 120 }),
  district: varchar('district', { length: 120 }),
  region: varchar('region', { length: 120 }),
  countryCode: varchar('country_code', { length: 2 }).notNull().default('BD'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Jurisdictions for compliance rules
export const jurisdictions = pgTable('jurisdictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
  region: varchar('region', { length: 120 }),
  district: varchar('district', { length: 120 }),
  cityCorporation: varchar('city_corporation', { length: 120 }),
  zone: varchar('zone', { length: 120 }),
  label: varchar('label', { length: 250 }).notNull(),
});

// Obligation Templates
export const obligationTemplates = pgTable('obligation_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }), // null = system default
  jurisdictionId: uuid('jurisdiction_id').references(() => jurisdictions.id, { onDelete: 'set null' }),
  category: obligationCategoryEnum('category').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  recurrenceType: varchar('recurrence_type', { length: 20 }), // annual, semiannual, quarterly, monthly, custom
  defaultLeadDays: integer('default_lead_days').notNull().default(30),
  defaultGraceDays: integer('default_grace_days').notNull().default(0),
  severity: severityEnum('severity').notNull().default('medium'),
  isActive: boolean('is_active').notNull().default(true),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Obligation Instances
export const obligationInstances = pgTable('obligation_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branches.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => obligationTemplates.id, { onDelete: 'set null' }),
  category: obligationCategoryEnum('category').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  ownerUserId: integer('owner_user_id').references(() => users.id, { onDelete: 'set null' }),
  status: obligationStatusEnum('status').notNull().default('upcoming'),
  severity: severityEnum('severity').notNull().default('medium'),
  dueAt: timestamp('due_at').notNull(),
  graceUntil: timestamp('grace_until'),
  completedAt: timestamp('completed_at'),
  recurrenceRule: varchar('recurrence_rule', { length: 120 }),
  source: varchar('source', { length: 20 }).notNull().default('manual'), // template, manual, import, api
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Obligation Documents
export const obligationDocuments = pgTable('obligation_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  obligationInstanceId: uuid('obligation_instance_id')
    .notNull()
    .references(() => obligationInstances.id, { onDelete: 'cascade' }),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  uploadedByUserId: integer('uploaded_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Domains for SSL monitoring
export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  hostname: varchar('hostname', { length: 255 }).notNull(),
  port: integer('port').notNull().default(443),
  sniHostname: varchar('sni_hostname', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  lastCheckedAt: timestamp('last_checked_at'),
  nextCheckAt: timestamp('next_check_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// SSL Check Results
export const sslCheckResults = pgTable('ssl_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  domainId: uuid('domain_id')
    .notNull()
    .references(() => domains.id, { onDelete: 'cascade' }),
  checkedAt: timestamp('checked_at').notNull().defaultNow(),
  checkStatus: sslCheckStatusEnum('check_status').notNull(),
  validFrom: timestamp('valid_from'),
  validTo: timestamp('valid_to'),
  issuerCn: varchar('issuer_cn', { length: 255 }),
  subjectCn: varchar('subject_cn', { length: 255 }),
  sanJson: jsonb('san_json'),
  daysRemaining: integer('days_remaining'),
  fingerprintSha256: varchar('fingerprint_sha256', { length: 128 }),
  errorMessage: text('error_message'),
  rawJson: jsonb('raw_json'),
});

// Notification Connectors
export const connectors = pgTable('connectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  type: connectorTypeEnum('type').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  status: connectorStatusEnum('status').notNull().default('pending_verification'),
  configEncryptedJson: text('config_encrypted_json').notNull(),
  secretEncryptedJson: text('secret_encrypted_json'),
  lastVerifiedAt: timestamp('last_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notification Routes
export const notificationRoutes = pgTable('notification_routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id')
    .notNull()
    .references(() => connectors.id, { onDelete: 'cascade' }),
  eventType: notificationEventTypeEnum('event_type').notNull(),
  severityMin: severityEnum('severity_min').notNull().default('low'),
  recipientRef: varchar('recipient_ref', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notification Events
export const notificationEvents = pgTable('notification_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  eventType: notificationEventTypeEnum('event_type').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // obligation, domain, system
  entityId: uuid('entity_id').notNull(),
  fingerprint: varchar('fingerprint', { length: 200 }).notNull().unique(),
  payloadJson: jsonb('payload_json').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  attemptCount: integer('attempt_count').notNull().default(0),
  nextAttemptAt: timestamp('next_attempt_at'),
  lockedAt: timestamp('locked_at'),
  lockedBy: varchar('locked_by', { length: 120 }),
  lastError: text('last_error'),
  deadLetteredAt: timestamp('dead_lettered_at'),
  status: notificationStatusEnum('status').notNull().default('queued'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notification Deliveries
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationEventId: uuid('notification_event_id')
    .notNull()
    .references(() => notificationEvents.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id')
    .notNull()
    .references(() => connectors.id, { onDelete: 'cascade' }),
  attemptNo: integer('attempt_no').notNull().default(1),
  deliveryStatus: varchar('delivery_status', { length: 50 }).notNull().default('pending'),
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  responseCode: varchar('response_code', { length: 50 }),
  responseBody: text('response_body'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Acknowledgements
export const acknowledgements = pgTable('acknowledgements', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationEventId: uuid('notification_event_id')
    .notNull()
    .references(() => notificationEvents.id, { onDelete: 'cascade' }),
  ackByUserId: integer('ack_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  ackNote: text('ack_note'),
  ackAt: timestamp('ack_at').notNull().defaultNow(),
});

// SSL Notification Recipients (simplified - just email addresses)
export const sslNotificationRecipients = pgTable('ssl_notification_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  notifyBeforeDays: integer('notify_before_days').notNull().default(30), // How many days before expiry to notify
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Email Verification Codes (for sign-in OTP)
export const emailVerificationCodes = pgTable('email_verification_codes', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull().default('signin'), // signin, signup, password_reset
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activity Logs (modified)
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  actorType: varchar('actor_type', { length: 20 }).notNull().default('user'), // user, system, connector
  action: varchar('action', { length: 120 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }),
  entityId: uuid('entity_id'),
  beforeJson: jsonb('before_json'),
  afterJson: jsonb('after_json'),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  branches: many(branches),
  obligationTemplates: many(obligationTemplates),
  obligationInstances: many(obligationInstances),
  domains: many(domains),
  connectors: many(connectors),
  notificationEvents: many(notificationEvents),
  activityLogs: many(activityLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  obligationInstances: many(obligationInstances),
  acknowledgements: many(acknowledgements),
  activityLogs: many(activityLogs),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [branches.tenantId],
    references: [tenants.id],
  }),
  obligationInstances: many(obligationInstances),
  domains: many(domains),
  notificationRoutes: many(notificationRoutes),
}));

export const jurisdictionsRelations = relations(jurisdictions, ({ many }) => ({
  obligationTemplates: many(obligationTemplates),
}));

export const obligationTemplatesRelations = relations(obligationTemplates, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [obligationTemplates.tenantId],
    references: [tenants.id],
  }),
  jurisdiction: one(jurisdictions, {
    fields: [obligationTemplates.jurisdictionId],
    references: [jurisdictions.id],
  }),
  obligationInstances: many(obligationInstances),
}));

export const obligationInstancesRelations = relations(obligationInstances, ({ one }) => ({
  tenant: one(tenants, {
    fields: [obligationInstances.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [obligationInstances.branchId],
    references: [branches.id],
  }),
  template: one(obligationTemplates, {
    fields: [obligationInstances.templateId],
    references: [obligationTemplates.id],
  }),
  owner: one(users, {
    fields: [obligationInstances.ownerUserId],
    references: [users.id],
  }),
}));

export const domainsRelations = relations(domains, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [domains.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [domains.branchId],
    references: [branches.id],
  }),
  sslCheckResults: many(sslCheckResults),
}));

export const sslCheckResultsRelations = relations(sslCheckResults, ({ one }) => ({
  domain: one(domains, {
    fields: [sslCheckResults.domainId],
    references: [domains.id],
  }),
}));

export const connectorsRelations = relations(connectors, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [connectors.tenantId],
    references: [tenants.id],
  }),
  notificationRoutes: many(notificationRoutes),
  notificationDeliveries: many(notificationDeliveries),
}));

export const notificationRoutesRelations = relations(notificationRoutes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notificationRoutes.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [notificationRoutes.branchId],
    references: [branches.id],
  }),
  connector: one(connectors, {
    fields: [notificationRoutes.connectorId],
    references: [connectors.id],
  }),
}));

export const notificationEventsRelations = relations(notificationEvents, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [notificationEvents.tenantId],
    references: [tenants.id],
  }),
  deliveries: many(notificationDeliveries),
  acknowledgement: one(acknowledgements),
}));

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({ one }) => ({
  notificationEvent: one(notificationEvents, {
    fields: [notificationDeliveries.notificationEventId],
    references: [notificationEvents.id],
  }),
  connector: one(connectors, {
    fields: [notificationDeliveries.connectorId],
    references: [connectors.id],
  }),
}));

export const acknowledgementsRelations = relations(acknowledgements, ({ one }) => ({
  notificationEvent: one(notificationEvents, {
    fields: [acknowledgements.notificationEventId],
    references: [notificationEvents.id],
  }),
  user: one(users, {
    fields: [acknowledgements.ackByUserId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activityLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// SSL Notification Recipients Relations
export const sslNotificationRecipientsRelations = relations(sslNotificationRecipients, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sslNotificationRecipients.tenantId],
    references: [tenants.id],
  }),
}));

// Email Verification Codes Relations
export const emailVerificationCodesRelations = relations(emailVerificationCodes, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationCodes.userId],
    references: [users.id],
  }),
}));

// Types
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type NewJurisdiction = typeof jurisdictions.$inferInsert;

export type ObligationTemplate = typeof obligationTemplates.$inferSelect;
export type NewObligationTemplate = typeof obligationTemplates.$inferInsert;

export type ObligationInstance = typeof obligationInstances.$inferSelect;
export type NewObligationInstance = typeof obligationInstances.$inferInsert;

export type ObligationDocument = typeof obligationDocuments.$inferSelect;
export type NewObligationDocument = typeof obligationDocuments.$inferInsert;

export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;

export type SslCheckResult = typeof sslCheckResults.$inferSelect;
export type NewSslCheckResult = typeof sslCheckResults.$inferInsert;

export type Connector = typeof connectors.$inferSelect;
export type NewConnector = typeof connectors.$inferInsert;

export type NotificationRoute = typeof notificationRoutes.$inferSelect;
export type NewNotificationRoute = typeof notificationRoutes.$inferInsert;

export type NotificationEvent = typeof notificationEvents.$inferSelect;
export type NewNotificationEvent = typeof notificationEvents.$inferInsert;

export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type NewNotificationDelivery = typeof notificationDeliveries.$inferInsert;

export type Acknowledgement = typeof acknowledgements.$inferSelect;
export type NewAcknowledgement = typeof acknowledgements.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type SSLNotificationRecipient = typeof sslNotificationRecipients.$inferSelect;
export type NewSSLNotificationRecipient = typeof sslNotificationRecipients.$inferInsert;

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TENANT = 'CREATE_TENANT',
  CREATE_BRANCH = 'CREATE_BRANCH',
  UPDATE_BRANCH = 'UPDATE_BRANCH',
  DELETE_BRANCH = 'DELETE_BRANCH',
  CREATE_OBLIGATION = 'CREATE_OBLIGATION',
  UPDATE_OBLIGATION = 'UPDATE_OBLIGATION',
  COMPLETE_OBLIGATION = 'COMPLETE_OBLIGATION',
  CREATE_DOMAIN = 'CREATE_DOMAIN',
  DELETE_DOMAIN = 'DELETE_DOMAIN',
  CREATE_CONNECTOR = 'CREATE_CONNECTOR',
  UPDATE_CONNECTOR = 'UPDATE_CONNECTOR',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  ACKNOWLEDGE_NOTIFICATION = 'ACKNOWLEDGE_NOTIFICATION',
}
