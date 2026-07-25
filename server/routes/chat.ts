import { GoogleGenAI } from "@google/genai";
import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const userMessage = req.body.message;
        const previousInteractionId = req.body.previous_interaction_id;

        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: `${userMessage}`,
            system_instruction: `You are a finance assistant embedded in a personal finance tracker app. 
            Only answer questions related to personal finance, budgeting, 
            the app's dashboard, transactions, and money management topics. 
            If asked about anything unrelated, politely decline and redirect 
            the user back to finance-related topics.`,
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