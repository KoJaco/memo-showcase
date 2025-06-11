"use client";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Check, CircleAlert, LoaderCircle, RefreshCwOff } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
    status: "loading" | "disconnected" | "connecting" | "connected" | "error";
    className?: string;
    handleAttemptConnect: () => void;
    handleAttemptDisconnect: () => void;
};

const ConnectionIndicator = ({
    className,
    status = "loading",
    handleAttemptConnect,
    handleAttemptDisconnect,
}: Props) => {
    const [statusState, setStatusState] = useState({
        status: "loading",
        styling: "bg-transparent text-foreground opacity-50",
        icon: <LoaderCircle className="animate-spin w-4 h-4" />,
        description: "loading",
    });

    useEffect(() => {
        switch (status) {
            case "loading":
                setStatusState({
                    status: "loading",
                    styling: "bg-transparent text-foreground opacity-50",
                    icon: <LoaderCircle className="animate-spin w-4 h-4" />,
                    description: "loading",
                });
                break;

            case "disconnected":
                setStatusState({
                    status: "disconnected",
                    styling: "bg-foreground/10 border text-foreground",
                    icon: <RefreshCwOff className="w-4 h-4" />,
                    description: "Click to connect w-4 h-4",
                });
                break;

            case "connecting":
                setStatusState({
                    status: "connecting",
                    styling: "bg-transparent text-foreground",
                    icon: <LoaderCircle className="animate-spin w-4 h-4" />,
                    description: "connecting",
                });
                break;

            case "connected":
                setStatusState({
                    status: "connected",
                    styling:
                        "bg-emerald-500 text-emerald-900 hover:bg-emerald-600 hover:text-emerald-100",
                    icon: <Check className="w-4 h-4" />,
                    description: "Click to disconnect",
                });
                break;
            case "error":
                setStatusState({
                    status: "error",
                    styling: "bg-destructive text-destructive-foreground",
                    icon: <CircleAlert className="w-4 h-4" />,
                    description: "Error, try to connect again",
                });
                break;
            default:
                setStatusState({
                    status: "error",
                    styling:
                        "bg-destructive hover:bg-destructive-foreground text-background",
                    icon: <CircleAlert className="w-4 h-4" />,
                    description: "Error, try to connect again",
                });
                break;
        }
    }, [status]);

    function handleClick() {
        if (status !== statusState.status) {
            // why not?
            console.log("Uh oh");
            return;
        }

        if (status === "connected") {
            handleAttemptDisconnect();
        } else if (status === "disconnected" || status === "error") {
            handleAttemptConnect();
        } else {
            return;
        }
    }

    return (
        <Button
            className={cn(
                "absolute z-10 cursor-pointer transition-all duration-300 text-xs disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2",
                statusState.styling,
                className
            )}
            disabled={
                statusState.status === "loading" ||
                statusState.status === "connecting"
            }
            title={statusState.description}
            onClick={handleClick}
            variant="ghost"
        >
            <span className="capitalize">{statusState.status}</span>
            {statusState.icon}
        </Button>
    );
};

export default ConnectionIndicator;
