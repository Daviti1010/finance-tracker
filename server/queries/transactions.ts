import pool from "../db";

interface Transaction {
    id: number
    amount: number
    category: string
    description: string
    type: "income" | "expense"
    date: string
}

export async function getTransactions(userId: number, type?: string, category?: string): Promise<Transaction[]> {

    try {
        if (type && category && category !== "all") {
            const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1 AND type = $2 AND category = $3 ORDER BY date DESC", 
                [userId, type, category])

            return result.rows;

        }
        
        if (type && type !== "all" && category && category === "all") {
            const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1 AND type = $2 ORDER BY date DESC", 
                [userId, type])

            return result.rows;
        }

        const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC", 
            [userId])

        return result.rows;
            
    } catch (err) {
        console.error(err);
        throw err;
    }
}