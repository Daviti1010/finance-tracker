import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
})