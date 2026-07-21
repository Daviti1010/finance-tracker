import { useState } from "react";
import type { Dispatch, SetStateAction } from "react"
import { getClientTransactions } from "../../../../api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from '../../../../types';


interface UpperPartProps {
    clientIdNum: number;
    setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
    fetchClientTransactions: () => Promise<void>
}


export function ClientTransactionsUpperPart({clientIdNum, setDisplayedTransactions, fetchClientTransactions}: UpperPartProps) {


    const [filterType, setFilterType] = useState("expense");
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

    function handleReset() {
        setFilterType("expense")
        setFilterCategory("all")
        fetchClientTransactions()
    }


    return (
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
    )
}