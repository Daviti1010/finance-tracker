import { GoogleGenAI } from "@google/genai";
import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { getRecentTransactions } from "../queries/transactions";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({});

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 7,
  message: 'Too many chat requests, please try again later.',
  keyGenerator: (req: any) => req.user?.id ?? ipKeyGenerator(req.ip)
});

router.post("/", authMiddleware, chatRateLimiter, async (req, res) => {
    const userId = (req as any).user?.id;

    try {
        const transactions30Days = await getRecentTransactions(userId, 30);
        // console.log(transactions30Days);

        const compactList = transactions30Days.map(t => {
            const sign = t.type === 'income' ? '+' : '-';
            const dateStr = new Date(t.date).toLocaleDateString();
            return `• [${dateStr}] ${t.description} (${t.category}): ${sign}$${Number(t.amount)}`;
        }).join('\n');

        // console.log(compactList);

        const totalIncome = transactions30Days
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpenses = transactions30Days
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const financialContext = `
            Here is the user's financial data for the last 30 days:
            Total income: $${totalIncome}
            Total expenses: $${totalExpenses}

            Transactions:
            ${compactList.length > 0 ? compactList : "No transactions found in this period."} `;

        const userMessage = req.body.message;
        const previousInteractionId = req.body.previous_interaction_id;

        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: `${userMessage}`,
            system_instruction: `You are a finance assistant embedded in a personal finance tracker app. 
            Only answer questions related to personal finance, budgeting, 
            the app's dashboard, transactions, and money management topics. 
            If asked about anything unrelated, politely decline and redirect 
            the user back to finance-related topics. ${financialContext}`,
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