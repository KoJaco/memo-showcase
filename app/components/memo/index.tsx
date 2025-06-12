"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

import { useMemonic } from "~/lib/sdk/useMemonic";
import {
    type ClientConfig,
    type FunctionCallingSchemaObject,
    type GenaiSchema,
} from "~/lib/sdk/index";

import {
    generateFunctionParsingGuide,
    generateTimeContext,
} from "~/lib/llm-context";

// Import our extracted components and utilities
import { TranscriptObject, FormField, Template } from "./types";
import { initializeTemplates } from "./templates";

import { TemplateSelector } from "./template-selector";

import {
    TextInput,
    TextAreaInput,
    CheckboxInput,
    RadioGroupInput,
    SelectInput,
} from "~/components/forms/elements";

import { FloatingRecordingMenu } from "./floating-recording-menu";
import { cn } from "~/lib/utils";

// Add utility function after the imports and before the Demo component
const camelCaseToReadable = (str: string): string => {
    return str
        .replace(/([A-Z])/g, " $1") // Add space before capital letters
        .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
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

// Add formatDurationMinutes helper function
const formatDurationMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hours`;
    return `${hours} hours ${mins} minutes`;
};

// Update the FormConfig type to match the new structure
type FormConfig = {
    id: string;
    name: string;
    description: string;
    fields: Array<{
        id: string;
        identifier: string;
        name: string;
        label: string;
        description?: string;
        type: FormField["type"];
        required: boolean;
        options?: string[];
        draft?: boolean;
    }>;
};

// Add a helper function to convert Template to FormConfig
const templateToFormConfig = (template: Template): FormConfig => ({
    id: template.id,
    name: template.name,
    description: template.description || "",
    fields: template.fields.map((field) => ({
        ...field,
        draft: false,
    })),
});

const Memo = () => {
    // Local state
    const [activeTab, setActiveTab] = useState("demo");
    const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(
        null
    );
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [averageStability, setAverageStability] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    // const [formValues, setFormValues] = useState<Record<string, any>>({});

    // Function tracking state
    const [functionTimestamps, setFunctionTimestamps] = useState<
        Record<string, Date>
    >({});
    const [totalFieldsUpdated, setTotalFieldsUpdated] = useState(0);
    const [confirmationTimestamps, setConfirmationTimestamps] = useState<
        Record<string, Date>
    >({});

    // Template management state
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [editingTemplateIndex, setEditingTemplateIndex] = useState<
        number | null
    >(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Template state
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>(
        []
    );
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

    // Update formData to be a single template/form
    const [formData, setFormData] = useState<FormConfig>({
        id: "",
        name: "",
        description: "",
        fields: [],
    });

    // Separate form state from template data
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isDraft, setIsDraft] = useState<Record<string, boolean>>({});

    const removeTemplate = (index: number) => {
        setAvailableTemplates((prev) => prev.filter((_, i) => i !== index));
    };

    // Recording handlers
    const handleRecording = () => {
        if (connectionStatus !== "connected") {
            console.warn("Cannot start recording: WebSocket not connected");
            return;
        }

        if (isRecording) {
            // console.log(
            //     "🎙️ Stopping recording, keeping recordingStartTime:",
            //     recordingStartTime
            // );
            stopRecording();
            setIsRecording(false);
            // Don't reset recordingStartTime - keep it for timestamp calculations
        } else {
            // console.log(
            //     "🎙️ Starting recording, current recordingStartTime:",
            //     recordingStartTime
            // );
            startRecording();
            setIsRecording(true);
            // Only set recording start time if we don't already have one for this session
            if (!recordingStartTime) {
                const newStartTime = new Date();
                // console.log("🎙️ Setting new recordingStartTime:", newStartTime);
                setRecordingStartTime(newStartTime);
            }
            // console.log(
            //     "🎙️ Reusing existing recordingStartTime:",
            //     recordingStartTime
            // );
        }
    };

    // Initialize templates on mount
    useEffect(() => {
        // console.log("🚀 Initializing templates...");
        const templates = initializeTemplates();
        // console.log("📦 Templates received:", templates);
        // console.log("🔍 First template:", templates[0]);
        // console.log("🔍 First template fields:", templates[0]?.fields);
        setAvailableTemplates(templates);

        // Automatically load the first template if available
        if (templates.length > 0) {
            loadTemplate(templates[0]);
        }
    }, []);

    // Template management functions
    const loadTemplate = (template: Template) => {
        // console.log("🔄 Loading template:", template);
        // console.log("🔍 Template fields:", template.fields);
        // console.log("🎯 First field:", template.fields[0]);

        // Convert template to form data using helper function
        setFormData(templateToFormConfig(template));

        // Clear form values when loading new template
        setFormValues({});
        setIsDraft({});

        setTimeout(() => {
            connect();
        }, 500);
    };

    const addTemplate = (template: Template) => {
        // console.log("➕ Adding template:", template);

        const isAlreadyAdded = availableTemplates.some(
            (t) => t.name === template.name
        );
        if (isAlreadyAdded) {
            return;
        }

        setAvailableTemplates((prev) => [...prev, template]);

        if (availableTemplates.length === 0) {
            loadTemplate(template);
        }
    };

    const clearAllTemplates = () => {
        if (confirm("Are you sure you want to clear all templates?")) {
            setAvailableTemplates([]);
            setFormData({
                id: "",
                name: "",
                description: "",
                fields: [],
            });
            setFormValues({});
            setIsDraft({});
        }
    };

    const nextTemplate = () => {
        setCurrentTemplateIndex((prev) =>
            prev >= availableTemplates.length - 1 ? 0 : prev + 1
        );
        loadTemplate(
            availableTemplates[
                (currentTemplateIndex + 1) % availableTemplates.length
            ]
        );
    };

    const previousTemplate = () => {
        setCurrentTemplateIndex((prev) =>
            prev <= 0 ? availableTemplates.length - 1 : prev - 1
        );
        loadTemplate(
            availableTemplates[
                (currentTemplateIndex - 1 + availableTemplates.length) %
                    availableTemplates.length
            ]
        );
    };

    const getCurrentTemplate = () => {
        return availableTemplates[currentTemplateIndex];
    };

    // Clear transcript and functions
    const clearTranscriptAndFunctions = () => {
        // Clear transcript and function states from the SDK
        clearTranscript();

        // Reset local tracking states
        setWordCount(0);
        setTotalFieldsUpdated(0);
        setFunctionTimestamps({});
        setConfirmationTimestamps({});
        setRecordingDuration(0);
        setAverageStability(0);
        setRecordingStartTime(null); // Reset recording start time on explicit clear
    };

    /* --------------------------------------------------------------- */
    /*  Memo-ised Memonic client config                                */
    /* --------------------------------------------------------------- */
    const clientCfg: ClientConfig = useMemo(() => {
        const timeContext = generateTimeContext();

        /* ----------------------------------------------------------- */
        /*  1. Function-parsing guide                                  */
        /* ----------------------------------------------------------- */
        const functionParsingGuide = generateFunctionParsingGuide(
            formData.name,
            formData.description,
            formData.fields,
            timeContext
        );

        /* ----------------------------------------------------------- */
        /* 2.  Function definitions (update_FIELD)                     */
        /* ----------------------------------------------------------- */
        const definitions: FunctionCallingSchemaObject[] = formData.fields.map(
            (field) => {
                // ---------- param type / description ----------
                let paramType: "string" | "number" | "boolean" = "string";
                let paramDesc = `The value for ${field.name}`;
                switch (field.type) {
                    case "number":
                    case "duration":
                        paramType = "number";
                        break;
                    case "date":
                        paramDesc += " (format: YYYY-MM-DD)";
                        break;
                    case "time":
                        paramDesc += " (format: HH:MM)";
                        break;
                    case "email":
                        paramDesc += " (valid e-mail)";
                        break;
                    case "select":
                    case "radio-group":
                        paramDesc += ` (one of: ${
                            field.options?.join(", ") ?? "-"
                        })`;
                        break;
                }

                // ---------- schema ----------
                const parameters: GenaiSchema = {
                    type: "object",
                    properties: {
                        [field.identifier]: {
                            type: paramType,
                            description: paramDesc,
                            ...(field.type === "select" ||
                            field.type === "radio-group"
                                ? {
                                      format: "enum",
                                      enum: field.options ?? [],
                                  }
                                : {}),
                        },
                    },
                    required: field.required ? [field.identifier] : [],
                };

                return {
                    name: `update_${field.identifier}`,
                    description: `Update the ${field.name} field. ${
                        field.description ?? ""
                    }`,
                    parameters,
                };
            }
        );

        /* ----------------------------------------------------------- */
        /* 3.  Assemble ClientConfig                                   */
        /* ----------------------------------------------------------- */
        return {
            // apiUrl: "ws://localhost:8080/ws",
            apiUrl: "wss://memonic-api.fly.dev/ws",
            language: "en-US",
            stt: {
                interimStabilityThreshold: 0.8,
                sampleHertz: 16000,
            },
            functionConfig: {
                updateMs: 800,
                parsingGuide: functionParsingGuide,
                definitions,
            },
            inputContext: undefined,
        } satisfies ClientConfig;
    }, [formData]);

    const {
        transcriptFinal,
        transcriptInterim,
        functions,
        drafts, // ← merged manager output
        connectionStatus,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        clearTranscript,
    } = useMemonic({ config: clientCfg });

    // console.log(transcriptFinal);

    // console.log("DRAFTS PICKED: ", drafts);

    // Effects for tracking metrics
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

    // Track word count from transcript
    useEffect(() => {
        const finalText =
            typeof transcriptFinal === "object"
                ? (transcriptFinal as TranscriptObject).text
                : transcriptFinal || "";
        const words = finalText
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
        setWordCount(words.length);
    }, [transcriptFinal]);

    // Track average stability
    useEffect(() => {
        if (
            typeof transcriptInterim === "object" &&
            transcriptInterim.stability !== undefined
        ) {
            setAverageStability(transcriptInterim.stability);
        }
    }, [transcriptInterim]);

    // Track function updates and timestamps
    useEffect(() => {
        if (functions.length > 0) {
            const now = new Date();
            const newTimestamps: Record<string, Date> = {};
            const newConfirmationTimestamps: Record<string, Date> = {};
            let fieldCount = 0;

            // console.log(
            //     "🕒 Processing functions for timestamps:",
            //     functions.length
            // );
            // console.log("🕒 Recording start time:", recordingStartTime);
            // console.log("🕒 Current time:", now);

            functions.forEach((func) => {
                const argKeys = Object.keys(func.args || {}).filter(
                    (arg) => arg !== "id"
                );
                fieldCount += argKeys.length;

                // Create a unique key for this function call
                const functionKey = `${func.name}_${JSON.stringify(func.args)}`;

                // Only set timestamp if we don't already have one for this exact function call
                if (!functionTimestamps[functionKey]) {
                    newTimestamps[functionKey] = now;
                    // console.log(
                    //     "🕒 Setting new timestamp for:",
                    //     functionKey,
                    //     now
                    // );
                }

                // Track confirmation timestamp for this specific function
                const confirmationKey = func.name.replace("update_", "");

                // Only set confirmation timestamp if we don't already have one
                if (!confirmationTimestamps[confirmationKey]) {
                    newConfirmationTimestamps[confirmationKey] = now;
                    // console.log(
                    //     "🕒 Setting confirmation timestamp for:",
                    //     confirmationKey,
                    //     now
                    // );
                }
            });

            // Only update if we have new timestamps
            if (Object.keys(newTimestamps).length > 0) {
                setFunctionTimestamps((prev) => ({
                    ...prev,
                    ...newTimestamps,
                }));
            }
            if (Object.keys(newConfirmationTimestamps).length > 0) {
                setConfirmationTimestamps((prev) => ({
                    ...prev,
                    ...newConfirmationTimestamps,
                }));
            }
            setTotalFieldsUpdated((prev) => prev + fieldCount);
        }
    }, [
        functions,
        functionTimestamps,
        confirmationTimestamps,
        recordingStartTime,
    ]);

    // Clean up old confirmed drafts periodically to prevent infinite growth
    useEffect(() => {
        const interval = setInterval(() => {
            if (drafts.length > 20) {
                // Keep max 20 drafts
                // This would require a method in the SDK to remove specific drafts
                // For now, we'll rely on manual clearing
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [drafts.length]);

    const handleFormValueChange = useCallback(
        (fieldIdentifier: string, value: any) => {
            // console.log("🔄 Updating form value:", { fieldIdentifier, value });
            setFormValues((prev) => {
                const newValues = {
                    ...prev,
                    [fieldIdentifier]: value,
                };
                // console.log("📝 New form values:", newValues);
                return newValues;
            });
            // Clear draft state when manually editing
            setIsDraft((prev) => ({
                ...prev,
                [fieldIdentifier]: false,
            }));
        },
        []
    );

    // Update form values when functions are finalized
    useEffect(() => {
        if (functions && functions.length > 0 && formData.fields.length > 0) {
            // console.log("📦 Processing finalized functions:", functions);

            functions.forEach((funcCall) => {
                const functionIdentifier = funcCall.name.replace("update_", "");
                // console.log("🔍 Processing function:", {
                //     name: funcCall.name,
                //     identifier: functionIdentifier,
                //     args: funcCall.args,
                // });

                const field = formData.fields.find(
                    (f) => f.identifier === functionIdentifier
                );

                if (field) {
                    // console.log("✅ Found matching field:", field);
                    const args = { ...funcCall.args };
                    delete args.id;
                    const value = Object.values(args)[0];
                    // console.log("💾 Setting finalized value:", {
                    //     field: field.identifier,
                    //     value,
                    // });
                    setFormValues((prev) => ({
                        ...prev,
                        [field.identifier]: value,
                    }));
                    setIsDraft((prev) => ({
                        ...prev,
                        [field.identifier]: false,
                    }));
                }
            });
        }
    }, [functions, formData.fields]);

    // Update draft states
    useEffect(() => {
        if (drafts && drafts.length > 0) {
            console.log("📝 Processing drafts:", drafts);

            drafts.forEach((draft) => {
                if (
                    draft.status === "pending_confirmation" ||
                    draft.status === "awaiting_potential_update"
                ) {
                    const functionIdentifier = draft.name.replace(
                        "update_",
                        ""
                    );
                    console.log(
                        `🔍 Draft function name: ${draft.name}, identifier: ${functionIdentifier}, status: ${draft.status}`
                    );
                    const field = formData.fields.find(
                        (f) => f.identifier === functionIdentifier
                    );
                    if (field) {
                        // Always set isDraft to true for both pending and awaiting states
                        setIsDraft((prev) => ({
                            ...prev,
                            [field.identifier]: true,
                        }));
                        // Only insert args if status is pending_confirmation
                        if (draft.status === "pending_confirmation") {
                            const args = { ...draft.args };
                            delete args.id;
                            const value = Object.values(args)[0];
                            console.log(
                                `💡 Matched field: ${field.identifier}, value:`,
                                value
                            );
                            if (value !== undefined) {
                                setFormValues((prev) => ({
                                    ...prev,
                                    [field.identifier]: value,
                                }));
                            }
                        }
                    } else {
                        console.warn(
                            `❌ No matching field for draft identifier: ${functionIdentifier}`
                        );
                    }
                }
            });
        }
    }, [drafts, formData.fields]);

    return (
        <div className="h-full w-full">
            <div className="space-y-6">
                {/* Template Selector */}
                {availableTemplates.length > 0 && (
                    <TemplateSelector
                        availableTemplates={availableTemplates}
                        currentTemplateIndex={currentTemplateIndex}
                        onPrevious={previousTemplate}
                        onNext={nextTemplate}
                        onLoadTemplate={loadTemplate}
                        onAddTemplate={addTemplate}
                        getCurrentTemplate={getCurrentTemplate}
                        activeTemplates={[
                            templateToFormConfig(getCurrentTemplate()),
                        ]} // Convert current template to form config
                    />
                )}

                {/* Current Form */}
                {formData.fields.length > 0 && (
                    <div
                        className={cn(
                            "bg-primary-foreground/75 rounded-lg p-4 transition-all duration-300",
                            isRecording
                                ? "border-2 border-foreground/50"
                                : "border"
                        )}
                        data-form-container
                    >
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {formData.fields.map((field) => {
                                    const currentValue =
                                        formValues[field.identifier];
                                    const isFieldDraft =
                                        isDraft[field.identifier];

                                    // console.log(
                                    //     `🎯 Rendering field: ${field.identifier}, value:`,
                                    //     currentValue,
                                    //     `type: ${field.type}, isDraft:`,
                                    //     isFieldDraft
                                    // );

                                    switch (field.type) {
                                        case "text":
                                            return (
                                                <TextInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        case "number":
                                            return (
                                                <TextInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    type="number"
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        case "duration":
                                            const displayValue = currentValue
                                                ? formatDurationMinutes(
                                                      Number(currentValue)
                                                  )
                                                : "";
                                            return (
                                                <TextInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    type="number"
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        case "textarea":
                                            return (
                                                <TextAreaInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        case "checkbox":
                                            return (
                                                <CheckboxInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    checked={currentValue}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            checked
                                                        )
                                                    }
                                                />
                                            );
                                        case "radio-group":
                                            return (
                                                <RadioGroupInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    options={
                                                        field.options || []
                                                    }
                                                    onValueChange={(value) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            value
                                                        )
                                                    }
                                                />
                                            );
                                        case "select":
                                            return (
                                                <SelectInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    options={
                                                        field.options || []
                                                    }
                                                    onValueChange={(value) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            value
                                                        )
                                                    }
                                                />
                                            );
                                        case "date":
                                            return (
                                                <TextInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    type="date"
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        case "time":
                                            return (
                                                <TextInput
                                                    key={field.id}
                                                    label={field.name}
                                                    description={
                                                        field.description
                                                    }
                                                    isDraft={isFieldDraft}
                                                    value={currentValue}
                                                    type="time"
                                                    onChange={(e) =>
                                                        handleFormValueChange(
                                                            field.identifier,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Recording Button */}
                <FloatingRecordingMenu
                    status={connectionStatus}
                    isRecording={isRecording}
                    handleRecording={handleRecording}
                    handleConnect={connect}
                    handleDisconnect={disconnect}
                />
            </div>
        </div>
    );
};

export default Memo;
