import jwt from 'jsonwebtoken';


function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token: any = authHeader.split(" ")[1]; 
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);

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