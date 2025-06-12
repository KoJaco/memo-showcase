import {
    MemonicConfig,
    FormConfig,
    ConnectionStatus,
    FunctionCall,
    Draft,
    TranscriptObject,
} from "./types";
import { FormHandler } from "./form-handler";
import { LoggingService } from "./logging-service";
import { FloatingMenu } from "./floating-menu";
import { MemonicSDK } from "../sdk/index";

export class MemonicEmbed {
    private config: MemonicConfig;
    private sdk: MemonicSDK;
    private observer?: IntersectionObserver;
    private menu: FloatingMenu | null = null;
    private formHandler: FormHandler | null = null;
    private loggingService: LoggingService;
    private isRecording: boolean = false;
    private connectionStatus: ConnectionStatus = "disconnected";

    constructor(config: MemonicConfig) {
        this.config = {
            apiUrl: "wss://memonic-api.fly.dev/ws",
            ...config,
        };
        this.loggingService = new LoggingService(this.config);

        // 1. Create and inject the menu component
        this.menu = new FloatingMenu({
            onRecordingToggle: this.handleRecording.bind(this),
            onConnect: this.connect.bind(this),
            onDisconnect: this.disconnect.bind(this),
            status: this.connectionStatus,
            isRecording: this.isRecording,
        });

        // 2. Initialize the SDK
        const apiUrl = this.config.apiUrl || "wss://memonic-api.fly.dev/ws";
        this.sdk = new MemonicSDK(apiUrl, {
            apiUrl,
            language: "en-US",
            stt: {
                interimStabilityThreshold: 0.8,
                sampleHertz: 16000,
            },
            functionConfig: {
                updateMs: 800,
                parsingGuide: "",
                definitions: [],
            },
            inputContext: undefined,
        });

        // 3. Set up form observation
        this.setupFormObserver();
    }

    private setupFormObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                const isFormVisible = entries.some(
                    (entry) =>
                        entry.isIntersecting && entry.intersectionRatio > 0.1
                );
                this.menu?.updateVisibility(isFormVisible);
            },
            {
                threshold: 0.1,
                rootMargin: "-100px 0px",
            }
        );

        // Observe all forms on the page
        document
            .querySelectorAll("form, [data-form-container]")
            .forEach((form) => {
                this.observer?.observe(form);
                this.formHandler = new FormHandler(form as HTMLFormElement);
            });
    }

    private handleRecording() {
        if (this.connectionStatus !== "connected") {
            console.warn("Cannot start recording: WebSocket not connected");
            return;
        }

        if (this.isRecording) {
            this.sdk.stopRecording();
        } else {
            this.sdk.startRecording();
        }
        this.isRecording = !this.isRecording;
        this.menu?.updateRecordingState(this.isRecording);
    }

    private connect() {
        this.sdk.connect();
    }

    private disconnect() {
        this.sdk.disconnect();
    }

    public destroy() {
        this.observer?.disconnect();
        this.menu?.destroy();
        this.sdk.disconnect();
    }
}
