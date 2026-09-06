import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

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
});