import { useState } from "react"
import { it, expect, describe, vi, beforeEach, type Mock} from 'vitest';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpperPart } from './UpperPart';
import { getTransactions } from '../../../../api';

const formattedDate = new Date().toISOString().split('T')[0];

vi.mock("../../../../api", () => ({
    getTransactions: vi.fn(),
}));

// const mockTransactionsResponse = {
//     ok: true,
//     json: async () => ([{ id: 1, type: "expense", category: "food", date: formattedDate }]),
// };

const defaultProps = {
    expenseCategories: [
        { value: "food", label: "Food & Groceries" },
        { value: "rent", label: "Rent / Housing" },
        { value: "transport", label: "Transport" },
        { value: "utilities", label: "Utilities" },
        { value: "entertainment", label: "Entertainment" },
        { value: "shopping", label: "Shopping" },
        { value: "health", label: "Health & Fitness" },
        { value: "subscriptions", label: "Subscriptions" },
        { value: "education", label: "Education" },
        { value: "other", label: "Other" }
    ],

    incomeCategories: [
        { value: "salary", label: "Salary" },
        { value: "freelance", label: "Freelance" },
        { value: "investments", label: "Investments" },
        { value: "gifts", label: "Gifts" },
        { value: "other", label: "Other" }
    ],

    setDisplayedTransactions: vi.fn(),
    fetchTransactions: vi.fn(),
    filterType: "all",
    setFilterType: vi.fn(),
    filterCategory: "all",
    setFilterCategory: vi.fn(),
    setCurrentPage: vi.fn(),
};

function TestWrapper(props: Partial<typeof defaultProps>) {
    const [filterType, setFilterType] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");

    return (
        <UpperPart
            {...defaultProps}
            {...props}
            filterType={filterType}
            setFilterType={setFilterType}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
        />
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    (getTransactions as Mock).mockImplementation((type?: string, category?: string) => {
        return Promise.resolve({
            ok: true,
            json: async () => ([
                { id: 1, type: type ?? "all", category: category ?? "all", date: formattedDate }
            ]),
        });
    });
});

describe("Filter Transactions", () => {
    it("calls getTransactions with selected type", async () => {
        const user = userEvent.setup();
        render(<TestWrapper />)

        await user.selectOptions(screen.getByRole("combobox", { name: /type/i }), "expense");
        await user.click(screen.getByRole("button", { name: /search/i }));
        
        expect(defaultProps.setDisplayedTransactions).toHaveBeenCalledWith([
            { id: 1, type: "expense", category: "all", date: formattedDate }
        ]);
    })

    it("calls getTransactions with type and category together", async () => {
        const user = userEvent.setup();
        render(<TestWrapper />)

        await user.selectOptions(screen.getByRole("combobox", { name: /type/i }), "income");
        await user.selectOptions(screen.getByRole("combobox", { name: /category/i }), "salary");
        await user.click(screen.getByRole("button", { name: /search/i }));

        expect(defaultProps.setDisplayedTransactions).toHaveBeenCalledWith([
            { id: 1, type: "income", category: "salary", date: formattedDate }
        ]);
    })
})