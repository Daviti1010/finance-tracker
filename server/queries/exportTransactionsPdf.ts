import { getStartingBalance, getTransactions } from "./transactions";
import PDFDocument from "pdfkit";
import { formatLocalDate } from "../utils/dateFormat";

export async function exportTransactionsPdf(req: any, res: any) {
    const userId = req.user?.id;
    const type = req.query?.type;
    const category = req.query?.category;

    try {
        const transactions = await getTransactions(userId, type as string, category as string);
        const rawStartingBalance = await getStartingBalance(userId);
        const startingBalance = Number(rawStartingBalance?.starting_balance) || 0;

        const isFiltered = Boolean(type || category);

        const totalIncome = transactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpenses = transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const netForPeriod = totalIncome - totalExpenses;
        const accountBalance = startingBalance + totalIncome - totalExpenses;

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="transactions.pdf"');
        doc.pipe(res);

        
        doc.fontSize(18).text("Transaction Report", { align: "center" });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
        doc.moveDown(1.5);
        doc.fontSize(10).text(
            isFiltered ? `Filtered: ${type ?? "all types"} / ${category ?? "all categories"}` : "All transactions",
            { align: "center" }
        );

        
        doc.fontSize(12).text(`Starting Balance: $${startingBalance.toFixed(2)}`);
        doc.moveDown(0.5);

        doc.fontSize(12).text(`Total Income: $${totalIncome.toFixed(2)}`);
        doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`);
        doc.moveDown(0.5);

        if (isFiltered) {
            doc.text(`Net for this filter: $${netForPeriod.toFixed(2)}`);
            doc.moveDown(0.5);
            doc.fontSize(10).text(`Account Balance (all transactions): $${accountBalance.toFixed(2)}`);
        } else {
            doc.text(`Account Balance: $${accountBalance.toFixed(2)}`);
        }

        doc.fontSize(11);
        doc.moveDown(1.5);

        
        const colX = { date: 50, type: 150, category: 230, description: 320, amount: 480 };
        const pageBottom = 720;

        function drawTableHeader() {
            doc.fontSize(10).font("Helvetica-Bold");
            const y = doc.y;
            doc.text("Date", colX.date, y);
            doc.text("Type", colX.type, y);
            doc.text("Category", colX.category, y);
            doc.text("Description", colX.description, y);
            doc.text("Amount", colX.amount, y);
            doc.font("Helvetica");
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
        }

        drawTableHeader();

        transactions.forEach(t => {
            if (doc.y > pageBottom) {
                doc.addPage();
                drawTableHeader();
            }
            
            const y = doc.y;
            doc.fontSize(9);
            doc.text(formatLocalDate(t.date), colX.date, y, { width: 90 });
            doc.text(t.type, colX.type, y, { width: 70 });
            doc.text(t.category, colX.category, y, { width: 80 });
            doc.text(t.description ?? "", colX.description, y, { width: 150 });
            doc.text(`$${Number(t.amount).toFixed(2)}`, colX.amount, y, { width: 60 });
            doc.moveDown(0.7);
        });

        doc.end();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Export failed" });
    }
}