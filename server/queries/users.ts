import pool from "../db";

interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    starting_balance: number;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`,
            [email])

        return result.rows[0] ?? null;

    } catch (err) {
        console.error(err)
        throw err;
    }
}


export async function getUserById(id: number): Promise<User | null> {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`,
            [id])
        
        return result.rows[0] ?? null;

    } catch (err) {
        console.error(err)
        throw err;
    }
}