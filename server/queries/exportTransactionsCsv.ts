import { getTransactions } from "./transactions";
import { stringify } from "csv-stringify/sync";


export async function exportTransactionsCsv(req: any, res: any) {
    const userId = req.user?.id;
    const type = req.query?.type;
    const category = req.query?.category;

    try {
        const transactions = await getTransactions(userId, type as string, category as string);
        
        const rows = transactions;

        const mapped = rows.map((row: any) => ({
            date: row.date instanceof Date
                ? row.date.toISOString().split("T")[0]
                : row.date,
            type: row.type,
            category: row.category,
            description: row.description ?? "",
            amount: Number(row.amount).toFixed(2),
        }));

        const csvString = stringify(mapped, {
            header: true,
            columns: [
                { key: "date", header: "Date" },
                { key: "type", header: "Type" },
                { key: "category", header: "Category" },
                { key: "description", header: "Description" },
                { key: "amount", header: "Amount" },
            ],
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');

        return res.status(200).send(csvString);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Export failed" });
    }
}