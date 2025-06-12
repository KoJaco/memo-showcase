export type ConnStatus = "connected" | "connecting" | "disconnected" | "error";

export interface Transcript {
    text: string;
    confidence: number;
}

export interface FunctionCall {
    name: string;
    args: Record<string, unknown>;
}

export interface FunctionDraft {
    name: string;
    args: Record<string, unknown>;
    status:
        | "pending_confirmation"
        | "confirmed_by_llm"
        | "awaiting_potential_update";
}
