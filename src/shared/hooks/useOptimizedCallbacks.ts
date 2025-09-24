import { useCallback, useMemo, useRef } from 'react';

/**
 * Hook for creating optimized callbacks that prevent unnecessary re-renders
 * Useful for list items and components that receive callback props
 */
export function useOptimizedCallbacks() {
    const callbacksRef = useRef(new Map<string, Function>());

    const createCallback = useCallback(<T extends any[]>(
        key: string,
        fn: (...args: T) => void,
        deps: any[] = []
    ) => {
        const depsString = JSON.stringify(deps);
        const cacheKey = `${key}-${depsString}`;

        if (!callbacksRef.current.has(cacheKey)) {
            callbacksRef.current.set(cacheKey, fn);
        }

        return callbacksRef.current.get(cacheKey) as (...args: T) => void;
    }, []);

    const clearCache = useCallback(() => {
        callbacksRef.current.clear();
    }, []);

    return { createCallback, clearCache };
}

/**
 * Hook for creating stable callbacks for list items
 * Prevents re-rendering of list items when callbacks change
 */
export function useStableCallbacks<T>(
    onEdit: (item: T) => void,
    onDelete: (item: T) => void,
    dependencies: any[] = []
) {
    const stableOnEdit = useCallback(onEdit, dependencies);
    const stableOnDelete = useCallback(onDelete, dependencies);

    return useMemo(() => ({
        onEdit: stableOnEdit,
        onDelete: stableOnDelete
    }), [stableOnEdit, stableOnDelete]);
}

/**
 * Hook for memoizing expensive computations
 */
export function useExpensiveMemo<T>(
    factory: () => T,
    deps: any[],
    isExpensive: boolean = true
): T {
    return useMemo(() => {
        if (isExpensive) {
            console.time('Expensive computation');
        }
        const result = factory();
        if (isExpensive) {
            console.timeEnd('Expensive computation');
        }
        return result;
    }, deps);
}
