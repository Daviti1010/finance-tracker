import { Header } from "./HeaderPages/Header"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons'
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

    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food & Groceries")
    const [description, setDescription] = useState("")

    const [netBalance, setNetBalance] = useState("");
    const [balanceSavedInDB, setBalanceSavedInDB] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([])

    const [isLoadingBalance, setIsLoadingBalance] = useState(true)

    // const [income, setIncome] = useState("");

    // async function getIncome() {
        
    // }

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await getTransactions();
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

        fetchTransactions()
    }, [])

    async function handleAddTransaction() {

        if (!amount || isNaN(Number(amount))) {
            console.log("Please enter a valid amount")
            return
        }

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
                    setNetBalance(data.startingBalance)
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
                                    <p id="net-balance-number-p">{formatMoney(netBalance)}</p>
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
                                    placeholder="Enter net balance:"
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
                                <select name="type"
                                  id="type"
                                  value={type}
                                  onChange={(e) => setType(e.target.value)}>

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
                                  onChange={(e) => setAmount(e.target.value)}/>
                            </div>
                        </div>

                        <div className="add-transaction-second-part">
                            <div className="category-div">
                                <label htmlFor="category">Category</label>
                                <select name="category"
                                  id="category"
                                  value={category} 
                                  onChange={(e) => setCategory(e.target.value)}>

                                    <option value="food">Food & Groceries</option>
                                    <option value="rent">Rent / Housing</option>
                                    <option value="transport">Transport</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="health">Health & Fitness</option>
                                    <option value="subscriptions">Subscriptions</option>
                                    <option value="education">Education</option>
                                    <option value="salary">Salary</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="investments">Investments</option>
                                    <option value="gifts">Gifts</option>
                                    <option value="other">Other</option>
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
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="button" onClick={handleAddTransaction}>Add transaction</button>
                    </div>

                    <div className="spending-by-category">
                        <p id="spending-text">Spending by category</p>
                        <div className="progress-bar-container">
                            <div className="bar-and-text-div">
                                <p className="spending-category">Rent</p>
                                <div className="rent-progress-bar"></div>
                                <p className="percentage">65%</p>
                            </div>

                            <div className="bar-and-text-div">
                                <p className="spending-category">Food</p>
                                <div className="food-progress-bar"></div>
                                <p className="percentage">35%</p>
                            </div>

                            <div className="bar-and-text-div">
                                <p className="spending-category">Transport</p>
                                <div className="transport-progress-bar"></div>
                                <p className="percentage">8%</p>
                            </div>

                            <div className="bar-and-text-div">
                                <p className="spending-category">Entertainment</p>
                                <div className="entertainment-progress-bar"></div>
                                <p className="percentage">2%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="all-transactions-container">
                    <div className="upper-part">
                            <p id="transactions-text">Transactions</p>
                            <select name="select-income-or-expense" id="select-income-or-expense">
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                            <select name="select-category" id="select-category">
                                <option value="food">Food & Groceries</option>
                                <option value="rent">Rent / Housing</option>
                                <option value="transport">Transport</option>
                                <option value="utilities">Utilities</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="shopping">Shopping</option>
                                <option value="health">Health & Fitness</option>
                                <option value="subscriptions">Subscriptions</option>
                                <option value="education">Education</option>
                                <option value="salary">Salary</option>
                                <option value="freelance">Freelance</option>
                                <option value="investments">Investments</option>
                                <option value="gifts">Gifts</option>
                                <option value="other">Other</option>
                            </select>
                            <button>Search</button>
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
                                            <p className="category">{t.category}</p>
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