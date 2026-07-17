import { getLinkStatus } from "../queries/advisorLinks";


export async function requireClientAccess(req: any, res: any, next: any) {
    const advisorId = req.user.id;
    const clientId = parseInt(req.params.clientId);

    try {
        if (isNaN(clientId)) {
            return res.status(400).json({ success: false, message: "Invalid client id" });
        }

        if (advisorId === clientId) return next();

        const status = await getLinkStatus(advisorId, clientId);

        if (status !== 'accepted') {
            return res.status(403).json({ error: 'Not authorized to view this data' });
        }
        
        next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
