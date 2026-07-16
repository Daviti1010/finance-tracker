import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { createLinkRequest } from "../queries/advisorLinks";
import { getUserByEmail } from "../queries/users";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    const clientEmail = req.body.clientEmail;
    const advisorId = (req as any).user?.id;

    if (!clientEmail) {
        return res.status(400).json({ success: false, message: "Client email is required" });
    }

    try {
        const client = await getUserByEmail(clientEmail);

        if (!client) {
            return res.status(201).json({ success: true, message: "Link request sent" });
        }

        if (client.id === advisorId) {
            return res.status(400).json({success: false, message: "Unable to do this action"})
        }

        await createLinkRequest(advisorId, client.id);

        res.status(201).json({ success: true, message: "Link request sent" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }

})

router.get("/incoming", authMiddleware, async (req, res) => {

})

router.get("/outgoing", authMiddleware, async (req, res) => {

})

router.patch("/:id/accept", authMiddleware, async (req, res) => {

})

router.patch("/:id/revoke", authMiddleware, async (req, res) => {

})

router.get("/api/get/clients", authMiddleware, async (req, res) => {

})

router.get("/api/get/advisors", authMiddleware, async (req, res) => {
    
})


export default router