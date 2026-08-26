import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";


async function createUserAndGetToken(email: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: "test", email, password: "123456!n" });
    return res.body.accessToken;
}


describe("GET /transactions", () => {
    it("returns only the authenticated user's own transactions", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")
        const tokenB = await createUserAndGetToken("transactions-test2@example.com")

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 50, category: "other", description: "A's transaction", date: "2026-08-20" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ type: "income", amount: 70, category: "salary", description: "B's transaction", date: "2026-08-21" });

        const res = await request(app)
            .get("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].description).toBe("A's transaction");
    });

});

describe("POST /transactions", () => {
    it("adding user transactions successfully", async () => {
    
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(Number(res.body.amount)).toBe(50);
    });

});