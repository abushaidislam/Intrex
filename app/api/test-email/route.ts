import { NextResponse } from 'next/server';
import { sendPlatformEmail, verifyPlatformEmailConnection } from '@/lib/email/platform-email';

export async function GET() {
  try {
    // Check if email is configured
    const config = {
      host: process.env.PLATFORM_SMTP_HOST,
      port: process.env.PLATFORM_SMTP_PORT,
      user: process.env.PLATFORM_SMTP_USER,
      hasPass: !!process.env.PLATFORM_SMTP_PASS,
      from: process.env.PLATFORM_EMAIL_FROM,
    };

    // Test SMTP connection
    const verifyResult = await verifyPlatformEmailConnection();

    return NextResponse.json({
      configured: config.host && config.user && config.hasPass,
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        from: config.from,
      },
      connectionTest: verifyResult,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      configured: false,
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await sendPlatformEmail({
      to: email,
      subject: 'Test Email from Compliance OS',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from your Compliance OS application.</p>
          <p>If you received this, your email configuration is working correctly!</p>
        </div>
      `,
      text: 'Test email from Compliance OS. If you received this, your email configuration is working!',
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email',
    }, { status: 500 });
  }
}
