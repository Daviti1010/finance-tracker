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



export default router