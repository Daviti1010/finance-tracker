import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
    return res.body.accessToken;
}

describe("POST /api/links", () => {
    it("advisor successfully sends a link request to a client", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const res = await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test@example.com" });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ success: true, message: "Link request sent." });
    })

    it("rejects request with missing clientEmail", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")

        const res = await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({})

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Client email is required" });
    })
})