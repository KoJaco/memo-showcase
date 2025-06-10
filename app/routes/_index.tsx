import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Memo Showcase" },
        { name: "description", content: "Welcome to my showcase!" },
    ];
};

export default function Index() {
    return <div className="flex h-screen items-center justify-center"></div>;
}
