import { it, expect, describe, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LinksPage } from './LinksPage';
import { ThemeProvider } from '../../context/ThemeContext';
import {
    sendLinkRequest,
    getIncomingRequests,
    getOutgoingRequests,
    // acceptLinkRequest,
    // revokeLink,
    getMyClients,
    getMyAdvisors,
    getMe
} from '../../api';

vi.mock("../../api", () => ({
    sendLinkRequest: vi.fn(),
    getIncomingRequests: vi.fn(),
    getOutgoingRequests: vi.fn(),
    acceptLinkRequest: vi.fn(),
    revokeLink: vi.fn(),
    getMyClients: vi.fn(),
    getMyAdvisors: vi.fn(),
    getMe: vi.fn()
}));

function mockResponse(data: unknown) {
    return { json: async () => ({ success: true, data }) };
}

beforeEach(() => {
    vi.clearAllMocks();
    (getOutgoingRequests as Mock).mockResolvedValue(mockResponse([]));
    (getIncomingRequests as Mock).mockResolvedValue(mockResponse([]));
    (getMyClients as Mock).mockResolvedValue(mockResponse([]));
    (getMyAdvisors as Mock).mockResolvedValue(mockResponse([]));
    (getMe as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ username: "testuser" }),
    });
});

describe("Links Page", () => {
    it("shows a sent request as outgoing after submitting", async () => {
        const user = userEvent.setup();

        let outgoingData: unknown[] = [];

        (getOutgoingRequests as Mock).mockImplementation(() =>
            Promise.resolve(mockResponse(outgoingData))
        );

        (sendLinkRequest as Mock).mockImplementation(async () => {
            outgoingData = [{ id: 1, clientEmail: "client@gmail.com", status: "pending" }];
            return { json: async () => ({ success: true }) };
        });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <LinksPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await user.type(screen.getByRole("textbox"), "client@gmail.com");
        await user.click(screen.getByRole("button", { name: /submit/i }));

        expect(await screen.findByText(/request to client@gmail.com — pending/i)).toBeInTheDocument();
    });
})