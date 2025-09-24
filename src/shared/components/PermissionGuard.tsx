import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useRoles, UserRole } from '../hooks/useRoles';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string | string[];
  role?: UserRole | UserRole[];
  uniqueRole?: boolean;
  fallback?: ReactNode;
  requireAll?: boolean; // Si es true, requiere TODOS los permisos/roles
}

/**
 * Componente para proteger contenido basado en permisos y/o roles
 * Equivalente a usar *ngIf con pipes acl y aclr en Angular
 */
export const PermissionGuard = ({
  children,
  permission,
  role,
  uniqueRole = false,
  fallback = null,
  requireAll = false
}: PermissionGuardProps) => {
  const hasPermission = usePermissions(permission || []);
  const hasRole = useRoles(role || [], uniqueRole);

  // Si no se especifica ni permiso ni rol, mostrar contenido
  if (!permission && !role) {
    return <>{children}</>;
  }

  // Solo verificar permisos
  if (permission && !role) {
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Solo verificar roles
  if (role && !permission) {
    const roleResult = typeof hasRole === 'boolean' ? hasRole : !!hasRole;
    return roleResult ? <>{children}</> : <>{fallback}</>;
  }

  // Verificar ambos: permisos Y roles
  if (permission && role) {
    const roleResult = typeof hasRole === 'boolean' ? hasRole : !!hasRole;
    
    if (requireAll) {
      // Requiere AMBOS: permiso Y rol
      return (hasPermission && roleResult) ? <>{children}</> : <>{fallback}</>;
    } else {
      // Requiere AL MENOS UNO: permiso O rol
      return (hasPermission || roleResult) ? <>{children}</> : <>{fallback}</>;
    }
  }

  return <>{fallback}</>;
};

/**
 * HOC para proteger componentes basado en permisos
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: string | string[],
  fallback?: ReactNode
) => {
  return (props: P) => (
    <PermissionGuard permission={permission} fallback={fallback}>
      <Component {...props} />
    </PermissionGuard>
  );
};

/**
 * HOC para proteger componentes basado en roles
 */
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  role: UserRole | UserRole[],
  uniqueRole = false,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <PermissionGuard role={role} uniqueRole={uniqueRole} fallback={fallback}>
      <Component {...props} />
    </PermissionGuard>
  );
};
