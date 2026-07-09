import { Header } from "./HeaderPages/Header"
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { addTransaction } from "../api"
import './Dashboard.css'


export function Dashboard() {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food & Groceries")
    const [description, setDescription] = useState("")

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

            setAmount("")
            setDescription("")
            setCategory("Food & Groceries")
            setType("Expense")
            setDate(new Date().toISOString().split("T")[0])

        } catch (err) {
            console.log(err)
        }

    }

    return (
        <>
            <Header />

            <div className="dashboard-page">
                <div className="income-expense-container">
                    <div className="income-expense">
                        <div className="income">
                            <div id="income-text">Total income</div>
                            <div id="income-number">$3,200.00</div>
                        </div>
                        <div className="expense">
                            <div id="expense-text">Total expenses</div>
                            <div id="expense-number">$1,840.00</div>
                        </div>
                        <div className="net-balance">
                            <div id="net-balance-text">Net balance</div>
                            <div id="net-balance-number">$1,360.00</div>
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
                    <div className="all-transactions">
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

                        <div className="list">
                            <div className="transaction">
                                <div className="transaction-left-side">
                                    <img src="/green-arrow.png" alt="" className="arrow green-arrow"/>
                                    <div className="transaction-text">
                                        <p className="category">Salary</p>
                                        <p className="description">June paycheck</p>
                                    </div>
                                </div>

                                <div className="transaction-right-side">
                                    <p className="transaction-date">Jun 1</p>
                                    <p className="transaction-amount positive">+$3,200</p>
                                    <button className="delete-button"><FontAwesomeIcon icon={faTrashCan} /></button>
                                </div>
                            </div>

                            <div className="transaction">
                                <div className="transaction-left-side">
                                    <img src="/red-arrow.png" alt="" className="arrow red-arrow"/>
                                    <div className="transaction-text">
                                        <p className="category">Rent</p>
                                        <p className="description">Monthly rent</p>
                                    </div>
                                </div>

                                <div className="transaction-right-side">
                                    <p className="transaction-date">Jun 2</p>
                                    <p className="transaction-amount negative">-$1,200</p>
                                    <button className="delete-button"><FontAwesomeIcon icon={faTrashCan} /></button>
                                </div>
                            </div>

                            <div className="transaction">
                                <div className="transaction-left-side">
                                    <img src="/red-arrow.png" alt="" className="arrow red-arrow"/>
                                    <div className="transaction-text">
                                        <p className="category">Food</p>
                                        <p className="description">Weekly groceries</p>
                                    </div>
                                </div>

                                <div className="transaction-right-side">
                                    <p className="transaction-date">Jun 4</p>
                                    <p className="transaction-amount negative">-$400</p>
                                    <button className="delete-button"><FontAwesomeIcon icon={faTrashCan} /></button>
                                </div>
                            </div>

                            <div className="transaction">
                                <div className="transaction-left-side">
                                    <img src="/red-arrow.png" alt="" className="arrow red-arrow"/>
                                    <div className="transaction-text">
                                        <p className="category">Transport</p>
                                        <p className="description">Bus pass</p>
                                    </div>
                                </div>

                                <div className="transaction-right-side">
                                    <p className="transaction-date">Jun 5</p>
                                    <p className="transaction-amount negative">-$140</p>
                                    <button className="delete-button"><FontAwesomeIcon icon={faTrashCan} /></button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}