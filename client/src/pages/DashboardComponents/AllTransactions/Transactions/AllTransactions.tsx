import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { deleteTransaction } from "../../../../api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from "../../../../types"
import './AllTransactions.css'

interface AddTransactionProps {
  setAllTransactions: Dispatch<SetStateAction<Transaction[]>>
  setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
  displayedTransactions: Transaction[]
}


export function AllTransactions({setAllTransactions, setDisplayedTransactions, displayedTransactions}: AddTransactionProps) {


    const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedTransactionId(prev => (prev === id ? null : id));
    };

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    async function handleDeleteTransaction(id: number) {
        try { 
            const response = await deleteTransaction(id);
            const data = await response.json();

            if (data.success) {
                console.log("Deleted!")
                // setTransactions((prev) => prev.filter(t => t.id !== id))
                setDisplayedTransactions((prev) => prev.filter(t => t.id !== id))
                setAllTransactions((prev) => prev.filter(t => t.id !== id))
            } else {
                console.log("Error deleting!")
            }

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="all-transactions">
            <div className="list">
                {displayedTransactions.map((t) => (
                    <div key={t.id} className="transaction" onClick={() => toggleExpand(t.id)}>
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
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                                className="delete-button">
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div>

                        {expandedTransactionId === t.id && (
                            <div className="transaction-details">
                                <p className="transaction-date-mobile">{formatDate(t.date)}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}