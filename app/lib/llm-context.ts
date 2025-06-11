import type { FormField } from "~/components/memo/types";

// Types for context data
type TimeContext = {
    currentDate: string;
    currentTime: string;
    currentTimestamp: number;
    currentWeekday: string;
    currentMonth: string;
    currentYear: string;
    dateFormats: {
        iso: string;
        short: string;
        long: string;
        relative: string;
    };
};

// Function to generate the current time context
export function generateTimeContext(): TimeContext {
    const now = new Date();
    return {
        currentDate: now.toISOString().split("T")[0],
        currentTime: now.toTimeString().split(" ")[0],
        currentTimestamp: now.getTime(),
        currentWeekday: now.toLocaleDateString("en-US", { weekday: "long" }),
        currentMonth: now.toLocaleDateString("en-US", { month: "long" }),
        currentYear: now.getFullYear().toString(),
        dateFormats: {
            iso: now.toISOString(),
            short: now.toLocaleDateString("en-US"),
            long: now.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            relative: "today", // Could be enhanced with relative time calculation
        },
    };
}

// Function to generate the function parsing guide
export function generateFunctionParsingGuide(
    templateName: string,
    templateDescription: string | undefined,
    _fields: FormField[],
    timeContext: TimeContext
): string {
    // const functionDescriptions = fields
    //     .map((field) => {
    //         let description = `- update_${field.identifier}(${field.identifier}: ${field.type})`;
    //         if (field.description) description += ` - ${field.description}`;
    //         if (field.required) description += ` [REQUIRED]`;
    //         if (field.options?.length)
    //             description += `\n  Valid values: ${field.options.join(", ")}`;
    //         return description;
    //     })
    //     .join("\n");

    return `
You are an intelligent **function-extraction** system.
Your job: turn spoken user input into *valid* function calls - **only** when the user provides clear, explicit data.

### Transcript context
• **Type of speech**: ${templateName}
${templateDescription ? `• **Purpose of speech**: ${templateDescription}` : ""}

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
  `.trim();
}
