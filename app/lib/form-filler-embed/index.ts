import { MemonicEmbed } from "./memonic-embed";
import type { MemonicConfig } from "./types";

// Export the main class and types
export { MemonicEmbed };
export type { MemonicConfig };

// Make it available globally when loaded as a script
if (typeof window !== "undefined") {
    (window as any).MemonicEmbed = MemonicEmbed;
}
