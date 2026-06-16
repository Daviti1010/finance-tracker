import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import pool from "../db";

const router = express.Router();

router.get("/", authMiddleware, async (req: any, res: any) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC", 
            [userId])

        return res.status(200).json(result.rows);

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

    if (amount <= 0) {
        return res.status(400).json({success: false, message: "Invalid number" })
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



export default router