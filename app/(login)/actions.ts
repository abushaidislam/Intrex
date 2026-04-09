'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  tenants,
  branches,
  activityLogs,
  type NewUser,
  type NewTenant,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAndSendVerificationCode, verifyCode } from '@/lib/auth/verification';

async function logActivity(
  tenantId: string | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (tenantId === null || tenantId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    tenantId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  // Rate limiting check by email
  const rateLimitKey = `signin:${email.toLowerCase()}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      error: 'Too many login attempts. Please try again later.',
      email,
      password
    };
  }

  const userWithTenant = await db
    .select({
      user: users,
      tenant: tenants
    })
    .from(users)
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTenant.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, tenant: foundTenant } = userWithTenant[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Sign in directly - no OTP verification for existing users
  await Promise.all([
    setSession(foundUser),
    logActivity(foundTenant?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ tenant: foundTenant, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
  verificationCode: z.string().length(6).optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, verificationCode } = data;

  // Rate limiting check by email
  const rateLimitKey = `signup:${email.toLowerCase()}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      error: 'Too many signup attempts. Please try again later.',
      email,
      password
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'An account with this email already exists. Please sign in instead.',
      email,
      password
    };
  }

  // Step 1: If no verification code, send OTP first
  if (!verificationCode) {
    // Send verification code for signup (userId is null since user doesn't exist yet)
    const otpResult = await createAndSendVerificationCode(
      email,
      null, // No user yet
      'signup'
    );

    if (!otpResult.success) {
      return {
        error: `Failed to send verification code: ${otpResult.error}`,
        email,
        password
      };
    }

    return {
      requiresVerification: true,
      email,
      password,
      message: 'Verification code sent to your email. Please check your inbox.'
    };
  }

  // Step 2: Verify the code
  const verifyResult = await verifyCode(email, verificationCode, 'signup');

  if (!verifyResult.success) {
    return {
      error: verifyResult.error || 'Invalid verification code.',
      requiresVerification: true,
      email,
      password
    };
  }

  // Step 3: Verification successful - create user and tenant
  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'head_office_admin'
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  // Create a new tenant for this user
  const newTenant: NewTenant = {
    name: `${email}'s Organization`
  };

  const [createdTenant] = await db.insert(tenants).values(newTenant).returning();

  if (!createdTenant) {
    return {
      error: 'Failed to create organization. Please try again.',
      email,
      password
    };
  }

  // Link user to tenant
  await db
    .update(users)
    .set({ tenantId: createdTenant.id })
    .where(eq(users.id, createdUser.id));

  await Promise.all([
    logActivity(createdTenant.id, createdUser.id, ActivityType.CREATE_TENANT),
    logActivity(createdTenant.id, createdUser.id, ActivityType.SIGN_UP),
    setSession({ ...createdUser, tenantId: createdTenant.id })
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ tenant: createdTenant, priceId });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTenant = await getUserWithTenant(user.id);
  await logActivity(userWithTenant?.tenantId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTenant = await getUserWithTenant(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTenant?.tenantId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTenant = await getUserWithTenant(user.id);

    await logActivity(
      userWithTenant?.tenantId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    // Remove tenant association
    if (userWithTenant?.tenantId) {
      await db
        .update(users)
        .set({ tenantId: null })
        .where(eq(users.id, user.id));
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTenant = await getUserWithTenant(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTenant?.tenantId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

// Simplified: remove inviteTeamMember and removeTeamMember functions for now
// They need invitations table and teamMembers table which don't exist in the new schema
