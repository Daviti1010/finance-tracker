import { Resend } from "resend";
import dotenv from 'dotenv';

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendPasswordResetEmail(toUserEmail: string, code: string) {

    try {
        const { data, error } = await resend.emails.send({
            from: `Finance Tracker <${process.env.EMAIL}>`,
            to: [`${toUserEmail}`],
            subject: "Your Reset Code:",
            html: `<strong>${code}</strong>`,
        });

        return {data, error}

    } catch (err) {
        console.error(err);
        return { data: null, error: err };
    }
}