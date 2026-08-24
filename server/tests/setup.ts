import dotenv from "dotenv"
dotenv.config({ path: ".env.test" });

import { beforeEach, afterAll } from "vitest";
import pool from "../db";

beforeEach(async () => {
    await pool.query(`
        TRUNCATE users, transactions, advisor_client_links
        RESTART IDENTITY CASCADE
    `);
});

afterAll(async () => {
    await pool.end();
});