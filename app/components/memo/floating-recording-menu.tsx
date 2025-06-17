import React, { useEffect, useState, useCallback } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    Mic,
    MicOff,
    Info,
    Wifi,
    WifiOff,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoDialog } from "~/components/ui/info-dialog";

interface FloatingRecordingMenuProps {
    status: "connected" | "disconnected" | "connecting" | "error";
    isRecording: boolean;
    handleRecording: () => void;
    handleConnect: () => void;
    handleDisconnect: () => void;
}

export const FloatingRecordingMenu: React.FC<FloatingRecordingMenuProps> = ({
    status,
    isRecording,
    handleRecording,
    handleConnect,
    handleDisconnect,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const updateVisibility = useCallback(
        (visible: boolean) => {
            if (visible !== isVisible) {
                setIsAnimating(true);
                setIsVisible(visible);
                // Remove animating class after animation completes
                setTimeout(() => setIsAnimating(false), 300);
            }
        },
        [isVisible]
    );

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const observer = new IntersectionObserver(
            (entries) => {
                // Clear any pending timeout
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                // Check if any form is visible
                const isFormVisible = entries.some(
                    (entry) =>
                        entry.isIntersecting && entry.intersectionRatio > 0.1
                );

                // Debounce the visibility update
                timeoutId = setTimeout(() => {
                    updateVisibility(isFormVisible);
                }, 100);
            },
            {
                threshold: 0.1,
                rootMargin: "0px",
            }
        );

        // Find all forms in the document
        const forms = document.querySelectorAll("form, [data-form-container]");

        // If no forms are found, show the menu by default
        if (forms.length === 0) {
            updateVisibility(true);
            return;
        }

        // Observe all forms
        forms.forEach((form) => observer.observe(form));

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            forms.forEach((form) => observer.unobserve(form));
            observer.disconnect();
        };
    }, [updateVisibility]);

    const getConnectionIcon = () => {
        switch (status) {
            case "connected":
                return <Wifi className="w-4 h-4" />;
            case "connecting":
                return <Wifi className="w-4 h-4 animate-pulse" />;
            case "error":
                return <WifiOff className="w-4 h-4 text-destructive" />;
            default:
                return <WifiOff className="w-4 h-4" />;
        }
    };

    const buttonBaseStyles =
        "hover:bg-primary/10 hover:scale-110 hover:text-primary transition-all duration-300 h-10 w-10 rounded-full";

    if (!isVisible && !isAnimating) return null;

    return (
        <AnimatePresence>
            {/* Not collapsed */}
            {isVisible && !isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    className={cn(
                        "fixed z-50 right-6 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col bg-primary-foreground text-primary rounded-full px-1 py-2 border border-primary/20"
                    )}
                >
                    <div className="flex flex-col items-center gap-2">
                        {/* Info Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsInfoOpen(true)}
                                className={buttonBaseStyles}
                            >
                                <Info className="w-4 h-4" />
                            </Button>
                        </motion.div>

                        {/* Hide/Show Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={buttonBaseStyles}
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </motion.div>

                        {/* Connection Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative"
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={
                                    status === "connected"
                                        ? handleDisconnect
                                        : handleConnect
                                }
                                className={cn(
                                    "w-10 h-10 rounded-full",
                                    buttonBaseStyles
                                )}
                            >
                                {getConnectionIcon()}
                                <motion.div
                                    className={cn(
                                        "absolute top-0 right-0 w-2 h-2 rounded-full border border-background",
                                        status === "connected"
                                            ? "bg-green-500"
                                            : status === "connecting"
                                            ? "bg-yellow-500"
                                            : status === "error"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                    )}
                                    animate={{
                                        scale:
                                            status === "connected"
                                                ? [1, 1.2, 1]
                                                : 1,
                                    }}
                                    transition={{
                                        repeat:
                                            status === "connected"
                                                ? Infinity
                                                : 0,
                                        duration: 2,
                                    }}
                                />
                            </Button>
                        </motion.div>

                        {/* Recording Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleRecording}
                                disabled={status !== "connected"}
                                className={cn(
                                    buttonBaseStyles,
                                    isRecording &&
                                        "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                )}
                            >
                                <motion.div
                                    animate={{
                                        scale: isRecording ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{
                                        repeat: isRecording ? Infinity : 0,
                                        duration: 1.5,
                                    }}
                                >
                                    {isRecording ? (
                                        <MicOff className="w-6 h-6" />
                                    ) : (
                                        <Mic className="w-6 h-6" />
                                    )}
                                </motion.div>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* Collapsed */}
            {isVisible && isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    className="fixed z-50 right-0 bottom-auto top-1/2 -translate-y-1/2 flex flex-col bg-primary text-primary-foreground rounded-l-lg"
                >
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="flex h-full my-auto min-h-[80px] items-center"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                </motion.div>
            )}

            {/* Info Dialog */}
            <InfoDialog open={isInfoOpen} onOpenChange={setIsInfoOpen} />
        </AnimatePresence>
    );
};
