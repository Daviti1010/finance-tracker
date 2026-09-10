import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
import { Login } from './Login';
import { MemoryRouter } from "react-router-dom";


describe("Login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with empty fields by default", async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(screen.getByLabelText(/email/i)).toHaveValue("");
        expect(screen.getByLabelText(/password/i)).toHaveValue("");
    })
})