import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { eq } from 'drizzle-orm';
import { appRoleEnum, users, tenants } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { seedBangladeshData } from './seed-bangladesh';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  // SECURITY: Require environment variables for seed credentials
  // Never hardcode credentials - this prevents accidental production exposure
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  
  if (!email || !password) {
    console.error('ERROR: SEED_EMAIL and SEED_PASSWORD environment variables must be set');
    console.error('Example: SEED_EMAIL=admin@company.com SEED_PASSWORD=your_secure_password npm run db:seed');
    process.exit(1);
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seeding is not allowed in production environment');
    process.exit(1);
  }
  
  // Validate password strength for seed user
  if (password.length < 12) {
    console.error('ERROR: SEED_PASSWORD must be at least 12 characters long');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "head_office_admin" as const,
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: 'Test Tenant',
    })
    .returning();

  await db
    .update(users)
    .set({ tenantId: tenant.id })
    .where(eq(users.id, user.id));

  await createStripeProducts();
  
  await seedBangladeshData();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
