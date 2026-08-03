import { Resend } from "resend";
import dotenv from 'dotenv';

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the password reset code via email using Resend.
 *
 * NOTE: Currently using Resend's sandbox sender (onboarding@resend.dev),
 * since no custom domain has been verified yet. In sandbox mode, Resend
 * only delivers to the email address associated with the Resend account
 * used to generate the API key — sending to any other address will fail
 * silently or return an error, even though this function accepts any
 * `toUserEmail`.
 *
 * To enable sending to arbitrary users, verify a domain in the Resend
 * dashboard and update the `from` address accordingly.
 */

export async function sendPasswordResetEmail(toUserEmail: string, code: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Finance Tracker <onboarding@resend.dev>`,
            to: [toUserEmail],
            subject: "Your Password Reset Code",
            html: buildResetEmailHtml(code),
        });

        return { data, error };

    } catch (err) {
        console.error(err);
        return { data: null, error: err };
    }
}

function buildResetEmailHtml(code: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #f7f7f7;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; text-align: center;">
            <h1 style="font-size: 20px; color: #1a1a1a; margin-bottom: 8px;">Finance Tracker</h1>
            <p style="font-size: 15px; color: #555555; margin-bottom: 24px;">
                Use the code below to reset your password. This code expires in 15 minutes.
            </p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a1a1a; background-color: #f0f0f0; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                ${code}
            </div>
            <p style="font-size: 13px; color: #999999;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    </div>
    `;
}