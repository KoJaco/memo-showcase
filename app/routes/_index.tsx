import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Equal, ExternalLink } from "lucide-react";
import { useInView } from "motion/react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Fader, FaderStagger } from "~/components//fader";
import BackgroundStatic from "~/components/background-static";
import { PageIntro } from "~/components/sections/page-intro";
import { SectionIntro } from "~/components/sections/section-intro";
import { FullShowcase, HowItWorksShowcase } from "~/components/showcases";
import { Badge } from "~/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";

import { Container } from "~/components/ui/container";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
    return [
        { title: "Memo Showcase" },
        { name: "description", content: "Welcome to my showcase!" },
    ];
};

type TypeofSection = "demo" | "why" | "how" | "who-its-for" | "whats-next";

type TSection = {
    id: TypeofSection;
    title: string | JSX.Element;
    eyebrow: string | JSX.Element;
    body: string | JSX.Element;
    image?: { src: string; aspect: number };
};

const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
};

const PAGE_NAVIGATION: {
    id: TypeofSection;
    title: string;
}[] = [
    { id: "demo", title: "demo" },
    { id: "why", title: "why?" },
    { id: "how", title: "how?" },
    { id: "who-its-for", title: "who it's for" },
    { id: "whats-next", title: "what's next?" },
];

const carouselImages = [
    { src: "/images/display/carousel-1.jpg", aspect: 4 / 3, widthMult: 1 },
    { src: "/images/display/carousel-2.webp", aspect: 4 / 3, widthMult: 2 },
    // { src: "/images/display/carousel-1.jpg", aspect: 4 / 3, widthMult: 1 },
];

const SECTIONS: Record<TypeofSection, TSection> = {
    demo: {
        id: "demo",
        title: (
            <span>
                <span className="text-primary">Voice</span> powered,
                <br />
                Effortless <span className="text-primary">Forms</span>
            </span>
        ),
        eyebrow: "Introducing Memo",
        body: "This is a working demo of Memo Form Filler. Just press the mic button and speak naturally — Memo will parse your intent and fill in the form fields automatically. Try something like: “Set name to Alex, email to alex@example.com, and message: I'm interested in a quote.”",
    },
    why: {
        id: "why",
        title: (
            <p>
                <span className="text-primary">Mobile Forms </span>
                are Broken
            </p>
        ),
        eyebrow: "Why this matters",
        body: "Typing on a phone is slow, error-prone, and often frustrating. Whether you're juggling tasks, filling a field report, or trying to submit a lead while on the move, forms on mobile create friction. Memo eliminates this pain by letting you speak naturally and get it done faster — without tapping through tiny fields or repeating information.",
        image: { src: "/images/display/field-service.jpg", aspect: 4 / 3 },
    },
    how: {
        id: "how",
        title: "How it works",
        eyebrow: (
            <div className="flex flex-col items-start justify-between gap-y-4 mb-6">
                <Badge className="text-sm text-background/75 hover:text-primary-foreground/75 rounded-full px-4 bg-foreground transition-colors duration-300 hover:bg-primary group/badge">
                    Powered by{" "}
                    <a
                        href="https://memonic.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-background ml-1 group-hover/badge:text-primary-foreground"
                    >
                        Memonic
                    </a>
                    <ExternalLink className="ml-2 w-4 h-4" />
                </Badge>
                <span>Voice → Intent → Structured Output,</span>
            </div>
        ),
        body: (
            <div>
                <p className="text-foreground/50 mt-4">
                    Memo listens to your voice and converts it into structured
                    actions in real time. It uses high-accuracy speech
                    recognition combined with the Memonic engine — a natural
                    language parser built to understand context, extract intent,
                    and map spoken instructions directly to structured output.
                    Whether you&apos;re saying &apos;Set budget to 500&apos; or
                    &apos;Name is Jess, message: follow up Monday&apos;, Memo
                    fills the form instantly, no training required.
                </p>
                <div className="mt-8">
                    <HowItWorksShowcase />
                </div>
            </div>
        ),
    },
    "who-its-for": {
        id: "who-its-for",
        title: "Built for real-world use",
        eyebrow: "Who it's for",
        body: (
            <div>
                <p className="text-foreground/50">
                    Memo is built for people who fill out forms on the go, for
                    those who struggle with form inputs, and for workflows that
                    require a lot of manual data entry. <br />
                    <br />
                    It&apos;s ideal for field workers, customer-facing teams,
                    and mobile-heavy workflows. It&apos;s also designed with
                    accessibility in mind, enabling users with motor
                    impairments, visual limitations, or dyslexia to fill out
                    structured forms entirely by voice. Memo lowers the barrier
                    for anyone who finds typing difficult or inefficient.,
                </p>
                <Carousel
                    className="w-full max-w-xl relative mt-4"
                    opts={{ align: "start" }}
                >
                    <CarouselContent>
                        {carouselImages.map((item, index) => {
                            return (
                                <CarouselItem
                                    key={`${item.aspect}_${index}`}
                                    className={cn(
                                        // "sm:basis-1/2",
                                        item.widthMult == 1
                                            ? "max-w-[300px]"
                                            : "max-w-[442px]"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "mt-4 rounded-lg overflow-hidden relative group/img"
                                        )}
                                    >
                                        <div className="absolute bg-primary-foreground top-0 left-0 w-full h-full opacity-20 group-hover/img:opacity-10 transition-all duration-500 z-10" />
                                        <img
                                            src={item.src}
                                            alt=""
                                            className={cn(
                                                "group-hover/img:scale-105 transition-transform duration-500 ",
                                                item.widthMult == 1
                                                    ? "aspect-4/5"
                                                    : "h-[426px] sm:h-full aspect-square"
                                            )}
                                        />
                                    </div>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <div className="absolute -bottom-8 left-10">
                        <CarouselPrevious className="border-0 hover:bg-transparent hover:text-foreground right-0 shadow-none bg-transparent" />
                        <CarouselNext className="border-0 hover:bg-transparent hover:text-foreground left-0 shadow-none bg-transparent" />
                    </div>
                </Carousel>
            </div>
        ),
    },
    "whats-next": {
        id: "whats-next",
        title: "Embed it in your app or workflow",
        eyebrow: "What's next?",
        body: (
            <div>
                <p className="text-foreground/50">
                    Memo is currently in development but will soon be available
                    as an embeddable script and a Chrome extension. We&apos;re
                    building a full SDK and dashboard so you can integrate voice
                    input into any form on your site or product with just a few
                    lines of code. Want early access?{" "}
                    <Link
                        to="/contact"
                        className="text-foreground/90 hover:text-foreground"
                    >
                        Reach out{" "}
                    </Link>
                    and let&apos;s build together.
                    <br />
                    <br />
                    Once Memo is released, you&apos;ll be able to:
                </p>

                <ul className="mt-8 space-y-8 text-sm text-foreground/50">
                    <li>
                        <strong>1.</strong> Sign up for a free Memo account to
                        get started.
                        {/* <div className="mt-4 p-4 bg-primary-foreground/75 rounded-lg border border-foreground/10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Free Tier
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute right-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Pro Tier
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute left-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Enterprise
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute left-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </li>
                    <li>
                        <strong>2.</strong> Customize your component preferences
                        — choose guidance settings, adjust field filling
                        behavior, and optionally apply your own branding styles.
                        <div className="mt-4 p-4 bg-primary-foreground/75 rounded-lg border border-foreground/10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Record Transcripts
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute right-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Pass Through Privacy Policy
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute left-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Allow User Settings
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute right-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Custom Branding
                                    </span>
                                    <div className="h-4 w-8 rounded-full bg-primary/20 relative">
                                        <div className="absolute right-0 h-4 w-4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        ...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>3.</strong> Copy a small generated script tag
                        and paste it into your website&apos;s HTML.
                        <div className="mt-4 p-4 bg-primary-foreground/75 rounded-lg border border-foreground/10 font-mono text-xs">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-foreground/75">
                                    script.js
                                </span>
                                <button className="text-foreground/50 hover:text-foreground transition-colors">
                                    Copy
                                </button>
                            </div>
                            <div className="text-foreground/75 whitespace-normal ">
                                <code>
                                    &lt;script
                                    src="https://cdn.memo.ai/v1/memo.min.js"
                                    data-site-url="your-site-url"
                                    data-theme="custom"
                                    data-auto-init="true"&gt;&lt;/script&gt;
                                </code>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4.</strong> Memo automatically detects forms and
                        gently pops up when in view, offering a seamless voice
                        input option to your visitors.
                        {/* <div className="mt-4 p-4 bg-primary-foreground/75 rounded-lg border border-foreground/10">
                            <div className="relative h-32 bg-background/50 rounded-lg overflow-hidden">
                                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-primary" />
                                </div>
                                <div className="absolute top-4 left-4 w-24 h-8 bg-primary/20 rounded-full" />
                                <div className="absolute top-4 right-4 w-16 h-8 bg-primary/20 rounded-full" />
                                <div className="absolute top-16 left-4 w-full h-8 bg-primary/20 rounded-full" />
                            </div>
                        </div> */}
                    </li>
                    <li>
                        <strong>5.</strong> View structured analytics and usage
                        metrics directly in your dashboard — including
                        completions, full transcripts, cost monitoring,
                        drop-offs, and voice command insights.
                        <div className="mt-4 p-4 bg-primary-foreground/75 rounded-lg border border-foreground/10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Completions
                                    </span>
                                    <span className="text-foreground/75">
                                        96%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full w-[87%] bg-primary rounded-full" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Fields left Pending
                                    </span>
                                    <span className="text-foreground/75">
                                        4%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full w-[4%] bg-primary rounded-full" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Average Transcript Words
                                    </span>
                                    <span className="text-foreground/75">
                                        42
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        Average Cost per Form
                                    </span>
                                    <span className="text-foreground/75">
                                        $0.0067
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-foreground/75">
                                        ...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        ),
    },
};

export default function Index() {
    // Internal state
    // TODO: properly implement either debounce or defer for section animation
    const [immediateSection, setImmediateSection] =
        useState<TypeofSection | null>(null);
    const deferredSection = useDeferredValue(immediateSection);

    const [menuOpen, setMenuOpen] = useState(false);

    // Track state of internal navigation
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleMobileNav = (id: string) => {
        setMenuOpen(false);

        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 500);
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            <BackgroundStatic />
            <div className="w-full max-w-xl mx-auto">
                <div className="flex flex-col max-w-xl mx-auto w-full justify-center">
                    {/* MOBILE - Sheet */}
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <div className="lg:hidden">
                            <header className="w-full h-[70px]">
                                <div className="justify-between flex items-center h-full w-full mx-auto max-w-7xl px-6 lg:px-8">
                                    <div className="w-auto">
                                        <span>Memo</span>
                                    </div>
                                    <SheetTrigger className="ml-auto">
                                        <Equal />
                                    </SheetTrigger>
                                </div>
                            </header>
                            <SheetContent
                                side="top"
                                className="w-full h-auto p-2 bg-transparent border-0"
                            >
                                <div className="w-full h-full bg-background rounded-lg relative">
                                    <BackgroundStatic />
                                    <Fader className="max-w-xl mx-auto px-6 h-full w-full">
                                        <SheetHeader className="pt-24 sm:pt-32 lg:pt-40 text-left">
                                            <SheetTitle>Memo</SheetTitle>
                                            <SheetDescription>
                                                <span className="text-primary">
                                                    Structured{" "}
                                                </span>
                                                output,
                                                <br />
                                                Powerful{" "}
                                                <span className="text-primary">
                                                    natural language
                                                </span>
                                            </SheetDescription>

                                            <div></div>
                                        </SheetHeader>

                                        <FaderStagger className="flex flex-col gap-y-4 mt-6 -ml-1">
                                            {PAGE_NAVIGATION.map((navItem) => {
                                                return (
                                                    <Fader
                                                        key={navItem.id}
                                                        variants={itemVariants}
                                                    >
                                                        <button
                                                            className={cn(
                                                                "capitalize -ml-4 group hover:ml-1 transition-all duration-300 text-xl text-foreground/50 hover:text-primary"
                                                            )}
                                                            onClick={() =>
                                                                handleMobileNav(
                                                                    SECTIONS[
                                                                        navItem
                                                                            .id
                                                                    ].id
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "mr-2 opacity-0 duration-300 transition-all group-hover:opacity-100 text-foreground/50"
                                                                )}
                                                            >
                                                                #
                                                            </span>
                                                            {navItem.title}
                                                        </button>
                                                    </Fader>
                                                );
                                            })}
                                        </FaderStagger>
                                    </Fader>
                                    {/* <Footer className="mt-auto absolute w-full left-0 bottom-0" /> */}
                                    <Footer className="block w-full h-auto md:mt-24 mt-12" />
                                </div>
                            </SheetContent>
                        </div>
                    </Sheet>

                    {/* Desktop */}
                    <FaderStagger
                        key="fixed-nav"
                        className={cn(
                            "max-w-[160px] text-sm gap-y-2 flex-col text-foreground/50 lg:flex hidden transition-opacity duration-300 fixed left-10 top-40 group/nav",

                            !deferredSection ? "opacity-0" : "opacity-100"
                        )}
                    >
                        <Fader>
                            <h1 className="text-xl text-foreground mb-2">
                                Memo
                            </h1>
                            <p className="text-md mb-4">
                                Structured output, <br />
                                powerful natural language
                            </p>
                        </Fader>
                        {PAGE_NAVIGATION.map((navItem) => {
                            return (
                                <Fader key={navItem.id} variants={itemVariants}>
                                    <button
                                        // href={`#${navItem.id}`}
                                        className={cn(
                                            "capitalize -ml-4 group/item hover:-ml-0 transition-all duration-300",
                                            deferredSection === navItem.id &&
                                                "-ml-0"
                                        )}
                                        onClick={() =>
                                            scrollToSection(
                                                SECTIONS[navItem.id].id
                                            )
                                        }
                                    >
                                        <span
                                            className={cn(
                                                "mr-2 opacity-0 duration-300 transition-all group-hover/item:opacity-100 group-hover/item:text-foreground/25",
                                                deferredSection === navItem.id
                                                    ? "opacity-100 text-primary/75"
                                                    : "opacity-0"
                                            )}
                                        >
                                            #
                                        </span>
                                        <span
                                            className={cn(
                                                deferredSection === navItem.id
                                                    ? "text-primary"
                                                    : "text-foreground/25"
                                            )}
                                        >
                                            {navItem.title}
                                        </span>
                                    </button>
                                </Fader>
                            );
                        })}
                    </FaderStagger>
                </div>
            </div>

            <div ref={containerRef} className="flex flex-col gap-y-32 h-full">
                {Object.keys(SECTIONS).map((sectionKey, index) => {
                    const section = SECTIONS[sectionKey as TypeofSection];

                    if (index === 0) {
                        return (
                            <HeaderSection
                                key={section.id + "_" + index}
                                sectionKey={sectionKey as TypeofSection}
                                section={section}
                                setImmediateSection={setImmediateSection}
                            />
                        );
                    } else {
                        return (
                            <BodySection
                                key={sectionKey}
                                sectionKey={sectionKey as TypeofSection}
                                index={index}
                                section={section}
                                setImmediateSection={setImmediateSection}
                            />
                        );
                    }
                })}
            </div>

            <Footer />
        </div>
    );
}

function HeaderSection({
    sectionKey,
    section,
    setImmediateSection,
}: {
    sectionKey: TypeofSection;
    section: TSection;
    setImmediateSection: (sectionKey: TypeofSection) => void;
}) {
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { margin: "-50% 0px -50% 0px" });

    useEffect(() => {
        if (inView) {
            setImmediateSection(sectionKey);
        }
    }, [inView, sectionKey, setImmediateSection]);

    return (
        <div
            key={section.id}
            ref={sectionRef}
            id={section.id}
            className="w-full max-w-xl mx-auto scroll-mt-20 bg-transparent h-full"
        >
            <PageIntro
                eyebrow={
                    typeof section.eyebrow === "string"
                        ? `${section.eyebrow}`
                        : section.eyebrow
                }
                title={section.title}
            >
                <p>
                    Typing on mobile is slow, clumsy, and frustrating. Memo lets
                    you fill out any online form using your voice —
                    intelligently mapping natural language to structured fields
                    in real time. No extensions, no training, just speak.
                    <br />
                    <br />
                    Select a form from the examples provided below and then use
                    the floating menu on the right of the screen to fill it out.
                    Easy as that!
                </p>
            </PageIntro>
            <Container className="mt-12">
                <FullShowcase />
            </Container>
        </div>
    );
}

function BodySection({
    sectionKey,
    index,
    section,
    setImmediateSection,
}: {
    sectionKey: TypeofSection;
    index: number;
    section: TSection;
    setImmediateSection: (sectionKey: TypeofSection) => void;
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { margin: "-50% 0px -50% 0px" });

    useEffect(() => {
        if (inView) {
            setImmediateSection(sectionKey);
        }
    }, [inView, sectionKey, setImmediateSection]);

    return (
        <section
            key={sectionKey + "_" + index}
            id={sectionKey}
            ref={ref}
            className="flex flex-col bg-transparent h-full w-full scroll-mt-40"
        >
            <div className="min-h-[600px] max-w-xl text-left w-full mx-auto">
                <SectionIntro
                    eyebrow={
                        typeof section.eyebrow === "string"
                            ? `${section.eyebrow}`
                            : section.eyebrow
                    }
                    title={section.title}
                />
                <Container className="mt-8">
                    <Fader>
                        <div>
                            {typeof section.body === "string" ? (
                                <p className="whitespace-pre-line text-foreground/50">
                                    {section.body}
                                </p>
                            ) : (
                                <>{section.body}</>
                            )}
                        </div>
                        {section.image && (
                            <div className="mt-4 rounded-lg overflow-hidden relative group/img">
                                <div className="absolute bg-primary-foreground top-0 left-0 w-full h-full opacity-20 group-hover/img:opacity-10 transition-all duration-500 z-10" />
                                <img
                                    src={section.image.src}
                                    alt=""
                                    className="group-hover/img:scale-105 transition-transform duration-500"
                                />
                            </div>
                        )}
                    </Fader>
                </Container>
            </div>
        </section>
    );
}

function Footer({ className }: { className?: string }) {
    return (
        <footer className={cn("min-h-[200px] mt-24", className && className)}>
            <Container className="max-w-xl">
                <div className="max-w-xl mx-auto flex flex-col gap-8 border-t py-8">
                    <div className="w-full grid grid-cols-2">
                        <ul className="text-xs text-foreground/75 gap-2 flex flex-col">
                            <li className="hover:text-foreground flex items-center gap-1 transition-colors duration-300 group/linkout">
                                <span className="flex w-1 h-1 rounded-full bg-foreground/50" />

                                <Link to="/contact">Contact</Link>
                                {/* <MoveRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/linkout:opacity-100 group-hover/linkout:translate-x-0 transition-all duration-300" /> */}
                            </li>
                            <li className="hover:text-foreground flex items-center gap-1 transition-colors duration-300 group/linkout">
                                <span className="flex w-1 h-1 rounded-full bg-foreground/50" />

                                <a
                                    href="https://memonic.vercel.app/"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    Checkout Memonic
                                </a>
                                {/* <MoveUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/linkout:opacity-100 group-hover/linkout:translate-x-0 transition-all duration-300" /> */}
                            </li>
                        </ul>
                        <ul className="text-xs text-foreground/75 gap-2 flex flex-col">
                            <li className="hover:text-foreground flex items-center gap-1 transition-colors duration-300">
                                <span className="flex w-1 h-1 rounded-full bg-foreground/50" />
                                <Link to="policies/terms-of-service">
                                    Terms of Service
                                </Link>
                            </li>
                            <li className="hover:text-foreground flex items-center gap-1 transition-colors duration-300">
                                <span className="flex w-1 h-1 rounded-full bg-foreground/50" />
                                <Link to="policies/privacy-policy">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="text-xs text-foreground/50">
                        <span className="text-primary">Memo </span>
                        is made with love by{" "}
                        <Link
                            to="https://www.korijacobsen.au/"
                            className="text-foreground/75"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Kori Jacobsen
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
