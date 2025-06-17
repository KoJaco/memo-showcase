import { Transcript, FunctionCall } from "~/lib/sdk/types";
import { FunctionDraftDataReceived } from "~/lib/sdk/index";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface TranscriptTimelineProps {
    transcriptFinal: Transcript;
    transcriptInterim: Transcript;
    isRecording: boolean;
    wordCount: number;
    recordingDuration: number;
    totalFieldsUpdated: number;
    functions: FunctionCall[];
    drafts: FunctionDraftDataReceived[];
    recordingStartTime: Date | null;
    functionTimestamps: Record<string, Date>;
    clearTranscriptAndFunctions: () => void;
}

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

export const TranscriptTimeline = ({
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
    clearTranscriptAndFunctions,
}: TranscriptTimelineProps) => {
    // Format duration as MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // Get function name without the "update_" prefix
    const getFunctionDisplayName = (name: string) => {
        return name.replace(/^update_/, "").replace(/_/g, " ");
    };

    // Get function value display
    const getFunctionValueDisplay = (
        func: FunctionCall | FunctionDraftDataReceived
    ) => {
        const args = func.args as Record<string, unknown>;
        const filteredArgs = Object.entries(args)
            .filter(([key]) => key !== "id")
            .map(
                ([_, value]) =>
                    `${
                        typeof value === "string"
                            ? value
                            : JSON.stringify(value)
                    }`
            )
            .join(", ");
        return filteredArgs;
    };

    return (
        <div className="space-y-6">
            {/* Real-time Transcript */}
            <div className="bg-primary-foreground/75 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Live Transcript</h3>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 text-xs text-foreground/75">
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{formatDuration(recordingDuration)}</span>
                        </div>
                        {(transcriptFinal.text ||
                            wordCount > 0 ||
                            totalFieldsUpdated > 0) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTranscriptAndFunctions}
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
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
                            {transcriptFinal.text}
                        </span>
                        {isRecording && transcriptInterim.text && (
                            <span className="text-muted-foreground/60 animate-pulse">
                                {transcriptInterim.text}
                            </span>
                        )}
                        {!transcriptFinal.text && !transcriptInterim.text && (
                            <span className="text-muted-foreground italic">
                                {isRecording
                                    ? "Listening... start speaking to see transcript"
                                    : "Click the microphone to start recording"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Function Timeline */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Timeline</h3>
                    {totalFieldsUpdated > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                            {totalFieldsUpdated} field updates
                        </span>
                    )}
                </div>

                {/* Timeline Container */}
                <div className="bg-primary-foreground/75 border rounded-lg p-4 max-h-[500px] overflow-hidden">
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

                    {/* Desktop Layout - Grid (lg and above) */}
                    <div className="hidden md:block">
                        {/* Timeline Header */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-2 border-b border-muted">
                            <div className="text-center">
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Pending
                                </h4>
                                {drafts.length > 0 && (
                                    <span className="text-xs text-yellow-600 font-medium">
                                        {drafts.length} pending
                                    </span>
                                )}
                            </div>
                            <div className="text-center">
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Finalized
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
                                <AnimatePresence>
                                    {drafts.map((draft, index) => {
                                        const isConfirmed =
                                            draft.status === "confirmed_by_llm";
                                        return (
                                            <motion.div
                                                key={`draft-${index}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="relative duration-100"
                                            >
                                                <div
                                                    className={`border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow bg-muted/25 text-foreground/75 ${
                                                        isConfirmed
                                                            ? "opacity-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className={`${
                                                                    isConfirmed
                                                                        ? "bg-green-700"
                                                                        : "bg-yellow-500"
                                                                } rounded-full w-1 h-1 ${
                                                                    isConfirmed
                                                                        ? ""
                                                                        : "animate-pulse"
                                                                }`}
                                                            />
                                                            <span className="text-xs">
                                                                {isConfirmed
                                                                    ? "Confirmed"
                                                                    : "Pending"}
                                                                :{" "}
                                                                {getFunctionDisplayName(
                                                                    draft.name
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-foreground/50">
                                                            {draft.timestamp
                                                                ? formatTranscriptTime(
                                                                      new Date(
                                                                          draft.timestamp
                                                                      ),
                                                                      recordingStartTime
                                                                  )
                                                                : "at start"}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex flex-col text-xs gap-y-1">
                                                            <span className="text-foreground/75 font-mono text-xs">
                                                                {getFunctionValueDisplay(
                                                                    draft
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Right Column - Finalized Functions */}
                            <div className="space-y-3 pl-2">
                                {functions.map((func, index) => {
                                    const key = `${func.name}_${JSON.stringify(
                                        func.args
                                    )}`;
                                    const timestamp = functionTimestamps[key];

                                    return (
                                        <motion.div
                                            key={`function-${index}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="relative duration-500"
                                        >
                                            <div className="bg-muted/25 border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="bg-green-700 rounded-full w-1 h-1" />
                                                        <span className="text-xs font-medium capitalize">
                                                            {getFunctionDisplayName(
                                                                func.name
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-foreground/50">
                                                        {timestamp
                                                            ? formatTranscriptTime(
                                                                  timestamp,
                                                                  recordingStartTime
                                                              )
                                                            : "at start"}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex flex-col text-xs gap-y-1">
                                                        <span className="text-foreground/75 font-mono text-xs whitespace-break-spaces">
                                                            {getFunctionValueDisplay(
                                                                func
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout - Stack (below lg) */}
                    <div className="md:hidden space-y-4 min-h-[400px]">
                        {/* Timeline Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-muted">
                            <div className="text-left">
                                <div className="flex items-center space-x-4">
                                    {drafts.length > 0 && (
                                        <span className="text-xs text-yellow-600 font-medium">
                                            {drafts.length} pending
                                        </span>
                                    )}
                                    {functions.length > 0 && (
                                        <span className="text-xs text-green-600 font-medium">
                                            {functions.length} confirmed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline Content - Stack */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-foreground scrollbar-track-transparent">
                            {/* Pending Functions */}
                            <div className="space-y-3">
                                <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Pending
                                </h5>
                                <AnimatePresence>
                                    {drafts.map((draft, index) => {
                                        const isConfirmed =
                                            draft.status === "confirmed_by_llm";
                                        return (
                                            <motion.div
                                                key={`draft-${index}`}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="relative duration-100"
                                            >
                                                <div
                                                    className={`border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow bg-muted/25 text-foreground/75 ${
                                                        isConfirmed
                                                            ? "opacity-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className={`${
                                                                    isConfirmed
                                                                        ? "bg-green-700"
                                                                        : "bg-yellow-500"
                                                                } rounded-full w-1 h-1 ${
                                                                    isConfirmed
                                                                        ? ""
                                                                        : "animate-pulse"
                                                                }`}
                                                            />
                                                            <span className="text-xs">
                                                                {isConfirmed
                                                                    ? "Confirmed"
                                                                    : "Pending"}
                                                                :{" "}
                                                                {getFunctionDisplayName(
                                                                    draft.name
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-foreground/50">
                                                            {draft.timestamp
                                                                ? formatTranscriptTime(
                                                                      new Date(
                                                                          draft.timestamp
                                                                      ),
                                                                      recordingStartTime
                                                                  )
                                                                : "at start"}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex flex-col text-xs gap-y-1">
                                                            <span className="text-foreground/75 font-mono text-xs">
                                                                {getFunctionValueDisplay(
                                                                    draft
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Finalized Functions */}
                            <div className="space-y-3">
                                <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Finalized
                                </h5>
                                {functions.map((func, index) => {
                                    const key = `${func.name}_${JSON.stringify(
                                        func.args
                                    )}`;
                                    const timestamp = functionTimestamps[key];

                                    return (
                                        <motion.div
                                            key={`function-${index}`}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative duration-500"
                                        >
                                            <div className="bg-muted/25 border rounded-lg p-3 relative shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="bg-green-700 rounded-full w-1 h-1" />
                                                        <span className="text-xs font-medium">
                                                            {getFunctionDisplayName(
                                                                func.name
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-foreground/50">
                                                        {timestamp
                                                            ? formatTranscriptTime(
                                                                  timestamp,
                                                                  recordingStartTime
                                                              )
                                                            : "at start"}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex flex-col text-xs gap-y-1">
                                                        <span className="text-foreground/75 font-mono text-xs">
                                                            {getFunctionValueDisplay(
                                                                func
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
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
