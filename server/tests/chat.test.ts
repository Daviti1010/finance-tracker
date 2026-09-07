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

describe("chat", () => {
    it("rejects request with no token", async () => {
        const res = await request(app)
            .post("/api/chat")
            .send({ message: "hello" });

        expect(res.status).toBe(401);
    })
})