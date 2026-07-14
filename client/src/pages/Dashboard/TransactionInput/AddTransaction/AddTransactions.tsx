import { useState } from 'react'
import type { Dispatch, SetStateAction } from "react"
import { addTransaction } from "../../../../api"
import './AddTransaction.css'

interface Transaction {
    id: number
    amount: number
    category: string
    description: string
    type: "income" | "expense"
    date: string
}

interface AddTransactionProps {
  expenseCategories: { value: string; label: string }[]
  incomeCategories: { value: string; label: string }[]
  setAllTransactions: Dispatch<SetStateAction<Transaction[]>>
  setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
}


export function AddTransaction({expenseCategories, incomeCategories, setAllTransactions, setDisplayedTransactions}: AddTransactionProps) {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("food")
    const [description, setDescription] = useState("")

    const [amountError, setAmountError] = useState("")

    const [dateError, setDateError] = useState("")

    const categoryOptions = type === "income" ? incomeCategories : expenseCategories


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

            // setTransactions((prev) => [data, ...prev])
            setAllTransactions((prev) => {
                const updated = [data, ...prev]
                return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            })

            setDisplayedTransactions((prev) => {
                const updated = [data, ...prev]
                return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            })

            setAmount("")
            setDescription("")
            setType("expense")
            setCategory(expenseCategories[0].value)
            setDate(new Date().toISOString().split("T")[0])

        } catch (err) {
            console.log(err)
        }
    }



  return (
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
              const newType = e.target.value;
              setType(newType);
              setCategory(
                newType === "income"
                  ? incomeCategories[0].value
                  : expenseCategories[0].value,
              );
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="amount-div">
          <label htmlFor="amount">Amount($)</label>
          <input
            type="text"
            name="amount"
            id="input-amount"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError("");
            }}
          />
          {amountError && <p className="amount-error-text">{amountError}</p>}
        </div>
      </div>

      <div className="add-transaction-second-part">
        <div
          className="category-div"
          style={{ marginTop: amountError ? "-10px" : "0" }}
        >
          <label htmlFor="category">Category</label>
          <select
            name="category"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((categ) => (
              <option key={categ.value} value={categ.value}>
                {categ.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="description-div">
        <label htmlFor="description">Description</label>
        <input
          type="text"
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
              setDate(e.target.value);
              setDateError("");
            }}
          />
        </div>
        {dateError && <p className="date-error-text">{dateError}</p>}
      </div>

      <button
        type="button"
        onClick={handleAddTransaction}
        style={{ marginTop: dateError ? "-8px" : "8px" }}
      >
        Add transaction
      </button>
    </div>
  );
}
