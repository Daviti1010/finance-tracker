import express from "express";
import { requireClientAccess } from "../middleware/accessMiddleware";
import authMiddleware from "../middleware/authMiddleware";
import { getTransactions } from "../queries/transactions";
import { getUserById } from "../queries/users";

const router = express.Router();



router.get("/:clientId/transactions", authMiddleware, requireClientAccess, async (req, res) => {
    const clientId = Number(req.params.clientId);
    const type = req.query.type;
    const category = req.query.category;

    try {
        const transactions = await getTransactions(clientId, type as string, category as string);
        return res.status(200).json(transactions);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }

})

router.get("/:clientId/starting-balance", authMiddleware, requireClientAccess, async (req, res) => {
    const clientId = Number(req.params.clientId);

    try {
        const user = await getUserById(clientId);
        return res.status(200).json({ startingBalance: user?.starting_balance != null ? Number(user.starting_balance) : null  });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }

})






export default router