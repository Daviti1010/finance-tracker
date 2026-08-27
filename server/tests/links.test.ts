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

    it("rejects self-request", async() => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")

        const res = await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "advisor-test@example.com" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Unable to do this action" });
    })

    it("rejects request with non-existent clientEmail", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")

        const res = await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "doesnotexist@example.com" })

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ success: true, message: "Link request sent" });
    })
})

describe("GET /api/links/incoming", () => {
    it("returns requests sent to this client", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test@example.com" });

        const res = await request(app)
            .get("/api/links/incoming")
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].advisorEmail).toBe("advisor-test@example.com");
        expect(res.body.data[0].status).toBe("pending");
    })

    it("returns empty array when no one has requested this client", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com")

        const res = await request(app)
            .get("/api/links/incoming")
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    })

    it("client only gets requests sent to them", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")
        const clientToken2 = await createUserAndGetToken("client-test2@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test1@example.com" });

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test2@example.com" });

        const res = await request(app)
            .get("/api/links/incoming")
            .set("Authorization", `Bearer ${clientToken1}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].advisorEmail).toBe("advisor-test@example.com");
    })
})