import { Header } from "./HeaderPages/Header"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPen, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { addTransaction, deleteTransaction, getStartingBalance, getTransactions, saveStartingBalance } from "../api"
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
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("food")
    const [description, setDescription] = useState("")

    const [netBalance, setNetBalance] = useState("");
    const [balanceSavedInDB, setBalanceSavedInDB] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([])

    const [isLoadingBalance, setIsLoadingBalance] = useState(true)

    const [amountError, setAmountError] = useState("")

    const [dateError, setDateError] = useState("")

    const [filterType, setFilterType]= useState("expense");
    const [filterCategory, setFilterCategory] = useState("all")

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    const formatMoney = (amount: number | string) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const numericAmount = amount ? parseFloat(amount.toString()) : 0;

        return formatter.format(numericAmount);
    };

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

    const categoryOptions = type === "income" ? incomeCategories : expenseCategories
    const filterCategoryOptions = [
        { value: "all", label: "All categories" },
        ...(filterType === "income" ? incomeCategories : expenseCategories)
    ]

    async function fetchTransactions() {
        try {
            const response = await getTransactions("all", "all");
            const data = await response.json()
            
            if (!response.ok) {
                console.log(data.message)
                return
            }

            console.log(data[0])

            setTransactions(data)

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

            setTransactions(data)

        } catch (err) {
            console.log(err)
        }
    }

    async function handleAddTransaction() {

        if (!amount || isNaN(Number(amount))) {
            setAmountError("Please enter a valid amount")
            console.log("Please enter a valid amount")
            return
        }

        const today = new Date().toISOString().split("T")[0]
            if (date > today) {
                setDateError("Date cannot be in the future")
            return
        }

        setAmountError("")
        setDateError("")

        try {
            const response = await addTransaction({
                type,
                amount: Number(amount),
                category,
                description,
                date
            })

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                console.log(data.message)
                return
            }

            setTransactions((prev) => [data, ...prev])

            setAmount("")
            setDescription("")
            setCategory("Food & Groceries")
            setType("Expense")
            setDate(new Date().toISOString().split("T")[0])

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
                setTransactions((prev) => prev.filter(t => t.id !== id))
            } else {
                console.log("Error deleting!")
            }

        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        async function findStartingBalance() {
            try {
                const response = await getStartingBalance();
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
            } finally {
                setIsLoadingBalance(false)
            }
        }

        findStartingBalance()
    }, [])


    async function saveInputNumber() {
        if (!netBalance) return
        
        try {  
            const response  = await saveStartingBalance(Number(netBalance));
            const data = await response.json();

            if (!response.ok) {
                console.log(data.message)
                return
            }

            setBalanceSavedInDB(true)

        } catch (err) {
            console.log(err)
        }
    }

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0)

    function handleReset() {
        setFilterType("expense")
        setFilterCategory("all")
        fetchTransactions()
    }


    return (
        <>
            <Header />

            <div className="dashboard-page">
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
                                    <button id="edit-balance-btn" onClick={() => setBalanceSavedInDB(false)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                </div>
                            )}

                        {!isLoadingBalance && !balanceSavedInDB && (
                            <div className="net-balance-enter">
                                <input 
                                    type="number" 
                                    name="enter-number"
                                    id="enter-number"
                                    placeholder="Enter startingy balance:"
                                    value={netBalance} 
                                    onChange={(e) => setNetBalance(e.target.value)}
                                />
                                <button className="save-net-balance-btn" onClick={saveInputNumber}>Save</button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                <div className="transaction-input">
                    <div className="add-transaction">
                        <p id="add-transaction-text">Add transaction</p>
                        <div className="add-transaction-first-part">
                            <div className="type-div">
                                <label htmlFor="type">Type</label>
                                    <select
                                        name="type"
                                        id="type"
                                        value={type}
                                        onChange={(e) => {
                                            const newType = e.target.value
                                            setType(newType)
                                            setCategory(newType === "income" ? incomeCategories[0].value : expenseCategories[0].value)
                                        }}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                            </div>

                            <div className="amount-div">
                                <label htmlFor="amount">Amount($)</label>
                                <input type="text"
                                  name="amount"
                                  id="input-amount"
                                  placeholder="$0.00"
                                  value={amount}
                                  onChange={(e) => {
                                    setAmount(e.target.value)
                                    setAmountError("")
                                  }}/>
                                  {amountError && <p className="amount-error-text">{amountError}</p>}
                            </div>
                        </div>

                        <div className="add-transaction-second-part">
                            <div className="category-div" style={{ marginTop: amountError ? "-10px" : "0" }}>
                                <label htmlFor="category">Category</label>
                                <select name="category"
                                  id="category"
                                  value={category} 
                                  onChange={(e) => setCategory(e.target.value)}>

                                    {categoryOptions.map((categ) => (
                                        <option key={categ.value} value={categ.value}>{categ.label}</option>
                                    ))}

                                </select>
                            </div>
                        </div>

                        <div className="description-div">
                            <label htmlFor="description">Description</label>
                            <input type="text"
                              name="description" 
                              id="description" 
                              value={description} 
                              placeholder="Optional Note..."
                              onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="date-div">
                            <label htmlFor="date">Date</label>
                            <div className="date-stepper">
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={date}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => {
                                        setDate(e.target.value)
                                        setDateError("")
                                    }}
                                />
                            </div>
                            {dateError && <p className="date-error-text">{dateError}</p>}
                        </div>

                        <button type="button" onClick={handleAddTransaction}  style={{ marginTop: dateError ? "-8px" : "8px" }}>Add transaction</button>
                    </div>

                    <div className="spending-by-category">
                        <div className="spending-text">
                            <p id="spending-text">Spending by category</p>
                        </div>
                        <div className="progress-bar-container">
                            {expenseCategories.map((categ) => (
                                <div className="bar-and-text-div">
                                    <p className="spending-category" style={{ textTransform: 'capitalize' }}>{categ.value}</p>
                                    <div className={`${categ.value}-progress-bar progress-bar`}></div>
                                    <p className="percentage">65%</p>
                                </div>
                            ))}
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
                            {transactions.map((t) => (
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