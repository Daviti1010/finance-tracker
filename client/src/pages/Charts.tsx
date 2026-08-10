import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import type { Transaction } from "../types"
import './Charts.css'


export function ChartsPage() {
    const [chartData, setChartData] = useState<{ date: string; income: number; expenses: number }[]>([]);

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
          const data = await response.json()
          
          if (!response.ok) {
              console.log(data.message)
              return
          }

          return data

      } catch (err) {
          console.log(err)
          return [];
      }
    }

    useEffect(() => {
        async function loadData() {
            const transactions = await fetchTransactions();
            const aggregated = aggregateByPeriod(transactions);
            setChartData(aggregated);
        }
        loadData();
    }, []);


    return (
        <div className='charts-page'>
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
        </div>
    )
}