import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  await resend.emails.send({
    from: "GlowUp <onboarding@resend.dev>",
    to: email,
    subject: "Verify your GlowUp account",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">GlowUp</h2>
        <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't sign up for GlowUp, you can ignore this email.</p>
      </div>
    `,
  });
}
