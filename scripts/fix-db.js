import postgres from 'postgres';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL not set in .env.local');
  process.exit(1);
}

const sql = postgres(process.env.POSTGRES_URL);

async function fixDatabase() {
  try {
    console.log('Checking if stripe columns exist...');
    
    // Check if stripe_customer_id column exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' AND column_name = 'stripe_customer_id'
    `;
    
    if (checkResult.length === 0) {
      console.log('Adding Stripe columns to tenants table...');
      
      await sql`ALTER TABLE tenants ADD COLUMN stripe_customer_id varchar(255)`;
      await sql`ALTER TABLE tenants ADD COLUMN stripe_subscription_id varchar(255)`;
      await sql`ALTER TABLE tenants ADD COLUMN stripe_product_id varchar(255)`;
      await sql`ALTER TABLE tenants ADD COLUMN plan_name varchar(100)`;
      await sql`ALTER TABLE tenants ADD COLUMN subscription_status varchar(50)`;
      
      console.log('✓ Stripe columns added successfully');
    } else {
      console.log('Stripe columns already exist');
    }

    // Also check if there's a team_id constraint issue on activity_logs
    console.log('Checking activity_logs constraints...');
    
    // Check if team_id column exists (it shouldn't after migration)
    const teamIdCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_logs' AND column_name = 'team_id'
    `;
    
    if (teamIdCheck.length > 0) {
      console.log('Dropping team_id column from activity_logs...');
      await sql`ALTER TABLE activity_logs DROP COLUMN IF EXISTS team_id`;
      console.log('✓ team_id column dropped');
    }

    console.log('\nDatabase fix complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

fixDatabase();
