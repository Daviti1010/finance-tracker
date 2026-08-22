import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react"
import type { Transaction } from "../../../../types"

interface ClientAllTransactionProps {
    displayedTransactions: Transaction[]
    setCurrentPage: Dispatch<SetStateAction<number>>
    currentPage: number
}

export function ClientAllTransactions({displayedTransactions, setCurrentPage, currentPage}: ClientAllTransactionProps) {

    const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);

    const itemsPerPage = 15;
    const totalPages = Math.ceil(displayedTransactions.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);

    const paginatedTransactions = displayedTransactions.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
    )

    const paginationRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        paginationRef.current?.scrollIntoView();
    }, [safePage]);
    
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
                {paginatedTransactions.map((t) => (
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

            {totalPages > 1 && (
                <div className="pagination-div" ref={paginationRef}>
                    <button className="pagination-button"
                    onClick={() => {
                        setCurrentPage(safePage - 1)
                    }}
                    disabled={safePage === 1}
                    >← Prev</button>

                    <p className="pagination-current">{`Page ${safePage} of ${totalPages}`}</p>

                    <button className="pagination-button"
                    onClick={() => {
                        setCurrentPage(safePage + 1)
                    }}
                    disabled={safePage === totalPages}
                    >Next →</button>
                </div>
            )}
        </div>
    )
}