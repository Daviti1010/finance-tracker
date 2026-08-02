import express, { Request, Response } from "express";
import pool from "../db";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { generateToken } from "../utils/generateToken";
import { getStartingBalance } from "../queries/transactions";
import authMiddleware from "../middleware/authMiddleware";
import { sendPasswordResetEmail } from "../services/email";
import { generateRandom6DigitCode } from "../utils/generateResetCode";
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';


dotenv.config()

const router = express.Router();

const salt_rounds = 10;


const ForgotPasswordIpLimiter = rateLimit({
  windowMs: 60 * 1000 * 15,
  max: 3,
  message: 'Too many password reset requests, please try again later.',
  keyGenerator: (req: any) => ipKeyGenerator(req.ip)
});

const ForgotPasswordEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests for this account, please try again later.',
  keyGenerator: (req: any) => req.body?.email ?? 'unknown',
});

const ResetPasswordIpLimiter = rateLimit({
  windowMs: 60 * 1000 * 15,
  max: 3,
  message: 'Too many password reset requests, please try again later.',
  keyGenerator: (req: any) => ipKeyGenerator(req.ip)
});

const ResetPasswordEmailRateLimiter = rateLimit({
  windowMs: 60 * 1000 * 15,
  max: 3,
  message: 'Too many password reset requests, please try again later.',
  keyGenerator: (req: any) => req.body?.email ?? 'unknown',
});



router.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Field Error", message: "All fields are required" })
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password Error", message: "Password must be at least 8 characters" })
    }

    try {
        const existing = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            [name]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Username is already in use." });
        }

        const checkResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (checkResult.rows.length > 0) {
            return res.json({ success: false, error: "Email Exists", message: "Email already in use" });
        } 

        const hash = await bcrypt.hash(password, salt_rounds);

        console.log("Hashed Password:", hash);

        const result = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
            [name, email, hash]
        );

        const newUser = result.rows[0];
        const newUserId = newUser.id;
        console.log(`User registered with ID: ${newUserId}`);

        const newUserInfo = { id: newUser.id, name: newUser.username }

        const accessToken = generateToken(newUserInfo)

        res.status(201).json({ success: true, message: "User registered successfully", accessToken });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})


router.get("/check-username", async (req, res) => {
    const username = req.query.username;

    // console.log("query:", req.query)
    // console.log("username:", req.query.username, typeof req.query.username)

    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" })
    }

    try {
        const result = await pool.query("SELECT id FROM users WHERE username = $1", [username])

        const exists = result.rows.length > 0;
        res.status(200).json({ exists })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
})



router.post("/login", async (req, res) => {
    const emailEnteredByUser = req.body.email;
    const passwordEnteredByUser = req.body.password;

    if (!emailEnteredByUser || !passwordEnteredByUser) {
        return res.status(400).json({ success: false, message: "Incorrect email or password" })
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [emailEnteredByUser]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = result.rows[0];        
        const passwordSavedInDB = user.password_hash;

        const userInfo = { id: user.id, name: user.name }

        const isMatch = await bcrypt.compare(passwordEnteredByUser, passwordSavedInDB)

        if (isMatch) {
            
            const accessToken = generateToken(userInfo);

            res.status(200).json({ success: true, accessToken: accessToken })

        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }


    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})


router.get("/me", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id;

    try {
        const result = await pool.query("SELECT username FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({ username: result.rows[0].username })

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.get("/starting-balance", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id;

    try {
        const startingBalanceResult = await getStartingBalance(userId);

        if (!startingBalanceResult) {
            return res.status(404).json({ message: "Balance not found" });
        }

        res.status(200).json({ success: true, startingBalance: startingBalanceResult.starting_balance });
        
        
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }

})

router.put("/starting-balance", authMiddleware, async (req, res) => {
    const userId = (req as any).user?.id;
    const {startingBalance} = req.body;

    if (startingBalance === undefined || isNaN(Number(startingBalance))) {
        return res.status(400).json({ message: "Invalid starting balance" })
    }

    try {
        const result = await pool.query("UPDATE users SET starting_balance = $1 WHERE id = $2", 
            [startingBalance, userId])

        return res.status(200).json({ success: true })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
})


router.post("/forgot-password", [ForgotPasswordIpLimiter, ForgotPasswordEmailRateLimiter], async (req: Request, res: Response) => {
    const userEmail = req.body.email;

    try {
        const findUserByEmail = await pool.query("SELECT * FROM users WHERE email = $1", [userEmail]) 

        if (findUserByEmail.rows.length === 0) {
            return res.status(200).json({ message: "If that email exists, a code was sent." });
        }

        const userId = findUserByEmail.rows[0].id;

        await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId])

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const rawCode = generateRandom6DigitCode();
        const tokenHash = await bcrypt.hash(rawCode, 10);

        await pool.query(`
            INSERT INTO password_reset_tokens
            (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, [userId, tokenHash, expiresAt])

        const result = await sendPasswordResetEmail(userEmail, rawCode);

        
        if (result.error) {
            console.error("Failed to send reset email:", result.error);
        }

        return res.status(200).json({ message: "If that email exists, a code was sent." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})

router.post("/check-code", [ResetPasswordIpLimiter, ResetPasswordEmailRateLimiter], async (req: Request, res: Response) => {
    const submittedCode = req.body.code;
    const userEmail = req.body.email;

    try {
        const findUserByEmail = await pool.query("SELECT * FROM users WHERE email = $1", [userEmail]) 

        if (findUserByEmail.rows.length === 0) {
            return res.status(200).json({ valid: false, message: "Invalid or expired code" });
        }

        const userId = findUserByEmail.rows[0].id;

        const result = await pool.query("SELECT * FROM password_reset_tokens WHERE user_id = $1", [userId])

        if (result.rows.length === 0) {
            return res.status(200).json({ valid: false, message: "Invalid or expired code" });
        }

        const tokenRow = result.rows[0];

        if (new Date() > tokenRow.expires_at) {
            return res.status(200).json({ valid: false, message: "Invalid or expired code" });
        }

        const isMatch = await bcrypt.compare(submittedCode, tokenRow.token_hash)

        if (!isMatch) {
            return res.status(200).json({ valid: false, message: "Invalid or expired code" });
        }

        return res.status(200).json({ valid: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})


router.post("/reset-password", [ResetPasswordIpLimiter, ResetPasswordEmailRateLimiter], async (req: Request, res: Response) => {
    const userEmail = req.body.email;
    const submittedCode = req.body.code;
    const newPassword = req.body.new_password;

    try {
        const findUserByEmail = await pool.query("SELECT * FROM users WHERE email = $1", [userEmail]) 

        if (findUserByEmail.rows.length === 0) {
            return res.status(200).json({ message: "Invalid or expired code" });
        }

        const userId = findUserByEmail.rows[0].id;

        const result = await pool.query("SELECT * FROM password_reset_tokens WHERE user_id = $1", [userId])

        if (result.rows.length === 0) {
            return res.status(200).json({ message: "Invalid or expired code" });
        }

        const tokenRow = result.rows[0];

        if (new Date() > tokenRow.expires_at) {
            return res.status(200).json({ message: "Invalid or expired code" });
        }

        const isMatch = await bcrypt.compare(submittedCode, result.rows[0].token_hash)

        if (!isMatch) {
            return res.status(200).json({ message: "Invalid or expired code" });

        } else {
            
            const hash = await bcrypt.hash(newPassword, salt_rounds);
            
            await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, userId]);

            await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId])

            return res.status(200).json({success: true, message: "Password reset is successful"})
        }


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})

export default router;