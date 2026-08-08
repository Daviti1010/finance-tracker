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
        const hasType = type && type !== "all";
        const hasCategory = category && category !== "all";

        if (hasType && hasCategory) {
            const result = await pool.query(
                "SELECT * FROM transactions WHERE user_id = $1 AND type = $2 AND category = $3 ORDER BY date DESC",
                [userId, type, category]
            );
            return result.rows;
        }

        if (hasType && !hasCategory) {
            const result = await pool.query(
                "SELECT * FROM transactions WHERE user_id = $1 AND type = $2 ORDER BY date DESC",
                [userId, type]
            );
            return result.rows;
        }

        if (!hasType && hasCategory) {
            const result = await pool.query(
                "SELECT * FROM transactions WHERE user_id = $1 AND category = $2 ORDER BY date DESC",
                [userId, category]
            );
            return result.rows;
        }

        const result = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
            [userId]
        );
        return result.rows;

    } catch (err) {
        console.error(err);
        throw err;
    }
}


export async function getRecentTransactions(userId: number, daysBack: number): Promise<Transaction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    try {
        const result = await pool.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1
            AND date >= $2
            ORDER BY date DESC`, [userId, cutoffDate])

        return result.rows;

    } catch (err) {
        console.error(err);
        throw err;
    }
}


export async function getStartingBalance(userId: number) {
    try {
        const result = await pool.query("SELECT starting_balance FROM users WHERE id = $1", [userId])

        return result.rows[0] ?? null

    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function getCurrentBalance(userId: number): Promise<number> {
    const startingBalanceResult = await getStartingBalance(userId);
    const startingBalance = Number(startingBalanceResult?.starting_balance ?? 0);

    const allTransactions = await getTransactions(userId);

    const totalIncome = allTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = allTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    return startingBalance + totalIncome - totalExpenses;
}