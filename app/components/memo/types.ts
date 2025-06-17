export type TranscriptObject = {
    text: string;
    stability?: number;
};

export type FormField = {
    id: string;
    identifier: string;
    name: string;
    label: string;
    description?: string;
    type:
        | "text"
        | "email"
        | "number"
        | "date"
        | "time"
        | "select"
        | "checkbox"
        | "textarea"
        | "radio-group"
        | "duration";
    required: boolean;
    options?: string[];
    draft?: boolean;
};

type CheckedState = boolean | "indeterminate";

export type FormFieldValue =
    | string
    | readonly string[]
    | number
    | undefined
    | CheckedState;

export type Template = {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
};

export type FormConfig = {
    name: string;
    description?: string;
    templates: Template[];
    config: {
        memonic: {
            chunkSize: number;
            interimStabilityThreshold: number;
        };
    };
};

export type ActionData =
    | { success: true }
    | { success: false; errors: Record<string, string> };
