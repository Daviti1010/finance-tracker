import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({});

router.post("/", async (req, res) => {
    const userMessage = req.body.message;
    const previousInteractionId = req.body.previous_interaction_id;

    const interaction1 = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: `${userMessage}`,
    });
    const response1 = interaction1.output_text
    res.status(200).json({response1})
})

export default router