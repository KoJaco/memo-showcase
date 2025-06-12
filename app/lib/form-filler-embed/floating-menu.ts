import { ConnectionStatus } from "./types";

interface FloatingMenuProps {
    onRecordingToggle: () => void;
    onConnect: () => void;
    onDisconnect: () => void;
    status: ConnectionStatus;
    isRecording: boolean;
}

export class FloatingMenu {
    private element: HTMLElement;
    private props: FloatingMenuProps;
    private isVisible: boolean = false;
    private isCollapsed: boolean = false;

    constructor(props: FloatingMenuProps) {
        this.props = props;
        this.element = this.createMenuElement();
        this.injectStyles();
        document.body.appendChild(this.element);
    }

    private createMenuElement(): HTMLElement {
        const menu = document.createElement("div");
        menu.className = "memonic-menu";
        menu.innerHTML = this.getMenuHTML();
        this.attachEventListeners(menu);
        return menu;
    }

    private getMenuHTML(): string {
        return `
            <div class="memonic-menu-container">
                <div class="memonic-menu-buttons">
                    <button class="memonic-menu-button settings">
                        <svg class="memonic-icon" viewBox="0 0 24 24">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                    </button>
                    <button class="memonic-menu-button collapse">
                        <svg class="memonic-icon" viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button class="memonic-menu-button connection">
                        <svg class="memonic-icon" viewBox="0 0 24 24">
                            <path d="M5 12.55a11 11 0 0114.08-11" />
                            <path d="M1.42 5a16 16 0 0120.16 0" />
                            <path d="M8.53 16.11a6 6 0 016.95 0" />
                            <path d="M12 20h.01" />
                        </svg>
                        <span class="connection-status"></span>
                    </button>
                    <button class="memonic-menu-button recording">
                        <svg class="memonic-icon" viewBox="0 0 24 24">
                            <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                            <path d="M19 10v2a7 7 0 01-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    private injectStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .memonic-menu {
                position: fixed;
                right: 1.5rem;
                bottom: 1.5rem;
                z-index: 50;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }

            .memonic-menu.visible {
                opacity: 1;
                transform: translateX(0);
            }

            .memonic-menu-container {
                background: white;
                border-radius: 9999px;
                padding: 0.5rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }

            .memonic-menu-buttons {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .memonic-menu-button {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }

            .memonic-menu-button:hover {
                background: rgba(0, 0, 0, 0.05);
                transform: scale(1.1);
            }

            .memonic-icon {
                width: 1.25rem;
                height: 1.25rem;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                fill: none;
            }

            .connection-status {
                position: absolute;
                top: 0;
                right: 0;
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 9999px;
                border: 2px solid white;
            }

            .connection-status.connected {
                background: #10B981;
            }

            .connection-status.connecting {
                background: #F59E0B;
            }

            .connection-status.disconnected {
                background: #EF4444;
            }

            .recording.active {
                background: #EF4444;
                color: white;
            }

            @media (min-width: 1024px) {
                .memonic-menu {
                    right: 2rem;
                    bottom: auto;
                    top: 50%;
                    transform: translate(100%, -50%);
                }

                .memonic-menu.visible {
                    transform: translate(0, -50%);
                }
            }
        `;
        document.head.appendChild(style);
    }

    private attachEventListeners(menu: HTMLElement) {
        const recordingButton = menu.querySelector(".recording");
        const connectionButton = menu.querySelector(".connection");
        const collapseButton = menu.querySelector(".collapse");

        recordingButton?.addEventListener("click", () => {
            this.props.onRecordingToggle();
        });

        connectionButton?.addEventListener("click", () => {
            if (this.props.status === "connected") {
                this.props.onDisconnect();
            } else {
                this.props.onConnect();
            }
        });

        collapseButton?.addEventListener("click", () => {
            this.isCollapsed = !this.isCollapsed;
            menu.classList.toggle("collapsed", this.isCollapsed);
        });
    }

    public updateVisibility(isVisible: boolean) {
        this.isVisible = isVisible;
        this.element.classList.toggle("visible", isVisible);
    }

    public updateStatus(status: ConnectionStatus) {
        const statusElement = this.element.querySelector(".connection-status");
        if (statusElement) {
            statusElement.className = `connection-status ${status}`;
        }
    }

    public updateRecordingState(isRecording: boolean) {
        const recordingButton = this.element.querySelector(".recording");
        if (recordingButton) {
            recordingButton.classList.toggle("active", isRecording);
        }
    }

    public destroy() {
        this.element.remove();
    }
}
