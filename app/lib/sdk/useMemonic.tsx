import { useEffect, useRef, useState, useCallback } from "react";
import {
    MemonicSDK,
    ClientConfig,
    FunctionCallReceived,
    FunctionDraftDataReceived,
    FunctionDraftManager,
    Word,
} from "./index";

type ConnStatus = "disconnected" | "connecting" | "connected" | "error";

interface UseMemonicOpts {
    /** Mandatory server / WS details etc. */
    config: ClientConfig;
    /** Share a manager across hooks – otherwise a fresh one is created */
    manager?: FunctionDraftManager;
}

/**
 * Real-time speech -> Memo functions hook
 *
 */

export function useMemonic({ config, manager }: UseMemonicOpts) {
    // stable refs
    const sdkRef = useRef<MemonicSDK | null>(null);
    const mgrRef = useRef<FunctionDraftManager>(
        manager ?? new FunctionDraftManager()
    );

    // React state
    const [finalTxt, setFinalTxt] = useState<{
        text: string;
        words?: Word[];
        confidence?: number;
    }>({
        text: "",
        words: [],
        confidence: 0,
    });
    const [interim, setInterim] = useState<{
        text: string;
        words?: Word[];
        confidence?: number;
        stability?: number;
    }>({
        text: "",
        words: [],
        confidence: 0,
        stability: 0,
    });
    const [funcs, setFuncs] = useState<FunctionCallReceived[]>([]);
    const [drafts, setDrafts] = useState<FunctionDraftDataReceived[]>([]);
    const [status, setStatus] = useState<ConnStatus>("disconnected");
    const [error, setError] = useState<Error | null>(null);

    // SDK init / teardown
    useEffect(() => {
        const sdk = new MemonicSDK(config.apiUrl, config);
        sdkRef.current = sdk;

        /* ---------- wire events -------------------------------------- */
        sdk.onFinal = (txt, words, confidence) =>
            setFinalTxt((prev) => ({
                text: prev.text ? `${prev.text.trimEnd()} ${txt}`.trim() : txt,
                words: words ? [...(prev.words ?? []), ...words] : prev.words,
                // TODO: set average for google stt hmmm
                confidence: confidence ?? prev.confidence,
            }));
        sdk.onInterim = (txt, words, confidence, stability) =>
            setInterim({ text: txt, words, confidence, stability });
        sdk.onFuncs = (calls) => {
            setFuncs(calls);
            const upd = mgrRef.current.reconcileWithConfirmed(calls);
            setDrafts(upd);
        };
        sdk.onDraft = (d) => {
            const upd = mgrRef.current.newDraft(d);
            setDrafts(upd);
        };
        sdk.onStatus = setStatus;
        sdk.onErr = setError;
        sdk.onEnd = () => setStatus("disconnected");

        return () => {
            sdk.disconnect();
            sdkRef.current = null;
        };
    }, [config, mgrRef]);

    // Manager helpers (memoised)
    const addManualDraft = useCallback(
        (d: Omit<FunctionDraftDataReceived, "status">) => {
            setDrafts(mgrRef.current.newDraft(d));
        },
        [mgrRef]
    );
    const confirmWithLLM = useCallback(
        (calls: FunctionCallReceived[]) => {
            setDrafts(mgrRef.current.reconcileWithConfirmed(calls));
        },
        [mgrRef]
    );

    const clearDrafts = useCallback(() => {
        setDrafts(mgrRef.current.clearDrafts());
    }, [mgrRef]);

    const getDrafts = useCallback(() => mgrRef.current.getDrafts(), [mgrRef]);

    // Public SDK actions
    const connect = () => sdkRef.current?.connect();
    const disconnect = () => sdkRef.current?.disconnect();
    const startRecording = () => sdkRef.current?.startRecording();
    const stopRecording = () => sdkRef.current?.stopRecording();

    const clearTranscript = () => {
        setFinalTxt({ text: "", confidence: 0 });
        setInterim({ text: "", confidence: 0 });
        setFuncs([]);
        clearDrafts();
        setError(null);
    };

    // Hook return out

    return {
        /* Transcript */
        transcriptFinal: finalTxt,
        transcriptInterim: interim,

        /* Functions & drafts */
        functions: funcs,
        drafts,
        addManualDraft,
        confirmWithLLM,
        clearDrafts,
        getDrafts,

        /* Connection */
        connectionStatus: status,
        connect,
        disconnect,
        startRecording,
        stopRecording,

        /* Misc */
        error,
        clearTranscript,
    };
}
