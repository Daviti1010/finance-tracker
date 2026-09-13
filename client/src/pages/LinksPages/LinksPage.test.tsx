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
    acceptLinkRequest,
    revokeLink,
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

    it("shows an incoming request with accept and reject buttons", async () => {
        (getIncomingRequests as Mock).mockResolvedValue(mockResponse([
            { id: 2, advisorEmail: "advisor@gmail.com", status: "pending" }
        ]));

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <LinksPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText(/request from advisor@gmail.com — pending/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    });

    it("removes the request from incoming and outgoing when rejected", async () => {
        const user = userEvent.setup();

        let incomingData: unknown[] = [
            { id: 2, advisorEmail: "advisor@gmail.com", status: "pending" }
        ];

        (getIncomingRequests as Mock).mockImplementation(() =>
            Promise.resolve(mockResponse(incomingData))
        );

        (revokeLink as Mock).mockImplementation(async () => {
            incomingData = [];
            return { json: async () => ({ success: true }) };
        });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <LinksPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await screen.findByText(/request from advisor@gmail.com — pending/i);

        await user.click(screen.getByRole("button", { name: /reject/i }));

        expect(screen.queryByText(/request from advisor@gmail.com/i)).not.toBeInTheDocument();
    });

    it("moves an accepted link to My Clients", async () => {
        const user = userEvent.setup();

        let incomingData: unknown[] = [
            { id: 3, advisorEmail: "advisor@gmail.com", status: "pending" }
        ];
        let advisorsData: unknown[] = [];

        (getIncomingRequests as Mock).mockImplementation(() =>
            Promise.resolve(mockResponse(incomingData))
        );

        (getMyAdvisors as Mock).mockImplementation(() =>
            Promise.resolve(mockResponse(advisorsData))
        );

        (acceptLinkRequest as Mock).mockImplementation(async () => {
            incomingData = [];
            advisorsData = [{ id: 3, advisorEmail: "advisor@gmail.com", status: "accepted" }];
            return { json: async () => ({ success: true }) };
        });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <LinksPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await screen.findByText(/request from advisor@gmail.com — pending/i);

        await user.click(screen.getByRole("button", { name: /accept/i }));

        expect(await screen.findByText("advisor@gmail.com")).toBeInTheDocument();
        expect(screen.queryByText(/request from advisor@gmail.com — pending/i)).not.toBeInTheDocument();
    });
})