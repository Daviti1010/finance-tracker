import { Header } from "./HeaderPages/Header"
import { useState } from "react"
import './Dashboard.css'


export function Dashboard() {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

    // function shiftDate(days: number) {
    //     const current = new Date(date)
    //     current.setDate(current.getDate() + days)
    //     setDate(current.toISOString().split("T")[0])
    // }
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
                                <select name="type" id="type">
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="amount-div">
                                <label htmlFor="amount">Amount($)</label>
                                <input type="text" name="amount" id="input-amount" placeholder="$0.00"/>
                            </div>
                        </div>

                        <div className="add-transaction-second-part">
                            <div className="category-div">
                                <label htmlFor="category">Category</label>
                                <select name="category" id="category">
                                    <option value="food">Food</option>
                                    <option value="rent">Rent</option>
                                    <option value="transport">Transport</option>
                                    <option value="salary">Salary</option>
                                    <option value="entertainment">Entertainment</option>
                                </select>
                            </div>
                        </div>

                        <div className="description-div">
                            <label htmlFor="description">Description</label>
                            <input type="text" name="description" id="description" placeholder="Optional Note..."/>
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

                        <button>Add transaction</button>
                    </div>

                    <div className="spending-by-category">
                    </div>
                </div>

                <div className="all-transactions"></div>
            </div>
        </>
    )
}