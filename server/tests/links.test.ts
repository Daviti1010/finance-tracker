import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
    return res.body.accessToken;
}

async function createLinkAndGetId(advisorToken: string, clientToken: string, clientEmail: string) {
    await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${advisorToken}`)
        .send({ clientEmail });

    const incomingRes = await request(app)
        .get("/api/links/incoming")
        .set("Authorization", `Bearer ${clientToken}`)

    const linkId = incomingRes.body.data[0].id;

    return linkId
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

    it("advisor does not see their own outgoing requests as incoming", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test1@example.com" });

        const res = await request(app)
            .get("/api/links/incoming")
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    })

    it("rejects GET /incoming without a token", async () => {
        const res = await request(app)
            .get("/api/links/incoming")

        expect(res.status).toBe(401);
    })
})


describe("GET /api/links/outgoing", () => {
    it("returns requests this advisor sent", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test1@example.com" });

        const res = await request(app)
            .get("/api/links/outgoing")
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].clientEmail).toBe("client-test1@example.com");
        expect(res.body.data[0].status).toBe("pending");
    })

    it("returns empty array when this advisor has sent nothing", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")

        const res = await request(app)
            .get("/api/links/outgoing")
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    })

    it("does not return other advisors' outgoing requests", async () => {
        const advisorToken1 = await createUserAndGetToken("advisor-test1@example.com")
        const advisorToken2 = await createUserAndGetToken("advisor-test2@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken1}`)
            .send({ clientEmail: "client-test1@example.com" });

        const res = await request(app)
            .get("/api/links/outgoing")
            .set("Authorization", `Bearer ${advisorToken2}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    })

    it("client does not see their own incoming requests as outgoing", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com")

        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${advisorToken}`)
            .send({ clientEmail: "client-test1@example.com" });

        const res = await request(app)
            .get("/api/links/outgoing")
            .set("Authorization", `Bearer ${clientToken1}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    })

    it("rejects GET /outgoing without a token", async () => {
        const res = await request(app)
            .get("/api/links/outgoing")

        expect(res.status).toBe(401);
    })
})

describe("PATCH /:id/accept", () => {
    it("client successfully accepts a request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        const res = await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("accepted");
    })

    it("rejects non-numeric link id", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const res = await request(app)
            .patch(`/api/links/abcd/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid link id");
    })

    it("rejects non-existent link id", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const res = await request(app)
            .patch(`/api/links/99999999/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Link not found");
    })

    it("rejects accept attempt by someone who isn't the target client", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com");
        const clientToken2 = await createUserAndGetToken("client-test2@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken1, "client-test1@example.com")

        const res = await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken2}`)

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized to accept this request");
    })

    it("rejects accepting an already-accepted request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("This request cannot be accepted");
    })
})


describe("PATCH /:id/revoke", () => {
    it("advisor successfully revokes accepted request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("revoked");
    })

    it("advisor successfully revokes their own pending request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        const res = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("revoked");
    })

    it("client successfully revokes accepted request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("revoked");
    })

    it("client successfully revokes a pending incoming request", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        const res = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("revoked");
    })

    it("rejects non-numeric link id", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const res = await request(app)
            .patch(`/api/links/abcd/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid link id");
    })

    it("rejects non-existent link id", async () => {
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const res = await request(app)
            .patch(`/api/links/99999999/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Not found");
    })

    it("rejects revoke attempt by unrelated client and unrelated advisor", async () => {
        const advisorToken1 = await createUserAndGetToken("advisor-test1@example.com")
        const advisorToken2 = await createUserAndGetToken("advisor-test2@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com");
        const clientToken2 = await createUserAndGetToken("client-test2@example.com");

        const linkId = await createLinkAndGetId(advisorToken1, clientToken1, "client-test1@example.com")

        const clientRes = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken2}`)

        const advisorRes = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${advisorToken2}`)

        expect(clientRes.status).toBe(403);
        expect(clientRes.body.message).toBe("User error");
        expect(advisorRes.status).toBe(403);
        expect(advisorRes.body.message).toBe("User error");
    })

    it("rejects revoking an already-revoked link", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Request error");
    })

    it("rejects accepting an already-revoked link", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken = await createUserAndGetToken("client-test@example.com");

        const linkId = await createLinkAndGetId(advisorToken, clientToken, "client-test@example.com")

        await request(app)
            .patch(`/api/links/${linkId}/revoke`)
            .set("Authorization", `Bearer ${clientToken}`)

        const res = await request(app)
            .patch(`/api/links/${linkId}/accept`)
            .set("Authorization", `Bearer ${clientToken}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("This request cannot be accepted");
    })
})


describe("GET /clients", () => {
    it("returns advisor's accepted clients", async () => {
        const advisorToken = await createUserAndGetToken("advisor-test@example.com")
        const clientToken1 = await createUserAndGetToken("client-test1@example.com");
        const clientToken2 = await createUserAndGetToken("client-test2@example.com");

        const linkId1 = await createLinkAndGetId(advisorToken, clientToken1, "client-test1@example.com")
        const linkId2 = await createLinkAndGetId(advisorToken, clientToken2, "client-test2@example.com")

        await request(app)
            .patch(`/api/links/${linkId1}/accept`)
            .set("Authorization", `Bearer ${clientToken1}`)

        await request(app)
            .patch(`/api/links/${linkId2}/accept`)
            .set("Authorization", `Bearer ${clientToken2}`)

        const res = await request(app)
            .get("/api/links/clients")
            .set("Authorization", `Bearer ${advisorToken}`)

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        const emails = res.body.data.map((c: any) => c.clientEmail);
        expect(emails).toContain("client-test1@example.com");
        expect(emails).toContain("client-test2@example.com");
    })
})