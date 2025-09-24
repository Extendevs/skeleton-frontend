# Sistema de Permisos y Roles en React

Equivalente a los pipes `acl` y `aclr` de Angular.

## Hooks Disponibles

### 1. `usePermissions` (equivalente a `acl` pipe)

```tsx
import { usePermissions } from '@/shared/hooks/usePermissions';

// Verificar un permiso
const canCreate = usePermissions('create.category');

// Verificar múltiples permisos (OR)
const canCreateOrEdit = usePermissions(['create.category', 'edit.category']);
```

### 2. `useMultiplePermissions` 

```tsx
import { useMultiplePermissions } from '@/shared/hooks/usePermissions';

// Verificar varios permisos a la vez
const permissions = useMultiplePermissions({
  canCreate: 'create.category',
  canEdit: 'edit.category',
  canDelete: 'delete.category',
  canReport: 'report.category'
});

// Usar en JSX
{permissions.canCreate && <Button>Create</Button>}
```

### 3. `useRoles` (equivalente a `aclr` pipe)

```tsx
import { useRoles } from '@/shared/hooks/useRoles';

// Verificar un rol
const isAdmin = useRoles('admin');

// Verificar múltiples roles
const hasAnyRole = useRoles(['admin', 'manager']);

// Obtener el primer rol que coincida
const firstRole = useRoles(['admin', 'manager'], true); // unique = true
```

### 4. Otros hooks de roles

```tsx
import { useHasRole, useHasAnyRole, useHasAllRoles, useUserRoles } from '@/shared/hooks/useRoles';

const isAdmin = useHasRole('admin');
const hasAnyAdminRole = useHasAnyRole(['admin', 'super-admin']);
const hasAllRoles = useHasAllRoles(['admin', 'manager']);
const userRoles = useUserRoles();
```

## Componentes de Protección

### 1. `PermissionGuard`

```tsx
import { PermissionGuard } from '@/shared/components/PermissionGuard';

// Proteger por permiso
<PermissionGuard permission="create.category">
  <Button>Create Category</Button>
</PermissionGuard>

// Proteger por rol
<PermissionGuard role="admin">
  <AdminPanel />
</PermissionGuard>

// Proteger por permiso Y rol (ambos requeridos)
<PermissionGuard 
  permission="create.category" 
  role="admin" 
  requireAll={true}
>
  <Button>Admin Create</Button>
</PermissionGuard>

// Proteger por permiso O rol (al menos uno)
<PermissionGuard 
  permission="create.category" 
  role="admin" 
  requireAll={false}
>
  <Button>Create</Button>
</PermissionGuard>

// Con fallback
<PermissionGuard 
  permission="create.category"
  fallback={<div>No tienes permisos</div>}
>
  <Button>Create</Button>
</PermissionGuard>
```

### 2. HOCs (Higher Order Components)

```tsx
import { withPermission, withRole } from '@/shared/components/PermissionGuard';

// Proteger componente completo con permiso
const ProtectedButton = withPermission(Button, 'create.category');

// Proteger componente completo con rol
const AdminButton = withRole(Button, 'admin');

// Usar
<ProtectedButton onClick={handleCreate}>Create</ProtectedButton>
```

## Ejemplos de Migración desde Angular

### Angular (antes)
```html
<!-- Angular -->
<button 
  [disabled]="!('create.category' | acl)"
  *ngIf="'admin' | aclr"
  (click)="create()">
  Create Category
</button>
```

### React (después)
```tsx
// React - Opción 1: Con hooks
const canCreate = usePermissions('create.category');
const isAdmin = useRoles('admin');

return (
  <>
    {isAdmin && (
      <Button disabled={!canCreate} onClick={handleCreate}>
        Create Category
      </Button>
    )}
  </>
);

// React - Opción 2: Con PermissionGuard
<PermissionGuard role="admin">
  <PermissionGuard permission="create.category">
    <Button onClick={handleCreate}>
      Create Category
    </Button>
  </PermissionGuard>
</PermissionGuard>

// React - Opción 3: Combinado
<PermissionGuard 
  permission="create.category" 
  role="admin" 
  requireAll={true}
>
  <Button onClick={handleCreate}>
    Create Category
  </Button>
</PermissionGuard>
```

## Configuración del Store

Asegúrate de que tu `sessionStore` tenga la estructura correcta:

```tsx
interface UserProfile {
  id: string;
  name: string;
  email: string;
  abilities: string[]; // ['create.category', 'edit.category', ...]
  roles: string[];     // ['admin', 'manager', ...]
}
```

## Uso en Componentes de Lista

```tsx
// En CategoryList.tsx
const permissions = useMultiplePermissions({
  canCreate: 'create.category',
  canEdit: 'edit.category', 
  canDelete: 'delete.category'
});

return (
  <div>
    <PermissionGuard permission="create.category">
      <Button onClick={handleCreate}>New Category</Button>
    </PermissionGuard>
    
    <ListActionButtons
      edit={permissions.canEdit}
      remove={permissions.canDelete}
      onEdit={handleEdit}
      onRemove={handleDelete}
    />
  </div>
);
```
