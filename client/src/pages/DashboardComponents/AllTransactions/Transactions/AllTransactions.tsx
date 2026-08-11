import { useState, useRef, useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"
import { deleteTransaction } from "../../../../api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faDownload } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from "../../../../types"
import './AllTransactions.css'

interface AddTransactionProps {
    setAllTransactions: Dispatch<SetStateAction<Transaction[]>>
    setDisplayedTransactions: Dispatch<SetStateAction<Transaction[]>>
    displayedTransactions: Transaction[]
    filterType: string
    filterCategory: string
    setCurrentPage: Dispatch<SetStateAction<number>>
    currentPage: number
}


export function AllTransactions({setAllTransactions, setDisplayedTransactions, displayedTransactions, 
    filterType, filterCategory, setCurrentPage, currentPage}: AddTransactionProps) {


    const itemsPerPage = 15;
    const totalPages = Math.ceil(displayedTransactions.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);
    

    const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);
    
    const [exportingCSV, setExportingCSV] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);

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

    async function handleExportCsv() {
        setExportingCSV(true);

        try {
            const token = localStorage.getItem("accessToken");
            const params = new URLSearchParams();
            if (filterType && filterType !== "all") params.append("type", filterType);
            if (filterCategory && filterCategory !== "all") params.append("category", filterCategory);

            const res = await fetch(`/transactions/export/csv?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    alert("Session expired. Please log in again.");
                } else {
                    alert("Failed to export CSV. Try again.");
                }

                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "transactions.csv";
            a.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Failed to export CSV. Try again.")
        } finally {
            setExportingCSV(false);
        }
    }
    
    async function handleExportPdf() {
        setExportingPDF(true); 

        try {
            const token = localStorage.getItem("accessToken");
            const params = new URLSearchParams();
            if (filterType && filterType !== "all") params.append("type", filterType);
            if (filterCategory && filterCategory !== "all") params.append("category", filterCategory);

            const res = await fetch(`/transactions/export/pdf?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    alert("Session expired. Please log in again.");
                } else {
                    alert("Failed to export PDF. Try again.");
                }
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "transactions.pdf";
            a.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Failed to export PDF. Try again.");
        } finally {
            setExportingPDF(false);
        }
    }

    
    const paginatedTransactions = displayedTransactions.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
    )

    const paginationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        paginationRef.current?.scrollIntoView();
    }, [safePage]);



    return (
        <div className="all-transactions">
            <div className="export-buttons">
                <button className="csv-button" onClick={handleExportCsv} disabled={exportingCSV}>
                    <FontAwesomeIcon icon={faDownload} />{exportingCSV ? "Exporting..." : "Export CSV"}
                </button>

                <button className="pdf-button" onClick={handleExportPdf} disabled={exportingPDF}>
                    <FontAwesomeIcon icon={faDownload} />{exportingPDF ? "Exporting..." : "Export PDF"}
                </button>
            </div>

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