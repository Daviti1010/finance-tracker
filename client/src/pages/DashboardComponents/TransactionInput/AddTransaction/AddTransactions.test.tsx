import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTransaction } from './AddTransactions';
import { addTransaction } from '../../../../api';

vi.mock('../../../../api', () => ({
    addTransaction: vi.fn(),
}));

const defaultProps = {
    expenseCategories: [
        { value: "food", label: "Food" },
        { value: "transport", label: "Transport" },
    ],

    incomeCategories: [
        { value: "salary", label: "Salary" },
        { value: "freelance", label: "Freelance" },
    ],

    setAllTransactions: vi.fn(),
    setDisplayedTransactions: vi.fn(),
};

const formattedDate = new Date().toISOString().split('T')[0];

describe("Add transaction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with empty fields by default", async () => {
        render(<AddTransaction {...defaultProps} />);

        expect(screen.getByLabelText(/type/i)).toHaveValue("expense");
        expect(screen.getByLabelText(/category/i)).toHaveValue("food");
        expect(screen.getByLabelText(/amount/i)).toHaveValue("");
        expect(screen.getByLabelText(/description/i)).toHaveValue("");
        expect(screen.getByLabelText(/date/i)).toHaveValue(formattedDate);
    });

    it("calls addTransaction with correct payload on submit", async () => {
        const user = userEvent.setup();
        render(<AddTransaction {...defaultProps} />);
    
        await user.selectOptions(screen.getByLabelText(/type/i), "expense");
        await user.selectOptions(screen.getByLabelText(/category/i), "Food");
        await user.type(screen.getByLabelText(/amount/i), "42.50");
        await user.type(screen.getByLabelText(/description/i), "Coffee");
        fireEvent.change(screen.getByLabelText(/date/i), "2026-09-10");

        await user.click(screen.getByRole("button", { name: /add transaction/i }));

        expect(addTransaction).toHaveBeenCalledTimes(1);
        expect(addTransaction).toHaveBeenCalledWith({
            type: "expense",
            amount: 42.5,
            category: "food",
            description: "Coffee",
            date: "2026-09-10",
        });
    })
})