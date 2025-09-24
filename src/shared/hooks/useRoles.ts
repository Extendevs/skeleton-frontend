import { useMemo } from 'react';
import { useStore } from 'zustand';
import { sessionStore } from '../../auth/sessionStore';

// Tipos para roles (ajusta según tu enum)
export type UserRole = string; // Cambia por tu tipo específico de roles

/**
 * Hook para verificar roles (equivalente a AclrPipe)
 * @param key - Rol o array de roles a verificar
 * @param unique - Si es true, retorna el primer rol que coincida
 * @returns boolean | string | null - Resultado de la verificación
 */
export const useRoles = (
    key: UserRole | UserRole[],
    unique = false
): boolean | UserRole | null => {
    const roles = useStore(sessionStore, (state) => state.profile?.roles || []);

    return useMemo(() => {
        if (!roles?.length) {
            return null;
        }

        if (typeof key === 'string') {
            return roles.includes(key);
        }

        if (Array.isArray(key)) {
            if (unique) {
                // Retorna el primer rol que coincida
                return key.find(role => roles.includes(role)) || null;
            } else {
                // Retorna true si tiene al menos uno de los roles
                const filteredArray = key.filter(role => roles.includes(role));
                return filteredArray.length > 0;
            }
        }

        return false;
    }, [roles, key, unique]);
};

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param role - Rol a verificar
 * @returns boolean
 */
export const useHasRole = (role: UserRole): boolean => {
    const roles = useStore(sessionStore, (state) => state.profile?.roles || []);

    return useMemo(() => {
        return roles.includes(role);
    }, [roles, role]);
};

/**
 * Hook para verificar si el usuario tiene alguno de los roles
 * @param rolesList - Array de roles a verificar
 * @returns boolean
 */
export const useHasAnyRole = (rolesList: UserRole[]): boolean => {
    const roles = useStore(sessionStore, (state) => state.profile?.roles || []);

    return useMemo(() => {
        return rolesList.some(role => roles.includes(role));
    }, [roles, rolesList]);
};

/**
 * Hook para verificar si el usuario tiene todos los roles
 * @param rolesList - Array de roles a verificar
 * @returns boolean
 */
export const useHasAllRoles = (rolesList: UserRole[]): boolean => {
    const roles = useStore(sessionStore, (state) => state.profile?.roles || []);

    return useMemo(() => {
        return rolesList.every(role => roles.includes(role));
    }, [roles, rolesList]);
};

/**
 * Hook para obtener los roles del usuario
 * @returns UserRole[] - Array de roles del usuario
 */
export const useUserRoles = (): UserRole[] => {
    return useStore(sessionStore, (state) => state.profile?.roles || []);
};
