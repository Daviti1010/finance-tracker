import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../db";


describe("authMiddleware", () => {
    it("rejects creation without a token", async () => { 
        const res = await request(app)
            .post("/transactions")
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ success: false });
    });

    it("rejects creation with a malformed token", async () => {
        const res = await request(app)
            .post("/transactions")
            .set("Authorization", "Bearer fake-token")
            .send({ type: "expense", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid token");
    });

    it("rejects token for a user that no longer exists", async () => {

        const registerRes = await request(app)
            .post("/auth/register")
            .send({ name: "test-user1", email: "authMiddleware-test1@example.com", password: "123456!n" });

        const token = registerRes.body.accessToken;

        const decoded: any = jwt.decode(token);
        const userId = decoded.id;

        await pool.query("DELETE FROM users WHERE id = $1", [userId]);

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, category: "other", description: "x", date: "2026-08-20" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid token");
    });

    it("rejects token with stale tokenVersion", async () => {
        const registerRes = await request(app)
            .post("/auth/register")
            .send({ name: "test-user2", email: "authMiddleware-test2@example.com", password: "123456!n" });

        const token = registerRes.body.accessToken;
        const decoded: any = jwt.decode(token);
        const userId = decoded.id;

        await pool.query("UPDATE users SET token_version = token_version + 1 WHERE id = $1", [userId]);

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, category: "other", description: "x", date: "2026-08-20" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Session expired, please log in again");
    });

});