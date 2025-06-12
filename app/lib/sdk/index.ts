/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { v4 as uuid } from "uuid";
// TODO: Implement runtime val with Zod
// TODO: Implement Reconnection / back-off
// TODO: Add MediaRecorder WebM/Opus fallback

// ----------------- Primitives -----------------
type FunctionParamType =
    | "unspecified"
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "array"
    | "object";

/**
 * A subset of the OpenAPI 3.0 Schema Object.
 * This interface can be used for both output format schema and function calling schema. Google Gemini only accepts schemas of the following type.
 * -- DOCS: https://ai.google.dev/gemini-api/docs/structured-output?lang=rest#supply-schema-in-prompt
 *
 */
export type GenaiSchema = {
    // a genai.TypeObject
    // This is an int32 which map out to a specific type. 0 = "TypeUnspecified", 1 = "TypeString", 2 = "TypeNumber", 3 = "TypeInteger", 4 = "TypeBoolean", 5 = "TypeArray", 6 = "TypeObject"
    // note, included 'unspecified' so this must be included or listed as 'unspecified' in the client.
    type: FunctionParamType;

    // * OPTIONAL FIELDS
    description?: string;
    // format of the data, only used for primitives.. i.e., NUMBER type: float, double... INTEGER type: int32, int64... just handle on server
    format?: string;
    // indicates whether the value may be null.
    nullable?: boolean;
    // TODO: set enum format in parsing of schema on server
    // possible values of the element of Type.STRING with enum format.... for example, an Enum for the value 'headingLevel' as: {type: STRING, format: enum, enum: ["1", "2", "3"]}
    enum?: string[];
    // Schema of the elements of Type.ARRAY
    items?: GenaiSchema;
    // Object where keys represent the property name and values are a GenaiSchema.
    /**
     * {
     *  "level": {
     *      type: "string",
     *      format: enum,
     *      enum: ["1", "2", "3"],
     *      description: "Describes the hierarchy of the heading element. Level 1 will be H1, level 2 will be H2, level 3 will be H3."
     *  },
     *  {
     *  "content": {
     *      type: "string",
     *      description: "The actual text content of the heading."
     * },
     *  "order": {
     *      type: "number",
     *      description: "Where the heading lies within the overall document."
     * }
     *  }
     * }
     */
    properties?: { [key: string]: GenaiSchema };
    // Required properties of Type.OBJECT... use array here.
    // {"brightness", "temperature"}
    required?: string[];
};

// ---------------- config sent by client ---------------

export type FunctionCallingSchemaObject = {
    // The name of the function, i.e., 'updateHeadingElement'
    name: string;
    // The description of the function, i.e., 'Used to update an existing heading element using parameters to control the heading hierarchy (level 1, 2, 3) and setting the actual text content of the heading 'This is a heading'.
    description: string;
    // a genai.Schema -- expected in GoLang
    parameters: GenaiSchema;
};

export interface STTConfig {
    interimStabilityThreshold?: number; // => interim_stability_threshold
    encoding?: string;
    sampleHertz?: number; // => sample_hertz
}
export interface FunctionConfig {
    updateMs?: number; // => update_ms
    parsingGuide?: string; // => parsing_guide
    definitions: FunctionCallingSchemaObject[];
}

export interface InputContext {
    currentTranscript?: string; // => current_transcript
    currentFunctions?: FunctionCallReceived[]; // => current_functions
}

export interface ClientConfig {
    apiUrl: string;
    sessionId?: string; // => session_id
    language?: string;
    stt?: STTConfig;
    functionConfig?: FunctionConfig; // => function_config
    inputContext?: InputContext; // => input_context
}

// ---------- Messages received back *from* the server -------------

// TODO: this may need to be updated pending deepgram api

export interface FunctionCallReceived {
    name: string;
    args: { [name: string]: any };
}

export type Word = {
    text: string;
    start: number;
    end: number;
    confidence?: number;
};
export interface FunctionDraftDataReceived {
    draftId: string; // <= draft_id
    name: string;
    args: { [key: string]: any };

    similarityScore: number; // <= similarity_score
    status:
        | "pending_confirmation"
        | "confirmed_by_llm"
        | "awaiting_potential_update";
    timestamp: string;
}
export interface TranscriptMsg {
    type: "transcript";
    text: string;
    final: boolean;
    confidence?: number;
    stability?: number;
    words?: Word[];
}

export interface FunctionMsg {
    type: "functions";
    functions: FunctionCallReceived[];
}

export interface DraftMsg {
    type: "function_draft_extracted";
    data: FunctionDraftDataReceived;
}

export interface AckMsg {
    type: "ack";
    sessionId: string; // <= session_id
}

export interface SessionEndMsg {
    type: "session_end";
}

export type ServerMsg =
    | TranscriptMsg
    | FunctionMsg
    | DraftMsg
    | AckMsg
    | SessionEndMsg
    | { type: "error"; err: string };

// ----------- Helper types --------------------------
export interface GenaiObjectSchema<T extends Record<string, GenaiSchema>> {
    type: "object"; // This should be the value that corresponds to an object type.
    // Here, properties is explicitly typed as T, and required is an array of keys of T.
    properties: T;
    required?: Array<Extract<keyof T, string>>;
}

// Helper: for correctly typing required to the keys of the GenaiSchema object.
export function defineFunction<T extends Record<string, GenaiSchema>>(fn: {
    name: string;
    description: string;
    parameters: GenaiObjectSchema<T>;
}): FunctionCallingSchemaObject {
    return fn;
}

function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertRequiredArrayToSnakeCase(arr: string[]): string[] {
    return arr.map(toSnakeCase);
}

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertRequiredArrayToCamelCase(arr: string[]): string[] {
    return arr.map(toCamelCase);
}

function convertKeysToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToSnakeCase);
        // null is an object type
    } else if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);

            const value = obj[key];

            // special handling for 'required' as values refer to object keys (must be in appropriate casing for function calling schema.)
            if (snakeKey === "required" && Array.isArray(value)) {
                acc[snakeKey] = convertRequiredArrayToSnakeCase(value);
            } else {
                acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
            }

            return acc;
        }, {} as any);
    }

    return obj;
}

function convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToCamelCase);
    } else if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);

            const value = obj[key];

            if (camelKey === "required" && Array.isArray(value)) {
                acc[camelKey] = convertRequiredArrayToCamelCase(value);
            } else {
                acc[camelKey] = convertKeysToCamelCase(obj[key]);
            }

            return acc;
        }, {} as any);
    }
    return obj;
}

export class MemonicSDK {
    // Transport
    private ws: WebSocket | null = null;

    // Audio
    private mediaRecorder: MediaRecorder | null = null;
    private mediaStream: MediaStream | null = null;
    private isRecording = false;
    private firstChunkSent = false;

    // State
    private status: "disconnected" | "connecting" | "connected" | "error" =
        "disconnected";
    private readonly chunkMs: number;

    // Callbacks
    onFinal?: (text: string, words?: Word[], confidence?: number) => void;
    onInterim?: (
        text: string,
        words?: Word[],
        confidence?: number,
        stability?: number
    ) => void;
    onFuncs?: (f: FunctionCallReceived[]) => void;
    onDraft?: (d: FunctionDraftDataReceived) => void;
    onAck?: (id: string) => void;
    onEnd?: () => void;
    onErr?: (e: Error) => void;
    onStatus?: (s: typeof this.status) => void;

    // Constructor
    constructor(private url: string, private cfg: ClientConfig, chunkMs = 250) {
        this.chunkMs = chunkMs;
        if (!cfg.sessionId) cfg.sessionId = uuid();
    }

    // Connection

    connect(): void {
        this.setStatus("connecting");
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => this.onWsOpen();
        this.ws.onmessage = (ev) => this.onWsMsg(ev);
        this.ws.onerror = () => this.emitErr(new Error("ws-error"));
        this.ws.onclose = () => {
            this.setStatus("disconnected");
            this.onEnd?.();
        };
    }

    disconnect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.stopRecording();
            this.ws.close(1000, "client disconnect");
        }

        this.setStatus("disconnected");
    }

    private setStatus(s: typeof this.status) {
        this.status = s;
        this.onStatus?.(s);
    }

    private onWsOpen() {
        this.setStatus("connected");
        // Wait for the next tick to ensure WebSocket is fully ready
        setTimeout(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                const payload = convertKeysToSnakeCase({
                    type: "config",
                    ...this.cfg,
                });
                this.ws.send(JSON.stringify(payload));
            }
        }, 0);
    }

    private emitErr(e: Error) {
        this.setStatus("error");
        this.onErr?.(e);
    }

    private onWsMsg(ev: MessageEvent) {
        let msg: any;
        try {
            msg = convertKeysToCamelCase(JSON.parse(ev.data));
        } catch {
            return this.emitErr(new Error("Bad json from server"));
        }

        switch (msg.type) {
            case "ack":
                this.onAck?.(msg.sessionId);
                break;
            case "transcript":
                msg.final
                    ? this.onFinal?.(msg.text, msg.words, msg.confidence)
                    : this.onInterim?.(
                          msg.text,
                          msg.words,
                          msg.confidence,
                          msg.stability
                      );
                break;
            case "functions":
                this.onFuncs?.(msg.functions);
                break;
            case "function_draft_extracted":
                // console.log("DRAFT RECEIVED IN SDK:: ", msg.draftFunction);
                this.onDraft?.(msg.draftFunction);
                break;
            case "session_end":
                console.log("Session end hit");
                this.onEnd?.();
                break;
            case "error":
                this.emitErr(new Error(msg.err));
                break;
        }
    }

    // Mic streaming (lazy-start)

    public startRecording() {
        if (this.isRecording) return;

        if (!navigator.mediaDevices) {
            throw new Error("MediaDevices not supported");
        }

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            // Webclient - (stream) -> Server socket
            .then((stream) => {
                this.mediaStream = stream;
                this.mediaRecorder = new MediaRecorder(stream);
                this.isRecording = true; // mark recording flag to start recording recognition
                this.firstChunkSent = false; // reset flag at the start of a recording session
                this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
                    if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                        return;

                    // uncomment this to see whenever data is recorded.
                    // console.log("ondataavailable event fired: ", e);

                    // Conditional start.. only try to send messages if there is a socket, if the socket is OPEN, and if we are recording (initiated by the client)

                    if (!this.firstChunkSent) {
                        this.ws.send(JSON.stringify({ type: "audio_start" }));
                        this.firstChunkSent = true;
                    }

                    this.ws.send(e.data);
                };
                // startup
                this.mediaRecorder.start(this.chunkMs);
            })
            // error logging during streaming.
            .catch((err) => {
                this.emitErr(err);
            });
    }

    public stopRecording() {
        this.ws?.send(JSON.stringify({ type: "audio_stop" }));

        if (!this.isRecording) return;
        this.isRecording = false;
        this.firstChunkSent = false;

        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((t) => t.stop());
            this.mediaStream = null;
        }
    }

    getConnectionStatus() {
        return this.status;
    }
}

/**
 * Utility
 *
 * Manages a list of function drafts based on new incoming drafts and confirmed function calls by the LLM.
 *
 */
/* -------------------------------------------
   FunctionDraftManager (replacement)
-------------------------------------------- */
export class FunctionDraftManager {
    private drafts: FunctionDraftDataReceived[] = [];

    /* ---------- add / update draft ---------- */
    public newDraft(
        data: Omit<FunctionDraftDataReceived, "status">
    ): FunctionDraftDataReceived[] {
        const idx = this.drafts.findIndex(
            (d) => d.draftId === data.draftId || d.name === data.name
        );

        // 1️⃣ already confirmed? --> set status to awaiting_potential_update
        if (idx !== -1 && this.drafts[idx].status === "confirmed_by_llm") {
            const incoming: FunctionDraftDataReceived = {
                ...data,
                status: "awaiting_potential_update",
            };
            this.drafts[idx] = incoming;
            this.sortAndClean();
            return [...this.drafts];
        }

        const incoming: FunctionDraftDataReceived = {
            ...data,
            status: "pending_confirmation",
        };

        if (idx === -1) {
            this.drafts.push(incoming);
        } else if (
            incoming.similarityScore >= this.drafts[idx].similarityScore
        ) {
            // supersede weaker draft of the *same* name
            this.drafts[idx] = incoming;
        }

        this.sortAndClean();
        return [...this.drafts];
    }

    /* ---------- confirm / reconcile ---------- */
    public reconcileWithConfirmed(
        confirmed: FunctionCallReceived[]
    ): FunctionDraftDataReceived[] {
        const byName = new Map(confirmed.map((c) => [c.name, c]));

        // mark existing drafts
        this.drafts.forEach((d) => {
            const fn = byName.get(d.name);
            if (fn) {
                d.status = "confirmed_by_llm";
                d.args = fn.args;
                byName.delete(d.name);
            }
        });

        // 2️⃣ any brand-new confirmations create implicit drafts
        byName.forEach((fn) => {
            this.drafts.push({
                draftId: crypto.randomUUID(),
                name: fn.name,
                args: fn.args,
                similarityScore: 1,
                status: "confirmed_by_llm",
                timestamp: new Date().toISOString(),
            });
        });

        this.sortAndClean();
        return [...this.drafts];
    }

    /* ---------- housekeeping ---------- */
    private sortAndClean() {
        // keep one entry per draftId & highest score first
        this.drafts = Array.from(
            new Map(this.drafts.map((d) => [d.draftId, d])).values()
        ).sort((a, b) => b.similarityScore - a.similarityScore);
    }

    public clearDrafts(
        filter?: (d: FunctionDraftDataReceived) => boolean
    ): FunctionDraftDataReceived[] {
        this.drafts = filter ? this.drafts.filter((d) => !filter(d)) : [];
        return [...this.drafts];
    }

    public getDrafts() {
        return [...this.drafts];
    }
}
