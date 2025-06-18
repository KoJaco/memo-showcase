import React, { useId, forwardRef, useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { LoaderCircleIcon } from "lucide-react";

interface BaseFieldProps {
    label: string;
    error?: string;
    description?: string;
    isDraft?: boolean;
}

function Loader() {
    return (
        <div className="absolute top-1/2 -translate-y-1/2 right-2">
            <LoaderCircleIcon className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
    );
}

export const TextInput = forwardRef<
    HTMLInputElement,
    React.ComponentPropsWithoutRef<"input"> & BaseFieldProps
>(({ label, error, description, isDraft, ...props }, ref) => {
    const id = useId();

    return (
        <div className="space-y-2">
            {error && <em className="text-destructive text-sm">{error}</em>}
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            {description && (
                <p className="text-sm text-foreground/50">{description}</p>
            )}
            <div className="relative">
                <input
                    id={id}
                    ref={ref}
                    {...props}
                    className={cn(
                        isDraft &&
                            "opacity-50 rounded-[2px] p-2 border border-foreground pr-8",
                        "w-full bg-transparent border-b border-foreground/20 focus:border-foreground focus:outline-none py-1 text-foreground/75 transition-all duration-100 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus:visible:ring-ring disabled:cursor-not-allowed disabled:opacity-75 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus:ring-foreground/50 focus-visible:border-b-0 focus-visible:rounded-[2px] focus-visible:p-2",
                        error && "border-destructive"
                    )}
                    readOnly={false}
                />
                {isDraft && <Loader />}
            </div>
        </div>
    );
});

export const TextAreaInput = forwardRef<
    HTMLTextAreaElement,
    React.ComponentPropsWithoutRef<"textarea"> & BaseFieldProps
>(({ label, error, description, isDraft, ...props }, ref) => {
    const id = useId();

    return (
        <div className="space-y-4">
            {error && <em className="text-destructive text-sm">{error}</em>}
            <div>
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {description && (
                    <p className="text-sm text-foreground/50">{description}</p>
                )}
            </div>
            <div className="relative">
                <textarea
                    id={id}
                    ref={ref}
                    {...props}
                    onFocus={(e) => {
                        e.currentTarget.scrollTop =
                            e.currentTarget.scrollHeight;
                        props.onFocus?.(e);
                    }}
                    className={cn(
                        isDraft &&
                            "opacity-50 rounded-[2px] p-2 border border-foreground pr-8",
                        "w-full bg-transparent border-b border-foreground/20 min-h-[80px] focus:border-foreground focus:outline-none py-1 text-foreground/75 transition-all duration-100 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus:visible:ring-ring disabled:cursor-not-allowed disabled:opacity-75 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus:ring-foreground/50 focus-visible:border-b-0 focus-visible:rounded-[2px] focus-visible:p-2",
                        error && "border-destructive"
                    )}
                    readOnly={false}
                />
                {isDraft && <Loader />}
            </div>
        </div>
    );
});

export const CheckboxInput = forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Checkbox> & BaseFieldProps
>(({ label, error, description, isDraft, ...props }, ref) => {
    const id = useId();

    return (
        <div className="space-y-1">
            {error && <em className="text-destructive text-sm">{error}</em>}
            <div className="flex items-center space-x-2">
                <div className="relative">
                    <Checkbox
                        id={id}
                        ref={ref}
                        {...props}
                        className={cn(
                            isDraft && "opacity-50 border rounded-[2px] p-2"
                        )}
                    />
                    {isDraft && <Loader />}
                </div>
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
            </div>
            {description && (
                <p className="text-sm text-muted-foreground pl-6">
                    {description}
                </p>
            )}
        </div>
    );
});

export const RadioGroupInput = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof RadioGroup> &
        BaseFieldProps & {
            options: string[];
        }
>(({ label, error, description, options, isDraft, ...props }, ref) => {
    const id = useId();

    return (
        <div className="space-y-1">
            {error && <em className="text-destructive text-sm">{error}</em>}
            <Label className="text-sm font-medium">{label}</Label>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="relative">
                <RadioGroup
                    {...props}
                    ref={ref}
                    className={cn(
                        "space-y-2",
                        isDraft && "opacity-50 border rounded-[2px] p-2 pr-8"
                    )}
                >
                    {options.map((option) => (
                        <div
                            key={option}
                            className="flex items-center space-x-2"
                        >
                            <RadioGroupItem
                                value={option}
                                id={`${id}-${option}`}
                            />
                            <Label
                                htmlFor={`${id}-${option}`}
                                className="text-sm"
                            >
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {isDraft && <Loader />}
            </div>
        </div>
    );
});

export const SelectInput = forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Select> &
        BaseFieldProps & {
            options: string[];
            open?: boolean;
        }
>(
    (
        {
            label,
            error,
            description,
            options,
            isDraft,
            value,
            onValueChange,
            open,
            ...props
        },
        ref
    ) => {
        const id = useId();
        const [selectedValue, setSelectedValue] = useState(value);
        const [isOpen, setIsOpen] = useState(open);

        // Update local state when value prop changes
        useEffect(() => {
            setSelectedValue(value);
        }, [value]);

        // Update open state when open prop changes
        useEffect(() => {
            setIsOpen(open);
        }, [open]);

        const handleValueChange = (newValue: string) => {
            setSelectedValue(newValue);
            onValueChange?.(newValue);
            setIsOpen(false);
        };

        return (
            <div className="space-y-4">
                {error && <em className="text-destructive text-sm">{error}</em>}
                <div>
                    <Label htmlFor={id} className="text-sm font-medium">
                        {label}
                    </Label>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <Select
                        value={selectedValue}
                        onValueChange={handleValueChange}
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        {...props}
                    >
                        <SelectTrigger
                            id={id}
                            ref={ref}
                            className={cn(
                                "border-b border-foreground/20 focus:border-foreground focus:outline-none bg-transparent rounded-[2px]",
                                isDraft &&
                                    "opacity-50 border rounded-[2px] p-2 pr-8"
                            )}
                        >
                            <SelectValue
                                placeholder={`Select ${label.toLowerCase()}`}
                            />
                            {isDraft && <Loader />}
                        </SelectTrigger>
                        <SelectContent className="rounded-b-[4px] rounded-t-none bg-background">
                            {options.map((option) => (
                                <SelectItem
                                    key={option}
                                    value={option}
                                    className="rounded-[4px]"
                                >
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    }
);

TextInput.displayName = "TextInput";
TextAreaInput.displayName = "TextAreaInput";
CheckboxInput.displayName = "CheckboxInput";
RadioGroupInput.displayName = "RadioGroupInput";
SelectInput.displayName = "SelectInput";
