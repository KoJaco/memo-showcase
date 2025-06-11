import React from "react";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Template } from "./types";

interface TemplateSelectorProps {
    availableTemplates: Template[];
    currentTemplateIndex: number;
    onPrevious: () => void;
    onNext: () => void;
    onLoadTemplate: (template: Template) => void;
    onAddTemplate: (template: Template) => void;
    getCurrentTemplate: () => Template | undefined;
    activeTemplates: Template[];
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    availableTemplates,
    currentTemplateIndex,
    onPrevious,
    onNext,
    onLoadTemplate,
    onAddTemplate,
    getCurrentTemplate,
    activeTemplates,
}) => {
    const currentTemplate = getCurrentTemplate();

    if (!availableTemplates.length || !currentTemplate) {
        return null;
    }

    const isTemplateActive = activeTemplates.some(
        (t) => t.name === currentTemplate.name
    );

    const handlePrevious = () => {
        onPrevious();
        const prevTemplate =
            availableTemplates[currentTemplateIndex - 1] ||
            availableTemplates[availableTemplates.length - 1];
        onLoadTemplate(prevTemplate);
    };

    const handleNext = () => {
        onNext();
        const nextTemplate =
            availableTemplates[currentTemplateIndex + 1] ||
            availableTemplates[0];
        onLoadTemplate(nextTemplate);
    };

    return (
        <div className="flex md:flex-row flex-col gap-y-4 md:items-center justify-between p-2 bg-primary-foreground/75 rounded-lg">
            <div className="flex md:flex-row flex-col md:items-center gap-4">
                <Sparkles className="w-4 h-4 text-foreground/75" />
                <div>
                    <p className="text-sm font-medium">
                        {currentTemplateIndex + 1} of{" "}
                        {availableTemplates.length}:{" "}
                        <span>{currentTemplate.name}</span>
                    </p>
                    <p className="text-xs text-foreground/50">
                        {currentTemplate.description}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={availableTemplates.length <= 1}
                    className="hover:bg-primary/10 w-8 h-8 rounded-full hover:text-primary"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNext}
                    disabled={availableTemplates.length <= 1}
                    className="hover:bg-primary/10 w-8 h-8 rounded-full hover:text-primary"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
