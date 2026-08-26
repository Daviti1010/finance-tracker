import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";


async function createUserAndGetToken(email: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: "test", email, password: "123456!n" });
    return res.body.accessToken;
}


describe("transactions", () => {
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