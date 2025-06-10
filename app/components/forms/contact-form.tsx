// import { Send } from "lucide-react";
import { Fader } from "~/components//fader";
import { Button } from "../ui/button";
import { RadioInput, TextArea, TextInput } from "./elements";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

const serviceTypes = ["Website", "E-commerce", "Freelance"];

type FormErrors = {
    email?: string;
    service?: string;
};

// TODO: Form, useActionData for remix... use native form handling from remix, server validation.

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = String(formData.get("email"));
    // const company = String(formData.get("company"));
    // const phone = String(formData.get("phone"));
    // const message = String(formData.get("message"));
    const service = String(formData.get("service"));

    // errs
    const errors: FormErrors = {};

    // conds
    if (!email.includes("@")) {
        errors.email = "Invalid email address, must include @.";
    }

    if (!serviceTypes.includes(service)) {
        errors.service = `Service type ${service} is not a valid selection.`;
    }

    if (service.length === 0) {
        errors.service = "Please select a service type.";
    }

    // return errors before submit if they exist.
    if (Object.keys(errors).length > 0) {
        return { errors: errors };
    }

    // TODO: implement submit to db.

    // redirect to /contact upon success
    return redirect("/");
}

export function ContactForm() {
    const actionData = useActionData<typeof action>();

    return (
        <Fader>
            <form method="post">
                <h2 className="font-display text-base font-semibold text-foreground">
                    Work inquiries
                </h2>
                <div className="isolate mt-6 -space-y-px rounded-md bg-background/25 focus-within:bg-background/50">
                    <TextInput label="Name" name="name" autoComplete="name" />
                    <TextInput
                        label="Email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        error={actionData?.errors?.email || undefined}
                    />
                    <TextInput
                        label="Company"
                        name="company"
                        autoComplete="organization"
                    />
                    <TextInput
                        label="Phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                    />
                    <TextArea label="message" name="message" />
                    {/* <TextInput label="Message" name="message" /> */}
                    <div className="border border-foreground/25 px-6 py-8 first:rounded-t-md last:rounded-b-md">
                        <fieldset>
                            <legend className="text-base/6 text-foreground/50">
                                Service
                            </legend>
                            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                                <RadioInput
                                    label="Website"
                                    name="service"
                                    value="25"
                                />
                                <RadioInput
                                    label="E-commerce"
                                    name="service"
                                    value="50"
                                />
                                <RadioInput
                                    label="Freelance"
                                    name="service"
                                    value="100"
                                />
                            </div>
                        </fieldset>
                        {actionData?.errors?.service && (
                            <em>{actionData.errors.service}</em>
                        )}
                    </div>
                </div>
                <Button type="submit" className="mt-10 group">
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
