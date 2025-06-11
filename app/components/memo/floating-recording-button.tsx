import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Mic, MicOff, Settings, Wifi, WifiOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingRecordingButtonProps {
    status: "connected" | "connecting" | "disconnected" | "error";
    isRecording: boolean;
    handleRecording: () => void;
    handleConnect: () => void;
    handleDisconnect: () => void;
}

export const FloatingRecordingButton: React.FC<
    FloatingRecordingButtonProps
> = ({
    status,
    isRecording,
    handleRecording,
    handleConnect,
    handleDisconnect,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create intersection observer
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                // Only update visibility if we've scrolled
                if (window.scrollY > 0) {
                    setIsVisible(entry.isIntersecting);
                }
            },
            {
                threshold: 0.1, // Show button when at least 10% of the form is visible
                rootMargin: "0px 0px -100px 0px", // Add some margin to the bottom
            }
        );

        // Start observing the form
        const formElement = document.querySelector("[data-form-container]");
        if (formElement) {
            observerRef.current.observe(formElement);
        }

        // Cleanup
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

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
        "hover:bg-primary-foreground/10 lg:hover:bg-primary/10 hover:scale-110 hover:text-primary-foreground lg:hover:text-primary transition-all duration-300 h-10 w-10 rounded-full";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    className="fixed right-6 lg:right-8 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 z-50 flex flex-col bg-primary text-primary-foreground lg:bg-primary-foreground lg:text-primary rounded-full px-1 py-2 border border-primary/20"
                >
                    <div className="flex flex-col items-center gap-2">
                        {/* Settings Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                className={buttonBaseStyles}
                            >
                                <Settings className="w-4 h-4" />
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
        </AnimatePresence>
    );
};
