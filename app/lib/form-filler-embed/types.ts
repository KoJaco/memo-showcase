export interface MemonicConfig {
    apiKey: string;
    apiUrl?: string;
    theme?: {
        primary?: string;
        background?: string;
        text?: string;
        border?: string;
    };
    logging?: {
        endpoint?: string;
        enabled?: boolean;
    };
}

export interface FormFieldConfig {
    type:
        | "text"
        | "number"
        | "textarea"
        | "checkbox"
        | "radio-group"
        | "select"
        | "date"
        | "time"
        | "duration";
    required: boolean;
    options?: string[];
    description?: string;
}

export interface FormConfig {
    id: string;
    name: string;
    description: string;
    fields: Array<{
        id: string;
        identifier: string;
        name: string;
        label: string;
        description?: string;
        type: FormFieldConfig["type"];
        required: boolean;
        options?: string[];
    }>;
}

export interface FunctionCall {
    name: string;
    args: Record<string, any>;
}

export interface Draft {
    name: string;
    args: Record<string, any>;
    status: "pending_confirmation" | "confirmed" | "rejected";
}

export interface TranscriptObject {
    text: string;
    stability?: number;
}

export type ConnectionStatus =
    | "connected"
    | "disconnected"
    | "connecting"
    | "error";
