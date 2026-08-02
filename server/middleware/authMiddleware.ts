import jwt from 'jsonwebtoken';
import pool from '../db';

interface TokenPayload {
    id: number;
    name: string;
    tokenVersion: number;
}

async function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false }); 
    }

    if (authHeader) {
        const token: any = authHeader.split(" ")[1]; 
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

            const result = await pool.query("SELECT token_version FROM users WHERE id = $1", [decoded.id]);

            if (result.rows.length === 0) {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }

            const currentTokenVersion = result.rows[0].token_version;

            if (decoded.tokenVersion !== currentTokenVersion) {
                return res.status(401).json({ success: false, message: "Session expired, please log in again" });
            }

            req.user = decoded;

            next()

        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" })
        }


    } else {
        return res.status(401).json({ success: false })
    }
}

export default authMiddleware