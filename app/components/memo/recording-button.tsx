import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Mic, MicOff } from "lucide-react";
import React from "react";

type Props = {
    status: "loading" | "disconnected" | "connecting" | "connected" | "error";
    isRecording: boolean;
    handleRecording: () => void;
    handleConnect: () => void;
    className?: string;
};

const RecordingButton = ({
    status,
    isRecording,
    handleRecording,
    handleConnect,
    className,
}: Props) => {
    function handleClick() {
        if (status !== "connected") {
            handleConnect();
            handleRecording();
        } else {
            handleRecording();
        }
    }

    return (
        <Button
            onClick={handleClick}
            variant="default"
            className={cn(
                "rounded-full mx-auto px-4 py-1 cursor-pointer overflow-hidden hover:bg-foreground/90 disabled:opacity-50 disabled:pointer-events-auto disabled:cursor-auto",
                isRecording && "bg-foreground/10 border animate-pulse",
                className
            )}
            disabled={status !== "connected"}
        >
            {isRecording ? (
                <>
                    Recording... <MicOff className="w-4 h-4 ml-2" />
                </>
            ) : (
                <>
                    Start recording
                    <Mic className="w-4 h-4 ml-2" />
                </>
            )}
        </Button>
    );
};

export default RecordingButton;
