export interface AdvisorClientLink {
    id: number;
    advisorId: number;
    clientId: number;
    status: "pending" | "accepted" | "revoked";
    createdAt: string;
    updatedAt: string;
}


export interface Transaction {
    id: number
    amount: number
    category: string
    description: string
    type: "income" | "expense"
    date: string
}