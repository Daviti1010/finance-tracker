import { useState } from 'react';
import type { Dispatch, SetStateAction } from "react"
import { getTransactions } from '../../../../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from '../../../../types';
import './UpperPart.css'



interface UpperPartProps {
    expenseCategories: { value: string; label: string }[]
    incomeCategories: { value: string; label: string }[]
    setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
    fetchTransactions: () => Promise<void>
}



export function UpperPart({expenseCategories, incomeCategories, setDisplayedTransactions, fetchTransactions}: UpperPartProps) {

    const [filterType, setFilterType]= useState("expense");
    const [filterCategory, setFilterCategory] = useState("all")


    const filterCategoryOptions = [
        { value: "all", label: "All categories" },
        ...(filterType === "income" ? incomeCategories : expenseCategories)
    ]

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


    function handleReset() {
        setFilterType("expense")
        setFilterCategory("all")
        fetchTransactions()
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