import { it, expect, describe, vi, beforeEach , type Mock} from 'vitest';
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

    it("STEP 1.1: shows validation error when email is empty", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

        await user.click(screen.getByRole("button", { name: /Send Recovery Code To Email/i }));

        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    })

    it("STEP 1.2: moves to Step 2 after successfully requesting a code", async () => {
        const user = userEvent.setup();

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            })
        );

        render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

        await user.type(screen.getByLabelText(/email/i), "user12345@gmail.com");
        await user.click(screen.getByRole("button", { name: /Send Recovery Code To Email/i }));

        expect(await screen.findByLabelText(/code/i)).toBeInTheDocument();
    });

    it("STEP 2: shows error when code is empty", async () => {
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

    it("STEP 3: shows an error and stays on Step 2 when the code is invalid", async () => {
        const user = userEvent.setup();

        (globalThis.fetch as Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            }) // response for sendCode
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ valid: false, message: "Invalid or expired code" }),
            }); // response for checkCode

        render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

        await user.type(screen.getByLabelText(/email/i), "user12345@gmail.com");
        await user.click(screen.getByRole("button", { name: /Send Recovery Code To Email/i }));

        const codeInput = await screen.findByLabelText(/code/i);
        await user.type(codeInput, "999999");
        await user.click(screen.getByRole("button", { name: /confirm code/i }));

        expect(await screen.findByText(/Invalid or expired code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    })
})