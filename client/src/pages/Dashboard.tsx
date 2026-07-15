import { Header } from "./HeaderPages/Header"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { deleteTransaction, getTransactions } from "../api"
import { FinancialSummary } from "./Dashboard/FinancialSummary/FinancialSummary"
import { AddTransaction } from "./Dashboard/TransactionInput/AddTransaction/AddTransactions"
import { SpendingByCategory } from "./Dashboard/TransactionInput/SpendingByCategory/SpendingByCategory"
import { UpperPart } from "./Dashboard/AllTransactions/UpperPart/UpperPart"
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
    const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])


    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

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

    async function handleDeleteTransaction(id: number) {
        try { 
            const response = await deleteTransaction(id);
            const data = await response.json();

            if (data.success) {
                console.log("Deleted!")
                // setTransactions((prev) => prev.filter(t => t.id !== id))
                setDisplayedTransactions((prev) => prev.filter(t => t.id !== id))
                setAllTransactions((prev) => prev.filter(t => t.id !== id))
            } else {
                console.log("Error deleting!")
            }

        } catch (err) {
            console.log(err)
        }
    }


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


                    <div className="all-transactions">
                        <div className="list">
                            {displayedTransactions.map((t) => (
                                <div key={t.id} className="transaction">
                                    <div className="transaction-left-side">
                                        <img 
                                          src={t.type === "income" ? "/green-arrow.png" : "/red-arrow.png"}
                                          alt=""
                                          className={t.type === "income" ? "arrow green-arrow" : "arrow red-arrow"}/>

                                        <div className="transaction-text">
                                            <p className="category" style={{ textTransform: 'capitalize' }}>{t.category}</p>
                                            <p className="description">{t.description}</p>
                                        </div>
                                    </div>

                                    <div className="transaction-right-side">
                                        <p className="transaction-date">{formatDate(t.date)}</p>
                                        <p className={t.type === "income" ?
                                             "transaction-amount positive" : "transaction-amount negative"}>
                                                {t.type === "income" ? "+$" : "-$"}{t.amount}</p>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="delete-button"><FontAwesomeIcon icon={faTrashCan} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}