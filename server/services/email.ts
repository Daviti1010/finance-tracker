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
            subject: "Your Reset Code:",
            html: `<strong>${code}</strong>`,
        });

        return {data, error}

    } catch (err) {
        console.error(err);
        return { data: null, error: err };
    }
}