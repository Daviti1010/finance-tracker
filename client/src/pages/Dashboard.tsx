import { Header } from "./HeaderPages/Header"
import './Dashboard.css'


export function Dashboard() {
    return (
        <>
            <Header />  

            <body>
                <div className="dashboard-page">
                    <div className="income-expense-container">
                        <div className="income-expense">
                            <div className="income">
                                <div id="income-text">Total income</div>
                                <div id="income-number">$3,200.00</div>
                            </div>
                            <div className="expense">
                                <div id="expense-text">Total expenses</div>
                                <div id="expense-number">$1,840.00</div>
                            </div>
                            <div className="net-balance">
                                <div id="net-balance-text">Net balance</div>
                                <div id="net-balance-number">$1,360.00</div>
                            </div>
                        </div>
                    </div>


                    <div className="transaction-input"></div>
                    <div className="all-transactions"></div>
                </div>  
            </body>
        </>
    )
}