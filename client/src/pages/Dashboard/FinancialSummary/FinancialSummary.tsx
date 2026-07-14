import { useState, useEffect } from "react"
import { saveStartingBalance, getStartingBalance } from "../../../api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import './FinancialSummary.css'

interface Transaction {
    id: number
    amount: number
    category: string
    description: string
    type: "income" | "expense"
    date: string
}

interface FinancialSummaryProps {
  allTransactions: Transaction[]
}

export function FinancialSummary({ allTransactions }: FinancialSummaryProps) {

    const [netBalance, setNetBalance] = useState("");
    const [balanceSavedInDB, setBalanceSavedInDB] = useState(false);

    const [isLoadingBalance, setIsLoadingBalance] = useState(true)


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

    return (
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
    )
}