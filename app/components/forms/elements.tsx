import React, { useId } from "react";

export function TextInput({
    label,
    error,
    ...props
}: React.ComponentPropsWithoutRef<"input"> & {
    label: string;
    error?: string;
}) {
    const id = useId();

    return (
        <div className="group relative z-0 transition-all focus-within:z-10">
            <input
                type="text"
                id={id}
                {...props}
                placeholder=" "
                className="peer block w-full border border-foreground/20 bg-transparent px-6 pb-4 pt-12 text-base/6 text-foreground ring-4 ring-transparent transition focus:border-foreground focus:outline-none focus:ring-foreground group-first:rounded-t-md group-last:rounded-b-md focus:rounded-sm"
            />
            <label
                htmlFor={id}
                className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-foreground/50 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-foreground/75 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-foreground/75"
            >
                {label}
            </label>
            {error && <em>{error}</em>}
        </div>
    );
}

export function TextArea({
    label,
    error,
    ...props
}: React.ComponentPropsWithoutRef<"textarea"> & {
    label: string;
    error?: string;
}) {
    const id = useId();

    return (
        <label className="group relative z-0 transition-all focus-within:z-10">
            <textarea
                id={id}
                {...props}
                placeholder=" "
                className="peer block w-full border border-foreground/20 bg-transparent px-6 pb-4 pt-12 text-base/6 text-foreground ring-4 ring-transparent transition focus:border-foreground focus:outline-none focus:ring-foreground group-first:rounded-t-md group-last:rounded-b-md focus:rounded-sm"
            />
            <label
                className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-foreground/50 transition-all duration-200 peer-focus:-translate-y-8 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-foreground/75 peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-foreground/75"
                htmlFor={id}
            >
                {label}
            </label>
            {error && <em>{error}</em>}
        </label>
    );
}

export function RadioInput({
    label,

    ...props
}: React.ComponentPropsWithoutRef<"input"> & {
    label: string;
}) {
    return (
        <label className="flex gap-x-3">
            <input
                type="radio"
                {...props}
                className="h-6 w-6 flex-none appearance-none rounded-full border border-foreground/20 outline-none checked:border-[0.5rem] checked:border-foreground focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2"
            />
            <span className="text-base/6 text-foreground/75">{label}</span>
        </label>
    );
}
