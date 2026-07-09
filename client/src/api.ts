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
