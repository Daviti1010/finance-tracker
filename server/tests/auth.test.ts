import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";


describe("register", () => {
    it("registers successfully", async () => {
    
        const res = await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

        
        expect(res.status).toBe(201);
    });

    it("checks duplicate emails", async () => {
    
        await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

        const res = await request(app)
            .post("/auth/register")
            .send({ name: "test1", email: "test@example.com", password: "123456!n" });

        
        expect(res.status).toBe(200);
    });

    it("checks duplicate usernames", async () => {
    
        await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

        const res = await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test1@example.com", password: "123456!n" });

        
        expect(res.status).toBe(409);
    });

    it("checks missing required fields", async () => {

        const res = await request(app)
            .post("/auth/register")
            .send({ name: "", email: "test1@example.com", password: "123456!n" });

        
        expect(res.status).toBe(400);
    });
});


describe("login", () => {
    it("login success", async () => {
    
        await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

            
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: "123456!n" });

            
        expect(res.status).toBe(200);
    });


    it("rejects wrong password", async () => {
    
        await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

        
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: "12345678" });

        
        expect(res.status).toBe(401);
    });

    it("checks logging in with non-existent email", async () => {
    
        await request(app)
            .post("/auth/register")
            .send({ name: "test", email: "test@example.com", password: "123456!n" });

            
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test12@example.com", password: "12345678" });

            
        expect(res.status).toBe(401);

    });
});
