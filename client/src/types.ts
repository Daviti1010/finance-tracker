export interface AdvisorClientLink {
    id: number;
    advisorId: number;
    clientId: number;
    status: "pending" | "accepted" | "revoked";
    createdAt: string;
    updatedAt: string;
}