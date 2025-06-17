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
import { FormField, FormFieldValue, Template } from "./types";
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
    const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(
        null
    );

    const [isRecording, setIsRecording] = useState(false);
    // const [formValues, setFormValues] = useState<Record<string, any>>({});

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
    const [formValues, setFormValues] = useState<
        Record<string, FormFieldValue>
    >({});
    const [isDraft, setIsDraft] = useState<Record<string, boolean>>({});

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
        const templates = initializeTemplates();
        setAvailableTemplates(templates);

        if (templates.length > 0) {
            setFormData(templateToFormConfig(templates[0]));

            // Clear form values when loading new template
            setFormValues({});
            setIsDraft({});

            setTimeout(() => {
                connect();
            }, 500);
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
        functions,
        drafts, // ← merged manager output
        connectionStatus,
        connect,
        disconnect,
        startRecording,
        stopRecording,
    } = useMemonic({ config: clientCfg });

    function ValidateFormFieldValue(value: unknown): FormFieldValue {
        if (typeof value === "string") {
            if (value === "intermediate") return "intermediate";
            return value;
        }

        if (typeof value === "number") {
            return value;
        }

        if (typeof value === "boolean") {
            return value;
        }
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
            return value as readonly string[];
        }

        return undefined;
    }

    const handleFormValueChange = useCallback(
        (fieldIdentifier: string, value: unknown) => {
            // TODO: extrapolate out value's type
            const val = ValidateFormFieldValue(value);

            if (!val) {
                console.warn(
                    "Attempting to handle form value change using an undefined value"
                );
                return;
            }

            setFormValues((prev) => {
                const newValues = {
                    ...prev,
                    [fieldIdentifier]: val,
                };
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
            functions.forEach((funcCall) => {
                const functionIdentifier = funcCall.name.replace("update_", "");

                const field = formData.fields.find(
                    (f) => f.identifier === functionIdentifier
                );

                if (field) {
                    const args = { ...funcCall.args };
                    delete args.id;
                    const value = Object.values(args)[0];

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
            drafts.forEach((draft) => {
                if (
                    draft.status === "pending_confirmation" ||
                    draft.status === "awaiting_potential_update"
                ) {
                    const functionIdentifier = draft.name.replace(
                        "update_",
                        ""
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

                            // TODO: attempt to parse value to appropriate type

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

                                    switch (field.type) {
                                        case "text":
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;

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
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;
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
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;
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
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;
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
                                            if (
                                                typeof currentValue !==
                                                    "boolean" &&
                                                currentValue !== "indeterminate"
                                            )
                                                return null;
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
                                                    value={
                                                        typeof currentValue ===
                                                        "string"
                                                            ? currentValue
                                                            : null
                                                    }
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
                                                    value={
                                                        typeof currentValue ===
                                                        "string"
                                                            ? currentValue
                                                            : ""
                                                    }
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
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;
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
                                            if (
                                                typeof currentValue ===
                                                "boolean"
                                            )
                                                return null;
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
