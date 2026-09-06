import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";

vi.mock("../services/email", () => ({
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ error: null }),
}));

import { sendPasswordResetEmail } from "../services/email";

async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
    return res.body.accessToken;
}

describe("POST /forgot-password", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("successfully sends a reset code for an existing email", async () => {
        await createUserAndGetToken("reset-test@example.com");

        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-test@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("If that email exists, a code was sent.");
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it("returns response for a nonexistent email", async () => {
        await createUserAndGetToken("reset-test@example.com");

        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "fake-reset-test@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("If that email exists, a code was sent.");
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(0);
    })

    it("deletes any previous unused token before creating a new one", async () => {
        await createUserAndGetToken("reset-test@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-test@example.com" });

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-test@example.com" });

        const result = await pool.query(
            `SELECT prt.* FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE u.email = $1`,
            ["reset-test@example.com"]
        );

        expect(result.rows).toHaveLength(1);
    });
});

describe("POST /check-code", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("extracts the real code from the mock", async () => {
        await createUserAndGetToken("reset-test@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-test@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        const res = await request(app)
            .post("/auth/check-code")
            .send({ email: "reset-test@example.com", code: rawCode });

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(true);
    });

    it("returns 'valid: false' for an incorrect code", async () => {
        await createUserAndGetToken("check-code-invalid@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "check-code-invalid@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        const res = await request(app)
            .post("/auth/check-code")
            .send({ email: "check-code-invalid@example.com", code: "123456"});

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(false);
    })

    it("returns 'valid: false' for a non-existent email", async () => {
        await createUserAndGetToken("check-code-invalid-1@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "check-code-invalid-1@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        const res = await request(app)
            .post("/auth/check-code")
            .send({ email: "check-code-invalid-123@example.com", code: rawCode });

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(false);
    })

    it("returns valid false when no token row exists", async () => {
        await createUserAndGetToken("check-code-no-token@example.com");

        const res = await request(app)
            .post("/auth/check-code")
            .send({ email: "check-code-no-token@example.com", code: "123456" });

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(false);
    });

    it("returns 'valid: false' for an expired code", async () => {
        await createUserAndGetToken("check-code-expired@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "check-code-expired@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        await pool.query(
            `UPDATE password_reset_tokens
            SET expires_at = $1
            WHERE user_id = (SELECT id FROM users WHERE email = $2)`,
            [new Date(Date.now() - 60 * 1000), "check-code-expired@example.com"]
        );

        const res = await request(app)
            .post("/auth/check-code")
            .send({ email: "check-code-expired@example.com", code: rawCode });

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(false);
    });
})


describe("POST /reset-password", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("successfully resets password", async () => {
        await createUserAndGetToken("reset-password-email@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-password-email@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-password-email@example.com", code: rawCode, new_password: "123456!n" })

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Password reset is successful");
    })

    it("invalidates old JWTs after password reset", async () => {
        const oldToken = await createUserAndGetToken("reset-invalidate@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-invalidate@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-invalidate@example.com", code: rawCode, new_password: "newPass123!" });

        const res = await request(app)
            .get("/api/links/advisors")
            .set("Authorization", `Bearer ${oldToken}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Session expired, please log in again")
    });
    
    it("deletes the token row after a successful reset", async () => {
        await createUserAndGetToken("reset-token-deleted@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-token-deleted@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-token-deleted@example.com", code: rawCode, new_password: "newPass123!" });

        const result = await pool.query(
            `SELECT prt.* FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE u.email = $1`,
            ["reset-token-deleted@example.com"]
        );

        expect(result.rows).toHaveLength(0);
    });

    it("rejects an already-used code", async () => {
        await createUserAndGetToken("reset-reused-code@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-reused-code@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        const firstAttempt = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-reused-code@example.com", code: rawCode, new_password: "firstPass123!" });

        expect(firstAttempt.status).toBe(200);
        expect(firstAttempt.body.success).toBe(true);

        const secondAttempt = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-reused-code@example.com", code: rawCode, new_password: "secondPass123!" });

        expect(secondAttempt.status).toBe(200);
        expect(secondAttempt.body.success).toBeUndefined();
        expect(secondAttempt.body.message).toBe("Invalid or expired code");
    })

    it("rejects wrong code", async () => {
        await createUserAndGetToken("wrong-code-email@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "wrong-code-email@example.com" });

        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "wrong-code-email@example.com", code: "123456", new_password: "123456!n" })

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Invalid or expired code");
    })

    it("rejects an expired code", async () => {
        await createUserAndGetToken("reset-password-expired@example.com");

        await request(app)
            .post("/auth/forgot-password")
            .send({ email: "reset-password-expired@example.com" });

        const rawCode = (sendPasswordResetEmail as any).mock.calls[0][1];

        await pool.query(
            `UPDATE password_reset_tokens
            SET expires_at = $1
            WHERE user_id = (SELECT id FROM users WHERE email = $2)`,
            [new Date(Date.now() - 60 * 1000), "reset-password-expired@example.com"]
        );

        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset-password-expired@example.com", code: rawCode, new_password: "123456!n" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Invalid or expired code");
    });
})