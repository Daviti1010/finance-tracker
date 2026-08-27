import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import pool from "../db";
import { getTransactions } from "../queries/transactions";
import { exportTransactionsCsv } from "../queries/exportTransactionsCsv";
import { exportTransactionsPdf } from "../queries/exportTransactionsPdf";

const router = express.Router();

router.get("/", authMiddleware, async (req: any, res: any) => {
    const userId = req.user?.id;
    const type = req.query?.type;
    const category = req.query?.category;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        const transactions = await getTransactions(userId, type as string, category as string);
        return res.status(200).json(transactions);

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" })
    }
})


router.post("/", authMiddleware, async (req: any, res: any) => {
    const {type, amount, category, description, date} = req.body;
    const userId = req.user?.id;

    if (!type || !amount || !category || !date) {
        return res.status(400).json({success: false, message: "Missing a field" })
    }

    if (type !== "income" && type !== "expense" ) {
        return res.status(400).json({success: false, message: "Invalid information" })
    }

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid number" });
    }

    const today = new Date().toISOString().split("T")[0]
    if (date > today!) {
        return res.status(400).json({ message: "Date cannot be in the future" })
    }

    try {
        const result = await pool.query("INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [userId, type, amount, category, description, date])

        return res.status(201).json(result.rows[0])

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" })
    }
})

router.get("/export/csv", authMiddleware, exportTransactionsCsv)

router.get("/export/pdf", authMiddleware, exportTransactionsPdf)


router.put("/:id", authMiddleware, async (req: any, res: any) => {
    const transactionId: number = req.params.id;
    const {type, amount, category, description, date} = req.body;
    const userId = req.user?.id;

    if (!type || !amount || !category || !date) {
        return res.status(400).json({success: false, message: "Missing a field" })
    }

    if (type !== "income" && type !== "expense" ) {
        return res.status(400).json({success: false, message: "Invalid information" })
    }

    if (amount <= 0) {
        return res.status(400).json({success: false, message: "Invalid number" })
    }

    try {
        const result = await pool.query("SELECT * FROM transactions WHERE id = $1", [transactionId])

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Error" })
        }

        const transactionUserId = result.rows[0].user_id

        if (userId === transactionUserId) {

            const updateTable = await pool.query
                ("UPDATE transactions SET type = $1, amount = $2, category = $3, description = $4, date = $5 WHERE id = $6 RETURNING *", [
                    type, amount, category, description, date, transactionId
                ])

            return res.status(200).json(updateTable.rows[0])

        } else {
            return res.status(404).json({ success: false, message: "Error" })
        }
        

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" })
    }

})




router.delete("/:id", authMiddleware, async (req: any, res: any) => {
    const transactionId: number = req.params.id;
    const userId = req.user?.id;

    try {
        const result = await pool.query("SELECT * FROM transactions WHERE id = $1", [transactionId])

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Error" })
        }

        const transactionUserId = result.rows[0].user_id

        if (userId === transactionUserId) {

            await pool.query("DELETE FROM transactions WHERE id = $1", [transactionId])

            return res.status(200).json({success: true, message: "Successfully deleted"})

        } else {
            return res.status(404).json({ success: false, message: "Error" })
        }


    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" })
    }
})



export default router