import { MemonicConfig } from "./types";

export class LoggingService {
    private endpoint: string;
    private enabled: boolean;
    private config: MemonicConfig;

    constructor(config: MemonicConfig) {
        this.config = config;
        this.endpoint =
            config.logging?.endpoint || "https://api.memonic.ai/logs";
        this.enabled = config.logging?.enabled ?? true;
    }

    public async logFormInteraction(formId: string, data: any) {
        if (!this.enabled) return;

        try {
            await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    formId,
                    timestamp: new Date().toISOString(),
                    data,
                }),
            });
        } catch (error) {
            console.error("Failed to log form interaction:", error);
        }
    }

    public async logError(error: Error, context: any = {}) {
        if (!this.enabled) return;

        try {
            await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    type: "error",
                    timestamp: new Date().toISOString(),
                    error: {
                        message: error.message,
                        stack: error.stack,
                    },
                    context,
                }),
            });
        } catch (err) {
            console.error("Failed to log error:", err);
        }
    }
}
