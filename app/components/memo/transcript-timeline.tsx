import React from "react";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { Template, TranscriptObject } from "./types";
import { formatDuration } from "./utils";

interface TranscriptTimelineProps {
    transcriptFinal: string | TranscriptObject;
    transcriptInterim: string | TranscriptObject;
    isRecording: boolean;
    wordCount: number;
    recordingDuration: number;
    totalFieldsUpdated: number;
    functions: any[];
    drafts: any[];
    recordingStartTime: Date | null;
    functionTimestamps: Record<string, Date>;
    formData: {
        templates: Template[];
    };
    clearTranscriptAndFunctions: () => void;
}

const camelCaseToReadable = (str: string): string => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
        .trim();
};

const formatTranscriptTime = (
    timestamp: Date,
    recordingStartTime: Date | null
): string => {
    if (!recordingStartTime) return "at start";

    const elapsedSeconds = Math.max(
        0,
        (timestamp.getTime() - recordingStartTime.getTime()) / 1000
    );

    if (elapsedSeconds < 60) {
        return `at ${Math.round(elapsedSeconds)}s`;
    } else {
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = Math.round(elapsedSeconds % 60);
        return `at ${minutes}m ${seconds}s`;
    }
};

export const TranscriptTimeline: React.FC<TranscriptTimelineProps> = ({
    transcriptFinal,
    transcriptInterim,
    isRecording,
    wordCount,
    recordingDuration,
    totalFieldsUpdated,
    functions,
    drafts,
    recordingStartTime,
    functionTimestamps,
    formData,
    clearTranscriptAndFunctions,
}) => {
    return (
        <div className="space-y-6">
            {/* Real-time Transcript */}
            <div className="bg-muted/10 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Live Transcript</h3>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 text-xs text-foreground/75">
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{formatDuration(recordingDuration)}</span>
                        </div>
                        {(transcriptFinal ||
                            wordCount > 0 ||
                            totalFieldsUpdated > 0) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTranscriptAndFunctions}
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Clear transcript and functions"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
                    <div className="font-mono text-sm">
                        <span className="text-foreground/50">
                            {typeof transcriptFinal === "object"
                                ? (transcriptFinal as TranscriptObject).text
                                : transcriptFinal || ""}
                        </span>
                        {isRecording && transcriptInterim && (
                            <span className="text-muted-foreground/60 animate-pulse">
                                {typeof transcriptInterim === "object"
                                    ? (transcriptInterim as TranscriptObject)
                                          .text
                                    : transcriptInterim || ""}
                            </span>
                        )}
                        {!transcriptFinal && !transcriptInterim && (
                            <span className="text-muted-foreground italic">
                                {isRecording
                                    ? "Listening... start speaking to see transcript"
                                    : "Click the microphone to start recording"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Function Extraction Timeline */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                        Function Extraction Timeline
                    </h3>
                    {totalFieldsUpdated > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                            {totalFieldsUpdated} field updates
                        </span>
                    )}
                </div>

                {/* Timeline Container */}
                <div className="relative bg-muted/10 border rounded-lg p-4 max-h-[500px] overflow-hidden">
                    {/* Timeline Progress Indicator */}
                    {isRecording && recordingDuration > 0 && (
                        <div className="flex w-full justify-center items-center mb-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span className="font-medium">
                                    Recording:{" "}
                                    {formatDuration(recordingDuration)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Timeline Scale when not recording */}
                    {!isRecording &&
                        (drafts.length > 0 || functions.length > 0) && (
                            <div className="flex items-center justify-center mb-4">
                                <div className="flex items-center justify-center text-xs text-muted-foreground">
                                    <span className="font-medium">
                                        Total session:{" "}
                                        {formatDuration(recordingDuration)}
                                    </span>
                                </div>
                            </div>
                        )}

                    {/* Desktop Layout - Grid (lg and above) */}
                    <div className="hidden md:block">
                        {/* Timeline Header */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-2 border-b border-muted">
                            <div className="text-center">
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Pending Extractions
                                </h4>
                                {drafts.length > 0 && (
                                    <span className="text-xs text-yellow-600 font-medium">
                                        {
                                            drafts.filter(
                                                (d) =>
                                                    d.status ===
                                                    "pending_confirmation"
                                            ).length
                                        }{" "}
                                        pending
                                    </span>
                                )}
                            </div>
                            <div className="text-center">
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Finalized Functions
                                </h4>
                                {functions.length > 0 && (
                                    <span className="text-xs text-green-600 font-medium">
                                        {functions.length} confirmed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Timeline Content - Grid */}
                        <div className="grid grid-cols-2 gap-4 relative h-[400px] overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            {/* Left Column - Pending Functions */}
                            <div className="space-y-3 pr-2">
                                {formData.templates.map((template) => {
                                    // Filter drafts for this template
                                    const templateDrafts = drafts.filter(
                                        (draft) => {
                                            const fieldName =
                                                draft.name.replace(
                                                    "update_",
                                                    ""
                                                );
                                            return template.fields.some(
                                                (field) =>
                                                    field.identifier ===
                                                    fieldName
                                            );
                                        }
                                    );

                                    if (templateDrafts.length === 0)
                                        return null;

                                    return (
                                        <div
                                            key={template.id}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                                    {template.name}
                                                </h4>
                                                <span className="text-xs text-yellow-600 font-medium">
                                                    {
                                                        templateDrafts.filter(
                                                            (d) =>
                                                                d.status ===
                                                                "pending_confirmation"
                                                        ).length
                                                    }{" "}
                                                    pending
                                                </span>
                                            </div>
                                            {templateDrafts.map((draft) => {
                                                const isConfirmed =
                                                    draft.status ===
                                                    "confirmed_by_llm";
                                                const argKeys = Object.keys(
                                                    draft.args || {}
                                                ).filter((arg) => arg !== "id");

                                                return (
                                                    <div
                                                        key={`${
                                                            draft.status ===
                                                            "confirmed_by_llm"
                                                                ? "confirmed"
                                                                : "pending"
                                                        }_${draft.draftId}`}
                                                        className={`relative duration-100 ${
                                                            isConfirmed
                                                                ? "opacity-50"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div
                                                            className={`border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow ${
                                                                isConfirmed
                                                                    ? "bg-muted/10 text-foreground/50"
                                                                    : "bg-muted/25 text-foreground/75"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div
                                                                        className={`rounded-full w-1 h-1 ${
                                                                            isConfirmed
                                                                                ? "bg-green-700"
                                                                                : "bg-yellow-500 animate-pulse"
                                                                        }`}
                                                                    />
                                                                    <span className="text-xs">
                                                                        {isConfirmed
                                                                            ? "Confirmed"
                                                                            : `Pending: ${draft.name.replace(
                                                                                  "update_",
                                                                                  ""
                                                                              )}`}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-foreground/50">
                                                                    {(() => {
                                                                        const draftTime =
                                                                            draft.timestamp
                                                                                ? new Date(
                                                                                      draft.timestamp
                                                                                  )
                                                                                : null;
                                                                        if (
                                                                            draftTime &&
                                                                            recordingStartTime
                                                                        ) {
                                                                            return formatTranscriptTime(
                                                                                draftTime,
                                                                                recordingStartTime
                                                                            );
                                                                        } else if (
                                                                            recordingStartTime
                                                                        ) {
                                                                            return formatTranscriptTime(
                                                                                recordingStartTime,
                                                                                recordingStartTime
                                                                            );
                                                                        } else {
                                                                            return "at start";
                                                                        }
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            {argKeys.length >
                                                                0 && (
                                                                <div className="space-y-1">
                                                                    {argKeys.map(
                                                                        (
                                                                            key
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    key
                                                                                }
                                                                                className="flex flex-col text-xs gap-y-1"
                                                                            >
                                                                                <span className="text-foreground/50 font-medium">
                                                                                    {camelCaseToReadable(
                                                                                        key
                                                                                    )}
                                                                                </span>
                                                                                <span className="text-foreground/75 font-mono text-xs">
                                                                                    {JSON.stringify(
                                                                                        draft
                                                                                            .args[
                                                                                            key
                                                                                        ]
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column - Finalized Functions */}
                            <div className="space-y-3 pl-2">
                                {formData.templates.map((template) => {
                                    // Filter functions for this template
                                    const templateFunctions = functions.filter(
                                        (func) => {
                                            const fieldName = func.name.replace(
                                                "update_",
                                                ""
                                            );
                                            return template.fields.some(
                                                (field) =>
                                                    field.identifier ===
                                                    fieldName
                                            );
                                        }
                                    );

                                    if (templateFunctions.length === 0)
                                        return null;

                                    return (
                                        <div
                                            key={template.id}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                                    {template.name}
                                                </h4>
                                                <span className="text-xs text-green-600 font-medium">
                                                    {templateFunctions.length}{" "}
                                                    confirmed
                                                </span>
                                            </div>
                                            {templateFunctions.map(
                                                (func, index) => {
                                                    const argKeys = Object.keys(
                                                        func.args || {}
                                                    ).filter(
                                                        (arg) => arg !== "id"
                                                    );
                                                    const functionKey = `${
                                                        func.name
                                                    }_${JSON.stringify(
                                                        func.args
                                                    )}`;
                                                    const timestamp =
                                                        functionTimestamps[
                                                            functionKey
                                                        ];

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="relative duration-500"
                                                        >
                                                            <div className="bg-muted/25 border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="bg-green-700 rounded-full w-1 h-1" />
                                                                        <span className="text-xs font-medium">
                                                                            {func.name.replace(
                                                                                "update_",
                                                                                ""
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-foreground/50">
                                                                        {(() => {
                                                                            if (
                                                                                timestamp &&
                                                                                recordingStartTime
                                                                            ) {
                                                                                return formatTranscriptTime(
                                                                                    timestamp,
                                                                                    recordingStartTime
                                                                                );
                                                                            } else if (
                                                                                recordingStartTime
                                                                            ) {
                                                                                return formatTranscriptTime(
                                                                                    recordingStartTime,
                                                                                    recordingStartTime
                                                                                );
                                                                            } else {
                                                                                return "at start";
                                                                            }
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                                {argKeys.length >
                                                                    0 && (
                                                                    <div className="space-y-1">
                                                                        {argKeys.map(
                                                                            (
                                                                                key
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        key
                                                                                    }
                                                                                    className="flex justify-between text-sm"
                                                                                >
                                                                                    <span className="text-foreground/75 font-mono text-xs">
                                                                                        {JSON.stringify(
                                                                                            func
                                                                                                .args[
                                                                                                key
                                                                                            ]
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
