import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({});

router.post("/", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const previousInteractionId = req.body.previous_interaction_id;

        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: `${userMessage}`,
            ...(previousInteractionId && { previous_interaction_id: previousInteractionId }),
        });

        const response = interaction.output_text;
        const responseId = interaction.id;

        res.status(200).json({ response, responseId });
    } catch (error) {
        console.error("Gemini API error:", error);
        res.status(500).json({ error: "Failed to get response from chatbot" });
    }
});

export default router