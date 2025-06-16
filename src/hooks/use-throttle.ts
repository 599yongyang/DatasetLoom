import { useEffect, useRef, useState } from 'react';

export function useThrottle<T>(value: T, delay: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef<number>(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= delay) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return throttledValue;
}
