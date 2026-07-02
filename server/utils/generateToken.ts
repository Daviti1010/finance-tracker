import jwt from "jsonwebtoken"


export function generateToken(userInfo: object) {
    return jwt.sign(
        userInfo,
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    )
}