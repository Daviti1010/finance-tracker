import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { Header } from "../HeaderPages/Header"
import { ClientFinancialSummary } from "./FinancialSummary/ClientFinancialSummary";
import { ClientTransactionsUpperPart } from "./AllTransactions/ClientTransactionsUpperPart/ClientTransactionsUpperPart";
import { ClientAllTransactions } from "./AllTransactions/ClientTransactions/ClientAllTransactions";
import { getClientTransactions } from "../../api";
import type { Transaction } from "../../types";


export function ClientTransactionsPage() {
    const { clientId } = useParams();
    const clientIdNum = Number(clientId);

    // console.log(clientIdNum);

    const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
        
    const [filterType, setFilterType] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all")

    const incomeCategories = [
        { value: "salary", label: "Salary" },
        { value: "freelance", label: "Freelance" },
        { value: "investments", label: "Investments" },
        { value: "gifts", label: "Gifts" },
        { value: "other", label: "Other" },
    ]

    const expenseCategories = [
        { value: "food", label: "Food & Groceries" },
        { value: "rent", label: "Rent / Housing" },
        { value: "transport", label: "Transport" },
        { value: "utilities", label: "Utilities" },
        { value: "entertainment", label: "Entertainment" },
        { value: "shopping", label: "Shopping" },
        { value: "health", label: "Health & Fitness" },
        { value: "subscriptions", label: "Subscriptions" },
        { value: "education", label: "Education" },
        { value: "other", label: "Other" },
    ]

    const fetchClientTransactions = useCallback(async (type?: string, category?: string) => {
        if (!clientId || isNaN(clientIdNum)) {
            console.error("Invalid client id");
            return;
        }

        try {
            const response = await getClientTransactions(clientIdNum, type, category);

            if (!response.ok) {
                console.error("Failed to fetch transactions:", response.status);
                return;
            }

            const data = await response.json();
            setDisplayedTransactions(data);
            setAllTransactions(data)

        } catch (err) {
            console.error(err);
        }
    }, [clientId, clientIdNum]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClientTransactions();
    }, [fetchClientTransactions]);

    return (
        <>
        <Header />

        <ClientFinancialSummary allTransactions={allTransactions} />
        

        <div className="all-transactions-container">

            <ClientTransactionsUpperPart 
                expenseCategories={expenseCategories} 
                incomeCategories={incomeCategories}
                clientIdNum={clientIdNum} 
                setDisplayedTransactions={setDisplayedTransactions}
                fetchClientTransactions={fetchClientTransactions}
                filterType={filterType}
                setFilterType={setFilterType} 
                filterCategory={filterCategory} 
                setFilterCategory={setFilterCategory}
            />

            <ClientAllTransactions 
                displayedTransactions={displayedTransactions}
            />

        </div>
        </>
    )
}