import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { Header } from "./HeaderPages/Header"
import { ClientFinancialSummary } from "./ClientTransactionsPages/FinancialSummary/ClientFinancialSummary";
import { getClientTransactions } from "../api";
import type { Transaction } from "../types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'


export function ClientTransactionsPage() {
    const { clientId } = useParams();
    const clientIdNum = Number(clientId);

    // console.log(clientIdNum);

    const [filterType, setFilterType] = useState("expense");
    const [filterCategory, setFilterCategory] = useState("all")

    const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])

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

    const filterCategoryOptions = [
        { value: "all", label: "All categories" },
        ...(filterType === "income" ? incomeCategories : expenseCategories)
    ]

    async function fetchFilteredTransactions() {
        try {
            const response = await getClientTransactions(clientIdNum, filterType, filterCategory);
            const data = await response.json()
            
            if (!response.ok) {
                console.log(data.message)
                return
            }

            console.log(data[0])

            setDisplayedTransactions(data);

        } catch (err) {
            console.log(err)
        }
    }

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }


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

    function handleReset() {
        setFilterType("expense")
        setFilterCategory("all")
        fetchClientTransactions()
    }

    return (
        <>
        <Header />

        <ClientFinancialSummary allTransactions={allTransactions} />
        

        <div className="all-transactions-container">
            <div className="upper-part">
                <p id="transactions-text">Transactions</p>

                <select
                    name="select-income-or-expense"
                    id="select-income-or-expense"
                    value={filterType}
                    onChange={(e) => {
                        const newType = e.target.value
                        setFilterType(newType)
                        setFilterCategory("all")
                    }}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                <select name="select-category"
                    id="select-category"
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}>

                    {filterCategoryOptions.map((categ) => (
                        <option key={categ.value} value={categ.value}>{categ.label}</option>
                    ))}

                </select>

                <button onClick={handleReset} id="reset-transactions-btn"><FontAwesomeIcon icon={faArrowRotateLeft} /></button>

                <button id="search-btn" type="button" onClick={fetchFilteredTransactions}>Search</button>
            </div>

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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}