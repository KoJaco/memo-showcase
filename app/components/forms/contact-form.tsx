import { Fader } from "~/components//fader";
import { Button } from "../ui/button";
import { TextAreaInput, TextInput } from "./elements";
import { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useState } from "react";

type FormErrors = {
    email?: string;
    service?: string;
};

type FormData = {
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
};

// TODO: Form, useActionData for remix... use native form handling from remix, server validation.

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = String(formData.get("email"));
    const name = String(formData.get("name"));
    const company = String(formData.get("company"));
    const phone = String(formData.get("phone"));
    const message = String(formData.get("message"));

    // errs
    const errors: FormErrors = {};

    // conds
    if (!email.includes("@")) {
        errors.email = "Invalid email address, must include @.";
    }

    // return errors before submit if they exist.
    if (Object.keys(errors).length > 0) {
        return { errors: errors };
    }

    // TODO: Add your form submission logic here
    console.log("Form submitted:", { name, email, company, phone, message });

    return { success: true };
}

export function ContactForm() {
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit(formData, { method: "post" });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Fader data-form-container>
            <form
                method="post"
                onSubmit={handleSubmit}
                className="border rounded-lg p-4 shadow bg-primary-foreground/75"
            >
                <h2 className="font-display text-base font-semibold text-primary">
                    All Inquiries
                </h2>
                <div className="isolate mt-6 rounded-md -mx-2 -mb-2 p-2 focus-within:bg-primary/5 space-y-4 text-foreground/75 transition-colors duration-300">
                    <TextInput
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        error={actionData?.errors?.email || undefined}
                    />
                    <TextInput
                        label="Company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        autoComplete="organization"
                    />
                    <TextInput
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                    />
                    <TextAreaInput
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                    />
                </div>
                <Button type="submit" className="mt-10 group rounded-full">
                    <span className="flex items-center">
                        Let&apos;s work together{" "}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-send w-0 h-4 opacity-0 group-hover:w-4 invisible group-hover:translate-x-2 group-hover:opacity-100 group-hover:visible transition-all duration-300"
                        >
                            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                            <path d="m21.854 2.147-10.94 10.939" />
                        </svg>
                        {/* <Send  /> */}
                    </span>
                </Button>
            </form>
        </Fader>
    );
}
