import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getTransactions } from '../api';
import type { Transaction } from "../types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeftLong } from '@fortawesome/free-solid-svg-icons'
import './Charts.css'

export function ChartsPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    function aggregateByPeriod(transactions: Transaction[]) {
        const buckets: Record<string, { income: number; expenses: number }> = {};

        transactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

            if (!buckets[key]) buckets[key] = { income: 0, expenses: 0 };

            if (t.type === "income") buckets[key].income += Number(t.amount);
            if (t.type === "expense") buckets[key].expenses += Number(t.amount);
        });

        return Object.entries(buckets)
            .map(([date, values]) => ({ date, ...values }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async function fetchTransactions() {
        try {
            const response = await getTransactions("all", "all");
            const data = await response.json();

            if (!response.ok) {
                console.log(data.message);
                return [];
            }

            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }


    useEffect(() => {
        async function loadData() {
            const transactions = await fetchTransactions();
            setAllTransactions(transactions);
        }
        loadData();
    }, []);


    const chartData = useMemo(() => {
        const filtered = allTransactions.filter(
            t => new Date(t.date).getFullYear() === selectedYear
        );
        return aggregateByPeriod(filtered);
    }, [allTransactions, selectedYear]);

    const availableYears = Array.from(
        new Set(allTransactions.map(t => new Date(t.date).getFullYear()))
    ).sort((a, b) => a - b);

    const hasPrevYear = availableYears.includes(selectedYear - 1);
    const hasNextYear = availableYears.includes(selectedYear + 1);

    return (
        <>
        <div className="charts-page">
            <Link to="/dashboard" className="back-to-dashboard">
            <FontAwesomeIcon icon={faLeftLong} className="right-arrow-icon"/>
            {" "} Back to dashboard</Link>

            <div className="year-nav">
                <button
                    className="year-nav-button"
                    disabled={!hasPrevYear}
                    onClick={() => setSelectedYear(y => y - 1)}
                >
                    ← {selectedYear - 1}
                </button>

                <span className="year-nav-current">{selectedYear}</span>

                <button
                    className="year-nav-button"
                    disabled={!hasNextYear}
                    onClick={() => setSelectedYear(y => y + 1)}
                >
                    {selectedYear + 1} →
                </button>
            </div>

            {chartData.length === 0 ? (
                <p className="no-data-message">No transactions for {selectedYear}.</p>
            ) : (
                <ResponsiveContainer width="100%" maxHeight={500} aspect={1.618}>
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="#82ca9d" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="expenses" fill="#f87171" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
        </>
    );
}