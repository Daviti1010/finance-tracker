// import { useState } from "react";
import type { Dispatch, SetStateAction } from "react"
import { getClientTransactions } from "../../../../api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from '../../../../types';


interface UpperPartProps {
    expenseCategories: { value: string; label: string }[]
    incomeCategories: { value: string; label: string }[]
    clientIdNum: number;
    setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
    fetchClientTransactions: () => Promise<void>
    filterType: string
    setFilterType: Dispatch<SetStateAction<string>>
    filterCategory: string
    setFilterCategory: Dispatch<SetStateAction<string>>
    setCurrentPage: Dispatch<SetStateAction<number>>
}


export function ClientTransactionsUpperPart({
    clientIdNum, expenseCategories, incomeCategories,
    setDisplayedTransactions, fetchClientTransactions, filterType, setFilterType,
    filterCategory, setFilterCategory, setCurrentPage}: UpperPartProps) {


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
        setFilterType("all")
        setFilterCategory("all")
        fetchClientTransactions()
        setCurrentPage(1)
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
                <option value="all">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

            <select name="select-category"
                id="select-category"
                value={filterCategory} 
                disabled={filterType === "all"}
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