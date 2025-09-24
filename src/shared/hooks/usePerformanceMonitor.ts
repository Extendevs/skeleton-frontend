import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage?: number;
    componentRenders: number;
    lastRenderTimestamp: number;
}

/**
 * Hook to monitor component performance
 * Useful for identifying performance bottlenecks
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = import.meta.env.DEV) {
    const renderCountRef = useRef(0);
    const lastRenderRef = useRef(Date.now());
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        renderTime: 0,
        componentRenders: 0,
        lastRenderTimestamp: Date.now()
    });

    useEffect(() => {
        if (!enabled) return;

        const startTime = performance.now();
        renderCountRef.current += 1;

        // Measure render time
        const renderTime = performance.now() - startTime;

        // Get memory usage if available
        const memoryUsage = (performance as any).memory?.usedJSHeapSize;

        const now = Date.now();
        const timeSinceLastRender = now - lastRenderRef.current;
        lastRenderRef.current = now;

        setMetrics({
            renderTime,
            memoryUsage,
            componentRenders: renderCountRef.current,
            lastRenderTimestamp: now
        });

        // Log performance warnings
        if (renderTime > 16) { // More than one frame (60fps)
            console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
        }

        if (renderCountRef.current % 10 === 0) {
            console.log(`[Performance] ${componentName} has rendered ${renderCountRef.current} times`);
        }
    });

    return metrics;
}

/**
 * Hook to measure expensive operations
 */
export function usePerformanceMeasure() {
    const measureOperation = (name: string, operation: () => any) => {
        const startTime = performance.now();
        const result = operation();
        const endTime = performance.now();

        console.log(`[Performance] ${name} took ${(endTime - startTime).toFixed(2)}ms`);

        return result;
    };

    const measureAsyncOperation = async (name: string, operation: () => Promise<any>) => {
        const startTime = performance.now();
        const result = await operation();
        const endTime = performance.now();

        console.log(`[Performance] ${name} took ${(endTime - startTime).toFixed(2)}ms`);

        return result;
    };

    return { measureOperation, measureAsyncOperation };
}

/**
 * Hook to track memory usage
 */
export function useMemoryMonitor(intervalMs: number = 5000) {
    const [memoryInfo, setMemoryInfo] = useState<{
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    } | null>(null);

    useEffect(() => {
        if (!(performance as any).memory) {
            return; // Memory API not available
        }

        const interval = setInterval(() => {
            const memory = (performance as any).memory;
            setMemoryInfo({
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            });

            // Warn if memory usage is high
            const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercentage > 80) {
                console.warn(`[Memory] High memory usage: ${usagePercentage.toFixed(1)}%`);
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs]);

    return memoryInfo;
}

/**
 * Hook to detect slow renders
 */
export function useSlowRenderDetector(threshold: number = 16) {
    const renderStartRef = useRef<number>(0);

    useEffect(() => {
        renderStartRef.current = performance.now();
    });

    useEffect(() => {
        const renderTime = performance.now() - renderStartRef.current;
        if (renderTime > threshold) {
            console.warn(`[Slow Render] Component rendered in ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`);
        }
    });

    return renderStartRef.current;
}
