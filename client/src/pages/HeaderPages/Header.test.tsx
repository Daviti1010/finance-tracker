import { it, expect, describe, beforeEach } from 'vitest';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from '../../context/ThemeContext';
import { Header } from './Header';

beforeEach(() => {
    localStorage.clear();
});

describe("Toggle Theme", () => {
    it("toggles theme state when clicked", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ThemeProvider> 
                    <Header /> 
                </ThemeProvider>
            </MemoryRouter>
        )

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
    })
})