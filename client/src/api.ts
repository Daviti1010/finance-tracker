const BASE_URL = "http://localhost:3000"

const getToken = () => localStorage.getItem("accessToken")

export const api = {
    get: (endpoint: string) =>
        fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }),

    post: (endpoint: string, body: Record<string, unknown>) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(body)
        }),

    put: (endpoint: string, body: Record<string, unknown>) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(body)
        }),

    patch: (endpoint: string, body: Record<string, unknown>) => 
        fetch(`${BASE_URL}${endpoint}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: body ? JSON.stringify(body) : undefined
        }),

    delete: (endpoint: string) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })
}

export const register = (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password })

export const login = (email: string, password: string) => 
    api.post("/auth/login", {email, password})

export const checkUsername = (username: string) =>
    api.get(`/auth/check-username?username=${username}`)

export const getMe = () =>
    api.get("/auth/me")

export const addTransaction = 
    (transaction: {type: string, amount: number, category: string, description: string, date: string}) =>
    api.post("/transactions", transaction)

export const getTransactions = (type?: string, category?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    return api.get(`/transactions?${params.toString()}`);
};

export const deleteTransaction = (id: number) =>
    api.delete(`/transactions/${id}`)

export const saveStartingBalance = (startingBalance: number) => 
    api.put(`/auth/starting-balance`, {startingBalance})

export const getStartingBalance = () =>
    api.get("/auth/starting-balance")





export const sendLinkRequest = (clientEmail: string) =>
    api.post("/api/links", {clientEmail})

export const getIncomingRequests = () =>
    api.get("/api/links/incoming")

export const getOutgoingRequests = () =>
    api.get("/api/links/outgoing")

export const acceptLinkRequest = (linkId: number) => 
    api.patch(`/api/links/${linkId}/accept`, {linkId})

export const revokeLink = (linkId: number) => 
    api.patch(`/api/links/${linkId}/revoke`, {linkId})

export const getMyClients = () => 
    api.get("/api/links/clients")

export const getMyAdvisors = () => 
    api.get("/api/links/advisors")

export const getClientTransactions = (clientId: number, type?: string, category?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    const query = params.toString();
    return api.get(`/clients/${clientId}/transactions${query ? `?${query}` : ""}`);
};

export const getClientStartingBalance = (clientId: number) =>
    api.get(`/clients/${clientId}/starting-balance`)