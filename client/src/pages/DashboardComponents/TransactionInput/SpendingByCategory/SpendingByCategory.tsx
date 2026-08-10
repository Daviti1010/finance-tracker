import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightLong } from '@fortawesome/free-solid-svg-icons'
import type { Transaction } from "../../../../types";
import "./SpendingByCategory.css";


interface SpendingByCategoryProps {
    allTransactions: Transaction[]
    expenseCategories: { value: string; label: string }[]
}

export function SpendingByCategory({allTransactions, expenseCategories}: SpendingByCategoryProps) {

    const expenseCategoryList = allTransactions
        .filter(t => t.type === "expense")
        .map(t => t.category)

    const categoryListLength = expenseCategoryList.length;

    const categoryCounts = expenseCategoryList.reduce((acc, str) => {
        acc[str] = (acc[str] || 0) + 1
        return acc
    }, {} as Record<string, number>)

  return (
    <div className="spending-by-category">
      <div className="spending-text">
        <p id="spending-text">Spending by category</p>
        <Link to="/charts" className="view-charts">View Charts <FontAwesomeIcon icon={faRightLong} className="right-arrow-icon"/></Link>
      </div>
      <div className="progress-bar-container">
        {expenseCategories.map((categ) => {
          const hasCount = categoryCounts[categ.value] !== undefined;
          const progressPercentage =
            (categoryCounts[categ.value] / categoryListLength) * 100;

          return hasCount ? (
            <div className="bar-and-text-div" key={categ.value}>
              <p
                className="spending-category"
                style={{ textTransform: "capitalize" }}
              >
                {categ.value}
              </p>
              <div
                className={`${categ.value}-progress-bar progress-bar`}
                style={
                  {
                    "--progress": `${progressPercentage}%`,
                  } as React.CSSProperties
                }
              ></div>

              <p className="percentage">{progressPercentage.toFixed(2)}%</p>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
