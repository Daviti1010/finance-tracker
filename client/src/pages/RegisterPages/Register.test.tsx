import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { Register } from './Register';


vi.mock("../../api", () => ({
    register: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // localStorage.clear();
    });

    it("renders with empty fields by default", async () => {
        render(<MemoryRouter><Register /></MemoryRouter>);

        expect(screen.getByLabelText(/username/i)).toHaveValue("");
        expect(screen.getByLabelText(/email/i)).toHaveValue("");
        expect(screen.getByLabelText(/password/i)).toHaveValue("");
    })

    it("disables create account button until password is valid", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><Register /></MemoryRouter>);

        expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();

        await user.type(screen.getByLabelText(/password/i), "ValidPass123!");

        expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled();
    });

    it("shows all fields required error when username and email are empty", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><Register /></MemoryRouter>);

        await user.type(screen.getByLabelText(/password/i), "Password123!");

        const createButton = screen.getByRole("button", { name: /create account/i });
        expect(createButton).toBeEnabled();

        await user.click(createButton);

        expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
})