import { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { Transaction } from "../../../types"
import { getClientStartingBalance } from "../../../api";

interface FinancialSummaryProps {
  allTransactions: Transaction[]
}

export function ClientFinancialSummary({ allTransactions }: FinancialSummaryProps) {

    const { clientId } = useParams();
    const clientIdNum = Number(clientId);

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
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}