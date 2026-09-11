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

    it("shows error when code is empty", async () => {
        const user = userEvent.setup();

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ message: 'Success' }),
            })
        );

        render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

        await user.type(screen.getByLabelText(/email/i), "user12345@gmail.com");
        await user.click(screen.getByRole("button", { name: /Send Recovery Code To Email/i }));
        
        const confirmButton = await screen.findByRole('button', { name: /confirm code|checking/i });
        await user.click(confirmButton);  

        const errorMessage = await screen.findByText(/code needs to be 6 digit/i);
        expect(errorMessage).toBeInTheDocument();
    })
})