import express from "express";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config()

const router = express.Router();

const salt_rounds = 10;

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
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
            [name, email, hash]
        );

        const newUserId = result.rows[0].id;
        console.log(`User registered with ID: ${newUserId}`);

        const accessToken = jwt.sign(
            { id: newUserId },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

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
            
            const accessToken = jwt.sign(userInfo, process.env.JWT_SECRET!, {
                expiresIn: '7d'
            })

            res.status(200).json({ success: true, accessToken: accessToken })

        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }


    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})




export default router;