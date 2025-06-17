import { useState, useEffect, useMemo } from "react";
import { TranscriptTimeline } from "./transcript-timeline";
import { useMemonic } from "~/lib/sdk/useMemonic";
import { ShowcaseFloatingMenu } from "./showcase-floating-menu";
import { generateTimeContext } from "~/lib/llm-context";
import { ClientConfig, defineFunction } from "~/lib/sdk/index";
import { Transcript } from "~/lib/sdk/types";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const scripts: JSX.Element[] = [
    <>
        {" "}
        <span className="font-medium text-foreground/50">
            &quot;I need to record something for a guy named{" "}
            <span className="text-primary">Daryl Bennett</span> make it a{" "}
            <span className="text-primary">low priority</span> — he&apos;s just{" "}
            <span className="text-primary">
                {" "}
                asking if we received his previous email
            </span>
            . &quot;
        </span>
    </>,
    <>
        {" "}
        <span className="font-medium text-foreground/50">
            &quot;I need to{" "}
            <span className="text-primary">create a new record</span> for the
            customer <span className="text-primary">John Smith. </span>
            The priority for the request is{" "}
            <span className="text-primary">urgent</span> and he mentioned he
            needs{" "}
            <span className="text-primary">
                immediate assistance with his account.
            </span>
            &quot;
        </span>
    </>,
    <>
        {" "}
        <span className="font-medium text-foreground/50">
            &quot;Can you jot down a new case for Benjamin Ross{" "}
            <span className="text-primary">Benjamin Ross</span>? I&apos;d say{" "}
            <span className="text-primary">medium urgency</span>. He&apos;s just
            <span className="text-primary">
                {" "}
                looking for clarification on his latest invoice
            </span>
            . &quot;
        </span>
    </>,
    <>
        {" "}
        <span className="font-medium text-foreground/50">
            <span className="text-primary">Schedule a follow-up</span> for{" "}
            <span className="text-primary">Alice Parker</span>
            <span className="text-primary"> next Thursday</span> by{" "}
            <span className="text-primary">phone</span>. Just{" "}
            <span className="text-primary">check in on her onboarding</span>.
            &quot;
        </span>
    </>,
    <>
        <span className="font-medium text-foreground/50">
            &quot;Hi, I just spoke with{" "}
            <span className="text-primary">Anna Reynolds</span> — she&apos;s a{" "}
            <span className="text-primary">new client</span>, so please{" "}
            <span className="text-primary">create a record</span> for her. She
            mentioned her issue is <span className="text-primary">urgent</span>{" "}
            and{" "}
            <span className="text-primary">needs a technician out today</span>.
            Also, <span className="text-primary">update her phone number</span>{" "}
            to <span className="text-primary">0432 123 456</span> since she said
            the one we have on file is outdated. Lastly,{" "}
            <span className="text-primary">schedule a follow-up</span> call with
            her for <span className="text-primary">two days from now</span> to{" "}
            <span className="text-primary">
                make sure everything&apos;s sorted
            </span>
            .&quot;
        </span>
    </>,
    <>
        <span className="font-medium text-foreground/50">
            &quot;I&apos;ve just been on site with{" "}
            <span className="text-primary">Rachel Tan</span>.{" "}
            <span className="text-primary">Go ahead and log a new record</span>{" "}
            — the situation is <span className="text-primary">urgent</span>.{" "}
            <span className="text-primary">
                She&apos;s got a network outage and needs someone by tonight
            </span>
            . Also, <span className="text-primary">update her notes field</span>{" "}
            to include that{" "}
            <span className="text-primary">
                she&apos;s requested weekend support
            </span>
            . And please{" "}
            <span className="text-primary">schedule an SMS follow-up</span> for
            her on <span className="text-primary">Sunday</span>.&quot;
        </span>
    </>,
    <>
        <span className="font-medium text-foreground/50">
            &quot;Can you{" "}
            <span className="text-primary">create a new entry</span> for{" "}
            <span className="text-primary">Mark Jennings</span>? It&apos;s{" "}
            <span className="text-primary">high priority</span> —{" "}
            <span className="text-primary">
                he&apos;s reporting inconsistent billing across the last three
                months
            </span>
            . Also, <span className="text-primary">set a reminder</span> to{" "}
            <span className="text-primary">call him back on Monday</span> and{" "}
            <span className="text-primary">
                double-check his payment history
            </span>{" "}
            in the meantime. He prefers{" "}
            <span className="text-primary">email follow-up</span>, just so you
            know.&quot;
        </span>
    </>,
];

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

    const [currentScript, setCurrentScript] = useState(scripts[0]);

    const clientConfig: ClientConfig = useMemo(() => {
        const timeContext = generateTimeContext();

        return {
            apiUrl: "wss://memonic-api.fly.dev/ws",
            // apiUrl: "ws://localhost:8080/ws",
            language: "en-US",
            stt: {
                interimStabilityThreshold: 0.8,
                sampleHertz: 16000,
            },
            functionConfig: {
                updateMs: 800,
                parsingGuide: `
You are an intelligent **function-extraction** system.
Your job: turn spoken user input into *valid* function calls - **only** when the user provides clear, explicit data.

### Current context
• Date: **${timeContext.currentDate}** (${timeContext.dateFormats.long})  
• Time: **${timeContext.currentTime}** (${timeContext.currentWeekday})

---

## CRITICAL RULES

1. **Only extract when explicitly stated**  
   - Never guess or fill missing values.  
   - Skip vague or incomplete info.

2. **Confidence ≥ 95 %** - if unsure, extract nothing.

3. **Explicit value checks**  
   • Names: must be said verbatim
   • Proper Nouns: may be spelled out within the transcript and MUST be adhered to intelligently
   • Dates: concrete (“tomorrow”, “March 15” …)  
   • Times: concrete (“7 PM”, “at noon” …)  
   • Numbers & selections: clearly stated or match valid options.

4. **Temporal conversions** (relative → absolute)  
   - “tonight” ⇒ today's date  
   - “tomorrow” ⇒ ${new Date(Date.now() + 86_400_000)
       .toISOString()
       .slice(0, 10)}  
   - “in 2 hours” ⇒ now + 2h  
   - Apply only when relevant to a function parameter.

5. **Validation**  
   • Dates: YYYY-MM-DD | Times: HH:MM (24 h)  
   • Emails & phone numbers: valid format  
   • Selection fields: exact match to schema enum.

6. **Never output anything except valid function-call JSON.**

Remember: *better to output nothing than something wrong.*
  `.trim(),
                definitions: [
                    defineFunction({
                        name: "create_new_record",
                        description:
                            "Create a new customer record with all available information. Fields may not be explicitly referred to by their descriptive names.",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description: "The customer's full name.",
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
                                        "Any notes or additional information about the request. This could be implied.",
                                },
                            },
                            required: ["customer_name", "priority", "notes"],
                        },
                    }),
                    defineFunction({
                        name: "schedule_follow_up",
                        description: "Schedule a follow-up with a customer",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description: "The customer's full name",
                                },
                                follow_up_date: {
                                    type: "string",
                                    format: "date",
                                    description:
                                        "The date for the follow-up in YYYY-MM-DD format",
                                },
                                method: {
                                    type: "string",
                                    enum: [
                                        "email",
                                        "phone",
                                        "sms",
                                        "in-person",
                                    ],
                                    description:
                                        "Preferred method of follow-up",
                                },
                                notes: {
                                    type: "string",
                                    description:
                                        "Optional notes about the follow-up",
                                },
                            },
                            required: [
                                "customer_name",
                                "follow_up_date",
                                "method",
                            ],
                        },
                    }),
                    defineFunction({
                        name: "update_existing_record",
                        description:
                            "Update an existing customer record with new details",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description:
                                        "The full name of the customer whose record should be updated",
                                },
                                field: {
                                    type: "string",
                                    enum: [
                                        "email",
                                        "phone",
                                        "address",
                                        "status",
                                        "notes",
                                    ],
                                    description:
                                        "The field to update in the record",
                                },
                                new_value: {
                                    type: "string",
                                    description:
                                        "The new value for the selected field",
                                },
                            },
                            required: ["customer_name", "field", "new_value"],
                        },
                    }),

                    defineFunction({
                        name: "set_priority",
                        description: "Sets the priority level of the request.",
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
                        name: "update_scheduled_follow_up",
                        description:
                            "Update an existing scheduled follow-up with new details",
                        parameters: {
                            type: "object",
                            properties: {
                                customer_name: {
                                    type: "string",
                                    description: "The customer's full name",
                                },
                                follow_up_date: {
                                    type: "string",
                                    format: "date",
                                    description:
                                        "The new date for the follow-up in YYYY-MM-DD format",
                                },
                                method: {
                                    type: "string",
                                    enum: [
                                        "email",
                                        "phone",
                                        "sms",
                                        "in-person",
                                    ],
                                    description:
                                        "The new preferred method of follow-up",
                                },
                                notes: {
                                    type: "string",
                                    description:
                                        "New notes about the follow-up",
                                },
                            },
                            required: [
                                "customer_name",
                                "follow_up_date",
                                "method",
                            ],
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

    const transcriptFinal = useMemo(() => {
        return {
            text: rawTranscriptFinal.text,
            confidence: rawTranscriptFinal.confidence ?? 1,
        };
    }, [rawTranscriptFinal]);

    // Ensure transcripts have required confidence field
    // const transcriptFinal: Transcript = {
    //     text: rawTranscriptFinal.text,
    //     confidence: rawTranscriptFinal.confidence ?? 1,
    // };

    const transcriptInterim: Transcript = {
        text: rawTranscriptInterim.text,
        confidence: rawTranscriptInterim.confidence ?? 0.5,
    };

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
                    <Button
                        size="icon"
                        variant="ghost"
                        className="mb-4 hover:bg-primary-foreground/90 hover:border hover:scale-110 rounded-lg hover:text-primary border"
                        onClick={() => {
                            setCurrentScript(
                                scripts[
                                    Math.floor(Math.random() * scripts.length)
                                ]
                            );
                        }}
                    >
                        <Sparkles className="w-4 h-4" />
                    </Button>
                    <br />
                    {currentScript}
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
