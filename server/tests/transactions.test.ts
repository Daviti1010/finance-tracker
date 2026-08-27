import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";


async function createUserAndGetToken(email: string, name?: string) {
    const res = await request(app)
        .post("/auth/register")
        .send({ name: name ?? email.split("@")[0], email, password: "123456!n" });
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

    it("returns empty array when the user has no transactions", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")

        const res = await request(app)
            .get("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
        expect(res.body).toEqual([]);
    })

    it("filters by type only", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 50, category: "other", description: "A's 1st transaction", date: "2026-08-20" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 500, category: "rent", description: "A's 2nd transaction", date: "2026-08-20" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "income", amount: 70, category: "salary", description: "A's 3rd transaction", date: "2026-08-21" });

        const res = await request(app)
            .get("/transactions?type=expense&category=all")
            .set("Authorization", `Bearer ${tokenA}`)

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body.every((t: any) => t.type === "expense")).toBe(true);
    })

    it("filters by type and category", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 50, category: "other", description: "A's 1st transaction", date: "2026-08-20" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 500, category: "rent", description: "A's 2nd transaction", date: "2026-08-20" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "income", amount: 70, category: "salary", description: "A's 3rd transaction", date: "2026-08-21" });

        await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 100, category: "education", description: "A's 4th transaction", date: "2026-08-25" });


        const res = await request(app)
            .get("/transactions?type=expense&category=rent")
            .set("Authorization", `Bearer ${tokenA}`)

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body.every((t: any) => t.type === "expense" && t.category === "rent")).toBe(true);
    })

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

    it("rejects with missing type field", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ amount: 50, category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing a field");
    });

    it("rejects with missing amount field", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing a field");
    });

    it("rejects with missing category field", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, description: "something", date: "2026-08-20" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing a field");
    });

    it("rejects with missing date field", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: 50, category: "other", description: "something" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing a field");
    });

    it("rejects invalid type", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "fake-type", amount: 50, category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid information");
    });

    it("rejects negative/non-numeric amount", async () => {
        const token = await createUserAndGetToken("transactions-test@example.com")

        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({ type: "expense", amount: "50", category: "other", description: "something", date: "2026-08-20" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid number");
    });

});

describe("Delete /transactions", () => {
    it("successfully deletes a transaction", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")

        const transactionA = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 50, category: "other", description: "A's transaction", date: "2026-08-20" });

        const transactionId = transactionA.body.id;

        const res = await request(app)
            .delete(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${tokenA}`)

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Successfully deleted");
    });

    it("rejects deleting another user's transaction", async () => {
        const tokenA = await createUserAndGetToken("transactions-test1@example.com")
        const tokenB = await createUserAndGetToken("transactions-test2@example.com")

        const transactionA = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ type: "expense", amount: 50, category: "other", description: "A's transaction", date: "2026-08-20" });

        const transactionId = transactionA.body.id;

        const res = await request(app)
            .delete(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${tokenB}`)

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Error");
    });

});
