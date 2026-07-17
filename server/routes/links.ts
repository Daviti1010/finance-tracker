import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { createLinkRequest, getIncomingRequests, getLinkById, getMyAdvisors, getMyClients, getOutgoingRequests, updateLinkStatus } from "../queries/advisorLinks";
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

        return res.status(201).json({ success: true, message: "Link request sent." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }

})

router.get("/incoming", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id; // logged in user plays the client's role

    try {
        const links = await getIncomingRequests(userId);
        res.status(200).json({success: true, data: links})

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})

router.get("/outgoing", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id; // logged in user plays the advisor's role

    try {
        const links = await getOutgoingRequests(userId);
        return res.status(200).json({success: true, data: links})

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

router.patch("/:id/accept", authMiddleware, async (req, res) => { // the client to accept the request 
    const linkId = Number(req.params.id);
    const userId = (req as any).user?.id;

    try {
        if (isNaN(linkId)) {
            return res.status(400).json({ success: false, message: "Invalid link id" });
        }

        const link = await getLinkById(linkId);

        if (link === null) {
            return res.status(404).json({ success: false, message: "Link not found" });
        }

        // link.clientId === userId, which means only client can accept the request
        if (link.clientId !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to accept this request" });
        }

        if (link.status !== 'pending') {
            return res.status(400).json({ success: false, message: "This request cannot be accepted" });
        }

        const updatedLink = await updateLinkStatus(linkId, 'accepted');

        return res.status(200).json({success: true, data: updatedLink})


    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

router.patch("/:id/revoke", authMiddleware, async (req, res) => { // both to revoke the request
    const linkId = Number(req.params.id);
    const userId = (req as any).user?.id;

    try {
        if (isNaN(linkId)) {
            return res.status(400).json({ success: false, message: "Invalid link id" });
        }

        const link = await getLinkById(linkId);

        if (!link) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        if (userId !== link.advisorId && userId !== link.clientId) {
            return res.status(403).json({ success: false, message: "User error" });
        }

        if (link.status === 'revoked') {
            return res.status(400).json({ success: false, message: "Request error" });
        }

        const updatedLinkStatus = await updateLinkStatus(linkId, 'revoked');

        return res.status(200).json({success: true, data: updatedLinkStatus})

        
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }

})



// the advisor, asking "who are my current accepted clients?"

router.get("/clients", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id;

    try {
        const clients = await getMyClients(userId);
        return res.status(200).json({success: true, data: clients})

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }

})


// the client, asking "who currently has access to my data?"

router.get("/advisors", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id;

    try {
        const advisors = await getMyAdvisors(userId);
        return res.status(200).json({success: true, data: advisors})

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }

})


export default router