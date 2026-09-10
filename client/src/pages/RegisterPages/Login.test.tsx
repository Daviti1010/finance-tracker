import { it, expect, describe, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Login } from './Login';
import { login } from '../../api';



vi.mock("../../api", () => ({
  login: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe("Login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("renders with empty fields by default", async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(screen.getByLabelText(/email/i)).toHaveValue("");
        expect(screen.getByLabelText(/password/i)).toHaveValue("");
    })

    it("shows a validation error for empty fields before submitting", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.click(screen.getByRole("button", { name: /Log In/i }));

        expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    })

    it("displays a server-returned error message when the API call fails", async () => {
        (login as Mock).mockResolvedValue({
            json: async () => ({ success: false, message: "Invalid credentials" }),
        });

        const user = userEvent.setup();
        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.type(screen.getByLabelText(/email/i), "user@gmail.com");
        await user.type(screen.getByLabelText(/password/i), "user1234!");
        await user.click(screen.getByRole("button", { name: /Log In/i }));

        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    })

    it("on successful login, stores the token / redirects appropriately", async () => {
        const user = userEvent.setup();

        (login as Mock).mockResolvedValue({
            json: async () => ({ success: true, accessToken: "Token" }),
        });

        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.type(screen.getByLabelText(/email/i), "user1@gmail.com");
        await user.type(screen.getByLabelText(/password/i), "user12345!");
        await user.click(screen.getByRole("button", { name: /Log In/i }));

        await vi.waitFor(() => {
            expect(localStorage.getItem("accessToken")).toBe("Token");
        });

        await new Promise((resolve) => setTimeout(resolve, 1600));

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    })
})