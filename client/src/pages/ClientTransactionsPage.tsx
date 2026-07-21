import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { Header } from "./HeaderPages/Header"
import { getClientTransactions, getClientStartingBalance } from "../api";
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

    // --------------------------------------------------------------------

    const [netBalance, setNetBalance] = useState("");
    const [balanceSavedInDB, setBalanceSavedInDB] = useState(false);

    const totalIncome = allTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = allTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const formatMoney = (amount: number | string) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const numericAmount = amount ? parseFloat(amount.toString()) : 0;

        return formatter.format(numericAmount);
    };

    useEffect(() => {
        async function findStartingBalance() {
            try {
                const response = await getClientStartingBalance(clientIdNum);
                const data = await response.json();

                if (!response.ok) {
                    console.log(data.message)
                    return
                }

                if (data.startingBalance !== null && data.startingBalance !== undefined) {
                    setNetBalance(String(data.startingBalance))
                    setBalanceSavedInDB(true)
                }

            } catch (err) {
                console.log(err)
            }
        }

        findStartingBalance()
    }, [clientIdNum])

    // --------------------------------------------------------------------

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
        
        <div className="income-expense-container">
                <div className="income-expense-balance">
                    <div className="income-expense">
                    <div className="income">
                        <div id="income-text">Total income</div>
                        <div id="income-number"><p>${totalIncome.toFixed(2)}</p></div>
                    </div>
                    <div className="expense">
                        <div id="expense-text">Total expenses</div>
                        <div id="expense-number"><p>${totalExpenses.toFixed(2)}</p></div>
                    </div>
                </div>
                <div className="net-balance">
                    <div id="net-balance-text">Net balance</div>
    
                    {balanceSavedInDB && (
                        <div id="net-balance-number">
                            <p id="net-balance-number-p">
                                {formatMoney(Number(netBalance) + totalIncome - totalExpenses)}
                            </p>
                        </div>
                    )}
    
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}