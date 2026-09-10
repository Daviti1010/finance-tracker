import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { AddTransaction } from './AddTransactions';
// import { addTransaction } from '../../../../api';

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
})