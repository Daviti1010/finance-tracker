import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app";

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

describe("chat", () => {
    it("rejects request with no token", async () => {
        const res = await request(app)
            .post("/api/chat")
            .send({ message: "hello" });

        expect(res.status).toBe(401);
    })

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