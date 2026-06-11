import express from "express";
import pool from "../db";
import bcrypt from "bcrypt";

const router = express.Router();

const salt_rounds = 10;

router.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })
    }

    try {
        const checkResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (checkResult.rows.length > 0) {
            return res.json({ success: false, message: "Email already in use" });
        } 

        const hash = await bcrypt.hash(password, salt_rounds);

        console.log("Hashed Password:", hash);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
            [name, email, hash]
        );

        const newUserId = result.rows[0].id;
        console.log(`User registered with ID: ${newUserId}`);

        res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})

export default router;