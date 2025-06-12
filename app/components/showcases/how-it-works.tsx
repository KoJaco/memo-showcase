import React, { useState, useEffect, useMemo } from "react";
import { TranscriptTimeline } from "./transcript-timeline";
import { useMemonic } from "~/lib/sdk/useMemonic";
import { nanoid } from "nanoid";
import { ShowcaseFloatingMenu } from "./showcase-floating-menu";
import { generateTimeContext } from "~/lib/llm-context";
import {
    ClientConfig,
    defineFunction,
    FunctionDraftDataReceived,
} from "~/lib/sdk/index";
import { Transcript } from "~/lib/sdk/types";

export const HowItWorksShowcase = () => {
    // Local state for metrics
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(
        null
    );
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [totalFieldsUpdated, setTotalFieldsUpdated] = useState(0);
    const [functionTimestamps, setFunctionTimestamps] = useState<
        Record<string, Date>
    >({});

    const clientConfig: ClientConfig = useMemo(() => {
        const timeContext = generateTimeContext();

        return {
            apiUrl: "wss://memonic-api.fly.dev/ws",
            language: "en-US",
            stt: {
                interimStabilityThreshold: 0.8,
                sampleHertz: 16000,
            },
            functionConfig: {
                updateMs: 800,
                parsingGuide:
                    "Extract customer information from the conversation",
                definitions: [
                    defineFunction({
                        name: "create_new_record",
                        description:
                            "Create a new customer record with all available information",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description: "The customer's full name",
                                },
                                priority: {
                                    type: "string",
                                    format: "enum",
                                    enum: ["Low", "Medium", "High", "Urgent"],
                                    description:
                                        "Priority level of the request",
                                },
                                notes: {
                                    type: "string",
                                    description:
                                        "Any additional information about the request",
                                },
                            },
                            required: ["customer_name", "priority"],
                        },
                    }),
                    defineFunction({
                        name: "update_customer",
                        description: "Update the customer's name",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description: "The customer's full name",
                                },
                            },
                            required: ["customer_name"],
                        },
                    }),
                    defineFunction({
                        name: "update_priority",
                        description: "Update the priority level of the request",
                        parameters: {
                            type: "object",
                            properties: {
                                priority: {
                                    type: "string",
                                    format: "enum",
                                    enum: ["Low", "Medium", "High", "Urgent"],
                                    description:
                                        "Priority level of the request",
                                },
                            },
                            required: ["priority"],
                        },
                    }),
                    defineFunction({
                        name: "update_notes",
                        description:
                            "Update additional notes about the request",
                        parameters: {
                            type: "object",
                            properties: {
                                notes: {
                                    type: "string",
                                    description:
                                        "Any additional information about the request",
                                },
                            },
                            required: ["notes"],
                        },
                    }),
                ],
            },
        };
    }, []);

    // Memonic hook
    const {
        transcriptFinal: rawTranscriptFinal,
        transcriptInterim: rawTranscriptInterim,
        functions,
        drafts,
        connectionStatus,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        clearTranscript,
    } = useMemonic({
        config: clientConfig,
    });

    // Ensure transcripts have required confidence field
    const transcriptFinal: Transcript = {
        text: rawTranscriptFinal.text,
        confidence: rawTranscriptFinal.confidence ?? 1,
    };

    const transcriptInterim: Transcript = {
        text: rawTranscriptInterim.text,
        confidence: rawTranscriptInterim.confidence ?? 0.5,
    };

    // console.log("DRAFTS: ", drafts);
    // console.log("FUNCTIONS: ", functions);

    // Auto-connect when component mounts
    useEffect(() => {
        // Small delay to ensure everything is initialized
        const timeoutId = setTimeout(() => {
            connect();
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    // Update metrics
    useEffect(() => {
        if (transcriptFinal.text) {
            setWordCount(transcriptFinal.text.split(/\s+/).length);
        }
    }, [transcriptFinal]);

    useEffect(() => {
        if (functions.length > 0) {
            setTotalFieldsUpdated(functions.length);
            // Update timestamps for new functions
            const newTimestamps = { ...functionTimestamps };
            functions.forEach((func) => {
                const key = `${func.name}_${JSON.stringify(func.args)}`;
                if (!newTimestamps[key]) {
                    newTimestamps[key] = new Date();
                }
            });
            setFunctionTimestamps(newTimestamps);
        }
    }, [functions]);

    // Handle recording state
    const handleRecording = () => {
        if (!isRecording) {
            setRecordingStartTime(new Date());
            startRecording();
        } else {
            stopRecording();
        }
        setIsRecording(!isRecording);
    };

    // Update recording duration
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && recordingStartTime) {
            interval = setInterval(() => {
                const now = new Date();
                const duration = Math.floor(
                    (now.getTime() - recordingStartTime.getTime()) / 1000
                );
                setRecordingDuration(duration);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, recordingStartTime]);

    // Clear function
    const clearTranscriptAndFunctions = () => {
        clearTranscript();
        setWordCount(0);
        setTotalFieldsUpdated(0);
        setRecordingDuration(0);
        setRecordingStartTime(null);
        setFunctionTimestamps({});
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-left space-y-4 showcase-form">
                <p className="text-foreground/50">
                    Try it yourself! Speak naturally about a customer request.
                    For example:
                    <br />
                    <br />
                    <span className="font-medium text-foreground/50">
                        "I need to{" "}
                        <span className="text-primary">
                            create a new record
                        </span>{" "}
                        for the customer{" "}
                        <span className="text-primary">John Smith.</span>
                        The priority for the request is{" "}
                        <span className="text-primary">urgent</span> and he
                        mentioned he needs{" "}
                        <span className="text-primary">
                            immediate assistance with his account.
                        </span>
                        "
                    </span>
                </p>
            </div>

            {/* Transcript Timeline */}
            <TranscriptTimeline
                transcriptFinal={transcriptFinal}
                transcriptInterim={transcriptInterim}
                isRecording={isRecording}
                wordCount={wordCount}
                recordingDuration={recordingDuration}
                totalFieldsUpdated={totalFieldsUpdated}
                functions={functions}
                drafts={drafts}
                recordingStartTime={recordingStartTime}
                functionTimestamps={functionTimestamps}
                clearTranscriptAndFunctions={clearTranscriptAndFunctions}
            />

            {/* Floating Menu */}
            <ShowcaseFloatingMenu
                isRecording={isRecording}
                onRecordingToggle={handleRecording}
                connectionStatus={connectionStatus}
                onConnect={connect}
                onDisconnect={disconnect}
            />
        </div>
    );
};
