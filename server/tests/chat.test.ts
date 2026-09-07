import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from 'jsonwebtoken';
import app from "../app";
import { chatRateLimiter } from "../routes/chat";

const { mockCreate } = vi.hoisted(() => {
    return { mockCreate: vi.fn().mockResolvedValue({ output_text: "mocked response", id: "mock-id-123" }) };
});

vi.mock("@google/genai", () => ({
    GoogleGenAI: vi.fn().mockImplementation(function () {
        return { interactions: { create: mockCreate } };
    }),
}));

async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
    return res.body.accessToken;
}

describe("chat: auth", () => {
    it("rejects request with no token", async () => {
        const res = await request(app)
            .post("/api/chat")
            .send({ message: "hello" });

        expect(res.status).toBe(401);
    })
})

describe("chat: input validation", () => {
    it("rejects empty message", async () => {
        const userToken = await createUserAndGetToken("chat-test-1@example.com")

        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ message: "" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Message cannot be empty")
    })

    it("rejects message over 500 characters", async () => {
        const userToken = await createUserAndGetToken("chat-test-2@example.com")

        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ message: "a".repeat(501) });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Message is too long (max 500 characters)")
    })
})

describe("chat: rate limiting", () => {
    it("allows up to 7 requests within the window", async () => {
        const userToken = await createUserAndGetToken("chat-limit-1@example.com");
        const decoded: any = jwt.decode(userToken);
        chatRateLimiter.resetKey(decoded.id);

        for (let i = 0; i < 7; i++) {
            const res = await request(app)
                .post("/api/chat")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ message: "a".repeat(100) });

            expect(res.status).toBe(200);
        }
    });
})