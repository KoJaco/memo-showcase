import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverProps {
    threshold?: number;
    rootMargin?: string;
}

export const useIntersectionObserver = ({
    threshold = 0,
    rootMargin = "0px",
}: UseIntersectionObserverProps = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<Element | null>(null);

    const ref = useCallback((element: Element | null) => {
        elementRef.current = element;
    }, []);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin]);

    return { ref, isIntersecting };
};
