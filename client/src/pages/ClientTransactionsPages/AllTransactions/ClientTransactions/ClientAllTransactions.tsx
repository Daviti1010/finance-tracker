import { useState } from "react";
import type { Transaction } from "../../../../types"

interface ClientAllTransactionProps {
  displayedTransactions: Transaction[]
}

export function ClientAllTransactions({displayedTransactions}: ClientAllTransactionProps) {

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