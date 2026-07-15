import { Header } from "./HeaderPages/Header"
import { useState, useEffect } from "react"
import { getTransactions } from "../api"
import { FinancialSummary } from "./DashboardComponents/FinancialSummary/FinancialSummary"
import { AddTransaction } from "./DashboardComponents/TransactionInput/AddTransaction/AddTransactions"
import { SpendingByCategory } from "./DashboardComponents/TransactionInput/SpendingByCategory/SpendingByCategory"
import { UpperPart } from "./DashboardComponents/AllTransactions/UpperPart/UpperPart"
import { AllTransactions } from "./DashboardComponents/AllTransactions/Transactions/AllTransactions"
import './Dashboard.css'

interface Transaction {
    id: number
    amount: number
    category: string
    description: string
    type: "income" | "expense"
    date: string
}


export function Dashboard() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]) // +
    const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]) // +

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



    async function fetchTransactions() {
        try {
            const response = await getTransactions("all", "all");
            const data = await response.json()
            
            if (!response.ok) {
                console.log(data.message)
                return
            }

            // setTransactions(data)
            setAllTransactions(data); // to get all
            setDisplayedTransactions(data);

        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTransactions()
    }, [])

    return (
        <>
            <Header />

            <div className="dashboard-page">

                <FinancialSummary allTransactions={allTransactions}/>

                <div className="transaction-input">
                    
                    <AddTransaction expenseCategories={expenseCategories} incomeCategories={incomeCategories}
                    setAllTransactions={setAllTransactions} setDisplayedTransactions={setDisplayedTransactions} />

                    <SpendingByCategory allTransactions={allTransactions} expenseCategories={expenseCategories}/>

                </div>

                <div className="all-transactions-container">

                    <UpperPart expenseCategories={expenseCategories} incomeCategories={incomeCategories}
                    setDisplayedTransactions={setDisplayedTransactions} fetchTransactions={fetchTransactions}/>

                    <AllTransactions setDisplayedTransactions={setDisplayedTransactions} setAllTransactions={setAllTransactions}
                    displayedTransactions={displayedTransactions}/>
                    
                </div>
            </div>
        </>
    )
}