import { db } from '@/lib/db/drizzle';
import { emailVerificationCodes, users, type NewEmailVerificationCode } from '@/lib/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { sendPlatformEmail } from '@/lib/email/platform-email';

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code email
 */
export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  purpose: 'signin' | 'signup' | 'password_reset' = 'signin'
): Promise<{ success: boolean; error?: string }> {
  const purposeLabels: Record<string, string> = {
    signin: 'Sign In',
    signup: 'Account Registration',
    password_reset: 'Password Reset',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 480px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px; }
    .code-container { background: #f8fafc; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace; }
    .message { color: #64748b; font-size: 14px; line-height: 1.6; margin: 16px 0; }
    .footer { text-align: center; padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    .expires { color: #ef4444; font-size: 13px; font-weight: 500; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${purposeLabels[purpose]}</h1>
    </div>
    <div class="content">
      <p class="message">Please use the following verification code to complete your ${purposeLabels[purpose].toLowerCase()}:</p>
      <div class="code-container">
        <div class="code">${code}</div>
      </div>
      <p class="expires">⏰ This code expires in 10 minutes</p>
      <p class="message">If you didn't request this code, please ignore this email. Do not share this code with anyone.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Compliance OS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Your verification code for ${purposeLabels[purpose]} is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`;

  return await sendPlatformEmail({
    to: email,
    subject: `Your Verification Code - ${purposeLabels[purpose]}`,
    html,
    text,
  });
}

/**
 * Create and send a new verification code
 */
export async function createAndSendVerificationCode(
  email: string,
  userId: number | null,
  purpose: 'signin' | 'signup' | 'password_reset' = 'signin'
): Promise<{ success: boolean; error?: string; codeId?: number }> {
  try {
    // Generate a new 6-digit code
    const code = generateVerificationCode();
    
    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing unused codes for this email and purpose
    await db
      .delete(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.purpose, purpose),
          isNull(emailVerificationCodes.usedAt)
        )
      );

    // Create new verification code
    const newCode: NewEmailVerificationCode = {
      email,
      code,
      purpose,
      userId,
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
    };

    const [created] = await db
      .insert(emailVerificationCodes)
      .values(newCode)
      .returning();

    // Send the email
    console.log(`[Verification] Sending ${purpose} code to ${email}...`);
    const emailResult = await sendVerificationCodeEmail(email, code, purpose);

    if (!emailResult.success) {
      console.error(`[Verification] Failed to send email: ${emailResult.error}`);
      return { success: false, error: emailResult.error };
    }

    console.log(`[Verification] Email sent successfully, codeId: ${created.id}`);
    return { success: true, codeId: created.id };
  } catch (error) {
    console.error('[Verification] Failed to create/send verification code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create verification code',
    };
  }
}

/**
 * Verify a verification code
 */
export async function verifyCode(
  email: string,
  code: string,
  purpose: 'signin' | 'signup' | 'password_reset' = 'signin'
): Promise<{ success: boolean; error?: string; userId?: number | null }> {
  try {
    // Find the most recent unused code for this email and purpose
    const [verificationRecord] = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.purpose, purpose),
          eq(emailVerificationCodes.code, code),
          isNull(emailVerificationCodes.usedAt),
          gt(emailVerificationCodes.expiresAt, new Date())
        )
      )
      .orderBy(emailVerificationCodes.createdAt)
      .limit(1);

    if (!verificationRecord) {
      // Check if code exists but is expired or wrong code
      const [existingRecord] = await db
        .select()
        .from(emailVerificationCodes)
        .where(
          and(
            eq(emailVerificationCodes.email, email),
            eq(emailVerificationCodes.purpose, purpose),
            isNull(emailVerificationCodes.usedAt)
          )
        )
        .orderBy(emailVerificationCodes.createdAt)
        .limit(1);

      if (existingRecord) {
        // Increment attempts
        const newAttempts = existingRecord.attempts + 1;
        
        if (newAttempts >= existingRecord.maxAttempts) {
          // Mark as used to prevent further attempts
          await db
            .update(emailVerificationCodes)
            .set({ usedAt: new Date(), attempts: newAttempts })
            .where(eq(emailVerificationCodes.id, existingRecord.id));
          
          return { success: false, error: 'Too many failed attempts. Please request a new code.' };
        }

        await db
          .update(emailVerificationCodes)
          .set({ attempts: newAttempts })
          .where(eq(emailVerificationCodes.id, existingRecord.id));

        return { success: false, error: 'Invalid verification code. Please try again.' };
      }

      return { success: false, error: 'Verification code not found or expired. Please request a new code.' };
    }

    // Mark code as used
    await db
      .update(emailVerificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationCodes.id, verificationRecord.id));

    return { success: true, userId: verificationRecord.userId };
  } catch (error) {
    console.error('[Verification] Failed to verify code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify code',
    };
  }
}

/**
 * Check if a user has a pending verification code
 */
export async function hasPendingVerification(
  email: string,
  purpose: 'signin' | 'signup' | 'password_reset' = 'signin'
): Promise<boolean> {
  const [record] = await db
    .select()
    .from(emailVerificationCodes)
    .where(
      and(
        eq(emailVerificationCodes.email, email),
        eq(emailVerificationCodes.purpose, purpose),
        isNull(emailVerificationCodes.usedAt),
        gt(emailVerificationCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  return !!record;
}
