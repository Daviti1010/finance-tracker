import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
    return res.body.accessToken;
}

async function createLinkAndGetId(advisorToken: string, clientToken: string, clientEmail: string, advisorEmail?: string) {
    await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${advisorToken}`)
        .send({ clientEmail });

    const incomingRes = await request(app)
        .get("/api/links/incoming")
        .set("Authorization", `Bearer ${clientToken}`)

    const match = advisorEmail
        ? incomingRes.body.data.find((link: any) => link.advisorEmail === advisorEmail)
        : incomingRes.body.data[0];

    return {
        linkId: match.id,
        clientId: match.clientId
    }
}


describe("GET /:clientId/transactions", () => {
    it("advisor with accepted link can access client's transactions", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const { linkId, clientId } = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${clientToken}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.some((t: any) => t.description === "something")).toBe(true);
    })

    it("advisor with pending link cannot access", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const { clientId } = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${clientToken}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })

    it("advisor with no link at all cannot access", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const decoded: any = jwt.decode(clientToken);
        const clientId = decoded.id;

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${clientToken}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })

    it("advisor whose link was revoked after being accepted, loses access", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const { linkId, clientId } = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })

    it("a client cannot use this route to view another client's transactions", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")
        const clientToken2 = await createUserAndGetToken("client-test2@example.com")

        const { clientId } = await createLinkAndGetId(advisorToken, clientToken1, "client-test1@example.com")

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${clientToken2}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })

    it("a user can access their own transactions via this route", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const decoded: any = jwt.decode(clientToken);
        const clientId = decoded.id;

        const res = await request(app)
            .get(`/clients/${clientId}/transactions`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
    })
})


describe("GET /:clientId/starting-balance", () => {
    it("advisor with accepted link can access client's starting balance", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const { linkId, clientId } = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .get(`/clients/${clientId}/starting-balance`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.startingBalance).toEqual(0);
    })

    it("advisor with no link cannot access", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const decoded: any = jwt.decode(clientToken);
        const clientId = decoded.id;

        const res = await request(app)
            .get(`/clients/${clientId}/starting-balance`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })
    
    it("a client cannot view another client's starting balance", async () => {
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")
        const clientToken2 = await createUserAndGetToken("client-test2@example.com")

        const decoded: any = jwt.decode(clientToken1);
        const clientId = decoded.id;

        const res = await request(app)
            .get(`/clients/${clientId}/starting-balance`)
            .set("Authorization", `Bearer ${clientToken2}`)

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not authorized to view this data' });
    })
})