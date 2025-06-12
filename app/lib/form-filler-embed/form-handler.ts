import { FormFieldConfig } from "./types";

export class FormHandler {
    private form: HTMLFormElement;
    private fieldMappings: Map<string, FormFieldConfig>;

    constructor(form: HTMLFormElement) {
        this.form = form;
        this.fieldMappings = this.analyzeFormFields();
    }

    private analyzeFormFields(): Map<string, FormFieldConfig> {
        const mappings = new Map<string, FormFieldConfig>();

        // Find all input elements
        this.form
            .querySelectorAll("input, select, textarea")
            .forEach((field) => {
                const config = this.getFieldConfig(field as HTMLElement);
                if (config) {
                    const identifier =
                        field.getAttribute("name") ||
                        field.getAttribute("id") ||
                        "";
                    if (identifier) {
                        mappings.set(identifier, config);
                    }
                }
            });

        return mappings;
    }

    private getFieldConfig(field: HTMLElement): FormFieldConfig | null {
        const type = this.mapInputType(field);
        if (!type) return null;

        return {
            type,
            required: field.hasAttribute("required"),
            description: field.getAttribute("data-description") || undefined,
            options: this.getFieldOptions(field),
        };
    }

    private mapInputType(field: HTMLElement): FormFieldConfig["type"] | null {
        if (field instanceof HTMLInputElement) {
            switch (field.type) {
                case "text":
                    return "text";
                case "number":
                    return "number";
                case "checkbox":
                    return "checkbox";
                case "date":
                    return "date";
                case "time":
                    return "time";
                default:
                    return "text";
            }
        } else if (field instanceof HTMLTextAreaElement) {
            return "textarea";
        } else if (field instanceof HTMLSelectElement) {
            return field.multiple ? "select" : "select";
        }
        return null;
    }

    private getFieldOptions(field: HTMLElement): string[] | undefined {
        if (field instanceof HTMLSelectElement) {
            return Array.from(field.options).map((option) => option.value);
        }
        return undefined;
    }

    public handleFunctionCall(functionName: string, args: Record<string, any>) {
        const fieldId = functionName.replace("update_", "");
        const field = this.form.querySelector(
            `[name="${fieldId}"], [id="${fieldId}"]`
        );

        if (field) {
            this.updateFieldValue(field as HTMLElement, args[fieldId]);
        }
    }

    private updateFieldValue(field: HTMLElement, value: any) {
        if (field instanceof HTMLInputElement) {
            if (field.type === "checkbox") {
                field.checked = Boolean(value);
            } else {
                field.value = String(value);
            }
        } else if (field instanceof HTMLTextAreaElement) {
            field.value = String(value);
        } else if (field instanceof HTMLSelectElement) {
            field.value = String(value);
        }

        // Trigger change event
        field.dispatchEvent(new Event("change", { bubbles: true }));
    }
}
