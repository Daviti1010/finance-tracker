import { Header } from "./HeaderPages/Header"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { deleteTransaction, getTransactions } from "../api"
import { FinancialSummary } from "./Dashboard/FinancialSummary/FinancialSummary"
import { AddTransaction } from "./Dashboard/TransactionInput/AddTransaction/AddTransactions"
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
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
    const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])


    const [filterType, setFilterType]= useState("expense");
    const [filterCategory, setFilterCategory] = useState("all")


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


    const filterCategoryOptions = [
        { value: "all", label: "All categories" },
        ...(filterType === "income" ? incomeCategories : expenseCategories)
    ]

    const expenseCategoryList = allTransactions
        .filter(t => t.type === "expense")
        .map(t => t.category)

    const categoryListLength = expenseCategoryList.length;

    const categoryCounts = expenseCategoryList.reduce((acc, str) => {
        acc[str] = (acc[str] || 0) + 1
        return acc
    }, {} as Record<string, number>)

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

    async function fetchFilteredTransactions() {
        try {
            const response = await getTransactions(filterType, filterCategory);
            const data = await response.json()
            
            if (!response.ok) {
                console.log(data.message)
                return
            }

            console.log(data[0])

            // setTransactions(data) // to filter 
            setDisplayedTransactions(data);

        } catch (err) {
            console.log(err)
        }
    }


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


    function handleReset() {
        setFilterType("expense")
        setFilterCategory("all")
        fetchTransactions()
    }


    return (
        <>
            <Header />

            <div className="dashboard-page">

                <FinancialSummary allTransactions={allTransactions}/>

                <div className="transaction-input">
                    
                    <AddTransaction expenseCategories={expenseCategories} incomeCategories={incomeCategories}
                    setAllTransactions={setAllTransactions} setDisplayedTransactions={setDisplayedTransactions} />

                    <div className="spending-by-category">
                        <div className="spending-text">
                            <p id="spending-text">Spending by category</p>
                        </div>
                            <div className="progress-bar-container">
                                {expenseCategories.map((categ) => {
                                    const hasCount = categoryCounts[categ.value] !== undefined;
                                    const progressPercentage = ((categoryCounts[categ.value]) / categoryListLength * 100);

                                    return hasCount ? (
                                        <div className="bar-and-text-div" key={categ.value}>
                                            <p className="spending-category" style={{ textTransform: 'capitalize' }}>
                                                {categ.value}
                                            </p>
                                            <div className={`${categ.value}-progress-bar progress-bar`}
                                            style={{ "--progress": `${progressPercentage}%` } as React.CSSProperties}
                                            ></div>
                                            
                                            <p className="percentage">{progressPercentage.toFixed(2)}%</p> 
                                        </div>
                                    ) : null;
                                })}
                            </div>
                    </div>
                </div>

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