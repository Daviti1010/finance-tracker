import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";


describe("transactions", () => {
    it("adding user transactions successfully", async () => {
    
        const registerRes = await request(app)
            .post("/auth/register")
            .send({ name: "transactions-test", email: "transactions-test@example.com", password: "123456!n" });

        const token = registerRes.body.accessToken;

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(Number(res.body.amount)).toBe(50);
    });

});