import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ForgotPassword } from './ForgotPassword';

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Forgot Password", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows validation error when email is empty", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

        await user.click(screen.getByRole("button", { name: /Send Recovery Code To Email/i }));

        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    })
})