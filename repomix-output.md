This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/*.log, **/tests/**, **/*.spec.ts, **/*.test.ts, **/types.ts, **/*.d.ts, **/assets/**, **/public/**, .husky, .cursor, dist, assets, public, node_modules, .husky, .react-email, out, emails, .cursor, pnpm-lock.yaml, repomix-clean.txt, repomix-output.xml, README.md, assets
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
src/
  app/
    layout/
      DashboardLayout.tsx
      useLayoutContext.ts
    router/
      PermissionRoute.tsx
      ProtectedRoute.tsx
      PublicOnlyRoute.tsx
      SubscriptionGuard.tsx
    AccessDeniedPage.tsx
  components/
    ui/
      alert-dialog.tsx
    accept-invitation-form.tsx
    app-sidebar.tsx
    forgot-password-form.tsx
    login-form.tsx
    nav-documents.tsx
    nav-main.tsx
    nav-secondary.tsx
    nav-user.tsx
    reset-password-form.tsx
    signup-form.tsx
    site-header.tsx
  hooks/
    use-mobile.ts
  lib/
    utils.ts
  modules/
    document/
      components/
        DocumentTableRow.tsx
      hooks/
        useDocumentList.ts
      services/
        DocumentResource.ts
      store/
        documentStore.ts
      DocumentForm.tsx
      DocumentFormModal.tsx
      DocumentList.tsx
      DocumentListPage.tsx
      schema.ts
    role/
      components/
        RolePermissionsEditor.tsx
        RoleTableRow.tsx
      hooks/
        useRoleDetail.ts
        useRoleList.ts
        useRolePermissions.ts
      services/
        RoleResource.ts
      store/
        roleStore.ts
      RoleDetail.tsx
      RoleDetailPage.tsx
      RoleForm.tsx
      RoleFormModal.tsx
      RoleList.tsx
      RoleListPage.tsx
      schema.ts
    user/
      components/
        CancelSubscriptionModal.tsx
        UserTableRow.tsx
      hooks/
        useSubscription.ts
        useUserList.ts
      services/
        UserResource.ts
      store/
        userStore.ts
      ChangePlanPage.tsx
      schema.ts
      SubscriptionPage.tsx
      UserForm.tsx
      UserFormModal.tsx
      UserList.tsx
      UserListPage.tsx
  shared/
    api/
      apiClient.ts
      queryClient.ts
      resourceApi.ts
    auth/
      authService.ts
      Session.ts
      SessionProvider.tsx
      sessionStore.ts
      useSession.ts
    components/
      atoms/
        EmptyStateIcon.tsx
        ObfuscatedText.tsx
        PageHeader.tsx
        ProfileIdentity.tsx
      molecules/
        ActionButtonGroup.tsx
        TableEmptyState.tsx
        TableLoadingState.tsx
      ConfirmDialog.tsx
      DatePicker.tsx
      Modal.tsx
      Pagination.tsx
      PasswordStrength.tsx
      PermissionGuard.tsx
      PermissionsModal.tsx
      SearchList.tsx
    config/
      appConfig.ts
    constants/
      passwordRequirements.ts
    enums/
      CrudMode.ts
    hooks/
      useBaseCrud.ts
      useBaseList.ts
      useCatalogs.ts
      useFilteredNavItems.ts
      useInitOnce.ts
      usePermissions.ts
      usePermissionsModal.ts
      useRoles.ts
      useToast.ts
    interfaces/
      Entity.ts
      list.types.ts
    store/
      EntityStore.ts
    utils/
      currencyHelper.ts
      dateHelper.ts
      displayInitials.ts
  App.tsx
  index.css
  main.tsx
```

# Files

## File: src/app/router/PermissionRoute.tsx
```typescript
import type { ERoleUserSlug } from '@/shared/interfaces/Entity'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useRoles } from '@/shared/hooks/useRoles'
import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
const ACCESS_DENIED_PATH = '/acceso-denegado'
function entityToPermissions(entity: string): string[] {
  return [`read.${entity}`, `report.${entity}`]
}
export interface PermissionRouteProps {
  permission?: string | string[]
  permissionEntity?: string
  role?: ERoleUserSlug | ERoleUserSlug[]
  requireAll?: boolean
}
function isAllowed(
  hasPermission: boolean,
  hasRole: boolean,
  permission?: string | string[],
  role?: ERoleUserSlug | ERoleUserSlug[],
  requireAll?: boolean
): boolean {
  if (!permission && !role) return true
  if (permission && !role) return hasPermission
  if (role && !permission) return hasRole
  return requireAll ? hasPermission && hasRole : hasPermission || hasRole
}
export function PermissionRoute({
  permission,
  permissionEntity,
  role,
  requireAll = false,
}: PermissionRouteProps) {
  const location = useLocation()
  const effectivePermission = useMemo(() => {
    if (permissionEntity) return entityToPermissions(permissionEntity)
    return permission
  }, [permission, permissionEntity])
  const hasPermission = usePermissions(effectivePermission ?? [])
  const hasRoleResult = useRoles(role ?? [], false)
  const hasRole = typeof hasRoleResult === 'boolean' ? hasRoleResult : Boolean(hasRoleResult)
  const allowed = isAllowed(hasPermission, hasRole, effectivePermission, role, requireAll)
  if (!allowed) {
    return <Navigate to={ACCESS_DENIED_PATH} state={{ from: location }} replace />
  }
  return <Outlet />
}
```

## File: src/app/router/ProtectedRoute.tsx
```typescript
import { sessionStore } from '@/shared/auth/sessionStore'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from 'zustand'
export function ProtectedRoute() {
  const isAuthenticated = useStore(sessionStore, (s) => s.isAuthenticated)
  const isRestoring = useStore(sessionStore, (s) => s.isRestoring)
  const location = useLocation()
  if (isRestoring) {
    return null
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}
```

## File: src/app/router/PublicOnlyRoute.tsx
```typescript
import { sessionStore } from '@/shared/auth/sessionStore'
import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from 'zustand'
export function PublicOnlyRoute() {
  const isAuthenticated = useStore(sessionStore, (s) => s.isAuthenticated)
  const isRestoring = useStore(sessionStore, (s) => s.isRestoring)
  if (isRestoring) {
    return null
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
```

## File: src/app/router/SubscriptionGuard.tsx
```typescript
import { sessionStore } from '@/shared/auth/sessionStore'
import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from 'zustand'
export function SubscriptionGuard() {
  const isBlocked = useStore(sessionStore, (s) => s.profile?.subscription?.is_blocked)
  if (isBlocked) {
    return <Navigate to="/select-plan" replace />
  }
  return <Outlet />
}
```

## File: src/app/AccessDeniedPage.tsx
```typescript
import { IconLock } from '@tabler/icons-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSession } from '@/shared/auth/useSession'
import { ERoleUserSlug, roleRoutes } from '@/shared/interfaces/Entity'
import { useMemo } from 'react'
const DEFAULT_HOME = '/dashboard'
export function AccessDeniedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useSession()
  const homePath = useMemo(() => {
    const slug = role as ERoleUserSlug
    return roleRoutes[slug] ?? DEFAULT_HOME
  }, [role])
  const from = location.state && typeof location.state === 'object' && 'from' in location.state
    ? (location.state as { from: { pathname: string } }).from
    : null
  const canGoBack = Boolean(from?.pathname && from.pathname !== '/acceso-denegado')
  return (
    <main
      className="flex flex-1 flex-col items-center justify-center p-4 md:p-6"
      id="access-denied-main"
      aria-labelledby="access-denied-title"
    >
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted"
            aria-hidden
          >
            <IconLock className="size-6 text-muted-foreground" />
          </div>
          <CardTitle id="access-denied-title" className="text-xl md:text-2xl">
            Zona protegida
          </CardTitle>
          <CardDescription id="access-denied-desc" className="text-base">
            No tienes permisos para ver esta sección. Si crees que deberías tener acceso, contacta
            al administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            Esta ruta está restringida por permisos o rol de usuario.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {canGoBack && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="min-w-[140px]"
              >
                Volver atrás
              </Button>
            )}
            <Button asChild variant="default" className="min-w-[140px]">
              <Link to={homePath}>Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
```

## File: src/components/ui/alert-dialog.tsx
```typescript
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}
function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  )
}
function AlertDialogContent({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: 'default' | 'sm'
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg',
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
        className
      )}
      {...props}
    />
  )
}
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        'text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className
      )}
      {...props}
    />
  )
}
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className
      )}
      {...props}
    />
  )
}
function AlertDialogAction({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}
function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger
}
```

## File: src/components/accept-invitation-form.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PasswordStrength } from '@/shared/components/PasswordStrength'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_TEXT,
} from '@/shared/constants/passwordRequirements'
import {
  acceptInvitationRequest,
  verifyInvitationTokenRequest,
} from '@/shared/auth/authService'
import { toast } from '@/shared/hooks/useToast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import z from 'zod'
const acceptSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres` })
      .regex(PASSWORD_REGEX, { message: 'Debe incluir mayúscula, minúscula y número' }),
    password_confirmation: z.string().min(1, { message: 'Confirma la contraseña' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })
type AcceptFormData = z.infer<typeof acceptSchema>
function AcceptInvitationFormFields({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  showPasswordConfirm,
  setShowPasswordConfirm,
  email,
}: {
  form: ReturnType<typeof useForm<AcceptFormData>>
  onSubmit: (_e: React.FormEvent<HTMLFormElement>) => void
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  showPasswordConfirm: boolean
  setShowPasswordConfirm: React.Dispatch<React.SetStateAction<boolean>>
  email?: string
}) {
  return (
    <form
      name="accept-invitation"
      onSubmit={onSubmit}
      autoComplete="on"
      className="space-y-6"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Completar mi cuenta</h1>
          <p className="text-muted-foreground text-balance">
            Elige una contraseña segura para poder iniciar sesión y consultar tu información.
          </p>
          {email && (
            <p className="text-sm text-muted-foreground" role="status">
              Cuenta: <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>
        <Field>
          <div className="flex items-center gap-1.5">
            <FieldLabel htmlFor="accept-password">Contraseña</FieldLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="Requisitos de contraseña"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {PASSWORD_REQUIREMENTS_TEXT}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="accept-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
              className="pr-10"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={
                form.formState.errors.password
                  ? 'accept-password-error'
                  : 'accept-password-strength accept-password-hint'
              }
              {...form.register('password')}
              disabled={form.formState.isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength
            value={form.watch('password')}
            id="accept-password-strength"
            showLabel
          />
          <FieldDescription id="accept-password-hint">
            Mín. 8 caracteres, mayúscula, minúscula y número.
          </FieldDescription>
          {form.formState.errors.password && (
            <FieldDescription
              id="accept-password-error"
              className="text-destructive"
              role="alert"
            >
              {form.formState.errors.password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="accept-password-confirm">Confirmar contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="accept-password-confirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              className="pr-10"
              aria-invalid={!!form.formState.errors.password_confirmation}
              aria-describedby={
                form.formState.errors.password_confirmation
                  ? 'accept-password-confirm-error'
                  : undefined
              }
              {...form.register('password_confirmation')}
              disabled={form.formState.isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password_confirmation && (
            <FieldDescription
              id="accept-password-confirm-error"
              className="text-destructive"
              role="alert"
            >
              {form.formState.errors.password_confirmation.message}
            </FieldDescription>
          )}
        </Field>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Guardando…' : 'Completar mi cuenta'}
        </Button>
        <FieldDescription className="text-center">
          <Link to="/login" className="underline underline-offset-2 hover:text-primary">
            Volver al inicio de sesión
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
export function AcceptInvitationForm() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [tokenState, setTokenState] = useState<{
    valid: boolean
    email?: string
  } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const form = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })
  useEffect(() => {
    if (!token) {
      setTokenState({ valid: false })
      return
    }
    verifyInvitationTokenRequest(token)
      .then((res) => setTokenState({ valid: res.valid, email: res.email }))
      .catch(() => setTokenState({ valid: false }))
  }, [token])
  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return
    try {
      await acceptInvitationRequest({
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success({
        title: 'Cuenta completada',
        description: 'Inicia sesión con tu correo y contraseña.',
      })
      navigate('/login', { replace: true })
    } catch {
      toast.error({
        title: 'Error',
        description: 'No se pudo completar la cuenta. El enlace puede haber expirado.',
      })
    }
  })
  if (tokenState === null) {
    return (
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <p className="text-center text-muted-foreground" role="status">
            Comprobando enlace…
          </p>
        </CardContent>
      </Card>
    )
  }
  if (!tokenState.valid) {
    return (
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-bold">Enlace inválido o caducado</h1>
            <p className="text-muted-foreground" role="alert">
              El enlace de invitación no es válido o ha expirado.
            </p>
            <Button asChild variant="outline">
              <Link to="/login">Ir al inicio de sesión</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-6 md:p-8">
        <AcceptInvitationFormFields
          form={form}
          onSubmit={onSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showPasswordConfirm={showPasswordConfirm}
          setShowPasswordConfirm={setShowPasswordConfirm}
          email={tokenState.email}
        />
      </CardContent>
    </Card>
  )
}
```

## File: src/components/reset-password-form.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PasswordStrength } from '@/shared/components/PasswordStrength'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_TEXT,
} from '@/shared/constants/passwordRequirements'
import {
  resetPasswordRequest,
  verifyResetTokenRequest,
} from '@/shared/auth/authService'
import { toast } from '@/shared/hooks/useToast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import z from 'zod'
const resetSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres` })
      .regex(PASSWORD_REGEX, { message: 'Debe incluir mayúscula, minúscula y número' }),
    password_confirmation: z.string().min(1, { message: 'Confirma la contraseña' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })
type ResetFormData = z.infer<typeof resetSchema>
function ResetPasswordFormFields({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  showPasswordConfirm,
  setShowPasswordConfirm,
}: {
  form: ReturnType<typeof useForm<ResetFormData>>
  onSubmit: (_e: React.FormEvent<HTMLFormElement>) => void
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  showPasswordConfirm: boolean
  setShowPasswordConfirm: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <form
      name="reset-password"
      onSubmit={onSubmit}
      autoComplete="on"
      className="space-y-6"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
          <p className="text-muted-foreground text-balance">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>
        <Field>
          <div className="flex items-center gap-1.5">
            <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="Requisitos de contraseña"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {PASSWORD_REQUIREMENTS_TEXT}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
              className="pr-10"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={
                form.formState.errors.password
                  ? 'reset-password-error'
                  : 'reset-password-strength reset-password-hint'
              }
              {...form.register('password')}
              disabled={form.formState.isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength
            value={form.watch('password')}
            id="reset-password-strength"
            showLabel
          />
          <FieldDescription id="reset-password-hint">
            Mín. 8 caracteres, mayúscula, minúscula y número.
          </FieldDescription>
          {form.formState.errors.password && (
            <FieldDescription
              id="reset-password-error"
              className="text-destructive"
              role="alert"
            >
              {form.formState.errors.password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password-confirm">Confirmar contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="new-password-confirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              className="pr-10"
              aria-invalid={!!form.formState.errors.password_confirmation}
              aria-describedby={
                form.formState.errors.password_confirmation
                  ? 'reset-password-confirm-error'
                  : undefined
              }
              {...form.register('password_confirmation')}
              disabled={form.formState.isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password_confirmation && (
            <FieldDescription
              id="reset-password-confirm-error"
              className="text-destructive"
              role="alert"
            >
              {form.formState.errors.password_confirmation.message}
            </FieldDescription>
          )}
        </Field>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Guardando…' : 'Restablecer contraseña'}
        </Button>
        <FieldDescription className="text-center">
          <Link to="/login" className="underline underline-offset-2 hover:text-primary">
            Volver al inicio de sesión
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
export function ResetPasswordForm() {
  const { token, email: encodedEmail } = useParams<{ token: string; email: string }>()
  const navigate = useNavigate()
  const [tokenValid, setTokenValid] = useState<boolean | null>(() =>
    !token || !encodedEmail ? false : null
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : ''
  const hasParams = Boolean(token && email)
  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })
  useEffect(() => {
    if (!hasParams) return
    verifyResetTokenRequest(token!, email)
      .then((res) => setTokenValid(res.response))
      .catch(() => setTokenValid(false))
  }, [token, email, hasParams])
  const onSubmit = form.handleSubmit(async (data) => {
    if (!token || !email) return
    try {
      await resetPasswordRequest({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success({
        title: 'Contraseña actualizada',
        description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      })
      navigate('/login', { replace: true })
    } catch {
      toast.error({
        title: 'Error',
        description:
          'No se pudo restablecer la contraseña. Intenta de nuevo o solicita un nuevo enlace.',
      })
    }
  })
  if (tokenValid === null) {
    return (
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <p className="text-center text-muted-foreground">Comprobando enlace…</p>
        </CardContent>
      </Card>
    )
  }
  if (!tokenValid) {
    return (
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-bold">Enlace inválido o caducado</h1>
            <p className="text-muted-foreground">
              El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.
            </p>
            <Button asChild variant="outline">
              <Link to="/forgot-password">Solicitar nuevo enlace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-6 md:p-8">
        <ResetPasswordFormFields
          form={form}
          onSubmit={onSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showPasswordConfirm={showPasswordConfirm}
          setShowPasswordConfirm={setShowPasswordConfirm}
        />
      </CardContent>
    </Card>
  )
}
```

## File: src/components/site-header.tsx
```typescript
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium"></h1>
        <div className="ml-auto flex items-center gap-2">
          {
}
        </div>
      </div>
    </header>
  )
}
```

## File: src/hooks/use-mobile.ts
```typescript
import * as React from "react"
const MOBILE_BREAKPOINT = 768
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return !!isMobile
}
```

## File: src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## File: src/modules/document/components/DocumentTableRow.tsx
```typescript
import { TableCell, TableRow } from '@/components/ui/table'
import type { IDocument } from '@/modules/document/schema'
import { ActionButtonGroup } from '@/shared/components/molecules/ActionButtonGroup'
import type { IEntityTableRowProps } from '@/shared/interfaces/list.types'
import { checkMemoListProps } from '@/shared/interfaces/list.types'
import { displayFormatDate } from '@/shared/utils/dateHelper'
import { memo } from 'react'
export const DocumentTableRow = memo<IEntityTableRowProps<IDocument>>(({
  entity,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow key={entity.id}>
      <TableCell>
        <div className="font-medium">
          {entity.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {entity.description || '—'}
      </TableCell>
      <TableCell>
        {entity.required ? 'Si' : 'No'}
      </TableCell>
      <TableCell>
        {entity.vigency ? 'Si' : 'No'}
      </TableCell>
      <TableCell>
        {entity.type?.name || '—'}
      </TableCell>
      <TableCell>
        {displayFormatDate(entity.created_at)}
      </TableCell>
      <TableCell className="actions">
        <div className="flex items-center justify-end gap-2">
          <ActionButtonGroup
            dropdown={true}
            onEdit={canEdit ? () => onEdit(entity) : undefined}
            edit={canEdit}
            remove={canDelete}
            onRemove={canDelete ? () => onDelete(entity) : undefined}
            disabled={isLoading || isDeleting || isSaving}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}, (prevProps, nextProps) => checkMemoListProps<IDocument>(prevProps, nextProps))
DocumentTableRow.displayName = 'DocumentTableRow'
```

## File: src/modules/document/hooks/useDocumentList.ts
```typescript
import type { IDocument } from '@/modules/document/schema'
import { DocumentResource } from '@/modules/document/services/DocumentResource'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { useBaseList } from '@/shared/hooks/useBaseList'
export function useDocumentList() {
  return useBaseList<IDocument>({
    store: useDocumentStore,
    resource: DocumentResource,
    autoInit: true,
    initialSearch: {
      sort: [{ field: 'name', direction: 'asc' }],
      includes: [
        { relation: 'type' },
      ],
    },
  })
}
```

## File: src/modules/document/services/DocumentResource.ts
```typescript
import type { DocumentFormValues, IDocument } from '@/modules/document/schema'
import { createCrudApi } from '@/shared/api/resourceApi'
export const DocumentResource = createCrudApi<IDocument, DocumentFormValues>({
  basePath: '/document',
})
```

## File: src/modules/document/store/documentStore.ts
```typescript
import type { IDocument } from '@/modules/document/schema'
import { createEntityStore } from '@/shared/store/EntityStore'
export const useDocumentStore = createEntityStore<IDocument>('document')
```

## File: src/modules/document/DocumentFormModal.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentForm } from '@/modules/document/DocumentForm'
import type { IDocument } from '@/modules/document/schema'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { CrudMode } from '@/shared/enums/CrudMode'
import type { IEntityFormModalProps } from '@/shared/interfaces/list.types'
import { useRef } from 'react'
export const DocumentFormModal = ({
  isOpen,
  mode,
  entity,
  onClose,
  onSuccess,
}: IEntityFormModalProps<IDocument>) => {
  const isSaving = useDocumentStore((s) => s.isSaving)
  const submitRef = useRef<(() => void) | null>(null)
  const handleSuccess = (result: IDocument) => {
    onSuccess?.(result)
    onClose()
  }
  if (!isOpen) {
    return null
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-4xl" aria-describedby={undefined}>
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>
            {mode === CrudMode.EDIT ? 'Editar documento' : 'Nuevo documento'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2">
          <DocumentForm
            mode={mode}
            entity={entity || undefined}
            onSuccess={handleSuccess}
            onSubmitRef={submitRef}
          />
        </div>
        <DialogFooter className="shrink-0 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[80px]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => submitRef.current?.()}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            {isSaving
              ? mode === CrudMode.EDIT
                ? 'Actualizando...'
                : 'Creando...'
              : mode === CrudMode.EDIT
                ? 'Actualizar'
                : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## File: src/modules/document/DocumentListPage.tsx
```typescript
import { DocumentList } from '@/modules/document/DocumentList'
export const DocumentListPage = () => {
  return <DocumentList />
}
```

## File: src/modules/document/schema.ts
```typescript
import type { IDocumentType } from '@/modules/documentType/schema'
import type { IEntity } from '@/shared/interfaces/Entity'
import { z } from 'zod'
export const documentFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  type_id: z.string().optional(),
  required: z.boolean().optional(),
  vigency: z.boolean().optional(),
})
export interface IDocument extends IEntity {
  name: string
  description?: string
  type_id: string
  required?: boolean
  vigency?: boolean
  type?: IDocumentType
}
export type DocumentFormValues = z.infer<typeof documentFormSchema>
```

## File: src/modules/role/components/RolePermissionsEditor.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRolePermissions } from '@/modules/role/hooks/useRolePermissions'
import type { IRolePermissionModule } from '@/modules/role/schema'
import { Loader2, Save, ShieldCheck } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
const ACTION_COLUMNS = [
  { key: 'read', label: 'Lectura' },
  { key: 'create', label: 'Creación' },
  { key: 'update', label: 'Edición' },
  { key: 'delete', label: 'Eliminar' },
  { key: 'restore', label: 'Restaurar' },
  { key: 'report', label: 'Reporte' },
] as const
const COLUMN_COUNT = ACTION_COLUMNS.length + 1
interface RolePermissionsEditorProps {
  roleId: string
}
function groupModulesByGroup(modules: IRolePermissionModule[]) {
  const groups: { name: string; modules: IRolePermissionModule[] }[] = []
  const groupMap = new Map<string, IRolePermissionModule[]>()
  for (const mod of modules) {
    const groupName = mod.group || 'Otros'
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, [])
      groups.push({ name: groupName, modules: groupMap.get(groupName)! })
    }
    groupMap.get(groupName)!.push(mod)
  }
  return groups
}
export function RolePermissionsEditor({ roleId }: RolePermissionsEditorProps) {
  const {
    modules,
    isLoading,
    isSaving,
    hasChanges,
    error,
    togglePermission,
    toggleModule,
    toggleColumn,
    selectAll,
    deselectAll,
    savePermissions,
  } = useRolePermissions(roleId)
  const handleSave = useCallback(async () => {
    try {
      await savePermissions()
      toast.success('Permisos actualizados correctamente')
    } catch {
      toast.error('Error al guardar los permisos')
    }
  }, [savePermissions])
  const groupedModules = useMemo(() => groupModulesByGroup(modules), [modules])
  const columnStates = useMemo(() => {
    const states: Record<string, { all: boolean; some: boolean }> = {}
    for (const col of ACTION_COLUMNS) {
      const perms = modules.flatMap((m) =>
        m.permissions.filter((p) => p.name.startsWith(`${col.key}.`)),
      )
      const activeCount = perms.filter((p) => p.active).length
      states[col.key] = {
        all: perms.length > 0 && activeCount === perms.length,
        some: activeCount > 0 && activeCount < perms.length,
      }
    }
    return states
  }, [modules])
  const allGlobalActive = useMemo(
    () => modules.length > 0 && modules.every((m) => m.permissions.every((p) => p.active)),
    [modules],
  )
  const someGlobalActive = useMemo(
    () => modules.some((m) => m.permissions.some((p) => p.active)) && !allGlobalActive,
    [modules, allGlobalActive],
  )
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-1 justify-around">
            {Array.from({ length: 6 }).map((_v, j) => (
              <Skeleton key={j} className="h-4 w-14" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-3">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-1 justify-around">
              {Array.from({ length: 6 }).map((_v, j) => (
                <Skeleton key={j} className="h-4 w-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    )
  }
  if (modules.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <ShieldCheck className="text-muted-foreground h-10 w-10" />
        <p className="text-muted-foreground text-sm">No hay permisos disponibles</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto rounded-md border">
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0] shadow-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={allGlobalActive ? true : someGlobalActive ? 'indeterminate' : false}
                      onCheckedChange={() => (allGlobalActive ? deselectAll() : selectAll())}
                    />
                    <span>Módulo</span>
                  </div>
                </th>
                {ACTION_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="w-[100px] px-2 py-3 text-center text-sm font-medium text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">{col.label}</span>
                      <Checkbox
                        checked={
                          columnStates[col.key]?.all
                            ? true
                            : columnStates[col.key]?.some
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedModules.map((group) => (
                <GroupSection
                  key={group.name}
                  groupName={group.name}
                  modules={group.modules}
                  onTogglePermission={togglePermission}
                  onToggleModule={toggleModule}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t bg-background px-4 py-3 lg:-mx-6 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Marcar todas
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Desmarcar todas
            </Button>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
function GroupSection({
  groupName,
  modules,
  onTogglePermission,
  onToggleModule,
}: {
  groupName: string
  modules: IRolePermissionModule[]
  onTogglePermission: (_moduleId: string, _permissionUuid: string) => void
  onToggleModule: (_moduleId: string) => void
}) {
  return (
    <>
      <tr>
        <td
          colSpan={COLUMN_COUNT}
          className="bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {groupName}
        </td>
      </tr>
      {modules.map((mod, idx) => {
        const allActive = mod.permissions.length > 0 && mod.permissions.every((p) => p.active)
        const someActive = mod.permissions.some((p) => p.active) && !allActive
        const isLast = idx === modules.length - 1
        return (
          <tr
            key={mod.id}
            className={cn(
              'transition-colors hover:bg-muted/20',
              !isLast && 'border-b border-border/40',
            )}
          >
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={allActive ? true : someActive ? 'indeterminate' : false}
                  onCheckedChange={() => onToggleModule(mod.id)}
                />
                <span className="text-sm">{mod.name}</span>
              </div>
            </td>
            {ACTION_COLUMNS.map((col) => {
              const perm = mod.permissions.find((p) => p.name.startsWith(`${col.key}.`))
              if (!perm) {
                return (
                  <td key={col.key} className="px-2 py-2.5 text-center">
                    <span className="text-muted-foreground/20">—</span>
                  </td>
                )
              }
              return (
                <td key={col.key} className="px-2 py-2.5 text-center">
                  <Checkbox
                    checked={perm.active}
                    onCheckedChange={() => onTogglePermission(mod.id, perm.uuid)}
                  />
                </td>
              )
            })}
          </tr>
        )
      })}
    </>
  )
}
```

## File: src/modules/role/components/RoleTableRow.tsx
```typescript
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { IRole } from '@/modules/role/schema'
import { ActionButtonGroup } from '@/shared/components/molecules/ActionButtonGroup'
import type { IEntityTableRowProps } from '@/shared/interfaces/list.types'
import { checkMemoListProps } from '@/shared/interfaces/list.types'
import { displayFormatDate } from '@/shared/utils/dateHelper'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
export const RoleTableRow = memo<IEntityTableRowProps<IRole>>(({
  entity,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate()
  const isSystem = entity.system
  const editAllowed = canEdit && !isSystem
  const deleteAllowed = canDelete && !isSystem
  return (
    <TableRow key={entity.id} className="cursor-pointer" onClick={() => navigate(`/role/${entity.id}`)}>
      <TableCell className="text-muted-foreground">
        {String(entity.description ?? '') || '—'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 font-medium">
          {entity.name}
          {isSystem && (
            <Badge variant="secondary" className="text-xs">Sistema</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {displayFormatDate(entity.created_at)}
      </TableCell>
      <TableCell className="actions">
        <div className="flex items-center justify-end gap-2">
          <ActionButtonGroup
            dropdown={true}
            detail={true}
            onDetail={() => navigate(`/role/${entity.uuid}`)}
            onEdit={editAllowed ? () => onEdit(entity) : undefined}
            edit={editAllowed}
            remove={deleteAllowed}
            onRemove={deleteAllowed ? () => onDelete(entity) : undefined}
            disabled={isLoading || isDeleting || isSaving}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}, (prevProps, nextProps) => checkMemoListProps<IRole>(prevProps, nextProps))
RoleTableRow.displayName = 'RoleTableRow'
```

## File: src/modules/role/hooks/useRoleDetail.ts
```typescript
import type { IRole } from '@/modules/role/schema'
import { RoleResource } from '@/modules/role/services/RoleResource'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
export function useRoleDetail(roleId: string) {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['role-detail', roleId],
    queryFn: () => RoleResource.show(roleId),
  })
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['role-detail', roleId] })
  }, [queryClient, roleId])
  return {
    role: (data as IRole) ?? null,
    isLoading,
    error: error ? 'Error al cargar el rol' : null,
    refresh,
  }
}
```

## File: src/modules/role/hooks/useRoleList.ts
```typescript
import type { IRole } from '@/modules/role/schema'
import { RoleResource } from '@/modules/role/services/RoleResource'
import { useRoleStore } from '@/modules/role/store/roleStore'
import { useBaseList } from '@/shared/hooks/useBaseList'
export function useRoleList() {
  return useBaseList<IRole>({
    store: useRoleStore,
    resource: RoleResource,
    autoInit: true,
    initialSearch: {
      sort: [{ field: 'name', direction: 'asc' }],
    },
  })
}
```

## File: src/modules/role/hooks/useRolePermissions.ts
```typescript
import type { IRolePermissionModule } from '@/modules/role/schema'
import { RoleResource } from '@/modules/role/services/RoleResource'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
export function useRolePermissions(roleId: string) {
  const queryClient = useQueryClient()
  const [localModules, setLocalModules] = useState<IRolePermissionModule[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const { data: serverModules, isLoading: queryLoading, error } = useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => RoleResource.getPermissions(roleId),
  })
  useEffect(() => {
    if (serverModules) {
      setLocalModules(serverModules)
    }
  }, [serverModules])
  const isLoading = queryLoading || (!!serverModules && localModules.length === 0)
  const hasChanges = useMemo(() => {
    if (!serverModules || serverModules.length === 0) return false
    return serverModules.some((serverModule) => {
      const localModule = localModules.find((m) => m.id === serverModule.id)
      if (!localModule) return true
      return serverModule.permissions.some((sp) => {
        const lp = localModule.permissions.find((p) => p.uuid === sp.uuid)
        return !lp || lp.active !== sp.active
      })
    })
  }, [serverModules, localModules])
  const togglePermission = useCallback((moduleId: string, permissionUuid: string) => {
    setLocalModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod
        return {
          ...mod,
          permissions: mod.permissions.map((perm) =>
            perm.uuid === permissionUuid ? { ...perm, active: !perm.active } : perm,
          ),
        }
      }),
    )
  }, [])
  const toggleModule = useCallback((moduleId: string) => {
    setLocalModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod
        const allActive = mod.permissions.every((p) => p.active)
        return {
          ...mod,
          permissions: mod.permissions.map((perm) => ({ ...perm, active: !allActive })),
        }
      }),
    )
  }, [])
  const toggleColumn = useCallback((action: string) => {
    setLocalModules((prev) => {
      const allActiveInColumn = prev.every((mod) => {
        const perm = mod.permissions.find((p) => p.name.startsWith(`${action}.`))
        return !perm || perm.active
      })
      return prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((perm) =>
          perm.name.startsWith(`${action}.`) ? { ...perm, active: !allActiveInColumn } : perm,
        ),
      }))
    })
  }, [])
  const selectAll = useCallback(() => {
    setLocalModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((perm) => ({ ...perm, active: true })),
      })),
    )
  }, [])
  const deselectAll = useCallback(() => {
    setLocalModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((perm) => ({ ...perm, active: false })),
      })),
    )
  }, [])
  const savePermissions = useCallback(async () => {
    setIsSaving(true)
    try {
      const payload: Record<string, Record<string, { uuid: string; active: boolean }>> = {}
      for (const mod of localModules) {
        payload[mod.id] = {}
        for (const perm of mod.permissions) {
          const action = perm.name.split('.')[0]
          payload[mod.id][action] = { uuid: perm.uuid, active: perm.active }
        }
      }
      await RoleResource.setPermissions(roleId, payload)
      queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] })
    } finally {
      setIsSaving(false)
    }
  }, [localModules, roleId, queryClient])
  return {
    modules: localModules,
    isLoading,
    isSaving,
    hasChanges,
    error: error ? 'Error al cargar los permisos' : null,
    togglePermission,
    toggleModule,
    toggleColumn,
    selectAll,
    deselectAll,
    savePermissions,
  }
}
```

## File: src/modules/role/services/RoleResource.ts
```typescript
import type { IRolePermissionModule, IRole, RoleFormValues } from '@/modules/role/schema'
import { apiClient } from '@/shared/api/apiClient'
import { createCrudApi } from '@/shared/api/resourceApi'
interface RoleCustomMethods {
  getPermissions: (id: string) => Promise<IRolePermissionModule[]>
  setPermissions: (id: string, permissions: Record<string, Record<string, { uuid: string; active: boolean }>>) => Promise<string[]>
}
export const RoleResource = createCrudApi<IRole, RoleFormValues, Record<string, unknown>, RoleCustomMethods>({
  basePath: '/role',
  customMethods: (basePath) => ({
    getPermissions: async (id: string) => {
      const { data } = await apiClient.get<{ data: IRolePermissionModule[] }>(`${basePath}/permissions/${id}`)
      return data.data
    },
    setPermissions: async (id: string, permissions) => {
      const { data } = await apiClient.post<{ data: string[] }>(`${basePath}/permissions/${id}`, { permissions })
      return data.data
    },
  }),
})
```

## File: src/modules/role/store/roleStore.ts
```typescript
import type { IRole } from '@/modules/role/schema'
import { createEntityStore } from '@/shared/store/EntityStore'
export const useRoleStore = createEntityStore<IRole>('role')
```

## File: src/modules/role/RoleDetail.tsx
```typescript
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RolePermissionsEditor } from '@/modules/role/components/RolePermissionsEditor'
import { useRoleDetail } from '@/modules/role/hooks/useRoleDetail'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
interface RoleDetailProps {
  roleId: string
}
export function RoleDetail({ roleId }: RoleDetailProps) {
  const { role, isLoading, error } = useRoleDetail(roleId)
  const navigate = useNavigate()
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => navigate('/role')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a roles
        </Button>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/role')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-5 w-5" />
                <h1 className="text-xl font-semibold">{String(role?.description ?? '') || role?.name}</h1>
                {role?.system && (
                  <Badge variant="secondary" className="text-xs">Sistema</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{role?.name}</p>
            </div>
          )}
        </div>
      </div>
      <RolePermissionsEditor roleId={roleId} />
    </div>
  )
}
```

## File: src/modules/role/RoleDetailPage.tsx
```typescript
import { RoleDetail } from '@/modules/role/RoleDetail'
import { Navigate, useParams } from 'react-router-dom'
export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/role" replace />
  return <RoleDetail roleId={id} />
}
```

## File: src/modules/role/RoleFormModal.tsx
```typescript
import { Button } from '@/components/ui/button'
import { RoleForm } from '@/modules/role/RoleForm'
import type { IRole } from '@/modules/role/schema'
import { useRoleStore } from '@/modules/role/store/roleStore'
import { Modal } from '@/shared/components/Modal'
import { CrudMode } from '@/shared/enums/CrudMode'
import type { IEntityFormModalProps } from '@/shared/interfaces/list.types'
const FORM_ID = 'role-form'
export const RoleFormModal = ({
  isOpen,
  mode,
  entity,
  onClose,
  onSuccess,
}: IEntityFormModalProps<IRole>) => {
  const isSaving = useRoleStore((s) => s.isSaving)
  const handleSuccess = (result: IRole) => {
    onSuccess?.(result)
    onClose()
  }
  if (!isOpen) {
    return null
  }
  const footerActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSaving}
        className="min-w-[80px]"
      >
        Cancelar
      </Button>
      <Button type="submit" form={FORM_ID} disabled={isSaving} className="min-w-[100px]">
        {isSaving
          ? mode === CrudMode.EDIT
            ? 'Actualizando...'
            : 'Creando...'
          : mode === CrudMode.EDIT
            ? 'Actualizar'
            : 'Crear'}
      </Button>
    </>
  )
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === CrudMode.EDIT ? 'Editar rol' : 'Nuevo rol'}
      size="lg"
      footer={footerActions}
    >
      <RoleForm
        formId={FORM_ID}
        mode={mode}
        entity={entity || undefined}
        onSuccess={handleSuccess}
      />
    </Modal>
  )
}
```

## File: src/modules/role/RoleListPage.tsx
```typescript
import { RoleList } from '@/modules/role/RoleList'
export const RoleListPage = () => {
  return <RoleList />
}
```

## File: src/modules/role/schema.ts
```typescript
import type { IEntity } from '@/shared/interfaces/Entity'
import { z } from 'zod'
export const roleFormSchema = z.object({
  description: z.string().min(1, 'El nombre es requerido'),
  name: z.string().min(1, 'El slug es requerido'),
})
export interface IRole extends IEntity {
  name: string
  system: boolean
}
export type RoleFormValues = z.infer<typeof roleFormSchema>
export interface IRolePermission {
  uuid: string
  name: string
  active: boolean
}
export interface IRolePermissionModule {
  id: string
  name: string
  group: string
  permissions: IRolePermission[]
}
```

## File: src/modules/user/components/CancelSubscriptionModal.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Modal } from '@/shared/components/Modal'
import { AlertTriangle, Heart, Loader2, Shield } from 'lucide-react'
import { useCallback, useState } from 'react'
type CancelStep = 'persuade' | 'choose' | 'confirm'
interface CancelSubscriptionModalProps {
  isOpen: boolean
  isCanceling: boolean
  onCancel: (_atPeriodEnd: boolean) => void
  onClose: () => void
  planName?: string
}
export function CancelSubscriptionModal({
  isOpen,
  isCanceling,
  onCancel,
  onClose,
  planName,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<CancelStep>('persuade')
  const [cancelMode, setCancelMode] = useState<'period_end' | 'immediate' | null>(null)
  const handleClose = useCallback(() => {
    setStep('persuade')
    setCancelMode(null)
    onClose()
  }, [onClose])
  const handleChooseMode = useCallback((mode: 'period_end' | 'immediate') => {
    setCancelMode(mode)
    setStep('confirm')
  }, [])
  const handleConfirm = useCallback(() => {
    if (cancelMode === null) return
    onCancel(cancelMode === 'period_end')
  }, [cancelMode, onCancel])
  const stepTitles: Record<CancelStep, string> = {
    persuade: 'Cancelar suscripción',
    choose: '¿Cómo deseas cancelar?',
    confirm: 'Confirmar cancelación',
  }
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={stepTitles[step]} size="sm">
      <div className="py-4">
        {step === 'persuade' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Heart className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">¿Seguro que quieres irte?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu plan <strong>{planName}</strong> incluye funciones premium que perderás al
                cancelar. Nuestro equipo está disponible para ayudarte si algo no funciona como
                esperas.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Conserva tus beneficios</p>
                  <p className="text-xs text-muted-foreground">
                    Al cancelar perderás acceso a todas las funciones de tu plan actual.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleClose} className="w-full">
                Mantener mi plan
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setStep('choose')}
              >
                Continuar con la cancelación
              </Button>
            </div>
          </div>
        )}
        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Elige cómo deseas cancelar tu suscripción.
            </p>
            <button
              type="button"
              className="w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
              onClick={() => handleChooseMode('period_end')}
            >
              <h4 className="font-medium">Al final del ciclo de facturación</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Mantén acceso completo hasta el final de tu periodo actual. No se realizarán más
                cobros después.
              </p>
            </button>
            <button
              type="button"
              className="w-full rounded-lg border border-destructive/20 p-4 text-left transition-colors hover:border-destructive/40 hover:bg-destructive/5"
              onClick={() => handleChooseMode('immediate')}
            >
              <h4 className="font-medium text-destructive">Cancelar inmediatamente</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Se revocará el acceso de inmediato. No se realizarán más cobros.
              </p>
            </button>
            <Button variant="ghost" className="w-full" onClick={() => setStep('persuade')}>
              Volver
            </Button>
          </div>
        )}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">
                {cancelMode === 'immediate'
                  ? 'Perderás el acceso a tu plan inmediatamente. Esta acción no se puede deshacer.'
                  : 'Tu plan se mantendrá activo hasta el final del ciclo actual. Después se desactivará automáticamente.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="destructive"
                className="w-full"
                disabled={isCanceling}
                onClick={handleConfirm}
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : cancelMode === 'immediate' ? (
                  'Confirmar cancelación inmediata'
                ) : (
                  'Confirmar cancelación al final del ciclo'
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                disabled={isCanceling}
                onClick={() => setStep('choose')}
              >
                Volver
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
```

## File: src/modules/user/hooks/useSubscription.ts
```typescript
import { CheckoutSubscriptionResource } from '@/modules/checkoutSubscription/services/CheckoutSubscriptionResource'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import { fetchSessionProfile } from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { toast } from '@/shared/hooks/useToast'
import { useCallback, useEffect, useState } from 'react'
export interface SubscriptionDetails {
  plan: ISubscriptionPlan | null
  subscription: {
    stripe_status: string
    current_period_start: string | null
    current_period_end: string | null
    trial_ends_at: string | null
    ends_at: string | null
    cancel_at_period_end: boolean
  } | null
}
export function useSubscription() {
  const [details, setDetails] = useState<SubscriptionDetails | null>(null)
  const [availablePlans, setAvailablePlans] = useState<ISubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isChangingPlan, setIsChangingPlan] = useState<string | null>(null)
  const refreshSession = useCallback(async () => {
    try {
      const profile = await fetchSessionProfile()
      sessionStore.getState().setProfile(profile)
    } catch {
    }
  }, [])
  const loadDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await CheckoutSubscriptionResource.getMySubscription()
      setDetails(data)
    } catch {
      toast.error('Error', 'No se pudo cargar la información de tu suscripción.')
    } finally {
      setIsLoading(false)
    }
  }, [])
  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true)
    try {
      const plans = await CheckoutSubscriptionResource.getPlans()
      setAvailablePlans(plans)
    } catch {
      toast.error('Error', 'No se pudieron cargar los planes disponibles.')
    } finally {
      setIsLoadingPlans(false)
    }
  }, [])
  useEffect(() => {
    loadDetails()
    loadPlans()
  }, [loadDetails, loadPlans])
  const handleCancel = useCallback(
    async (atPeriodEnd: boolean) => {
      setIsCanceling(true)
      try {
        await CheckoutSubscriptionResource.cancelSubscription(atPeriodEnd)
        toast.success(
          'Suscripción cancelada',
          atPeriodEnd
            ? 'Tu plan se cancelará al final del ciclo de facturación.'
            : 'Tu suscripción ha sido cancelada inmediatamente.',
        )
        await Promise.all([loadDetails(), refreshSession()])
      } catch {
        toast.error('Error', 'No se pudo cancelar la suscripción.')
      } finally {
        setIsCanceling(false)
      }
    },
    [loadDetails, refreshSession],
  )
  const handleChangePlan = useCallback(
    async (planId: string) => {
      setIsChangingPlan(planId)
      try {
        await CheckoutSubscriptionResource.changePlan(planId)
        toast.success('Plan actualizado', 'Tu plan ha sido cambiado correctamente.')
        await Promise.all([loadDetails(), refreshSession()])
      } catch {
        toast.error('Error', 'No se pudo cambiar el plan.')
      } finally {
        setIsChangingPlan(null)
      }
    },
    [loadDetails, refreshSession],
  )
  const handlePortal = useCallback(async () => {
    try {
      const url = await CheckoutSubscriptionResource.getPortalUrl()
      window.location.href = url
    } catch {
      toast.error('Error', 'No se pudo abrir el portal de facturación.')
    }
  }, [])
  return {
    details,
    availablePlans,
    isLoading,
    isLoadingPlans,
    isCanceling,
    isChangingPlan,
    handleCancel,
    handleChangePlan,
    handlePortal,
    reload: loadDetails,
  }
}
```

## File: src/modules/user/services/UserResource.ts
```typescript
import type { IUser, UserFormValues } from '@/modules/user/schema'
import { createCrudApi } from '@/shared/api/resourceApi'
export const UserResource = createCrudApi<IUser, UserFormValues>({
  basePath: '/user',
});
```

## File: src/modules/user/store/userStore.ts
```typescript
import type { IUser } from '@/modules/user/schema'
import { createEntityStore } from '@/shared/store/EntityStore'
export const useUserStore = createEntityStore<IUser>('user');
```

## File: src/modules/user/ChangePlanPage.tsx
```typescript
import { Button } from '@/components/ui/button'
import { BillingToggle } from '@/modules/checkoutSubscription/components/BillingToggle'
import { getNormalizedMonthlyPrice } from '@/modules/checkoutSubscription/components/formatPrice'
import { PlanCard } from '@/modules/checkoutSubscription/components/PlanCard'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import { useSubscription } from '@/modules/user/hooks/useSubscription'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import { ArrowLeft, Loader2, Lock } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
type DowngradeStep = 'persuade' | 'confirm'
export function ChangePlanPage() {
  const isOwner = useRoles(ERoleUserSlug.ACCOUNT_OWNER)
  const navigate = useNavigate()
  const { details, availablePlans, isLoading, isLoadingPlans, isChangingPlan, handleChangePlan } =
    useSubscription()
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [selectedPlan, setSelectedPlan] = useState<ISubscriptionPlan | null>(null)
  const [downgradeStep, setDowngradeStep] = useState<DowngradeStep>('persuade')
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false)
  const currentPlan = details?.plan ?? null
  const currentPlanId = currentPlan?.id ?? null
  const stripePlans = useMemo(() => availablePlans.filter((p) => p.is_stripe), [availablePlans])
  const hasMonthly = stripePlans.some((p) => p.interval === 'month')
  const hasYearly = stripePlans.some((p) => p.interval === 'year')
  const showToggle = hasMonthly && hasYearly
  const filteredPlans = showToggle
    ? stripePlans.filter((p) => p.interval === billingInterval)
    : stripePlans
  const maxSavings = useMemo(() => {
    if (!showToggle) return 0
    const monthlyPlans = stripePlans.filter((p) => p.interval === 'month')
    const yearlyPlans = stripePlans.filter((p) => p.interval === 'year')
    let max = 0
    for (const yearly of yearlyPlans) {
      const monthly = monthlyPlans.find((m) => m.name === yearly.name)
      if (!monthly) continue
      const annualized = monthly.price * 12
      if (annualized <= 0) continue
      const savings = ((annualized - yearly.price) / annualized) * 100
      max = Math.max(max, savings)
    }
    return Math.round(max)
  }, [stripePlans, showToggle])
  const isUpgrade = useMemo(() => {
    if (!selectedPlan || !currentPlan) return true
    return getNormalizedMonthlyPrice(selectedPlan) >= getNormalizedMonthlyPrice(currentPlan)
  }, [selectedPlan, currentPlan])
  const handleSelectPlan = useCallback(
    (plan: ISubscriptionPlan) => {
      setSelectedPlan(plan)
      if (!currentPlan) {
        setShowUpgradeConfirm(true)
        return
      }
      const currentMonthly = getNormalizedMonthlyPrice(currentPlan)
      const newMonthly = getNormalizedMonthlyPrice(plan)
      if (newMonthly >= currentMonthly) {
        setShowUpgradeConfirm(true)
      } else {
        setDowngradeStep('persuade')
      }
    },
    [currentPlan],
  )
  const handleConfirmChange = useCallback(async () => {
    if (!selectedPlan) return
    await handleChangePlan(selectedPlan.id)
    setSelectedPlan(null)
    setShowUpgradeConfirm(false)
    setDowngradeStep('persuade')
    navigate('/subscription')
  }, [selectedPlan, handleChangePlan, navigate])
  const handleCloseDialogs = useCallback(() => {
    setSelectedPlan(null)
    setShowUpgradeConfirm(false)
    setDowngradeStep('persuade')
  }, [])
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Solo el propietario de la cuenta puede cambiar el plan.
        </p>
      </div>
    )
  }
  if (isLoading || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  const showDowngradePersuade =
    selectedPlan !== null && !isUpgrade && !showUpgradeConfirm && downgradeStep === 'persuade'
  const showDowngradeConfirm =
    selectedPlan !== null && !isUpgrade && !showUpgradeConfirm && downgradeStep === 'confirm'
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cambiar de plan</h1>
          <p className="text-muted-foreground">
            Al cambiar de plan se aplicará prorrateo automático. Solo pagarás la diferencia.
          </p>
        </div>
      </div>
      {showToggle && (
        <BillingToggle
          billingInterval={billingInterval}
          maxSavings={maxSavings}
          onIntervalChange={setBillingInterval}
        />
      )}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay planes disponibles en este momento.</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            filteredPlans.length === 1
              ? 'mx-auto max-w-md'
              : filteredPlans.length === 2
                ? 'mx-auto max-w-2xl grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCheckingOut={isChangingPlan}
              onSelect={handleSelectPlan}
              currentPlanId={currentPlanId}
              actionLabel="Cambiar a este plan"
            />
          ))}
        </div>
      )}
      {}
      <ConfirmDialog
        isOpen={showUpgradeConfirm}
        title={`Cambiar a ${selectedPlan?.name ?? ''}`}
        description="Se aplicará prorrateo automático sobre tu ciclo de facturación actual. ¿Deseas confirmar el cambio?"
        confirmLabel="Confirmar cambio de plan"
        isLoading={isChangingPlan !== null}
        onConfirm={handleConfirmChange}
        onCancel={handleCloseDialogs}
      />
      {}
      <ConfirmDialog
        isOpen={showDowngradePersuade}
        title="¿Cambiar a un plan con menos beneficios?"
        description={`Tu plan actual (${currentPlan?.name ?? ''}) tiene más funciones. Al cambiar a ${selectedPlan?.name ?? ''} podrías perder acceso a algunas características. ¿Deseas continuar?`}
        confirmLabel="Continuar con el cambio"
        cancelLabel="Mantener mi plan actual"
        isLoading={false}
        onConfirm={() => setDowngradeStep('confirm')}
        onCancel={handleCloseDialogs}
      />
      {}
      <ConfirmDialog
        isOpen={showDowngradeConfirm}
        title={`Confirmar cambio a ${selectedPlan?.name ?? ''}`}
        description="Se aplicará prorrateo automático. Tu nuevo plan será efectivo inmediatamente."
        confirmLabel="Confirmar cambio de plan"
        isLoading={isChangingPlan !== null}
        onConfirm={handleConfirmChange}
        onCancel={handleCloseDialogs}
      />
    </div>
  )
}
```

## File: src/modules/user/SubscriptionPage.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/modules/checkoutSubscription/components/formatPrice'
import { CancelSubscriptionModal } from '@/modules/user/components/CancelSubscriptionModal'
import { useSubscription } from '@/modules/user/hooks/useSubscription'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Activa',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  trialing: {
    label: 'Periodo de prueba',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  past_due: {
    label: 'Pago pendiente',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  canceled: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  incomplete: {
    label: 'Incompleta',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  incomplete_expired: {
    label: 'Expirada',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  unpaid: {
    label: 'Sin pagar',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
function CurrentPlanSection({
  plan,
  subscription,
  isStripe,
  onPortal,
  onChangePlan,
  onCancelPlan,
}: {
  plan: ISubscriptionPlan
  subscription: {
    stripe_status: string
    current_period_start: string | null
    current_period_end: string | null
    trial_ends_at: string | null
    ends_at: string | null
    cancel_at_period_end: boolean
  } | null
  isStripe: boolean
  onPortal: () => void
  onChangePlan: () => void
  onCancelPlan: () => void
}) {
  const statusInfo = subscription?.stripe_status
    ? STATUS_LABELS[subscription.stripe_status]
    : null
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Plan actual</CardTitle>
            <CardDescription>Detalles de tu suscripción</CardDescription>
          </div>
          {statusInfo && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            )}
          </div>
          <div className="text-right">
            {isStripe ? (
              <>
                <p className="text-3xl font-bold tracking-tight">
                  {formatPrice(plan.price, plan.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  / {plan.interval === 'year' ? 'año' : 'mes'}
                </p>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                Plan gratuito
              </span>
            )}
          </div>
        </div>
        {isStripe && subscription && (
          <>
            {subscription.cancel_at_period_end && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Cancelación programada</p>
                  <p className="mt-0.5 text-sm">
                    Tu plan se cancelará el{' '}
                    {formatDate(subscription.ends_at ?? subscription.current_period_end)}. Mantendrás
                    acceso hasta esa fecha.
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscription.current_period_end && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Próximo cobro</p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}
              {subscription.trial_ends_at && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fin del periodo de prueba
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.trial_ends_at)}
                    </p>
                  </div>
                </div>
              )}
              {subscription.current_period_start && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Inicio del periodo
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.current_period_start)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Características incluidas
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {}
        <div className="flex flex-wrap items-center gap-3 border-t pt-6">
          {isStripe && (
            <>
              <Button onClick={onChangePlan}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Cambiar de plan
              </Button>
              <Button variant="outline" onClick={onPortal}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Portal de facturación
              </Button>
              {!subscription?.cancel_at_period_end && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={onCancelPlan}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar suscripción
                </Button>
              )}
            </>
          )}
          {!isStripe && (
            <Button onClick={onChangePlan}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Cambiar de plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
export function SubscriptionPage() {
  const isOwner = useRoles(ERoleUserSlug.ACCOUNT_OWNER)
  const navigate = useNavigate()
  const { details, isLoading, isCanceling, handleCancel, handlePortal } = useSubscription()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const handleCancelConfirm = useCallback(
    async (atPeriodEnd: boolean) => {
      await handleCancel(atPeriodEnd)
      setCancelModalOpen(false)
    },
    [handleCancel],
  )
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Solo el propietario de la cuenta puede gestionar la suscripción. Contacta al
          administrador de tu organización para realizar cambios.
        </p>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  const plan = details?.plan ?? null
  const subscription = details?.subscription ?? null
  const isStripe = plan?.is_stripe ?? false
  if (!plan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Sin plan activo</h3>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Aún no tienes un plan asignado. Selecciona uno para comenzar.
            </p>
            <Button onClick={() => navigate('/change-plan')}>Seleccionar un plan</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>
      <CurrentPlanSection
        plan={plan}
        subscription={subscription}
        isStripe={isStripe}
        onPortal={handlePortal}
        onChangePlan={() => navigate('/change-plan')}
        onCancelPlan={() => setCancelModalOpen(true)}
      />
      <CancelSubscriptionModal
        isOpen={cancelModalOpen}
        isCanceling={isCanceling}
        onCancel={handleCancelConfirm}
        onClose={() => setCancelModalOpen(false)}
        planName={plan.name}
      />
    </div>
  )
}
```

## File: src/modules/user/UserFormModal.tsx
```typescript
import { Button } from '@/components/ui/button'
import { UserForm } from '@/modules/user/UserForm'
import type { IUser } from '@/modules/user/schema'
import { useUserStore } from '@/modules/user/store/userStore'
import { Modal } from '@/shared/components/Modal'
import { CrudMode } from '@/shared/enums/CrudMode'
import type { IEntityFormModalProps } from '@/shared/interfaces/list.types'
const FORM_ID = 'user-form';
export const UserFormModal = ({
  isOpen,
  mode,
  entity,
  onClose,
  onSuccess,
}: IEntityFormModalProps<IUser>) => {
  const isSaving = useUserStore((s) => s.isSaving);
  const handleSuccess = (result: IUser) => {
    onSuccess?.(result);
    onClose();
  };
  if (!isOpen) {
    return null;
  }
  const footerActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSaving}
        className="min-w-[80px]"
      >
        Cancelar
      </Button>
      <Button type="submit" form={FORM_ID} disabled={isSaving} className="min-w-[100px]">
        {isSaving
          ? mode === CrudMode.EDIT
            ? 'Actualizando...'
            : 'Creando...'
          : mode === CrudMode.EDIT
            ? 'Actualizar'
            : 'Crear'}
      </Button>
    </>
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === CrudMode.EDIT ? 'Editar usuario' : 'Nuevo usuario'}
      size="lg"
      footer={footerActions}
    >
      <UserForm
        formId={FORM_ID}
        mode={mode}
        entity={entity || undefined}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
};
```

## File: src/modules/user/UserListPage.tsx
```typescript
import { UserList } from '@/modules/user/UserList'
export const UserListPage = () => {
  return <UserList />;
};
```

## File: src/shared/api/queryClient.ts
```typescript
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30
    }
  }
});
```

## File: src/shared/components/atoms/EmptyStateIcon.tsx
```typescript
interface EmptyStateIconProps {
  className?: string;
}
export const EmptyStateIcon = ({ className = 'h-8 w-8 text-slate-300' }: EmptyStateIconProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 15h2" />
    </svg>
  );
};
```

## File: src/shared/components/atoms/ObfuscatedText.tsx
```typescript
import { cn } from '@/lib/utils'
import { toast } from '@/shared/hooks/useToast'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useCallback, useState } from 'react'
interface ObfuscatedTextProps {
  value: string | null | undefined
  fallback?: string
  className?: string
  maskChar?: string
}
export const ObfuscatedText = ({
  value,
  fallback = '—',
  className,
  maskChar = '•',
}: ObfuscatedTextProps) => {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasValue = value != null && value.length > 0
  const handleCopy = useCallback(async () => {
    if (!hasValue) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }, [value, hasValue])
  if (!hasValue) {
    return <span className="text-muted-foreground">{fallback}</span>
  }
  const masked = maskChar.repeat(Math.min(value.length, 16))
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="select-none font-mono text-sm">
        {visible ? value : masked}
      </span>
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title={visible ? 'Ocultar' : 'Mostrar'}
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Copiar"
      >
        {copied ? (
          <Check className="size-3.5 text-green-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </span>
  )
}
```

## File: src/shared/components/atoms/PageHeader.tsx
```typescript
import type { ReactNode } from 'react'
interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}
export const PageHeader = ({
  title,
  description,
  actions
}: PageHeaderProps) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
    {actions && (
      <div className="flex items-center gap-2">
        {actions}
      </div>
    )}
  </div>
);
```

## File: src/shared/components/Modal.tsx
```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { JSX, PropsWithChildren, ReactNode } from 'react'
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
interface ModalProps {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: ModalSize;
}
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  children
}: PropsWithChildren<ModalProps>): JSX.Element => {
   const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-2xl';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'fullscreen':
        return 'max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh]';
      default:
        return 'max-w-2xl';
    }
  };
  return (
      <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
          <DialogContent className={`p-0 ${getSizeClasses()}`}>
            <DialogHeader className="shrink-0 px-6 pt-6">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto px-6">
              {children}
            </div>
            {footer && (
              <DialogFooter className="shrink-0 px-6 pb-6">
                {footer}
              </DialogFooter>
            )}
          </DialogContent>
      </Dialog>
  );
};
```

## File: src/shared/components/PasswordStrength.tsx
```typescript
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4 | 5
const SEGMENTS = 5
const LABELS: Record<PasswordStrengthLevel, string> = {
  0: 'Muy débil',
  1: 'Débil',
  2: 'Aceptable',
  3: 'Buena',
  4: 'Fuerte',
  5: 'Muy fuerte',
}
function computeStrength(password: string): PasswordStrengthLevel {
  if (!password.length) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 5) as PasswordStrengthLevel
}
export interface PasswordStrengthProps {
  value: string
  id?: string
  className?: string
  showLabel?: boolean
}
export function PasswordStrength({
  value,
  id = 'password-strength',
  className,
  showLabel = true,
}: PasswordStrengthProps) {
  const level = useMemo(() => computeStrength(value), [value])
  const segmentClasses = (index: number) => {
    const filled = index < level
    if (!filled) return 'bg-muted'
    if (level <= 1) return 'bg-destructive'
    if (level <= 3) return 'bg-amber-500'
    return 'bg-primary'
  }
  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-label={`Fortaleza: ${LABELS[level]}`}
      className={cn('space-y-1.5', className)}
    >
      <div
        className="flex gap-0.5"
        aria-hidden
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              segmentClasses(i)
            )}
          />
        ))}
      </div>
      {showLabel && value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Fortaleza: <span className="font-medium text-foreground">{LABELS[level]}</span>
        </p>
      )}
    </div>
  )
}
```

## File: src/shared/components/PermissionGuard.tsx
```typescript
import type { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { ReactNode } from 'react'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useRoles } from '@/shared/hooks/useRoles'
interface PermissionGuardProps {
  children: ReactNode;
  permission?: string | string[];
  role?: ERoleUserSlug | ERoleUserSlug[];
  uniqueRole?: boolean;
  fallback?: ReactNode;
  requireAll?: boolean;
  isSystemOwner?: boolean;
}
export const PermissionGuard = ({
  children,
  permission,
  role,
  uniqueRole = false,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) => {
  const hasPermission = usePermissions(permission || []);
  const hasRole = useRoles(role || [], uniqueRole);
  if (!permission && !role) {
    return <>{children}</>;
  }
  if (permission && !role) {
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }
  if (role && !permission) {
    const roleResult = typeof hasRole === 'boolean' ? hasRole : !!hasRole;
    return roleResult ? <>{children}</> : <>{fallback}</>;
  }
  if (permission && role) {
    const roleResult = typeof hasRole === 'boolean' ? hasRole : !!hasRole;
    if (requireAll) {
      return (hasPermission && roleResult) ? <>{children}</> : <>{fallback}</>;
    } else {
      return (hasPermission || roleResult) ? <>{children}</> : <>{fallback}</>;
    }
  }
  return <>{fallback}</>;
};
```

## File: src/shared/components/PermissionsModal.tsx
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { usePermissionsModal } from '@/shared/hooks/usePermissionsModal'
import { ShieldAlert } from 'lucide-react'
export function PermissionsModal() {
  const { isOpen, message, action, closeModal } = usePermissionsModal()
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-500/10 text-amber-600 dark:text-amber-500">
            <ShieldAlert className="size-8" aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle id="permissions-modal-title">
            Sin permiso
          </AlertDialogTitle>
          <AlertDialogDescription id="permissions-modal-description">
            <span className="block space-y-1">
              <span className="block">{message}</span>
              {action && action !== 'acción solicitada' && (
                <span className="text-muted-foreground block font-mono text-xs">
                  {action}
                </span>
              )}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={closeModal}>
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## File: src/shared/components/SearchList.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ISearchParams } from '@/shared/interfaces/list.types'
import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
type SearchListSimpleFilter = {
  operator: string;
  value: unknown;
} & Record<string, unknown>;
type SearchListComplexFilter = Record<string, ({ value: unknown } & Record<string, unknown>)>;
type SearchListFilters = Record<string, SearchListSimpleFilter | SearchListComplexFilter>;
interface SearchListProps {
  paramsSearch?: ISearchParams;
  filters?: SearchListFilters;
  showSearchBar?: boolean;
  searchAction?: boolean;
  disabled?: boolean;
  placeholder?: string;
  collapsibleFilters?: boolean;
  defaultFiltersExpanded?: boolean;
  toggleLabels?: {
    expand?: string;
    collapse?: string;
  };
  children?: ReactNode;
  fieldsetChildren?: ReactNode;
  onSearch: (_params: ISearchParams) => void;
  onReset: (_data: { paramsSearch: ISearchParams; filters: SearchListFilters }) => void;
}
interface SearchFormData {
  search: string;
}
export const SearchList = ({
  paramsSearch = {},
  filters = {},
  showSearchBar = true,
  searchAction = true,
  disabled = false,
  placeholder = 'Buscar...',
  collapsibleFilters = false,
  defaultFiltersExpanded = false,
  toggleLabels = { expand: 'Ver más filtros', collapse: 'Ver menos filtros' },
  children,
  fieldsetChildren,
  onSearch,
  onReset
}: SearchListProps) => {
  const [, setIsSearchable] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(defaultFiltersExpanded);
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, watch, reset } = useForm<SearchFormData>({
    defaultValues: {
      search: ''
    }
  });
  const searchValue = watch('search');
  useEffect(() => {
    if (searchValue !== '') {
      setIsSearchable(true);
    }
  }, [searchValue]);
  const dispatchSearch = useCallback(() => {
    const searchParams: ISearchParams = {
      ...paramsSearch,
      search: searchValue ? {
        value: searchValue,
        case_sensitive: false
      } : null
    };
    onSearch(searchParams);
  }, [paramsSearch, searchValue, onSearch]);
  const handleSearch = useCallback(() => {
    dispatchSearch();
    setIsSearchable(false);
  }, [dispatchSearch]);
  const handleReset = useCallback(() => {
    // Reset form
    reset({ search: '' });
    // Reset search params
    const resetParams: ISearchParams = {
      ...paramsSearch,
      search: null
    };
    // Reset filters - clear all form controls in the form
    const resetFilters: SearchListFilters = { ...filters };
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('input, select, textarea, [name]');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement;
        const name = element.getAttribute('name');
        if (name && name !== 'search') {
          if (resetParams.filters) {
            resetParams.filters = resetParams.filters.filter(item => item.field !== name);
          }
          const filterDef = resetFilters[name];
          if (!filterDef) return;
          const operator = (filterDef as Partial<SearchListSimpleFilter>)?.operator;
          const isSimpleFilter = typeof operator === 'string' && operator.length > 0;
          if (isSimpleFilter) {
            resetFilters[name] = {
              ...(filterDef as SearchListSimpleFilter),
              value: null
            } as SearchListSimpleFilter;
            return;
          }
          const complexFilter = filterDef as SearchListComplexFilter;
          for (const key in complexFilter) {
            if (Object.prototype.hasOwnProperty.call(complexFilter, key)) {
              complexFilter[key] = {
                ...complexFilter[key],
                value: null
              };
            }
          }
        }
      });
    }
    setIsSearchable(false);
    if (collapsibleFilters) {
      setFiltersExpanded(defaultFiltersExpanded);
    }
    onReset({
      paramsSearch: resetParams,
      filters: resetFilters
    });
  }, [paramsSearch, filters, reset, onReset, collapsibleFilters, defaultFiltersExpanded]);
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(handleSearch)}
      autoComplete="off"
      id="searchForm"
      className="w-full"
    >
      <fieldset disabled={disabled} className="border-0 p-0 m-0">
        <div className="flex flex-col gap-2">
          <div className="w-full">
            <div className="flex flex-col gap-2">
              {}
              {}
              {showSearchBar && (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Input
                        {...register('search')}
                        placeholder={placeholder}
                        onKeyDown={handleKeyDown}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {searchAction && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="px-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          type="submit"
                          className="px-4 flex items-center gap-2"
                        >
                          <Search className="h-4 w-4" />
                          <span className="hidden md:block">Buscar</span>
                        </Button>
                      </>
                    )}
                  </div>
                  {collapsibleFilters && (children || fieldsetChildren) && (
                    <div className="flex">
                      <a
                        onClick={() => setFiltersExpanded((v) => !v)}
                        aria-expanded={filtersExpanded}
                        className="underline text-primary cursor-pointer"
                      >
                        {filtersExpanded
                          ? (toggleLabels?.collapse ?? 'Ver menos filtros')
                          : (toggleLabels?.expand ?? 'Ver más filtros')}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {(!collapsibleFilters || filtersExpanded) && (
            <>
              {children}
              {}
              {fieldsetChildren}
            </>
          )}
        </div>
      </fieldset>
    </form>
  );
};
```

## File: src/shared/constants/passwordRequirements.ts
```typescript
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
export const PASSWORD_REQUIREMENTS_TEXT =
  'Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.'
export const PASSWORD_REQUIREMENTS_SHORT = 'Mín. 8 caracteres, mayúscula, minúscula y número.'
```

## File: src/shared/hooks/useBaseList.ts
```typescript
import type { ReportParams } from '@/shared/api/resourceApi'
import { useInitOnce } from '@/shared/hooks/useInitOnce'
import { toast } from '@/shared/hooks/useToast'
import type { IEntity } from '@/shared/interfaces/Entity'
import type { IPaginationMeta, ISearchParams } from '@/shared/interfaces/list.types'
import type { IEntityStore } from '@/shared/store/EntityStore'
import { useCallback, useRef, useState } from 'react'
interface ApiResponse<T> {
    data: T[]
    meta?: IPaginationMeta
    total?: number
}
interface ResourceApi<T> {
    list: (_params: Record<string, unknown>) => Promise<ApiResponse<T>>
    search: (_params: Record<string, unknown>) => Promise<ApiResponse<T>>
    remove?: (_id: string) => Promise<unknown>
    restore?: (_id: string) => Promise<unknown>
    report?: (_params: ReportParams) => Promise<Blob>
}
export interface OverrideParams {
    filters?: Array<{ field: string; operator: string; value: unknown }>
    sort?: Array<{ field: string; direction: string }>
    includes?: Array<{ relation: string }>
    [key: string]: unknown
}
export interface UseBaseListConfig<T extends IEntity> {
    store: () => IEntityStore<T>
    resource: ResourceApi<T>
    autoInit?: boolean
    overrideParams?: OverrideParams
    initialSearch?: ISearchParams
    view?: string
}
export function useBaseList<T extends IEntity>(config: UseBaseListConfig<T>) {
    const store = config.store()
    const storeRef = useRef(store)
    storeRef.current = store
    const [paramsSearch, setParamsSearch] = useState<ISearchParams>(
        config.initialSearch || {
            search: null,
            filters: [],
            sort: [],
            includes: [],
            aggregates: [],
            user_id: null,
        }
    )
    const paramsSearchRef = useRef(paramsSearch)
    paramsSearchRef.current = paramsSearch
    const buildParams = useCallback((overrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        const currentStore = storeRef.current
        const currentSearch = searchOverrides
            ? { ...paramsSearchRef.current, ...searchOverrides }
            : paramsSearchRef.current
        const pagination = {
            ...currentStore.pagination,
            ...(currentSearch.page !== undefined && { page: currentSearch.page }),
            ...(currentSearch.limit !== undefined && { limit: currentSearch.limit }),
            ...overrides,
        }
        const { page, limit } = pagination
        const params: Record<string, unknown> = {
            page,
            limit,
            view: config.view
        }
        if (config.overrideParams) {
            const { filters: overrideFilters, sort: overrideSort, includes: overrideIncludes, ...otherOverrides } = config.overrideParams
            Object.assign(params, otherOverrides)
            if (overrideFilters?.length || currentSearch.filters?.length) {
                params.filters = [
                    ...(currentSearch.filters || []),
                    ...(overrideFilters || [])
                ]
            }
            if (overrideSort?.length) {
                params.sort = overrideSort
            } else if (currentSearch.sort?.length) {
                params.sort = currentSearch.sort
            }
            if (overrideIncludes?.length || currentSearch.includes?.length) {
                const allIncludes = [
                    ...(currentSearch.includes || []),
                    ...(overrideIncludes || [])
                ]
                const uniqueIncludes = allIncludes.filter((include, index, self) =>
                    index === self.findIndex(i => i.relation === include.relation)
                )
                params.includes = uniqueIncludes
            }
        } else {
            if (currentSearch.filters?.length) {
                params.filters = currentSearch.filters
            }
            if (currentSearch.sort?.length) {
                params.sort = currentSearch.sort
            }
            if (currentSearch.includes?.length) {
                params.includes = currentSearch.includes
            }
        }
        if (currentSearch.search?.value) {
            params.search = {
                value: currentSearch.search.value.trim(),
                case_sensitive: false
            }
        }
        if (currentSearch.aggregates?.length) {
            params.aggregates = currentSearch.aggregates
        }
        if (currentSearch.user_id) {
            params.user_id = currentSearch.user_id
        }
        if (currentSearch.scopes?.length) {
            params.scopes = currentSearch.scopes
        }
        if (currentSearch.active !== undefined) {
            params.active = currentSearch.active
        }
        return params
    }, [config.overrideParams, config.view])
    const getList = useCallback(async (paramOverrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        const s = storeRef.current
        s.putLoading(true)
        s.putNotFound(false)
        try {
            const params = buildParams(paramOverrides, searchOverrides)
            const response = await config.resource.search(params)
            s.setAllEntities(response.data)
            let paginationUpdate
            if (response.meta && typeof response.meta === 'object') {
                const meta = response.meta
                paginationUpdate = {
                    page: meta.current_page || (params.page as number) || 1,
                    limit: meta.per_page || (params.limit as number) || 20,
                    total: meta.total || (response.total as number) || response.data.length,
                    pages: meta.last_page || Math.ceil((meta.total || (response.total as number) || response.data.length) / (meta.per_page || (params.limit as number) || 20)),
                    per_page: meta.per_page || (params.limit as number) || 20,
                    from: meta.from || (((params.page as number) || 1) - 1) * ((params.limit as number) || 20) + 1,
                    to: meta.to || Math.min(((params.page as number) || 1) * ((params.limit as number) || 20), meta.total || (response.total as number) || response.data.length)
                }
                s.putMeta(response.meta)
            } else {
                const currentPage = (params.page as number) || 1
                const pageSize = (params.limit as number) || 20
                const totalItems = (response.total as number) || response.data.length
                let totalPages
                if (totalItems && totalItems > 0) {
                    totalPages = Math.ceil(totalItems / pageSize)
                } else if (response.data.length === pageSize) {
                    totalPages = currentPage + 1
                } else {
                    totalPages = currentPage
                }
                paginationUpdate = {
                    page: currentPage,
                    limit: pageSize,
                    total: totalItems || response.data.length,
                    pages: totalPages,
                    per_page: pageSize,
                    from: response.data.length > 0 ? (currentPage - 1) * pageSize + 1 : null,
                    to: response.data.length > 0 ? (currentPage - 1) * pageSize + response.data.length : null
                }
            }
            s.putPagination(paginationUpdate)
            s.putNotFound(response.data.length === 0)
            return response
        } catch (error) {
            s.removeAllEntities()
            s.putMeta(null)
            toast.error('Error al obtener la lista')
            throw error
        } finally {
            s.putLoading(false)
        }
    }, [buildParams, config.resource])
    const onSearch = useCallback((search?: Partial<ISearchParams>) => {
        if (search) {
            setParamsSearch(prev => ({ ...prev, ...search }))
        }
        storeRef.current.putPagination({ page: 1 })
        return getList({ page: 1 }, search)
    }, [getList])
    const onReset = useCallback(() => {
        const resetSearch: ISearchParams = {
            search: null,
            filters: [],
            sort: paramsSearchRef.current.sort,
            includes: paramsSearchRef.current.includes,
            aggregates: [],
            user_id: null,
        }
        setParamsSearch(resetSearch)
        storeRef.current.putPagination({ page: 1 })
        return getList({ page: 1 }, resetSearch)
    }, [getList])
    const onPageChanged = useCallback((page: number, limit?: number) => {
        const paginationUpdate = {
            page,
            ...(limit ? { limit } : {})
        }
        storeRef.current.putPagination(paginationUpdate)
        return getList(paginationUpdate)
    }, [getList])
    const onRemove = useCallback(async (entity: T) => {
        if (!config.resource.remove) return
        const s = storeRef.current
        s.putDeleting(true)
        try {
            await config.resource.remove(entity.id.toString())
            s.removeEntity(entity.id)
            toast.success('Registro eliminado exitosamente')
        } catch (error) {
            toast.error('Error al eliminar el registro')
            throw error
        } finally {
            s.putDeleting(false)
        }
    }, [config.resource])
    const onRestore = useCallback(async (entity: T) => {
        if (!config.resource.restore) return
        const s = storeRef.current
        s.putSaving(true)
        try {
            await config.resource.restore(entity.id.toString())
            toast.success('Registro restaurado exitosamente')
            await getList()
        } catch (error) {
            toast.error('Error al restaurar el registro')
            throw error
        } finally {
            s.putSaving(false)
        }
    }, [config.resource, getList])
    const onReport = useCallback(async (
        model: string,
        type: 'xlsx' | 'csv' | 'pdf' = 'xlsx',
        title: string = 'reporte',
        reportType?: string
    ) => {
        if (!config.resource.report) {
            toast.error('La descarga de reportes no está disponible')
            return
        }
        const s = storeRef.current
        s.putLoading(true)
        try {
            const params = buildParams()
            const reportParams: ReportParams = {
                _model: model,
                _type: type,
                _title: title,
                _report_type: reportType,
                limit: params.limit as number,
                page: params.page as number,
                ...params,
            }
            const blob = await config.resource.report(reportParams)
            if (blob.size <= 0) {
                toast.info('No hay datos para exportar')
                return
            }
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${title}.${type}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Reporte descargado correctamente')
        } catch (error) {
            toast.error('Error al descargar el reporte, inténtalo más tarde')
            throw error
        } finally {
            s.putLoading(false)
        }
    }, [buildParams, config.resource])
    useInitOnce(() => {
        if (config.autoInit !== false) {
            getList()
        }
    }, 'baseList')
    return {
        store,
        paramsSearch,
        setParamsSearch,
        getList,
        onSearch,
        onReset,
        onPageChanged,
        onRemove,
        onRestore,
        onReport,
    }
}
```

## File: src/shared/hooks/useFilteredNavItems.ts
```typescript
import { useMemo } from 'react';
import { useStore } from 'zustand';
import { sessionStore } from '@/shared/auth/sessionStore';
import type { ERoleUserSlug } from '@/shared/interfaces/Entity';
export interface NavSubItem {
  title: string;
  url: string;
  permissionEntity?: string;
  roles?: ERoleUserSlug[];
}
export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType;
  isActive?: boolean;
  permissionEntity?: string;
  roles?: ERoleUserSlug[];
  items?: NavSubItem[];
}
const EMPTY_ABILITIES: string[] = [];
const EMPTY_ROLES: ERoleUserSlug[] = [];
function hasEntityAccess(abilities: string[], entity: string): boolean {
  return abilities.includes(`read.${entity}`) || abilities.includes(`report.${entity}`);
}
function hasRoleAccess(userRoles: ERoleUserSlug[], requiredRoles: ERoleUserSlug[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}
function isItemVisible(
  item: Pick<NavItem, 'permissionEntity' | 'roles'>,
  abilities: string[],
  userRoles: ERoleUserSlug[],
): boolean {
  if (item.roles?.length && !hasRoleAccess(userRoles, item.roles)) return false;
  if (item.permissionEntity && !hasEntityAccess(abilities, item.permissionEntity)) return false;
  return true;
}
export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const abilities = useStore(sessionStore, (state) => state.profile?.abilities ?? EMPTY_ABILITIES);
  const userRoles = useStore(sessionStore, (state) => state.profile?.roles ?? EMPTY_ROLES);
  return useMemo(() => {
    return items.reduce<NavItem[]>((acc, item) => {
      if (item.items?.length) {
        const filteredChildren = item.items.filter((child) =>
          isItemVisible(child, abilities, userRoles),
        );
        if (filteredChildren.length > 0) {
          acc.push({ ...item, items: filteredChildren });
        }
        return acc;
      }
      if (isItemVisible(item, abilities, userRoles)) {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [items, abilities, userRoles]);
}
```

## File: src/shared/hooks/usePermissions.ts
```typescript
import { useMemo } from 'react';
import { useStore } from 'zustand';
import { sessionStore } from '@/shared/auth/sessionStore';
const EMPTY_ABILITIES: string[] = [];
export const usePermissions = (key: string | string[]): boolean => {
    const abilities = useStore(sessionStore, (state) => state.profile?.abilities ?? EMPTY_ABILITIES);
    return useMemo(() => {
        if (!abilities?.length) {
            return false;
        }
        if (typeof key === 'string') {
            return abilities.includes(key);
        }
        if (Array.isArray(key)) {
            return key.some(k => abilities.includes(k));
        }
        return false;
    }, [abilities, key]);
};
export const useMultiplePermissions = <T extends Record<string, string | string[]>>(
    permissions: T
): Record<keyof T, boolean> => {
    const abilities = useStore(sessionStore, (state) => state.profile?.abilities ?? EMPTY_ABILITIES);
    return useMemo(() => {
        const result: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
        Object.entries(permissions).forEach(([key, permission]) => {
            if (!abilities?.length) {
                result[key as keyof T] = false;
                return;
            }
            if (typeof permission === 'string') {
                result[key as keyof T] = abilities.includes(permission);
            } else if (Array.isArray(permission)) {
                result[key as keyof T] = permission.some(p => abilities.includes(p));
            } else {
                result[key as keyof T] = false;
            }
        });
        return result;
    }, [abilities, permissions]);
};
```

## File: src/shared/hooks/usePermissionsModal.ts
```typescript
import { create } from 'zustand';
interface PermissionsModalState {
    isOpen: boolean;
    message: string;
    action: string;
    openModal: (message?: string, action?: string) => void;
    closeModal: () => void;
}
export const usePermissionsModal = create<PermissionsModalState>((set) => ({
    isOpen: false,
    message: 'No tienes permisos para realizar esta acción',
    action: 'acción solicitada',
    openModal: (message = 'No tienes permisos para realizar esta acción', action = 'acción solicitada') =>
        set({
            isOpen: true,
            message,
            action
        }),
    closeModal: () =>
        set({
            isOpen: false,
            message: 'No tienes permisos para realizar esta acción',
            action: 'acción solicitada'
        }),
}));
```

## File: src/shared/hooks/useRoles.ts
```typescript
import { sessionStore } from '@/shared/auth/sessionStore'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import { useMemo } from 'react'
import { useStore } from 'zustand'
const EMPTY_ROLES: ERoleUserSlug[] = []
export type UseRolesHelpers = {
  roles: ERoleUserSlug[]
  hasRole: (_role: ERoleUserSlug) => boolean
  hasAnyRole: (_allowedRoles: ERoleUserSlug[]) => boolean
  hasAllRoles: (_requiredRoles: ERoleUserSlug[]) => boolean
  findFirstRole: (_rolesToMatch: ERoleUserSlug[]) => ERoleUserSlug | null
}
export function useRoles(): UseRolesHelpers
export function useRoles(
  _key: ERoleUserSlug | ERoleUserSlug[],
  _unique?: boolean
): boolean | ERoleUserSlug | null
export function useRoles(
  key?: ERoleUserSlug | ERoleUserSlug[],
  unique = false
): UseRolesHelpers | boolean | ERoleUserSlug | null {
  const storeRoles = useStore(sessionStore, (state) => state.profile?.roles ?? EMPTY_ROLES)
  const helpers = useMemo<UseRolesHelpers>(() => {
    const roles = Array.isArray(storeRoles) ? storeRoles : []
    const hasRole = (role: ERoleUserSlug) => roles.includes(role)
    const hasAnyRole = (allowedRoles: ERoleUserSlug[]) => {
      if (!roles.length || !Array.isArray(allowedRoles) || !allowedRoles.length) {
        return false
      }
      return allowedRoles.some((role) => roles.includes(role))
    }
    const hasAllRoles = (requiredRoles: ERoleUserSlug[]) => {
      if (!roles.length || !Array.isArray(requiredRoles) || !requiredRoles.length) {
        return false
      }
      return requiredRoles.every((role) => roles.includes(role))
    }
    const findFirstRole = (rolesToMatch: ERoleUserSlug[]) => {
      if (!roles.length || !Array.isArray(rolesToMatch) || !rolesToMatch.length) {
        return null
      }
      return rolesToMatch.find((role) => roles.includes(role)) ?? null
    }
    return {
      roles,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      findFirstRole,
    }
  }, [storeRoles])
  if (typeof key === 'undefined') {
    return helpers
  }
  if (!helpers.roles.length) {
    return null
  }
  if (typeof key === 'string') {
    return helpers.hasRole(key)
  }
  if (Array.isArray(key)) {
    if (unique) {
      return helpers.findFirstRole(key)
    }
    return helpers.hasAnyRole(key)
  }
  return false
}
```

## File: src/shared/hooks/useToast.ts
```typescript
import type { SileoOptions, SileoPosition } from 'sileo'
import { sileo } from 'sileo'
const DEFAULTS: Partial<SileoOptions> = {
    fill: 'black', styles: {
        title: 'text-white!',
        description: 'text-white/75!',
        badge: 'bg-white/20!',
        button: 'bg-white/10!',
    },
    duration: 7000,
}
type ToastType = 'success' | 'error' | 'info' | 'warning'
interface PromiseOptions<T = unknown> {
    loading: SileoOptions
    success: SileoOptions | ((_data: T) => SileoOptions)
    error: SileoOptions | ((_err: unknown) => SileoOptions)
    action?: SileoOptions | ((_data: T) => SileoOptions)
    position?: SileoPosition
}
const TOAST_METHODS = {
    success: sileo.success,
    error: sileo.error,
    warning: sileo.warning,
    info: sileo.info,
} as const
function withDefaults(opts: SileoOptions): SileoOptions {
    return { ...DEFAULTS, ...opts }
}
function notify(type: ToastType, opts: SileoOptions): string {
    return TOAST_METHODS[type](withDefaults(opts))
}
function success(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.success(withDefaults(opts))
}
function error(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.error(withDefaults(opts))
}
function warning(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.warning(withDefaults(opts))
}
function info(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.info(withDefaults(opts))
}
function action(opts: SileoOptions): string {
    return sileo.action(withDefaults(opts))
}
function promise<T>(p: Promise<T> | (() => Promise<T>), opts: PromiseOptions<T>): Promise<T> {
    return sileo.promise(p, opts)
}
function dismiss(id: string): void {
    sileo.dismiss(id)
}
function clear(position?: SileoPosition): void {
    sileo.clear(position)
}
export const toast = {
    notify,
    success,
    error,
    warning,
    info,
    action,
    promise,
    dismiss,
    clear,
}
export type { PromiseOptions, SileoOptions }
```

## File: src/shared/store/EntityStore.ts
```typescript
import type { IEntity } from '@/shared/interfaces/Entity'
import type { IPagination, IPaginationMeta } from '@/shared/interfaces/list.types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
export type EntityId = string | number
export interface IEntityStore<T extends IEntity> {
    entities: T[]
    selectId: EntityId | null
    currentEntity: T | null
    isLoading: boolean
    isSaving: boolean
    isDeleting: boolean
    notFound: boolean
    initial: boolean
    pagination: IPagination
    meta: IPaginationMeta | null
    putInitial: (_initial: boolean) => void
    putSelectId: (_selectId: EntityId | null) => void
    putMeta: (_meta: IPaginationMeta | null) => void
    putPagination: (_pagination: Partial<IPagination>) => void
    putLoading: (_isLoading: boolean) => void
    putSaving: (_isSaving: boolean) => void
    putDeleting: (_isDeleting: boolean) => void
    putNotFound: (_notFound: boolean) => void
    setCurrentEntity: (_entity: T | null) => void
    addEntity: (_entity: T) => void
    addEntities: (_entities: T[]) => void
    setEntity: (_entity: T) => void
    setEntities: (_entities: T[]) => void
    setAllEntities: (_entities: T[]) => void
    updateEntity: (_entity: Partial<T> | T) => void
    updateEntities: (_ids: EntityId[], _changes: Partial<T>) => void
    updateAllEntities: (_changes: Partial<T>) => void
    removeEntity: (_id: EntityId) => void
    removeEntities: (_ids: EntityId[]) => void
    removeAllEntities: () => void
    reset: () => void
}
const initialPaginationState: IPagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    per_page: 20,
    to: null,
    from: null
}
export function createEntityStore<T extends IEntity>(name: string) {
    return create<IEntityStore<T>>()(
        devtools(
            (set) => ({
                entities: [],
                selectId: null,
                currentEntity: null,
                isLoading: false,
                isSaving: false,
                isDeleting: false,
                notFound: false,
                initial: false,
                pagination: initialPaginationState,
                meta: null,
                putInitial: (initial) => set({ initial }),
                putSelectId: (selectId) => set({ selectId }),
                putMeta: (meta) => set({ meta }),
                putPagination: (pagination) => set(state => ({
                    pagination: { ...state.pagination, ...pagination }
                })),
                putLoading: (isLoading) => set({ isLoading }),
                putSaving: (isSaving) => set({ isSaving }),
                putDeleting: (isDeleting) => set({ isDeleting }),
                putNotFound: (notFound) => set({ notFound }),
                setCurrentEntity: (entity) => set({ currentEntity: entity }),
                addEntity: (entity) => set(state => {
                    const exists = state.entities.some(e => e.id === entity.id)
                    if (exists) {
                        return {
                            entities: state.entities.map(e =>
                                e.id === entity.id ? entity : e
                            )
                        }
                    }
                    return {
                        entities: [entity, ...state.entities],
                        pagination: {
                            ...state.pagination,
                            total: state.pagination.total + 1
                        }
                    }
                }),
                addEntities: (entities) => set(state => ({
                    entities: [...entities, ...state.entities]
                })),
                setEntity: (entity) => set(state => {
                    const index = state.entities.findIndex(e => e.id === entity.id)
                    if (index >= 0) {
                        const newEntities = [...state.entities]
                        newEntities[index] = entity
                        return { entities: newEntities }
                    }
                    return { entities: [entity, ...state.entities] }
                }),
                setEntities: (entities) => set(state => {
                    const entityMap = new Map(state.entities.map(e => [e.id, e]))
                    entities.forEach(entity => entityMap.set(entity.id, entity))
                    return { entities: Array.from(entityMap.values()) }
                }),
                setAllEntities: (entities) => set({ entities }),
                updateEntity: (entity) => set(state => ({
                    entities: state.entities.map(e =>
                        e.id === entity.id ? { ...e, ...entity } : e
                    )
                })),
                updateEntities: (ids, changes) => set(state => ({
                    entities: state.entities.map(e =>
                        ids.includes(e.id) ? { ...e, ...changes } : e
                    )
                })),
                updateAllEntities: (changes) => set(state => ({
                    entities: state.entities.map(e => ({ ...e, ...changes }))
                })),
                removeEntity: (id) => set(state => ({
                    entities: state.entities.filter(e => e.id !== id),
                    selectId: state.selectId === id ? null : state.selectId,
                    pagination: {
                        ...state.pagination,
                        total: Math.max(0, state.pagination.total - 1)
                    }
                })),
                removeEntities: (ids) => set(state => {
                    const idSet = new Set(ids)
                    const filtered = state.entities.filter(e => !idSet.has(e.id))
                    return {
                        entities: filtered,
                        selectId: idSet.has(state.selectId as EntityId) ? null : state.selectId,
                        pagination: {
                            ...state.pagination,
                            total: Math.max(0, state.pagination.total - (state.entities.length - filtered.length))
                        }
                    }
                }),
                removeAllEntities: () => set({
                    entities: [],
                    selectId: null
                }),
                reset: () => set({
                    entities: [],
                    selectId: null,
                    currentEntity: null,
                    isLoading: false,
                    isSaving: false,
                    isDeleting: false,
                    notFound: false,
                    initial: false,
                    pagination: initialPaginationState,
                    meta: null
                })
            }),
            { name }
        )
    )
}
```

## File: src/shared/utils/currencyHelper.ts
```typescript
export const displayFormatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    const safeValue = isNaN(numValue) ? 0 : numValue
    const truncatedValue = Math.trunc(safeValue * 100) / 100
    return truncatedValue.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}
```

## File: src/shared/utils/dateHelper.ts
```typescript
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
export const displayFormatDate = (dateStr: string | null | undefined, formatD: 'medium' | 'mediumDate' = 'medium') => {
    if (!dateStr) {
        return ''
    }
    try {
        // Parse ISO string which handles timezone correctly
        let date = parseISO(dateStr)
        // If parsing fails, try with Date constructor
        if (isNaN(date.getTime())) {
            date = new Date(dateStr)
        }
        // Validate the date
        if (isNaN(date.getTime())) {
            return ''
        }
        // For date-only formatting, adjust to local timezone to prevent day shift
        // This ensures "2025-11-25T00:00:00.000Z" displays as Nov 25, not Nov 24
        if (formatD === 'mediumDate') {
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/)
            if (dateMatch && dateMatch[1]) {
                const [year, month, day] = dateMatch[1].split('-').map(Number)
                date = new Date(year, month - 1, day)
            }
        }
        switch (formatD) {
            case 'medium':
                return format(date, 'MMM d, yyyy HH:mm', { locale: es })
            case 'mediumDate':
                return format(date, 'MMM d, yyyy', { locale: es })
            default:
                return format(date, 'MMM d, yyyy HH:mm', { locale: es })
        }
    } catch (error) {
        console.error('Error formatting date:', dateStr, error)
        return ''
    }
}
export const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
        const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/)
        if (dateMatch?.[1]) {
            return dateMatch[1]
        }
        return format(parseISO(dateStr), 'yyyy-MM-dd')
    } catch (error) {
        console.error('Error parsing date:', dateStr, error)
        return ''
    }
}
```

## File: src/shared/utils/displayInitials.ts
```typescript
export function displayInitials(name: string): string {
    return (name ?? '')
        .split(' ')
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join('')
}
```

## File: src/app/layout/DashboardLayout.tsx
```typescript
import { LayoutContext } from '@/app/layout/useLayoutContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
export type DashboardLayoutContext = {
  setFullWidth: (_value: boolean) => void
}
export function DashboardLayout() {
  const [fullWidth, setFullWidth] = useState(false)
  const layoutContextValue: DashboardLayoutContext = { setFullWidth }
  return (
    <LayoutContext.Provider value={layoutContextValue}>
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className={cn(
            '@container/main flex flex-1 flex-col gap-2 p-4 lg:p-6 w-full',
            !fullWidth && 'max-w-7xl mx-auto',
          )}>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </LayoutContext.Provider>
  )
}
```

## File: src/app/layout/useLayoutContext.ts
```typescript
import type { DashboardLayoutContext } from '@/app/layout/DashboardLayout'
import { createContext, useContext } from 'react'
const LayoutContext = createContext<DashboardLayoutContext | undefined>(undefined)
export function useLayoutContext(): DashboardLayoutContext {
  const ctx = useContext(LayoutContext)
  if (ctx === undefined) {
    return {
      setFullWidth: () => {},
    }
  }
  return ctx
}
export { LayoutContext }
```

## File: src/components/forgot-password-form.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { forgotPasswordRequest } from '@/shared/auth/authService'
import { toast } from '@/shared/hooks/useToast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import z from 'zod'
const forgotSchema = z.object({
  email: z.string().email({ message: 'Ingresa un email válido' }),
})
type ForgotFormData = z.infer<typeof forgotSchema>
export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true)
      await forgotPasswordRequest(data.email)
      toast.success({
        title: 'Correo enviado',
        description:
          'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
      })
      form.reset()
    } catch (error) {
      toast.error({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo enviar el enlace.',
      })
    } finally {
      setIsSubmitting(false)
    }
  })
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-6 md:p-8">
        <form
          name="forgot-password"
          onSubmit={onSubmit}
          autoComplete="on"
          className="space-y-6"
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
              <p className="text-muted-foreground text-balance">
                Indica tu correo y te enviaremos un enlace para crear una nueva contraseña.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                {...form.register('email')}
                disabled={isSubmitting}
                required
              />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
            </Button>
            <FieldDescription className="text-center">
              <Link to="/login" className="underline underline-offset-2 hover:text-primary">
                Volver al inicio de sesión
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
```

## File: src/components/nav-documents.tsx
```typescript
'use client'
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  const { isMobile } = useSidebar()
  return (
    items?.length > 0 && (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items?.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <IconFolder />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare3 />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {
}
      </SidebarMenu>
    </SidebarGroup>
    )
  )
}
```

## File: src/components/nav-main.tsx
```typescript
'use client'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { NavItem } from '@/shared/hooks/useFilteredNavItems'
import { useNavigate } from 'react-router-dom'
export function NavMain({ items }: { items: NavItem[] }) {
  const navigate = useNavigate();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className='cursor-pointer' tooltip={item.title} onClick={() => navigate(item.url)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a className='cursor-pointer' onClick={() => navigate(subItem.url)}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
```

## File: src/components/nav-secondary.tsx
```typescript
'use client'
import { type Icon } from '@tabler/icons-react'
import * as React from 'react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    items?.length > 0 && (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items?.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  )
}
```

## File: src/components/nav-user.tsx
```typescript
import {
  IconBuilding,
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSession } from '@/shared/auth/useSession'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import { displayInitials } from '@/shared/utils/displayInitials'
import { useNavigate } from 'react-router-dom'
export function NavUser() {
  const { isMobile } = useSidebar()
  const { logout, user } = useSession()
  const navigate = useNavigate()
  const isOwner = useRoles(ERoleUserSlug.ACCOUNT_OWNER)
  const handleLogout = () => {
    logout()
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {}
                <AvatarFallback className="rounded-lg">{displayInitials(user?.name ?? '')}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {}
                  <AvatarFallback className="rounded-lg">{displayInitials(user?.name ?? '')}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/company/me')}>
                <IconBuilding />
                Mi empresa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconUserCircle />
                Cuenta
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <IconCreditCard />
                  Suscripción
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

## File: src/modules/document/DocumentForm.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { documentFormSchema, type DocumentFormValues, type IDocument } from '@/modules/document/schema'
import { DocumentResource } from '@/modules/document/services/DocumentResource'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useBaseCrud } from '@/shared/hooks/useBaseCrud'
import { CatalogType, useCatalogs } from '@/shared/hooks/useCatalogs'
import type { IFormProps } from '@/shared/interfaces/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
interface DocumentFormProps extends IFormProps<IDocument> {
  onSubmitRef?: React.MutableRefObject<(() => void) | null>
}
export const DocumentForm = ({ mode, entity, onSuccess, onCancel, formId, onSubmitRef }: DocumentFormProps) => {
  const defaultValues = useMemo<DocumentFormValues>(() => ({
    name: entity?.name ?? '',
    description: entity?.description ?? '',
    type_id: entity?.type_id ?? '',
    required: Boolean(entity?.required ?? false),
    vigency: Boolean(entity?.vigency ?? false),
  }), [entity])
  const crud = useBaseCrud<IDocument, DocumentFormValues>({
    store: useDocumentStore,
    resource: {
      save: DocumentResource.create,
      update: DocumentResource.update,
      delete: DocumentResource.remove,
    },
    mode,
    entityId: entity?.id,
    initialData: entity,
  })
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues,
  })
  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])
  const doSubmit = handleSubmit(async (values) => {
    const result = await crud.submit(values)
    if (result) {
      onSuccess?.(result)
    }
  })
  // Expone el trigger de submit al modal padre via ref
  const doSubmitRef = useRef(doSubmit)
  doSubmitRef.current = doSubmit
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => void doSubmitRef.current()
    }
  }, [onSubmitRef])
  const { catalogs } = useCatalogs({
    [CatalogType.DOCUMENT_TYPE]: { _sort: 'name' },
  })
  const isSaving = crud.store.isSaving
  return (
    <form id={formId} onSubmit={(e) => { e.preventDefault(); void doSubmit(e) }}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Información del documento</FieldLegend>
          <FieldDescription>Datos principales del documento</FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-12 gap-4">
            <Field className="col-span-12">
              <FieldLabel htmlFor="document-name" required>
                Nombre
              </FieldLabel>
              <Input
                id="document-name"
                placeholder="Nombre del documento"
                {...register('name')}
                disabled={isSaving}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field className="col-span-12 md:col-span-4">
              <FieldLabel htmlFor="document-required">Requerido</FieldLabel>
              <Controller
                name="required"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="document-required"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={isSaving}
                  />
                )}
              />
            </Field>
            <Field className="col-span-12 md:col-span-4">
              <FieldLabel htmlFor="document-vigency">Vigencia</FieldLabel>
              <Controller
                name="vigency"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="document-vigency"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={isSaving}
                  />
                )}
              />
            </Field>
            <Field className="col-span-12 md:col-span-4">
              <FieldLabel htmlFor="document-type">
                Tipo de documento
              </FieldLabel>
              <Controller
                name="type_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="document-type" className="w-full">
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs[CatalogType.DOCUMENT_TYPE]?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.type_id?.message}</FieldError>
            </Field>
            <Field className="col-span-12">
              <FieldLabel htmlFor="document-description">Descripción</FieldLabel>
              <Textarea
                id="document-description"
                placeholder="Descripción del documento..."
                className="resize-none"
                rows={4}
                {...register('description')}
                disabled={isSaving}
              />
              <FieldDescription>Detalle brevemente el propósito del documento</FieldDescription>
            </Field>
            </div>
          </FieldGroup>
        </FieldSet>
        {!formId && !onSubmitRef && (
          <Field orientation="horizontal" className="justify-end border-t border-gray-200 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="min-w-[80px]"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSaving} className="min-w-[100px]">
              {isSaving
                ? mode === CrudMode.EDIT
                  ? 'Actualizando...'
                  : 'Creando...'
                : mode === CrudMode.EDIT
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
```

## File: src/modules/document/DocumentList.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DocumentFormModal } from '@/modules/document/DocumentFormModal'
import { DocumentTableRow } from '@/modules/document/components/DocumentTableRow'
import { useDocumentList } from '@/modules/document/hooks/useDocumentList'
import type { IDocument } from '@/modules/document/schema'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
export const DocumentList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useDocumentList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useDocumentStore()
  const permissions = useMultiplePermissions({
    canCreate: 'create.document',
    canEdit: 'update.document',
    canDelete: 'delete.document',
    canReport: 'report.document',
    canRestore: 'restore.document',
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IDocument | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IDocument | null>(null)
  const handleCreate = useCallback(() => {
    setSelectedEntity(null)
    setModalMode(CrudMode.CREATE)
    setModalOpen(true)
  }, [])
  const handleEdit = useCallback((document: IDocument) => {
    setSelectedEntity(document)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])
  const handleDeleteClick = useCallback((document: IDocument) => {
    setEntityToDelete(document)
    setDeleteConfirmOpen(true)
  }, [])
  const handleDeleteConfirm = useCallback(async () => {
    if (!entityToDelete) return
    try {
      await onRemove(entityToDelete)
      setEntityToDelete(null)
      setDeleteConfirmOpen(false)
    } catch {
    }
  }, [entityToDelete, onRemove])
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedEntity(null)
  }, [])
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Documentos" description="Gestiona los documentos del sistema" />
        <PermissionGuard permission="create.document">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo documento
          </Button>
        </PermissionGuard>
      </div>
      <section>
        <div className="space-y-6">
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder="Buscar documentos..."
          />
          <section>
            {isLoading ? (
              <div>
                <TableLoadingState />
              </div>
            ) : entities.length === 0 ? (
              <div>
                <TableEmptyState />
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Requerido</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((document) => (
                        <DocumentTableRow
                          key={document.id}
                          entity={document}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canDelete}
                          isLoading={isLoading}
                          isDeleting={isDeleting}
                          isSaving={isSaving}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {entities.length > 0 && (
                  <Pagination
                    pagination={pagination}
                    onPageChanged={onPageChanged}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </section>
      <DocumentFormModal
        isOpen={modalOpen}
        mode={modalMode}
        entity={selectedEntity ?? undefined}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />
      <ConfirmDialog
        isOpen={deleteConfirmOpen} variant="delete" entityName={entityToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setEntityToDelete(null)
        }}
      />
    </div>
  )
}
```

## File: src/modules/role/RoleForm.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { roleFormSchema, type IRole, type RoleFormValues } from '@/modules/role/schema'
import { RoleResource } from '@/modules/role/services/RoleResource'
import { useRoleStore } from '@/modules/role/store/roleStore'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useBaseCrud } from '@/shared/hooks/useBaseCrud'
import type { IFormProps } from '@/shared/interfaces/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
export const RoleForm = ({ mode, entity, onSuccess, onCancel, formId }: IFormProps<IRole>) => {
  const defaultValues = useMemo<RoleFormValues>(() => {
    const baseDefaults: RoleFormValues = {
      name: '',
      description: '',
    }
    if (!entity) return baseDefaults
    return { ...baseDefaults, ...entity }
  }, [entity])
  const crud = useBaseCrud<IRole, RoleFormValues>({
    store: useRoleStore,
    resource: {
      save: RoleResource.create,
      update: RoleResource.update,
      delete: RoleResource.remove,
    },
    mode,
    entityId: entity?.id,
    initialData: entity,
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  })
  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])
  const onFormSubmit = handleSubmit(async (values) => {
    const result = await crud.submit(values)
    if (result) {
      onSuccess?.(result)
    }
  })
  const isSaving = crud.store.isSaving
  return (
    <form id={formId} onSubmit={onFormSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Información del rol</FieldLegend>
          <FieldDescription>Datos principales del rol</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="role-description" required>
                Nombre
              </FieldLabel>
              <Input
                id="role-description"
                placeholder="Descripción del rol"
                {...register('description')}
                disabled={isSaving}
              />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="role-name" required>
                Slug
              </FieldLabel>
              <Input
                id="role-name"
                placeholder="slug-del-rol"
                {...register('name')}
                disabled={isSaving || mode === CrudMode.EDIT}
              />
              <FieldDescription>Identificador único del rol (no editable después de creado)</FieldDescription>
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            {
}
          </FieldGroup>
        </FieldSet>
        {!formId && (
          <Field orientation="horizontal" className="justify-end border-t border-gray-200 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="min-w-[80px]"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSaving} className="min-w-[100px]">
              {isSaving
                ? mode === CrudMode.EDIT
                  ? 'Actualizando...'
                  : 'Creando...'
                : mode === CrudMode.EDIT
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
```

## File: src/modules/role/RoleList.tsx
```typescript
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RoleFormModal } from '@/modules/role/RoleFormModal'
import { RoleTableRow } from '@/modules/role/components/RoleTableRow'
import { useRoleList } from '@/modules/role/hooks/useRoleList'
import type { IRole } from '@/modules/role/schema'
import { useRoleStore } from '@/modules/role/store/roleStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { useCallback, useState } from 'react'
export const RoleList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useRoleList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useRoleStore()
  const permissions = useMultiplePermissions({
    canCreate: 'create.role',
    canEdit: 'update.role',
    canDelete: 'delete.role',
    canReport: 'report.role',
    canRestore: 'restore.role',
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IRole | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IRole | null>(null)
  const handleEdit = useCallback((role: IRole) => {
    setSelectedEntity(role)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])
  const handleDeleteClick = useCallback((role: IRole) => {
    setEntityToDelete(role)
    setDeleteConfirmOpen(true)
  }, [])
  const handleDeleteConfirm = useCallback(async () => {
    if (!entityToDelete) return
    try {
      await onRemove(entityToDelete)
      setEntityToDelete(null)
      setDeleteConfirmOpen(false)
    } catch {
    }
  }, [entityToDelete, onRemove])
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedEntity(null)
  }, [])
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Roles" description="Gestiona los roles del sistema" />
        <PermissionGuard permission="create.role" children={undefined}>
         {
}
        </PermissionGuard>
      </div>
      <section>
        <div className="space-y-6">
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder="Buscar roles..."
          />
          <section>
            {isLoading ? (
              <div>
                <TableLoadingState />
              </div>
            ) : entities.length === 0 ? (
              <div>
                <TableEmptyState />
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((role) => (
                        <RoleTableRow
                          key={role.id}
                          entity={role}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canDelete}
                          isLoading={isLoading}
                          isDeleting={isDeleting}
                          isSaving={isSaving}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {entities.length > 0 && (
                  <Pagination
                    pagination={pagination}
                    onPageChanged={onPageChanged}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </section>
      <RoleFormModal
        isOpen={modalOpen}
        mode={modalMode}
        entity={selectedEntity ?? undefined}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />
      <ConfirmDialog
        isOpen={deleteConfirmOpen} variant="delete" entityName={entityToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setEntityToDelete(null)
        }}
      />
    </div>
  )
}
```

## File: src/modules/user/components/UserTableRow.tsx
```typescript
import { TableCell, TableRow } from '@/components/ui/table'
import type { IRole } from '@/modules/role/schema'
import type { ITenant } from '@/modules/tenant/schema'
import type { IUser } from '@/modules/user/schema'
import { ActionButtonGroup } from '@/shared/components/molecules/ActionButtonGroup'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { IEntityTableRowProps } from '@/shared/interfaces/list.types'
import { checkMemoListProps } from '@/shared/interfaces/list.types'
import { displayFormatDate } from '@/shared/utils/dateHelper'
import { memo } from 'react'
export const UserTableRow = memo<IEntityTableRowProps<IUser>>(({
  entity,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete,
}) => {
  const roles = useRoles()
  const fullName = entity.full_name
    ?? [entity.name, entity.last_name, entity.second_last_name].filter(Boolean).join(' ')
  return (
    <TableRow key={entity.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          {entity.profile_image_url ? (
            <img
              src={entity.profile_image_url}
              alt={fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {entity.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="font-medium">{fullName}</div>
        </div>
      </TableCell>
      <TableCell>{entity.email}</TableCell>
      <TableCell>{entity.roles?.map((role: IRole) => role.description).join(', ') ?? '—'}</TableCell>
      {
        roles?.hasRole(ERoleUserSlug.SUPER_ADMIN) ? (
          <>
          <TableCell>{entity.tenants?.length && entity.tenants?.length > 0 ? entity.tenants?.map((tenant: ITenant) => tenant.name).join(', ') : '—'}</TableCell>
          <TableCell>{entity.tenants?.length && entity.tenants?.length > 0 ? entity.tenants?.map((tenant: ITenant) => tenant.subscription_plan?.name + (tenant.subscription_plan?.is_stripe ? ' (Stripe)' : '')).join(', ') : '—'}</TableCell>
          </>
        ) : null
      }
      <TableCell>{entity.phone ?? '—'}</TableCell>
      <TableCell>
        {displayFormatDate(entity.created_at)}
      </TableCell>
      <TableCell className="actions">
        <div className="flex items-center justify-end gap-2">
          <ActionButtonGroup
            dropdown={true}
            onEdit={canEdit ? () => onEdit(entity) : undefined}
            edit={canEdit}
            remove={canDelete}
            onRemove={canDelete ? () => onDelete(entity) : undefined}
            disabled={isLoading || isDeleting || isSaving}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return checkMemoListProps<IUser>(prevProps, nextProps)
});
UserTableRow.displayName = 'UserTableRow';
```

## File: src/modules/user/hooks/useUserList.ts
```typescript
import type { IUser } from '@/modules/user/schema'
import { UserResource } from '@/modules/user/services/UserResource'
import { useUserStore } from '@/modules/user/store/userStore'
import { useBaseList } from '@/shared/hooks/useBaseList'
export function useUserList() {
  return useBaseList<IUser>({
    store: useUserStore,
    resource: UserResource,
    autoInit: true,
    initialSearch: {
      sort: [{ field: 'created_at', direction: 'desc' }],
      includes: [
        {
          relation: 'tenants',
        },
        {
          relation: 'tenants.subscription_plan',
        },
        {
          relation: 'roles',
        },
        {
          relation: 'role',
        },
      ],
    },
  })
}
```

## File: src/shared/api/apiClient.ts
```typescript
import { refreshTokenRequest } from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { APP_CONFIG } from '@/shared/config/appConfig'
import { usePermissionsModal } from '@/shared/hooks/usePermissionsModal'
import axios, { type AxiosRequestConfig, type AxiosRequestHeaders } from 'axios'
export interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}
export class ApiError extends Error {
  status?: number
  payload?: ApiErrorPayload
  constructor(message: string, status?: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload as ApiErrorPayload | undefined
  }
}
export function formatApiErrorMessage(apiError: ApiError): { title: string; description?: string } {
  const payload = apiError.payload
  const title = payload?.message ?? apiError.message ?? 'Error al guardar'
  const errors = payload?.errors
  if (errors && typeof errors === 'object') {
    const lines = Object.values(errors).flat().filter(Boolean) as string[]
    if (lines.length > 0) {
      return { title, description: lines.slice(0, 5).join(' ') }
    }
  }
  return { title }
}
export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
  withCredentials: true
})
apiClient.interceptors.request.use((config) => {
  const token = sessionStore.getState().token
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders
  }
  return config
})
let refreshPromise: Promise<{ access_token: string } | null> | null = null
function logoutAndReject(
  error: unknown,
  status: number,
  message: string
): Promise<never> {
  refreshPromise = null
  sessionStore.getState().logout({ propagate: false })
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
  const payload = error && typeof error === 'object' && 'response' in error
    ? (error as { response?: { data?: unknown } }).response?.data
    : undefined
  return Promise.reject(new ApiError(message, status, payload))
}
function ensureRefreshPromise(): void {
  if (refreshPromise) return
  refreshPromise = refreshTokenRequest()
    .then((data) => data)
    .catch((err) => {
      refreshPromise = null
      throw err
    })
    .finally(() => {
      refreshPromise = null
    })
}
function getErrorMessage(error: { response?: { data?: unknown } }, fallback: string): string {
  return (error.response?.data as { message?: string })?.message ?? fallback
}
function reject401(error: unknown, status: number, message: string): Promise<never> {
  const payload =
    error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: unknown } }).response?.data
      : undefined
  return Promise.reject(new ApiError(message, status, payload))
}
function hadAuthorizationHeader(config: AxiosRequestConfig): boolean {
  const headers = config.headers as Record<string, unknown> | undefined
  return Boolean(headers?.Authorization)
}
async function handle401Retry(
  error: { response?: { status?: number; data?: unknown } },
  originalConfig: AxiosRequestConfig & { _retry?: boolean }
): Promise<unknown> {
  const status = error.response?.status ?? 401
  const message = getErrorMessage(error, 'Unauthorized')
  if (originalConfig._retry) {
    return logoutAndReject(error, status, message)
  }
  if (!hadAuthorizationHeader(originalConfig)) {
    return reject401(error, status, message)
  }
  ensureRefreshPromise()
  try {
    const tokens = await refreshPromise
    if (tokens) {
      sessionStore.getState().setTokens({
        token: tokens.access_token
      })
      originalConfig._retry = true
      return apiClient.request(originalConfig)
    }
  } catch {
    return logoutAndReject(error, status, getErrorMessage(error, 'Session expired'))
  }
  return logoutAndReject(error, status, message)
}
function handle403(error: { response?: { data?: unknown }; config?: { method?: string; url?: string } }): void {
  const errorData = error.response?.data as { message?: string } | undefined
  const method = error.config?.method?.toUpperCase() ?? 'REQUEST'
  const url = error.config?.url ?? ''
  const message = errorData?.message ?? 'No tienes permisos para realizar esta acción'
  const actionDescription = `${method} ${url}`
  usePermissionsModal.getState().openModal(message, actionDescription)
}
function rejectWithApiError(error: {
  response?: { data?: ApiErrorPayload; status?: number }
  message?: string
}): Promise<never> {
  const status = error.response?.status
  const message =
    error.response?.data?.message ?? error.message ?? 'Unexpected error, please try again'
  return Promise.reject(new ApiError(message, status, error.response?.data))
}
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    if (status === 401) {
      const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean }
      return handle401Retry(error, originalConfig)
    }
    if (status === 403) {
      handle403(error)
    }
    return rejectWithApiError(error)
  }
)
```

## File: src/shared/api/resourceApi.ts
```typescript
import { apiClient } from '@/shared/api/apiClient'
import type { PaginatedResponse } from '@/shared/interfaces/Entity'
export interface CrudApiConfig<TRecord, TForm, TCustomMethods = Record<string, unknown>> {
  basePath: string
  mapListResponse?: (_payload: PaginatedResponse<TRecord>) => PaginatedResponse<TRecord>
  mapCreateInput?: (_payload: TForm) => unknown
  mapUpdateInput?: (_payload: TForm) => unknown
  customMethods?: (_basePath: string) => TCustomMethods
}
export interface ReportParams {
  _model: string
  _type?: 'xlsx' | 'csv' | 'pdf'
  _title?: string
  _report_type?: string;
  [key: string]: unknown
}
type BaseCrudMethods<TRecord, TForm, TParams> = {
  readonly list: (_params: TParams) => Promise<PaginatedResponse<TRecord>>
  readonly search: (_params: TParams) => Promise<PaginatedResponse<TRecord>>
  readonly show: (_id: string, _params?: Partial<TForm>) => Promise<TRecord>
  readonly create: (_payload: TForm | FormData) => Promise<TRecord>
  readonly update: (_id: string, _payload: TForm | FormData) => Promise<TRecord>
  readonly remove: (_id: string) => Promise<string>
  readonly report: (_params: ReportParams) => Promise<Blob>
}
export const createCrudApi = <
  TRecord extends Record<string, unknown>,
  TForm extends Record<string, unknown> = TRecord,
  TParams = Record<string, unknown>,
  TCustomMethods = Record<string, unknown>,
>({
  basePath,
  mapListResponse,
  mapCreateInput,
  mapUpdateInput,
  customMethods
}: CrudApiConfig<TRecord, TForm, TCustomMethods>): BaseCrudMethods<TRecord, TForm, TParams> & TCustomMethods => {
  const list = async (params: TParams) => {
    const { data } = await apiClient.get<PaginatedResponse<TRecord>>(basePath, { params })
    return mapListResponse ? mapListResponse(data) : data
  }
  const search = async (params: TParams) => {
    const { active, ...bodyParams } = params as Record<string, unknown>
    const queryParams: Record<string, string> = {}
    if (active !== undefined) {
      queryParams.active = String(active)
    }
    const url = Object.keys(queryParams).length > 0
      ? `${basePath}/search?${new URLSearchParams(queryParams).toString()}`
      : `${basePath}/search`
    const { data } = await apiClient.post<PaginatedResponse<TRecord>>(url, bodyParams)
    return mapListResponse ? mapListResponse(data) : data
  }
  const create = async (payload: TForm | FormData) => {
    if (payload instanceof FormData) {
      const { data } = await apiClient.post<TRecord>(basePath, payload)
      return data
    }
    const body = mapCreateInput ? mapCreateInput(payload) : payload
    const queryParams = await setQueryParams(payload)
    const { data } = await apiClient.post<TRecord>(`${basePath}?${queryParams.toString()}`, body)
    return data
  }
  const setQueryParams = async (payload: TForm) => {
    const includeParam: Record<string, string> = {}
    if (payload.include) {
      includeParam.include = String(payload.include)
    }
    const queryParams = new URLSearchParams(includeParam)
    return queryParams
  }
  const update = async (id: string, payload: TForm | FormData) => {
    if (payload instanceof FormData) {
      const { data } = await apiClient.put<TRecord>(`${basePath}/${id}`, payload)
      return data
    }
    const body = mapUpdateInput ? mapUpdateInput(payload) : payload
    const queryParams = await setQueryParams(payload)
    const { data } = await apiClient.put<TRecord>(`${basePath}/${id}?${queryParams.toString()}`, body)
    return data
  }
  const show = async (id: string, params?: Partial<TForm>) => {
    const { data } = await apiClient.get<{ data: TRecord }>(`${basePath}/${id}`, { params })
    return data.data
  }
  const remove = async (id: string) => {
    await apiClient.delete(`${basePath}/${id}`)
    return id
  }
  const report = async (params: ReportParams): Promise<Blob> => {
    const response = await apiClient.post(`/customReport`, params, {
      responseType: 'blob',
      timeout: 60000,
    })
    return response.data
  }
  const baseMethods = { list, search, show, create, update, remove, report } as const
  const custom = customMethods ? customMethods(basePath) : ({} as TCustomMethods)
  return { ...baseMethods, ...custom } as BaseCrudMethods<TRecord, TForm, TParams> & TCustomMethods
}
```

## File: src/shared/auth/authService.ts
```typescript
import { apiClient } from '@/shared/api/apiClient'
import type { SessionProfile, SessionTenant, SessionUser, SubscriptionState } from '@/shared/auth/Session'
import { APP_CONFIG } from '@/shared/config/appConfig'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import axios from 'axios'
export interface LoginRequest {
  email: string
  password: string
}
export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  tenant_id?: string | null
  birthdate?: string | null
}
interface LoginRawResponse {
  data: {
    user: SessionUser
    abilities?: string[]
    roles?: string[]
    access_token?: string
  }
  [key: string]: unknown
}
export interface RefreshResponse {
  access_token: string
}
const AUTH_LOGIN_PATH = '/auth/login'
const AUTH_REGISTER_PATH = '/auth/register'
const AUTH_ME_PATH = '/auth/me'
const AUTH_REFRESH_PATH = '/auth/refresh'
const AUTH_FORGOT_PASSWORD_PATH = '/auth/forgot-password'
const AUTH_VERIFY_RESET_TOKEN_PATH = '/auth/verifyResetToken'
const AUTH_RESET_PASSWORD_PATH = '/auth/reset-password'
const AUTH_VERIFY_INVITATION_TOKEN_PATH = '/auth/verify-invitation-token'
const AUTH_ACCEPT_INVITATION_PATH = '/auth/accept-invitation'
const refreshClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
  withCredentials: true
})
const toSessionProfile = (data: LoginRawResponse): SessionProfile => {
  const rawUser = data?.user as (SessionUser & { full_name?: string | null }) | undefined
  if (!rawUser) {
    throw new Error('Missing user data in session response')
  }
  const fullName = typeof rawUser.full_name === 'string' ? rawUser.full_name : null
  const resolvedName = fullName && fullName.trim().length > 0 ? fullName.trim() : rawUser.name
  const user: SessionUser = {
    ...rawUser,
    email: rawUser.email,
    name: resolvedName
  }
  const raw = data as Record<string, unknown>
  const tenant = raw.tenant as SessionTenant | null | undefined
  const subscription = (raw.subscription as SubscriptionState | null) ?? null
  return {
    user,
    abilities: Array.isArray(data.abilities) ? (data.abilities as string[]) : [],
    roles: Array.isArray(data.roles) ? (data.roles as ERoleUserSlug[]) : [],
    company: (raw.company as Record<string, unknown> | null) ?? null,
    country: (raw.country as Record<string, unknown> | null) ?? null,
    tenant: tenant ?? null,
    subscription,
  }
}
export interface LoginResponse {
  profile: SessionProfile
  token: string
}
export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginRawResponse>(AUTH_LOGIN_PATH, credentials)
  const data = response.data?.data
  const profile = toSessionProfile(data as unknown as LoginRawResponse)
  const token = typeof data.access_token === 'string' && data.access_token.length > 0
    ? data.access_token
    : null
  if (!token) {
    throw new Error('Missing access token in login response')
  }
  return { profile, token }
}
export const registerRequest = async (payload: RegisterRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginRawResponse>(AUTH_REGISTER_PATH, payload)
  const data = response.data?.data
  const profile = toSessionProfile(data as unknown as LoginRawResponse)
  const token =
    typeof data?.access_token === 'string' && data.access_token.length > 0
      ? data.access_token
      : null
  if (!token) {
    throw new Error('Missing access token in register response')
  }
  return { profile, token }
}
export const refreshTokenRequest = async (): Promise<RefreshResponse> => {
  const response = await refreshClient.post<{ data: { access_token: string } }>(AUTH_REFRESH_PATH, {})
  const data = response.data?.data
  if (!data || typeof data.access_token !== 'string') {
    throw new Error('Invalid refresh response')
  }
  return { access_token: data.access_token }
}
export const fetchSessionProfile = async (): Promise<SessionProfile> => {
  const response = await apiClient.get<LoginRawResponse>(AUTH_ME_PATH)
  const data = response.data?.data
  return toSessionProfile(data as unknown as LoginRawResponse)
}
export const forgotPasswordRequest = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(AUTH_FORGOT_PASSWORD_PATH, { email })
  return response.data
}
export interface VerifyResetTokenResponse {
  response: boolean
  message: string
}
export const verifyResetTokenRequest = async (
  token: string,
  email: string
): Promise<VerifyResetTokenResponse> => {
  const response = await apiClient.post<VerifyResetTokenResponse>(AUTH_VERIFY_RESET_TOKEN_PATH, {
    token,
    email,
  })
  return response.data
}
export const resetPasswordRequest = async (params: {
  token: string
  email: string
  password: string
  password_confirmation: string
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(AUTH_RESET_PASSWORD_PATH, params)
  return response.data
}
export interface VerifyInvitationTokenResponse {
  valid: boolean
  email?: string
  message?: string
}
export const verifyInvitationTokenRequest = async (
  token: string
): Promise<VerifyInvitationTokenResponse> => {
  const response = await apiClient.post<VerifyInvitationTokenResponse>(
    AUTH_VERIFY_INVITATION_TOKEN_PATH,
    { token }
  )
  return response.data
}
export const acceptInvitationRequest = async (params: {
  token: string
  password: string
  password_confirmation: string
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    AUTH_ACCEPT_INVITATION_PATH,
    params
  )
  return response.data
}
```

## File: src/shared/auth/SessionProvider.tsx
```typescript
import { sessionStore } from '@/shared/auth/sessionStore'
import { useSession } from '@/shared/auth/useSession'
import type { JSX, PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
export const SessionProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const { restoreSession, validateSession, isRestoring } = useSession()
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    restoreSession()
    const currentState = sessionStore.getState()
    if (currentState.token || currentState.profile) {
      validateSession().catch(() => {
      })
    }
  }, [restoreSession, validateSession])
  if (isRestoring) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4"
        aria-busy="true"
        aria-label="Cargando aplicación"
      >
        <div
          className="h-8 w-8 shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <p
          className="text-sm font-medium text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Cargando sesión...
        </p>
      </main>
    )
  }
  return <>{children}</>
}
```

## File: src/shared/auth/sessionStore.ts
```typescript
import type { SessionProfile } from '@/shared/auth/Session'
import { createStore } from 'zustand/vanilla'
const STORAGE_KEY = 'session'
interface PersistedSession {
  profile: SessionProfile | null
}
interface SessionState {
  profile: SessionProfile | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isRestoring: boolean
  setSession: (_payload: { profile: SessionProfile; token: string }) => void
  setTokens: (_payload: { token: string }) => void
  setProfile: (_profile: SessionProfile) => void
  clearSession: () => void
  restoreSession: () => void
  logout: (_options?: { propagate?: boolean }) => void
}
const readPersistedState = (): PersistedSession => {
  if (typeof window === 'undefined') {
    return { profile: null }
  }
  try {
    const raw = localStorage.getItem(`fallback_${STORAGE_KEY}`)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedSession
      return { profile: parsed.profile ?? null }
    }
    const secureData = localStorage.getItem(`secure_${STORAGE_KEY}`)
    if (secureData) {
      const parsed = JSON.parse(secureData) as PersistedSession
      return { profile: parsed.profile ?? null }
    }
    return { profile: null }
  } catch (error) {
    console.warn('Failed to read session from storage', error)
    return { profile: null }
  }
}
const persistState = (state: PersistedSession) => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(`secure_${STORAGE_KEY}`, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to persist session state', error)
  }
}
const clearPersistedState = () => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.removeItem(`secure_${STORAGE_KEY}`)
    localStorage.removeItem(`fallback_${STORAGE_KEY}`)
  } catch (error) {
    console.error('Failed to clear persisted state', error)
  }
}
export const sessionStore = createStore<SessionState>((set) => ({
  profile: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isAuthenticating: false,
  isRestoring: true,
  setSession: ({ profile, token }) => {
    persistState({ profile })
    set({
      profile,
      token,
      refreshToken: null,
      isAuthenticated: true,
      isRestoring: false
    })
  },
  setTokens: ({ token }) => {
    set((_current) => ({
      token,
      refreshToken: null,
      isAuthenticated: Boolean(token)
    }))
  },
  setProfile: (profile) => {
    set((current) => {
      persistState({ profile })
      return {
        profile,
        token: current.token,
        refreshToken: current.refreshToken,
        isAuthenticated: Boolean(current.token),
        isRestoring: false
      }
    })
  },
  clearSession: () => {
    clearPersistedState()
    set({
      profile: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: false
    })
  },
  restoreSession: () => {
    const persisted = readPersistedState()
    set({
      profile: persisted.profile,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: Boolean(persisted.profile)
    })
  },
  logout: ({ propagate } = { propagate: true }) => {
    clearPersistedState()
    set({
      profile: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: false
    })
    if (propagate && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}))
```

## File: src/shared/auth/useSession.ts
```typescript
import { queryClient } from '@/shared/api/queryClient'
import {
  fetchSessionProfile,
  type LoginRequest,
  loginRequest,
  type RegisterRequest,
  refreshTokenRequest,
  registerRequest,
} from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { useCallback } from 'react'
import { useStore } from 'zustand'
export const useSession = () => {
  const profile = useStore(sessionStore, (state) => state.profile)
  const token = useStore(sessionStore, (state) => state.token)
  const isAuthenticated = useStore(sessionStore, (state) => state.isAuthenticated)
  const isRestoring = useStore(sessionStore, (state) => state.isRestoring)
  const login = useCallback(async (credentials: LoginRequest) => {
    const result = await loginRequest(credentials)
    sessionStore.getState().setSession(result)
    return result.profile
  }, [])
  const register = useCallback(async (payload: RegisterRequest) => {
    const result = await registerRequest(payload)
    sessionStore.getState().setSession(result)
    return result.profile
  }, [])
  const logout = useCallback(() => {
    queryClient.clear()
    sessionStore.getState().logout()
  }, [])
  const restoreSession = useCallback(() => {
    sessionStore.getState().restoreSession()
  }, [])
  const loadProfile = useCallback(async () => {
    try {
      const profileResponse = await fetchSessionProfile()
      sessionStore.getState().setProfile(profileResponse)
      return profileResponse
    } catch (error) {
      queryClient.clear()
      sessionStore.getState().logout()
      throw error
    }
  }, [])
  const validateSession = useCallback(async () => {
    const currentState = sessionStore.getState()
    if (!currentState.token) {
      try {
        const { access_token } = await refreshTokenRequest()
        sessionStore.getState().setTokens({ token: access_token })
        const profileResponse = await fetchSessionProfile()
        sessionStore.getState().setProfile(profileResponse)
        return profileResponse
      } catch {
        queryClient.clear()
        sessionStore.getState().logout()
        return
      }
    }
    try {
      const profileResponse = await fetchSessionProfile()
      sessionStore.getState().setProfile(profileResponse)
      return profileResponse
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Token validation failed:', errorMessage)
      queryClient.clear()
      sessionStore.getState().logout()
      throw error
    }
  }, [])
  return {
    profile,
    token,
    user: profile?.user ?? null,
    abilities: profile?.abilities ?? [],
    roles: profile?.roles ?? [],
    company: profile?.company,
    isAuthenticated,
    isRestoring,
    login,
    register,
    logout,
    restoreSession,
    loadProfile,
    validateSession,
    role: profile?.roles[0] ?? null,
  }
}
```

## File: src/shared/components/atoms/ProfileIdentity.tsx
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { displayInitials } from '@/shared/utils/displayInitials'
interface ProfileIdentityProps {
  name: string
  subtitle?: string
  imageUrl?: string | null
  avatarSize?: 'sm' | 'md' | 'lg'
  nameTag?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  number?: string
}
const sizeClasses = {
  sm: { avatar: 'size-10 text-base', name: 'text-base' },
  md: { avatar: 'size-12 text-lg', name: 'text-xl' },
  lg: { avatar: 'h-24 w-24 text-2xl', name: 'text-lg' },
} as const
export function ProfileIdentity({
  name,
  number,
  subtitle,
  imageUrl,
  avatarSize = 'md',
  nameTag: NameTag = 'h1',
  className,
}: ProfileIdentityProps) {
  const sizes = sizeClasses[avatarSize]
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className={sizes.avatar}>
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {displayInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <NameTag className={cn('font-semibold truncate', sizes.name)}>{name}</NameTag>
        {number && (
          <p className="text-sm text-muted-foreground truncate">Numero de colaborador: {number}</p>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
```

## File: src/shared/components/molecules/ActionButtonGroup.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  Edit,
  Eye,
  MinusSquare,
  MoreHorizontal,
  PlusSquare,
  Printer,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'
export const ACTION_ORDER = {
  RESTORE: 10,
  DETAIL: 20,
  EDIT: 30,
  PRINT: 40,
  REMOVE: 50,
} as const
export interface ActionOption {
  key: string
  label: string
  icon: ReactNode
  order: number
  onClick: () => void
  variant?: 'default' | 'destructive'
}
export interface ActionButtonGroupProps {
  isSelectable?: boolean
  isSelected?: boolean
  edit?: boolean
  mobile?: boolean
  print?: boolean
  detail?: boolean
  dropdown?: boolean
  remove?: boolean
  restore?: boolean
  onEdit?: () => void
  onDetail?: () => void
  onPrint?: () => void
  onRestore?: () => void
  onRemove?: () => void
  onSelect?: () => void
  extraOptions?: ActionOption[]
  children?: ReactNode
  className?: string
  disabled?: boolean
}
interface ActionConfig {
  key: string
  icon: ReactNode
  dropdownIcon: ReactNode
  label: string
  handler?: () => void
  visible: boolean
  order: number
  variant?: 'default' | 'destructive'
}
const ICON_INLINE = 'h-8 w-8 md:h-6 md:w-6'
const ICON_DROPDOWN = 'mr-2 h-5 w-5'
const HOVER_VISIBLE_COUNT = 2
function stopAndRun(e: React.MouseEvent, action?: () => void) {
  e.stopPropagation()
  action?.()
}
function buildActions(props: ActionButtonGroupProps): ActionConfig[] {
  const {
    restore,
    detail,
    edit,
    print,
    remove,
    onRestore,
    onDetail,
    onEdit,
    onPrint,
    onRemove,
    extraOptions = [],
  } = props
  const builtIns: ActionConfig[] = [
    {
      key: 'restore',
      icon: <RotateCcw className={ICON_INLINE} />,
      dropdownIcon: <RotateCcw className={ICON_DROPDOWN} />,
      label: 'Restaurar',
      handler: onRestore,
      visible: Boolean(restore && onRestore),
      order: ACTION_ORDER.RESTORE,
    },
    {
      key: 'detail',
      icon: <Eye className={ICON_INLINE} />,
      dropdownIcon: <Eye className={ICON_DROPDOWN} />,
      label: 'Ver detalles',
      handler: onDetail,
      visible: Boolean(detail && onDetail),
      order: ACTION_ORDER.DETAIL,
    },
    {
      key: 'edit',
      icon: <Edit className={ICON_INLINE} />,
      dropdownIcon: <Edit className={ICON_DROPDOWN} />,
      label: 'Editar',
      handler: onEdit,
      visible: Boolean(edit && onEdit),
      order: ACTION_ORDER.EDIT,
    },
    {
      key: 'print',
      icon: <Printer className={ICON_INLINE} />,
      dropdownIcon: <Printer className={ICON_DROPDOWN} />,
      label: 'Imprimir',
      handler: onPrint,
      visible: Boolean(print && onPrint),
      order: ACTION_ORDER.PRINT,
    },
    {
      key: 'remove',
      icon: <Trash2 className={ICON_INLINE} />,
      dropdownIcon: <Trash2 className={ICON_DROPDOWN} />,
      label: 'Eliminar',
      handler: onRemove,
      visible: Boolean(remove && onRemove),
      order: ACTION_ORDER.REMOVE,
      variant: 'destructive',
    },
  ]
  const fromExtra: ActionConfig[] = extraOptions.map((opt) => ({
    key: opt.key,
    icon: opt.icon,
    dropdownIcon: opt.icon,
    label: opt.label,
    handler: opt.onClick,
    visible: true,
    order: opt.order,
    variant: opt.variant,
  }))
  const all = [...fromExtra, ...builtIns]
    .filter((a) => a.visible && a.handler)
    .sort((a, b) => a.order - b.order)
  return all
}
function DropdownActions({
  actions,
  disabled,
}: {
  actions: ActionConfig[]
  disabled: boolean
}) {
  return (
    <>
      {actions.map((action) => (
        <DropdownMenuItem
          key={action.key}
          onClick={(e) => stopAndRun(e, action.handler)}
          disabled={disabled}
          variant={action.variant}
          className={
            action.variant === 'destructive'
              ? 'text-destructive focus:text-destructive'
              : undefined
          }
        >
          {action.dropdownIcon}
          <span>{action.label}</span>
        </DropdownMenuItem>
      ))}
    </>
  )
}
function ActionIconButton({
  action,
  disabled,
  showTooltip,
  className,
}: {
  action: ActionConfig
  disabled: boolean
  showTooltip?: boolean
  className?: string
}) {
  const colorClass =
    action.variant === 'destructive'
      ? 'text-destructive hover:text-destructive/90 hover:bg-destructive/10'
      : 'text-primary hover:text-primary/90 hover:bg-primary/10'
  const btn = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(e) => stopAndRun(e, action.handler)}
      title={action.label}
      disabled={disabled}
      aria-label={action.label}
      className={cn(
        'h-8 w-8 shrink-0 p-0 transition-all duration-200',
        colorClass,
        className
      )}
    >
      {action.icon}
    </Button>
  )
  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="left">{action.label}</TooltipContent>
      </Tooltip>
    )
  }
  return btn
}
function InlineSingleAction({
  action,
  disabled,
}: {
  action: ActionConfig
  disabled: boolean
}) {
  return (
    <ActionIconButton action={action} disabled={disabled} showTooltip />
  )
}
function InlineMultipleActions({
  actions,
  disabled,
}: {
  actions: ActionConfig[]
  disabled: boolean
}) {
  const hoverVisible = actions.slice(0, HOVER_VISIBLE_COUNT)
  return (
    <div
      className="group relative inline-flex h-8 shrink-0 justify-end overflow-visible"
      role="group"
      aria-label="Acciones"
    >
      {}
      <div
        className={cn(
          'absolute right-full top-0 flex h-8 items-center gap-0 rounded-l-md border border-r-0 border-border bg-card shadow-sm',
          'opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100',
          'pointer-events-none group-hover:pointer-events-auto'
        )}
      >
        {hoverVisible.map((action) => (
          <ActionIconButton
            key={action.key}
            action={action}
            disabled={disabled}
            showTooltip={false}
          />
        ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 shrink-0 p-0 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground',
              'border border-transparent hover:border-border hover:bg-card hover:shadow-sm',
              'rounded-md group-hover:rounded-l-none group-hover:rounded-r-md'
            )}
            disabled={disabled}
            aria-label="Más opciones"
            aria-haspopup="menu"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={0}
          className="bg-card border border-border shadow-lg rounded-md"
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={(e) => stopAndRun(e, action.handler)}
              disabled={disabled}
              variant={action.variant}
              className={
                action.variant === 'destructive'
                  ? 'text-destructive focus:text-destructive'
                  : undefined
              }
            >
              {action.dropdownIcon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
function DropdownSelectAction({
  selected,
  onSelect,
  disabled,
}: {
  selected: boolean
  onSelect: () => void
  disabled: boolean
}) {
  const icon = selected ? (
    <MinusSquare className={cn(ICON_DROPDOWN, 'text-red-600')} />
  ) : (
    <PlusSquare className={cn(ICON_DROPDOWN, 'text-green-600')} />
  )
  return (
    <DropdownMenuItem onClick={(e) => stopAndRun(e, onSelect)} disabled={disabled}>
      {icon}
      <span>{selected ? 'Deseleccionar' : 'Seleccionar'}</span>
    </DropdownMenuItem>
  )
}
function InlineSelectAction({
  selected,
  onSelect,
  disabled,
}: {
  selected: boolean
  onSelect: () => void
  disabled: boolean
}) {
  const colorClass = selected
    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
  const selectIcon = selected ? (
    <MinusSquare className="h-5 w-5 md:h-8 md:w-8 text-red-600" />
  ) : (
    <PlusSquare className="h-5 w-5 md:h-8 md:w-8 text-green-600" />
  )
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(e) => stopAndRun(e, onSelect)}
      title={selected ? 'Deseleccionar' : 'Seleccionar'}
      aria-label={selected ? 'Deseleccionar' : 'Seleccionar'}
      disabled={disabled}
      className={cn('h-8 w-8 p-0', colorClass)}
    >
      {selectIcon}
    </Button>
  )
}
export const ActionButtonGroup = (props: ActionButtonGroupProps) => {
  const {
    isSelectable = false,
    isSelected = false,
    dropdown = false,
    onSelect,
    children,
    className,
    disabled = false,
  } = props
  const actions = buildActions(props)
  const hasActions = actions.length > 0
  if (dropdown) {
    return (
      <div
        className={cn('flex items-center justify-end gap-1', className)}
        role="toolbar"
        aria-label="Acciones de fila"
      >
        {isSelectable && onSelect && (
          <InlineSelectAction
            selected={isSelected}
            onSelect={onSelect}
            disabled={disabled}
          />
        )}
        {hasActions &&
          (actions.length === 1 ? (
            <InlineSingleAction action={actions[0]} disabled={disabled} />
          ) : (
            <InlineMultipleActions actions={actions} disabled={disabled} />
          ))}
        {children}
      </div>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          disabled={disabled}
          aria-label="Abrir menú de acciones"
          aria-haspopup="menu"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={0}
        className="bg-card border border-border shadow-lg rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          {isSelectable && onSelect && (
            <DropdownSelectAction
              selected={isSelected}
              onSelect={onSelect}
              disabled={disabled}
            />
          )}
          {hasActions && <DropdownActions actions={actions} disabled={disabled} />}
          {children}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## File: src/shared/components/molecules/TableEmptyState.tsx
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Inbox, Plus, Search } from 'lucide-react'
interface TableEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: 'plus' | 'search' | 'default';
}
export const TableEmptyState = ({
  title = 'No se encontraron resultados',
  description = 'Intenta ajustar tus filtros o agregar un nuevo registro para comenzar.',
  actionLabel,
  onAction,
  className,
  icon = 'default'
}: TableEmptyStateProps) => {
  const iconClasses = 'h-10 w-10 text-energy/80 shrink-0';
  const renderIcon = () => {
    switch (icon) {
      case 'plus':
        return <Plus className={iconClasses} />;
      case 'search':
        return <Search className={iconClasses} />;
      default:
        return <Inbox className={iconClasses} strokeWidth={1.5} />;
    }
  };
  const hasAction = Boolean(actionLabel && onAction);
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-energy/20 bg-linear-to-br from-background via-card to-background px-8 py-14 sm:py-16 text-center relative overflow-hidden transition-colors duration-200',
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-energy/5 via-transparent to-energy/5 opacity-50 pointer-events-none" aria-hidden />
      <div className="relative z-10 flex flex-col items-center gap-5 max-w-sm">
        <div
          className={cn(
            'flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-energy/20 to-energy/10 border border-energy/25 shadow-sm',
            hasAction && 'ring-2 ring-energy/10 ring-offset-2 ring-offset-background'
          )}
        >
          {renderIcon()}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl text-foreground tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {hasAction && (
          <Button
            size="lg"
            onClick={onAction}
            className="mt-1 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-energy/40 transition-shadow duration-200"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" aria-hidden />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
```

## File: src/shared/components/molecules/TableLoadingState.tsx
```typescript
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
interface TableLoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
  showSkeletons?: boolean;
  mini?: boolean;
}
export const TableLoadingState = ({
  message = 'Cargando datos...',
  rows = 3,
  className,
  showSkeletons = false,
  mini = false
}: TableLoadingStateProps) => {
  if (showSkeletons) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 rounded-lg border border-border/50 bg-card/30 p-4 animate-pulse"
          >
            <div className="w-10 h-10 bg-muted/30 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/30 rounded w-3/4" />
              <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
            <div className="w-20 h-8 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-energy/20 bg-gradient-to-br from-background via-card to-background px-8 text-center relative overflow-hidden',
        className,
        mini ? 'py-4' : 'py-16'
      )}
    >
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-energy/5 via-transparent to-energy/5 opacity-50" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-energy/20 to-energy/10 border border-energy/30 shadow-lg">
          <Loader2 className="h-10 w-10 text-energy animate-spin" />
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-foreground">{message}</h3>
          <p className="text-muted-foreground">
            Por favor espera mientras se cargan los datos...
          </p>
        </div>
        {}
        <div className="flex space-x-2 mt-2">
          <div className="w-3 h-3 bg-energy rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-energy rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-energy rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
```

## File: src/shared/components/ConfirmDialog.tsx
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import type { JSX, ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
export type ConfirmDialogVariant = 'delete' | 'default'
interface ConfirmDialogProps {
  isOpen: boolean
  variant?: ConfirmDialogVariant
  title?: ReactNode
  description?: ReactNode
  entityName?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
  colorButtonConfirm?: string
  colorButtonCancel?: string
}
const DELETE_DEFAULTS = {
  title: 'Eliminar registro',
  confirmLabel: 'Eliminar',
  loadingLabel: 'Eliminando...',
  descriptionNoName: 'Esta acción no se puede deshacer. ¿Deseas continuar?',
  descriptionWithName: (name: string) =>
    `¿Eliminar "${name}"? Esta acción no se puede deshacer.`
} as const
const DEFAULT_DEFAULTS = {
  title: 'Confirmar',
  description: '¿Estás seguro de que quieres continuar?',
  confirmLabel: 'Confirmar',
  loadingLabel: 'Procesando...'
} as const
function resolveCopy(
  variant: ConfirmDialogVariant,
  overrides: {
    title?: ReactNode
    description?: ReactNode
    entityName?: string
    confirmLabel?: string
  }
): { title: ReactNode; description: ReactNode; confirmLabel: string; loadingLabel: string } {
  const isDelete = variant === 'delete'
  const title = overrides.title ?? (isDelete ? DELETE_DEFAULTS.title : DEFAULT_DEFAULTS.title)
  const description =
    overrides.description ??
    (isDelete
      ? overrides.entityName
        ? DELETE_DEFAULTS.descriptionWithName(overrides.entityName)
        : DELETE_DEFAULTS.descriptionNoName
      : DEFAULT_DEFAULTS.description)
  const confirmLabel =
    overrides.confirmLabel ??
    (isDelete ? DELETE_DEFAULTS.confirmLabel : DEFAULT_DEFAULTS.confirmLabel)
  const loadingLabel = isDelete ? DELETE_DEFAULTS.loadingLabel : DEFAULT_DEFAULTS.loadingLabel
  return { title, description, confirmLabel, loadingLabel }
}
export const ConfirmDialog = ({
  isOpen,
  variant = 'default',
  title,
  description,
  entityName,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
  colorButtonConfirm = 'bg-primary hover:bg-primary/90'
}: ConfirmDialogProps): JSX.Element => {
  const isDelete = variant === 'delete'
  const { title: resolvedTitle, description: resolvedDescription, confirmLabel: resolvedConfirmLabel, loadingLabel } =
    resolveCopy(variant, { title, description, entityName, confirmLabel })
  return (
    <AlertDialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {isDelete && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-8" aria-hidden />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDelete ? 'destructive' : undefined}
            className={!isDelete ? colorButtonConfirm : undefined}
          >
            {isLoading ? loadingLabel : resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## File: src/shared/components/DatePicker.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, isValid, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, X } from 'lucide-react'
import { useState } from 'react'
interface DatePickerProps {
  value?: string
  clearable?: boolean
  onChange: (_date: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  fromYear?: number
  toYear?: number
}
export function DatePicker({
  value,
  clearable = true,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  id,
  className,
  fromYear = 1940,
  toYear = new Date().getFullYear() + 5,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selectedDate = date && isValid(date) ? date : undefined
  const handleSelect = (selected: Date | undefined) => {
    onChange(selected ? format(selected, 'yyyy-MM-dd') : '')
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
          {clearable && selectedDate && (
            <Button
              className="ml-auto"
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSelect(undefined)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={handleSelect}
          captionLayout="dropdown"
          locale={es}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}
```

## File: src/shared/components/Pagination.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { IPagination } from '@/shared/interfaces/list.types'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
interface PaginationProps {
  pagination: IPagination
  onPageChanged: (_page: number, _size?: number) => void
  pageSizeOptions?: number[]
  selectedCount?: number
}
export const Pagination = ({
  pagination,
  onPageChanged,
  pageSizeOptions = [20, 50, 100],
  selectedCount,
}: PaginationProps) => {
  const { page: currentPage, pages: totalPages, total: totalItems, per_page: pageSize } = pagination
  if (totalItems === 0 || totalPages <= 1) return null
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-2 py-4 sticky bottom-0 bg-background z-10">
      <div className="text-sm text-muted-foreground">
        {selectedCount !== undefined
          ? `${selectedCount} de ${totalItems} fila(s) seleccionada(s).`
          : `${totalItems} fila(s) en total.`}
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageChanged(1, Number(value))}
          >
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(1)}
              disabled={currentPage <= 1}
              aria-label="Primera página"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(totalPages)}
              disabled={currentPage >= totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## File: src/shared/enums/CrudMode.ts
```typescript
export enum CrudMode {
    CREATE = 'create',
    EDIT = 'edit',
    DETAIL = 'detail'
}
```

## File: src/shared/hooks/useBaseCrud.ts
```typescript
import { ApiError, formatApiErrorMessage } from '@/shared/api/apiClient'
import { CrudMode } from '@/shared/enums/CrudMode'
import type { IEntity } from '@/shared/interfaces/Entity'
import type { IEntityStore } from '@/shared/store/EntityStore'
import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/shared/hooks/useToast'
export type CrudPayload<TForm> = TForm | FormData
export interface UseBaseCrudConfig<TEntity extends IEntity, TForm = Partial<TEntity>> {
  store: () => IEntityStore<TEntity>
  resource: {
    save?: (_data: CrudPayload<TForm>) => Promise<TEntity | { data: TEntity }>
    update?: (_id: string, _data: CrudPayload<TForm>) => Promise<TEntity | { data: TEntity }>
    delete?: (_id: string) => Promise<void | string | unknown>
    restore?: (_id: string) => Promise<void | string | unknown>
  }
  mode?: CrudMode
  entityId?: string | number
  initialData?: Partial<TEntity> | null
}
export function useBaseCrud<TEntity extends IEntity, TForm = Partial<TEntity>>(
  config: UseBaseCrudConfig<TEntity, TForm>,
) {
  const store = config.store()
  const mode = config.mode || CrudMode.CREATE
  const [formData, setFormData] = useState<Partial<TEntity>>(() => {
    return config.initialData || {}
  })
  const cleanFormData = useCallback((params: FormData): FormData => {
    const cleaned = new FormData()
    params.forEach((value, key) => {
      if (key === 'id' && typeof value === 'string' && value.trim() === '') {
        return
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
          return
        }
      }
      cleaned.append(key, value)
    })
    return cleaned
  }, [])
  useEffect(() => {
    if (config.initialData) {
      setFormData(config.initialData)
    }
  }, [config.initialData])
  const cleanParams = useCallback(
    (params: CrudPayload<TForm>): CrudPayload<TForm> => {
      if (params instanceof FormData) {
        return cleanFormData(params) as CrudPayload<TForm>
      }
      const cleaned = { ...params } as Record<string, unknown>
      if ('id' in cleaned && !cleaned.id) {
        delete cleaned.id
      }
      return cleaned as CrudPayload<TForm>
    },
    [cleanFormData],
  )
  const onSave = useCallback(
    async (data?: CrudPayload<TForm>): Promise<TEntity | null> => {
      if (!config.resource.save) return null
      store.putSaving(true)
      try {
        const saveData = data ?? (formData as unknown as CrudPayload<TForm>)
        const params = cleanParams(saveData)
        const response = await config.resource.save(params)
        const entity: TEntity =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data: TEntity }).data
            : (response as TEntity)
        if (!entity?.id) {
          (entity as TEntity & { id: string }).id = Date.now().toString()
        }
        toast.success('Registro creado exitosamente')
        store.addEntity(entity)
        store.putNotFound(false)
        return entity
      } catch (err) {
        if (err instanceof ApiError) {
          const { title, description } = formatApiErrorMessage(err)
          toast.error(title, description)
        } else {
          toast.error('No se pudo guardar. Inténtalo de nuevo.')
        }
        throw err
      } finally {
        store.putSaving(false)
      }
    },
    [formData, config.resource, store, cleanParams],
  )
  const onUpdate = useCallback(
    async (data?: CrudPayload<TForm>): Promise<TEntity | null> => {
      if (!config.resource.update) return null
      const entityId = config.entityId || store.selectId
      if (!entityId) {
        console.error('No entityId found for update')
        return null
      }
      store.putSaving(true)
      try {
        const updateData = data ?? (formData as unknown as CrudPayload<TForm>)
        const params = cleanParams(updateData)
        const response = await config.resource.update(entityId as string, params)
        const entity: TEntity =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data: TEntity }).data
            : (response as TEntity)
        const updatedEntity: TEntity = { ...entity, id: entityId } as TEntity
        store.updateEntity(updatedEntity)
        toast.success('Registro actualizado exitosamente')
        return updatedEntity
      } catch (err) {
        if (err instanceof ApiError) {
          const { title, description } = formatApiErrorMessage(err)
          toast.error(title, description)
        } else {
          toast.error('No se pudo actualizar. Inténtalo de nuevo.')
        }
        throw err
      } finally {
        store.putSaving(false)
      }
    },
    [formData, config.entityId, config.resource, store, cleanParams],
  )
  const submit = useCallback(
    async (data?: CrudPayload<TForm>): Promise<TEntity | null> => {
      if (mode === CrudMode.EDIT) {
        return onUpdate(data)
      }
      return onSave(data)
    },
    [mode, onSave, onUpdate],
  )
  const onDelete = useCallback(
    async (id?: string | number): Promise<void> => {
      if (!config.resource.delete) return
      const entityId = id || config.entityId || store.selectId
      if (!entityId) return
      store.putDeleting(true)
      try {
        await config.resource.delete(entityId as string)
        store.removeEntity(entityId)
      } finally {
        store.putDeleting(false)
      }
    },
    [config.resource, config.entityId, store],
  )
  return {
    store,
    formData,
    setFormData,
    mode,
    onSave,
    onUpdate,
    submit,
    onDelete,
    cleanParams,
  }
}
```

## File: src/shared/hooks/useInitOnce.ts
```typescript
import { useEffect, useRef } from 'react'
export const useInitOnce = (callback: () => void | Promise<void>, _key: string) => {
  const hasRun = useRef(false)
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    callbackRef.current()
  }, [])
}
```

## File: src/shared/interfaces/list.types.ts
```typescript
import type { CrudMode } from '@/shared/enums/CrudMode'
import type { IEntity } from '@/shared/interfaces/Entity'
export interface IEntityTableRowProps<T> {
    tableOnly?: boolean
    standalone?: boolean
    entity: T
    canEdit: boolean
    canDelete?: boolean
    canView?: boolean
    isLoading: boolean
    isDeleting: boolean
    isSaving: boolean
    onEdit: (_entity: T) => void
    onDelete: (_entity: T) => void
    onDetail?: (_entity: T) => void
}
export interface IEntityFormModalProps<T> {
    isOpen: boolean
    mode: CrudMode
    entity?: T | null
    onClose: () => void
    onSuccess?: (_entity: T) => void
}
export const checkMemoListProps = <T>(prevProps: Readonly<IEntityTableRowProps<T>>, nextProps: Readonly<IEntityTableRowProps<T>>) => {
    return (
        prevProps.entity === nextProps.entity &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.isDeleting === nextProps.isDeleting &&
        prevProps.isSaving === nextProps.isSaving
    )
}
export interface ISearchParams {
    id?: string
    scopes?: Scope[]
    filters?: Filter[]
    search?: Search | null
    sort?: Sort[]
    page?: number
    limit?: number
    aggregates?: Aggregate[]
    includes?: Include[]
    user_id?: string | null
    view?: string
    active?: string | boolean
}
export interface DateFilterForm extends IEntity {
    date_start: string
    date_end: string
}
export interface Scope {
    name: string
    parameters?: string[]
}
export interface Filter {
    field: string
    operator: FilterOperator
    value: unknown
    type?: string
}
export type FilterOperator =
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'like'
    | 'not_like'
    | 'in'
    | 'not_in'
    | 'between'
    | 'is_null'
    | 'is_not_null'
export interface Search {
    value: string | null
    case_sensitive?: boolean
}
export interface Sort {
    field: string
    direction?: 'asc' | 'desc'
}
export interface Aggregate {
    relation: string
    type?: string
    filters?: Filter[]
}
export interface Include {
    relation: string
    filters?: Filter[]
}
export interface IPaginationMeta {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
    path?: string
    first_page_url?: string
    last_page_url?: string
    next_page_url?: string | null
    prev_page_url?: string | null
}
export interface IPagination {
    page: number
    limit: number
    total: number
    pages: number
    per_page: number
    to?: number | null
    from?: number | null
}
```

## File: src/modules/user/schema.ts
```typescript
import type { IRole } from '@/modules/role/schema'
import type { ITenant } from '@/modules/tenant/schema'
import type { IEntity } from '@/shared/interfaces/Entity'
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from '@/shared/constants/passwordRequirements'
import { z } from 'zod'
const passwordOptional = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => !val || val.length >= PASSWORD_MIN_LENGTH,
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  )
  .refine(
    (val) => !val || PASSWORD_REGEX.test(val),
    'Debe incluir mayúscula, minúscula y número'
  )
export const userFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido paterno es requerido'),
  second_last_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('El correo debe ser válido'),
  password: passwordOptional,
  password_confirmation: z.string().optional().or(z.literal('')),
  role_id: z.string().min(1, 'El rol es requerido'),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.password_confirmation
  }
  return true
}, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
})
export interface IUser extends IEntity {
  roles?: IRole[]
  role?: IRole
  name: string
  last_name?: string
  second_last_name?: string
  full_name?: string
  phone?: string
  email: string
  email_verified_at?: string
  profile_image_url?: string
  tenant_id?: string
  role_id?: string
  tenants?: ITenant[]
}
export type UserFormValues = z.infer<typeof userFormSchema>
```

## File: src/modules/user/UserList.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserFormModal } from '@/modules/user/UserFormModal'
import { UserTableRow } from '@/modules/user/components/UserTableRow'
import { useUserList } from '@/modules/user/hooks/useUserList'
import type { IUser } from '@/modules/user/schema'
import { useUserStore } from '@/modules/user/store/userStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { DateFilterForm } from '@/shared/interfaces/list.types'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
export const UserList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useUserList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useUserStore()
  const roles = useRoles()
  useForm<DateFilterForm>({
    defaultValues: {
      date_start: '',
      date_end: '',
    },
  })
  const permissions = useMultiplePermissions({
    canCreate: 'create.user',
    canEdit: 'update.user',
    canDelete: 'delete.user',
    canReport: 'report.user',
    canRestore: 'restore.user',
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IUser | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IUser | null>(null)
  const handleCreate = useCallback(() => {
    setSelectedEntity(null)
    setModalMode(CrudMode.CREATE)
    setModalOpen(true)
  }, [])
  const handleEdit = useCallback((user: IUser) => {
    setSelectedEntity(user)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])
  const handleDeleteClick = useCallback((user: IUser) => {
    setEntityToDelete(user)
    setDeleteConfirmOpen(true)
  }, [])
  const handleDeleteConfirm = useCallback(async () => {
    if (!entityToDelete) return
    try {
      await onRemove(entityToDelete)
      setEntityToDelete(null)
      setDeleteConfirmOpen(false)
    } catch {
    }
  }, [entityToDelete, onRemove])
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedEntity(null)
  }, [])
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <PageHeader title='Usuarios' description='Gestiona los usuarios del sistema' />
        <PermissionGuard permission='create.user'>
          <Button onClick={handleCreate} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Nuevo usuario
          </Button>
        </PermissionGuard>
      </div>
      <section>
        <div className='space-y-6'>
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder='Buscar usuarios...'
          >
          </SearchList>
          <section>
            {isLoading ? (
              <div>
                <TableLoadingState />
              </div>
            ) : entities.length === 0 ? (
              <div>
                <TableEmptyState />
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        {
                          roles?.hasRole(ERoleUserSlug.SUPER_ADMIN) ? (
                            <>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Plan de suscripción</TableHead>
                            </>
                          ) : null
                        }
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className='text-right'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((user) => (
                        <UserTableRow
                          key={user.id}
                          entity={user}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canDelete}
                          isLoading={isLoading}
                          isDeleting={isDeleting}
                          isSaving={isSaving}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {entities.length > 0 && (
                  <Pagination
                    pagination={pagination}
                    onPageChanged={onPageChanged}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </section>
      <UserFormModal
        isOpen={modalOpen}
        mode={modalMode}
        entity={selectedEntity ?? undefined}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />
      <ConfirmDialog
        isOpen={deleteConfirmOpen} variant="delete" entityName={entityToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setEntityToDelete(null)
        }}
      />
    </div>
  )
}
```

## File: src/shared/auth/Session.ts
```typescript
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
export interface SessionUser {
  id: string
  email: string
  name?: string
  [key: string]: unknown
}
export interface SessionTenant {
  id: string
  name: string
  tenant_payment_type_id: string | null
  subscription_plan_id: string | null
  payment_type?: { id: string; name: string } | null
}
export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'exempt'
export interface SubscriptionState {
  status: SubscriptionStatus
  is_blocked: boolean
  is_owner: boolean
}
export interface SessionProfile {
  user: SessionUser
  abilities: string[]
  roles: ERoleUserSlug[]
  company?: Record<string, unknown> | null
  country?: Record<string, unknown> | null
  tenant?: SessionTenant | null
  subscription?: SubscriptionState | null
}
```

## File: src/main.tsx
```typescript
import App from '@/App.tsx'
import '@/index.css'
import { queryClient } from '@/shared/api/queryClient'
import { SessionProvider } from '@/shared/auth/SessionProvider'
import { PermissionsModal } from '@/shared/components/PermissionsModal'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sileo'
import 'sileo/styles.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
            <Toaster position="bottom-right" />
            <PermissionsModal />
            <App />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

## File: src/components/login-form.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSession } from '@/shared/auth/useSession'
import { toast } from '@/shared/hooks/useToast'
import { roleRoutes } from '@/shared/interfaces/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'
const loginSchema = z.object({
  email: z.string().email({ message: 'Ingresa un email válido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
})
type LoginFormData = z.infer<typeof loginSchema>
function LoginBranding() {
  return (
    <div
      className={cn(
        'relative hidden min-h-[280px] overflow-hidden rounded-r-2xl md:flex md:flex-col md:justify-center md:px-10 md:py-12 lg:px-14',
        'bg-linear-to-br from-[oklch(0.97_0.02_155)] via-[oklch(0.95_0.03_155)] to-[oklch(0.92_0.04_155)]'
      )}
      aria-hidden
    >
      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          Tu empresa lista para inspecciones y protegida legalmente.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground lg:text-base">
          Gestiona expedientes, contratos y cumplimiento documental desde un solo lugar.
        </p>
      </div>
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-32 w-32 rounded-full bg-primary/5 blur-xl" />
    </div>
  )
}
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const { login, role } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const handleLoginSubmit = loginForm.handleSubmit(async (data: LoginFormData) => {
    try {
      await login(data)
      if (role) {
        navigate(roleRoutes[role], { replace: true })
      } else {
        navigate('/clients', { replace: true })
      }
    } catch {
      toast.error({
        title: 'Error de autenticación',
        description: 'Credenciales inválidas. Revisa email y contraseña.',
      })
    }
  })
  return (
    <div className={cn('w-full max-w-4xl', className)} {...props}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid md:grid-cols-[1fr_1.2fr]">
          <form
            name="login"
            onSubmit={handleLoginSubmit}
            className="flex flex-col justify-center p-6 sm:p-8 md:p-10"
            autoComplete="on"
          >
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Bienvenido de nuevo
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accede a tu panel de cumplimiento
                </p>
              </div>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="username email"
                    placeholder="tu@empresa.com"
                    className="bg-muted/50"
                    aria-invalid={!!loginForm.formState.errors.email}
                    aria-describedby={
                      loginForm.formState.errors.email ? 'login-email-error' : undefined
                    }
                    {...loginForm.register('email')}
                    required
                  />
                  {loginForm.formState.errors.email && (
                    <FieldDescription
                      id="login-email-error"
                      className="text-destructive"
                      role="alert"
                    >
                      {loginForm.formState.errors.email.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
                    <Link
                      to="/forgot-password"
                      tabIndex={-1}
                      className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Introduce tu contraseña"
                      className="bg-muted/50"
                      aria-invalid={!!loginForm.formState.errors.password}
                      aria-describedby={
                        loginForm.formState.errors.password
                          ? 'login-password-error'
                          : undefined
                      }
                      required
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <FieldDescription
                      id="login-password-error"
                      className="text-destructive"
                      role="alert"
                    >
                      {loginForm.formState.errors.password.message}
                    </FieldDescription>
                  )}
                </Field>
                <Button
                  type="submit"
                  className="w-full font-medium"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? 'Entrando…' : 'Entrar al panel'}
                </Button>
                <FieldDescription className="text-center">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Crear cuenta
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </div>
          </form>
          <LoginBranding />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros{' '}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Términos de servicio
        </a>{' '}
        y nuestra{' '}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Política de privacidad
        </a>
        .
      </p>
    </div>
  )
}
```

## File: src/components/signup-form.tsx
```typescript
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSession } from '@/shared/auth/useSession'
import { PasswordStrength } from '@/shared/components/PasswordStrength'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_TEXT,
} from '@/shared/constants/passwordRequirements'
import { toast } from '@/shared/hooks/useToast'
import { roleRoutes } from '@/shared/interfaces/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'
const signupSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Ingresa un email válido'),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
      .regex(PASSWORD_REGEX, 'Debe incluir mayúscula, minúscula y número'),
    password_confirmation: z.string(),
    accept_terms: z
      .boolean()
      .refine((v) => v === true, {
        message: 'Debes aceptar los términos y la política de privacidad',
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })
type SignupFormData = z.infer<typeof signupSchema>
function SignupBranding() {
  return (
    <div
      className={cn(
        'relative hidden min-h-[320px] overflow-hidden rounded-r-2xl md:flex md:flex-col md:justify-center md:px-10 md:py-12 lg:px-14',
        'bg-linear-to-br from-[oklch(0.97_0.02_155)] via-[oklch(0.95_0.03_155)] to-[oklch(0.92_0.04_155)]'
      )}
      aria-hidden
    >
      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          Tu empresa lista para inspecciones y protegida legalmente.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground lg:text-base">
          Crea tu cuenta y empieza a organizar expedientes, contratos y cumplimiento en minutos.
        </p>
      </div>
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-32 w-32 rounded-full bg-primary/5 blur-xl" />
    </div>
  )
}
function SignupPasswordSection({
  form,
  showPassword,
  setShowPassword,
  showPasswordConfirmation,
  setShowPasswordConfirmation,
}: {
  form: ReturnType<typeof useForm<SignupFormData>>
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  showPasswordConfirmation: boolean
  setShowPasswordConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <>
      <Field>
        <div className="flex items-center gap-1.5">
          <FieldLabel htmlFor="signup-password">Contraseña</FieldLabel>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Requisitos de contraseña"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {PASSWORD_REQUIREMENTS_TEXT}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
            className="bg-muted/50 pr-10"
            aria-invalid={!!form.formState.errors.password}
            aria-describedby={
              form.formState.errors.password
                ? 'signup-password-error'
                : 'signup-password-strength signup-password-hint'
            }
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrength
          value={form.watch('password')}
          id="signup-password-strength"
          showLabel
        />
        <FieldDescription id="signup-password-hint">
          Mín. 8 caracteres, mayúscula, minúscula y número.
        </FieldDescription>
        {form.formState.errors.password && (
          <FieldDescription id="signup-password-error" className="text-destructive" role="alert">
            {form.formState.errors.password.message}
          </FieldDescription>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="signup-password-confirmation">Confirmar contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="signup-password-confirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            className="bg-muted/50 pr-10"
            aria-invalid={!!form.formState.errors.password_confirmation}
            aria-describedby={
              form.formState.errors.password_confirmation
                ? 'signup-password-confirmation-error'
                : undefined
            }
            {...form.register('password_confirmation')}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              showPasswordConfirmation ? 'Ocultar confirmación' : 'Mostrar confirmación'
            }
          >
            {showPasswordConfirmation ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {form.formState.errors.password_confirmation && (
          <FieldDescription
            id="signup-password-confirmation-error"
            className="text-destructive"
            role="alert"
          >
            {form.formState.errors.password_confirmation.message}
          </FieldDescription>
        )}
      </Field>
    </>
  )
}
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const { register: doRegister, role } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      accept_terms: false,
    },
  })
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await doRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      if (role) {
        navigate(roleRoutes[role], { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      toast.error({
        title: 'Error al registrarse',
        description: error instanceof Error ? error.message : 'Revisa los datos e intenta de nuevo',
      })
    }
  })
  return (
    <div className={cn('w-full max-w-4xl', className)} {...props}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid md:grid-cols-[1fr_1fr]">
          <form
            name="signup"
            onSubmit={onSubmit}
            className="flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-14"
            autoComplete="on"
          >
            <div className="mx-auto w-full max-w-md">
              <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Crear cuenta
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Completa tus datos para empezar
                </p>
              </div>
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="signup-name">Nombre completo</FieldLabel>
                  <Input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    className="bg-muted/50"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={form.formState.errors.name ? 'signup-name-error' : undefined}
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <FieldDescription
                      id="signup-name-error"
                      className="text-destructive"
                      role="alert"
                    >
                      {form.formState.errors.name.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-email">Correo electrónico</FieldLabel>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    className="bg-muted/50"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={
                      form.formState.errors.email ? 'signup-email-error' : undefined
                    }
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <FieldDescription
                      id="signup-email-error"
                      className="text-destructive"
                      role="alert"
                    >
                      {form.formState.errors.email.message}
                    </FieldDescription>
                  )}
                </Field>
                <SignupPasswordSection
                  form={form}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showPasswordConfirmation={showPasswordConfirmation}
                  setShowPasswordConfirmation={setShowPasswordConfirmation}
                />
                <Field>
                  <Controller
                    name="accept_terms"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="signup-accept-terms"
                          checked={field.value}
                          aria-invalid={!!form.formState.errors.accept_terms}
                          aria-describedby={
                            form.formState.errors.accept_terms
                              ? 'signup-accept-terms-error'
                              : undefined
                          }
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5"
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor="signup-accept-terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Acepto los{' '}
                            <a
                              href="#"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              Términos de servicio
                            </a>{' '}
                            y la{' '}
                            <a
                              href="#"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              Política de privacidad
                            </a>
                          </label>
                          {form.formState.errors.accept_terms && (
                            <FieldDescription
                              id="signup-accept-terms-error"
                              className="text-destructive"
                              role="alert"
                            >
                              {form.formState.errors.accept_terms.message}
                            </FieldDescription>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </Field>
                <Button
                  type="submit"
                  className="w-full font-medium"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </div>
          </form>
          <SignupBranding />
        </div>
      </div>
    </div>
  )
}
```

## File: src/modules/user/UserForm.tsx
```typescript
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { userFormSchema, type IUser, type UserFormValues } from '@/modules/user/schema'
import { UserResource } from '@/modules/user/services/UserResource'
import { useUserStore } from '@/modules/user/store/userStore'
import { PasswordStrength } from '@/shared/components/PasswordStrength'
import { PASSWORD_REQUIREMENTS_TEXT } from '@/shared/constants/passwordRequirements'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useBaseCrud } from '@/shared/hooks/useBaseCrud'
import { CatalogType, useCatalogs } from '@/shared/hooks/useCatalogs'
import { type IFormProps } from '@/shared/interfaces/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconEye, IconEyeOff, IconInfoCircle } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
interface PasswordFieldsProps {
  mode: CrudMode
  register: UseFormRegister<UserFormValues>
  errors: FieldErrors<UserFormValues>
  disabled: boolean
  passwordValue?: string
}
interface UserPasswordInputRowProps {
  id: string
  label: string
  showTooltip: boolean
  errorMessage?: string
  errorId: string
  show: boolean
  onToggleShow: () => void
  placeholder: string
  disabled: boolean
  name: 'password' | 'password_confirmation'
  register: UseFormRegister<UserFormValues>
}
function UserPasswordInputRow({
  id,
  label,
  showTooltip,
  errorMessage,
  errorId,
  show,
  onToggleShow,
  placeholder,
  disabled,
  name,
  register,
}: UserPasswordInputRowProps) {
  return (
    <Field>
      {showTooltip ? (
        <div className="flex items-center gap-1.5">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label="Requisitos de contraseña"
              >
                <IconInfoCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {PASSWORD_REQUIREMENTS_TEXT}
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      )}
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          className="pr-10"
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
          disabled={disabled}
          {...register(name)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          onClick={onToggleShow}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError id={errorId} role="alert">
        {errorMessage}
      </FieldError>
    </Field>
  )
}
const PasswordFields = ({
  mode,
  register,
  errors,
  disabled,
  passwordValue = '',
}: PasswordFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const passwordLabel =
    mode === CrudMode.EDIT
      ? 'Nueva contraseña (dejar vacío para no cambiar)'
      : 'Contraseña'
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <UserPasswordInputRow
          id="user-password"
          label={passwordLabel}
          showTooltip
          errorMessage={errors.password?.message}
          errorId="user-password-error"
          show={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          placeholder={
            mode === CrudMode.EDIT ? '••••••••' : 'Mín. 8 caracteres, mayúscula, minúscula y número'
          }
          disabled={disabled}
          name="password"
          register={register}
        />
        {passwordValue ? (
          <PasswordStrength
            value={passwordValue}
            id="user-password-strength"
            showLabel
          />
        ) : null}
      </div>
      <UserPasswordInputRow
        id="user-password-confirmation"
        label="Confirmar contraseña"
        showTooltip={false}
        errorMessage={errors.password_confirmation?.message}
        errorId="user-password-confirmation-error"
        show={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
        placeholder="Repetir contraseña"
        disabled={disabled}
        name="password_confirmation"
        register={register}
      />
    </div>
  )
}
interface UserFormExtendedProps extends IFormProps<IUser> {
  hideRole?: boolean
  tenantId?: string
}
export const UserForm = ({ mode, entity, onSuccess, onCancel, formId, hideRole, tenantId }: UserFormExtendedProps) => {
  const defaultValues = useMemo<UserFormValues>(() => {
    const baseDefaults: UserFormValues = {
      name: '',
      last_name: '',
      second_last_name: '',
      phone: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
    }
    if (!entity) return baseDefaults
    const role = (entity as IUser).role ?? (entity as IUser).roles?.[0]
    const roleId =
      entity.role_id ??
      role?.id ??
      (role as { uuid?: string } | undefined)?.uuid ??
      ''
    return {
      ...baseDefaults,
      ...entity,
      password: '',
      password_confirmation: '',
      role_id: roleId,
    }
  }, [entity])
  const crud = useBaseCrud<IUser, UserFormValues>({
    store: useUserStore,
    resource: {
      save: UserResource.create,
      update: UserResource.update,
      delete: UserResource.remove,
    },
    mode,
    entityId: entity?.id,
    initialData: entity,
  })
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  })
  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])
  const onFormSubmit = handleSubmit(async (values) => {
    const payload: Record<string, unknown> = { ...values }
    delete payload.password_confirmation
    if (!payload.password) {
      delete payload.password
    }
    if (tenantId) {
      payload.tenant_id = tenantId
    }
    const result = await crud.submit(payload as UserFormValues)
    if (result) {
      onSuccess?.(result)
    }
  })
  const { catalogs } = useCatalogs({
    [CatalogType.ROLE]: { _sort: 'name' },
  })
  const isSaving = crud.store.isSaving
  return (
    <form id={formId} onSubmit={onFormSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Información personal</FieldLegend>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="user-name" required>
                  Nombre
                </FieldLabel>
                <Input
                  id="user-name"
                  placeholder="Nombre"
                  {...register('name')}
                  disabled={isSaving}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel required htmlFor="user-last-name">Primer apellido</FieldLabel>
                <Input
                  id="user-last-name"
                  placeholder="Primer apellido"
                  {...register('last_name')}
                  disabled={isSaving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-second-last-name">Segundo Apellido</FieldLabel>
                <Input
                  id="user-second-last-name"
                  placeholder="Segundo Apellido"
                  {...register('second_last_name')}
                  disabled={isSaving}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="user-email" required>
                  Correo electrónico
                </FieldLabel>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register('email')}
                  disabled={isSaving}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-phone">Teléfono</FieldLabel>
                <Input
                  id="user-phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  {...register('phone')}
                  disabled={isSaving}
                />
              </Field>
            </div>
            {!hideRole && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="user-role" required>
                    Rol
                  </FieldLabel>
                  <Controller
                    name="role_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="user-role" className="w-full">
                          <SelectValue placeholder="Seleccionar rol..." />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogs[CatalogType.ROLE]?.map((item) => (
                            <SelectItem key={item.uuid as string} value={item.uuid as string}>
                              {item.description as string}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{errors.role_id?.message}</FieldError>
                </Field>
              </div>
            )}
            <PasswordFields
              mode={mode}
              register={register}
              errors={errors}
              disabled={isSaving}
              passwordValue={watch('password')}
            />
          </FieldGroup>
        </FieldSet>
        {!formId && (
          <Field orientation="horizontal" className="justify-end border-t border-gray-200 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="min-w-[80px]"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSaving} className="min-w-[100px]">
              {isSaving
                ? mode === CrudMode.EDIT
                  ? 'Actualizando...'
                  : 'Creando...'
                : mode === CrudMode.EDIT
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
```

## File: src/shared/config/appConfig.ts
```typescript
const rawPageSize = import.meta.env.VITE_PAGE_SIZE_DEFAULT ?? '20'
const resolvedPageSize = Number(rawPageSize)
const defaultApiBaseUrl =
  import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api')
export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  pageSize: Number.isFinite(resolvedPageSize) && resolvedPageSize > 0 ? resolvedPageSize : 20
} as const
```

## File: src/shared/hooks/useCatalogs.ts
```typescript
import { apiClient } from '@/shared/api/apiClient'
import type { IEntity } from '@/shared/interfaces/Entity'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
export enum CatalogType {
    USER_REGISTER_STATUS = 'user_register_status',
    USER_RISK = 'UserRisk',
    BRANCH = 'branch',
    USER_PROMOTER = 'UserPromoter',
    STATE = 'state',
    MUNICIPALITY = 'municipality',
    CREDIT = 'credit',
    CREDIT_USER_STATUS = 'CreditUserStatus',
    CREDIT_USER_PAYMENT_STATUS = 'CreditUserPaymentStatus',
    ROLE = 'role',
    COMPANY = 'company',
    INTERACTION_TYPE = 'interaction_type',
    INTERACTION_STATUS = 'interaction_status',
    JOB_POSITION = 'job_position',
    AREA = 'area',
    CONTRACT_TYPE = 'contract_type',
    DOCUMENT_TYPE = 'document_type',
    COLLABORATOR = 'collaborator',
    DOCUMENT = 'document',
    SYSTEM_TEMPLATE_FIELD = 'system_template_field',
    PERMISSION = 'permission',
    TENANT_PAYMENT_TYPE = 'tenant_payment_type',
    SUBSCRIPTION_PLAN = 'subscription_plan',
}
export interface CatalogParams {
    _sort?: string
    _limit?: number
    _search?: string
    _filters?: Record<string, unknown>
    [key: string]: unknown
}
export type CatalogRequest = {
    [_key in CatalogType]?: CatalogParams
}
export type CatalogResponse = {
    [_key in CatalogType]?: IEntity[]
}
export function useCatalogs(catalogRequest: CatalogRequest) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['catalogs', catalogRequest],
        queryFn: async () => {
            const response = await apiClient.post('/selects', catalogRequest)
            return response.data?.data || response.data || {}
        },
        staleTime: 15 * 60 * 1000,
        gcTime: 0,
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: Object.keys(catalogRequest).length > 0,
    })
    const catalogs = useMemo(() => {
        const catalogData: Partial<CatalogResponse> = {}
        Object.keys(catalogRequest).forEach(catalogType => {
            catalogData[catalogType as CatalogType] = []
        })
        if (data) {
            Object.entries(data).forEach(([catalogType, catalogItems]) => {
                if (Array.isArray(catalogItems)) {
                    catalogData[catalogType as CatalogType] = catalogItems
                }
            })
        }
        return catalogData
    }, [data, catalogRequest])
    const refetchCatalog = useCallback(async () => {
        await refetch()
    }, [refetch])
    const getCatalog = useCallback((catalogType: CatalogType): IEntity[] => {
        return catalogs[catalogType] || []
    }, [catalogs])
    const findCatalogItem = useCallback((
        catalogType: CatalogType,
        predicate: (_item: IEntity) => boolean
    ): IEntity | undefined => {
        const catalog = getCatalog(catalogType)
        return catalog.find(predicate)
    }, [getCatalog])
    const getCatalogItemById = useCallback((
        catalogType: CatalogType,
        id: string
    ): IEntity | undefined => {
        return findCatalogItem(catalogType, item => item.id === id)
    }, [findCatalogItem])
    const getCatalogItemBySlug = useCallback((
        catalogType: CatalogType,
        slug: string
    ): IEntity | undefined => {
        return findCatalogItem(catalogType, item => item.slug === slug)
    }, [findCatalogItem])
    return {
        catalogs,
        isLoading,
        isError,
        error,
        refetch,
        refetchCatalog,
        getCatalog,
        findCatalogItem,
        getCatalogItemById,
        getCatalogItemBySlug,
        catalogTypes: Object.keys(catalogRequest) as CatalogType[],
        isEmpty: Object.values(catalogs).every(catalog => !catalog || (Array.isArray(catalog) && catalog.length === 0)),
    }
}
export function useCatalog(
    catalogType: CatalogType,
    params?: CatalogParams
) {
    return useQuery({
        queryKey: ['catalog', catalogType, params],
        queryFn: async () => {
            const catalogRequest = { [catalogType]: params || {} }
            const response = await apiClient.post('/selects', catalogRequest)
            const data = response.data?.data || response.data || {}
            return data[catalogType] || []
        },
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    })
}
export function useCatalogsManual() {
    const [catalogs, setCatalogs] = useState<Partial<CatalogResponse>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Error[]>([])
    const fetchCatalogs = useCallback(async (catalogRequest: CatalogRequest) => {
        setIsLoading(true)
        setErrors([])
        try {
            const response = await apiClient.post('/selects', catalogRequest)
            const data = response.data?.data || response.data || {}
            const newCatalogs: Partial<CatalogResponse> = {}
            Object.keys(catalogRequest).forEach(catalogType => {
                newCatalogs[catalogType as CatalogType] = []
            })
            Object.entries(data).forEach(([catalogType, catalogItems]) => {
                if (Array.isArray(catalogItems)) {
                    newCatalogs[catalogType as CatalogType] = catalogItems
                }
            })
            setCatalogs(prev => ({ ...prev, ...newCatalogs }))
            return newCatalogs
        } catch (error) {
            setErrors([error as Error])
            return {}
        } finally {
            setIsLoading(false)
        }
    }, [])
    const clearCatalogs = useCallback(() => {
        setCatalogs({})
        setErrors([])
    }, [])
    return {
        catalogs,
        isLoading,
        errors,
        fetchCatalogs,
        clearCatalogs,
    }
}
```

## File: src/shared/interfaces/Entity.ts
```typescript
import type { ICompany } from '@/modules/company/schema'
import { CrudMode } from '@/shared/enums/CrudMode'
export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
    first_page_url?: string
    last_page_url?: string
    next_page_url?: string | null
    prev_page_url?: string | null
    path?: string
  }
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}
export interface IEntity {
  id: string
  name?: string
  description?: string
  include?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  media?: IMedia[]
  tenant_id?: string
  company?: ICompany
  _method?: string
  [key: string]: unknown
}
export interface IMedia {
  id: number
  uuid: string
  collection_name: string
  name: string
  file_name: string
  mime_type: string
  disk: string
  conversions_disk: string
  size: number
  manipulations: unknown[]
  custom_properties: unknown[]
  generated_conversions: unknown[]
  responsive_images: unknown[]
  order_column: number
  created_at: string
  updated_at: string
  model_type: string
  model_id: string
  original_url: string
  preview_url: string
}
export interface IFormProps<T> {
  entity?: Partial<T> | null
  mode: CrudMode
  onCancel?: () => void
  onSuccess?: (entity: T) => void
  formId?: string
}
export enum ERoleUserSlug {
  SUPER_ADMIN = 'admin.super',
  ACCOUNT_OWNER = 'account.owner',
  RH = 'admin.rh',
  COLLABORATOR = 'collaborator',
  AFFILIATE = 'affiliate',
  COMPANY_ADMIN = 'company.admin',
}
export const roleRoutes: Record<ERoleUserSlug, string> = {
  [ERoleUserSlug.SUPER_ADMIN]: '/user',
  [ERoleUserSlug.ACCOUNT_OWNER]: '/dashboard',
  [ERoleUserSlug.RH]: '/dashboard',
  [ERoleUserSlug.COLLABORATOR]: '/collaborator/me',
  [ERoleUserSlug.AFFILIATE]: '/affiliates',
  [ERoleUserSlug.COMPANY_ADMIN]: '/dashboard',
}
```

## File: src/App.tsx
```typescript
import { AccessDeniedPage } from '@/app/AccessDeniedPage'
import { DashboardLayout } from '@/app/layout/DashboardLayout'
import { PermissionRoute } from '@/app/router/PermissionRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import { SubscriptionGuard } from '@/app/router/SubscriptionGuard'
import { AcceptInvitationForm } from '@/components/accept-invitation-form'
import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { LoginForm } from '@/components/login-form'
import { ResetPasswordForm } from '@/components/reset-password-form'
import { SignupForm } from '@/components/signup-form'
import '@/index.css'
import { AdministrativeMinuteListPage } from '@/modules/administrativeMinute/AdministrativeMinuteListPage'
import { AreaListPage } from '@/modules/area/AreaListPage'
import { AuditListPage } from '@/modules/audit/AuditListPage'
import { SelectPlanPage } from '@/modules/checkoutSubscription/SelectPlanPage'
import { ClientDetailPage } from '@/modules/client/ClientDetailPage'
import { ClientListPage } from '@/modules/client/ClientListPage'
import { ClientMetadataListPage } from '@/modules/clientMetadata/ClientMetadataListPage'
import { CollaboratorDetailPage } from '@/modules/collaborator/CollaboratorDetailPage'
import { CollaboratorImportPage } from '@/modules/collaborator/CollaboratorImportPage'
import { CollaboratorListPage } from '@/modules/collaborator/CollaboratorListPage'
import { CollaboratorMePage } from '@/modules/collaborator/me/CollaboratorMePage'
import { CompanyListPage } from '@/modules/company/CompanyListPage'
import { CompanyMePage } from '@/modules/company/me/CompanyMePage'
import { ContractTypeListPage } from '@/modules/contractType/ContractTypeListPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { DocumentListPage } from '@/modules/document/DocumentListPage'
import { DocumentCollaboratorListPage } from '@/modules/documentCollaborator/DocumentCollaboratorListPage'
import { DocumentTemplateCollaboratorsPage } from '@/modules/documentTemplate/DocumentTemplateCollaboratorsPage'
import { DocumentTemplateDetailPage } from '@/modules/documentTemplate/DocumentTemplateDetailPage'
import { DocumentTemplateListPage } from '@/modules/documentTemplate/DocumentTemplateListPage'
import { DocumentTypeListPage } from '@/modules/documentType/DocumentTypeListPage'
import { InteractionListPage } from '@/modules/interaction/InteractionListPage'
import { JobPositionListPage } from '@/modules/jobPosition/JobPositionListPage'
import { NoteListPage } from '@/modules/note/NoteListPage'
import { ProjectListPage } from '@/modules/project/ProjectListPage'
import { RoleDetailPage } from '@/modules/role/RoleDetailPage'
import { RoleListPage } from '@/modules/role/RoleListPage'
import { StageListPage } from '@/modules/stage/StageListPage'
import { SubscriptionPlanListPage } from '@/modules/subscriptionPlan/SubscriptionPlanListPage'
import { TenantListPage } from '@/modules/tenant/TenantListPage'
import { TenantWizardPage } from '@/modules/tenant/TenantWizardPage'
import { ChangePlanPage } from '@/modules/user/ChangePlanPage'
import { SubscriptionPage } from '@/modules/user/SubscriptionPage'
import { UserListPage } from '@/modules/user/UserListPage'
import { useSession } from '@/shared/auth/useSession'
import { ERoleUserSlug, roleRoutes } from '@/shared/interfaces/Entity'
import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
function App() {
  const { role } = useSession();
  const roleRoute = useMemo(() => {
    return roleRoutes[role as ERoleUserSlug]
  }, [role])
  return (
    <Routes>
      {}
      <Route element={<PublicOnlyRoute />}>
        <Route
          path="/login"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-5xl">
                <LoginForm />
              </div>
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-5xl">
                <SignupForm />
              </div>
            </div>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <ForgotPasswordForm />
              </div>
            </div>
          }
        />
        <Route
          path="/auth/reset-password/:token/:email"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <ResetPasswordForm />
              </div>
            </div>
          }
        />
        <Route
          path="/auth/accept-invitation/:token"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <AcceptInvitationForm />
              </div>
            </div>
          }
        />
      </Route>
      {}
      <Route element={<ProtectedRoute />}>
        {}
        <Route path="/select-plan" element={<SelectPlanPage />} />
        {}
        <Route element={<SubscriptionGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to={roleRoute ?? '/dashboard'} replace />} />
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
            <Route element={<PermissionRoute permissionEntity="dashboard" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="/company/me" element={<CompanyMePage />} />
            <Route element={<PermissionRoute permissionEntity="company" />}>
              <Route path="/company" element={<CompanyListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="client" />}>
              <Route path="/client" element={<ClientListPage />} />
              <Route path="/client/:id" element={<ClientDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="project" />}>
              <Route path="/project" element={<ProjectListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="user" />}>
              <Route path="/user" element={<UserListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="tenant" />}>
              <Route path="/tenant" element={<TenantListPage />} />
              <Route path="/tenant/new" element={<TenantWizardPage />} />
            </Route>
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/change-plan" element={<ChangePlanPage />} />
            <Route element={<PermissionRoute permissionEntity="subscription_plan" />}>
              <Route path="/subscription-plan" element={<SubscriptionPlanListPage />} />
            </Route>
            <Route element={<PermissionRoute role={[ERoleUserSlug.SUPER_ADMIN]} />}>
              <Route path="/role" element={<RoleListPage />} />
              <Route path="/role/:id" element={<RoleDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="stage" />}>
              <Route path="/stage" element={<StageListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="note" />}>
              <Route path="/note" element={<NoteListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="interaction" />}>
              <Route path="/interaction" element={<InteractionListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="client_metadata" />}>
              <Route path="/client-metadata" element={<ClientMetadataListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="area" />}>
              <Route path="/area" element={<AreaListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document" />}>
              <Route path="/document" element={<DocumentListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_type" />}>
              <Route path="/document-type" element={<DocumentTypeListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="job_position" />}>
              <Route path="/job-position" element={<JobPositionListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="contract_type" />}>
              <Route path="/contract-type" element={<ContractTypeListPage />} />
            </Route>
            <Route path="/collaborator/me" element={<CollaboratorMePage />} />
            <Route element={<PermissionRoute permissionEntity="collaborator" />}>
              <Route path="/collaborator" element={<CollaboratorListPage />} />
              <Route path="/collaborator/import" element={<CollaboratorImportPage />} />
              <Route path="/collaborator/:id" element={<CollaboratorDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="administrative_minute" />}>
              <Route path="/administrative-minute" element={<AdministrativeMinuteListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_collaborator" />}>
              <Route path="/document-collaborator" element={<DocumentCollaboratorListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_template" />}>
              <Route path="/document-template" element={<DocumentTemplateListPage />} />
              <Route path="/document-template/:id" element={<DocumentTemplateDetailPage />} />
              <Route path="/document-template/:id/collaborators" element={<DocumentTemplateCollaboratorsPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="audit" />}>
              <Route path="/audit" element={<AuditListPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
```

## File: src/index.css
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource/geist/latin-400.css";
@import "@fontsource/geist/latin-500.css";
@import "@fontsource/geist/latin-600.css";
@import "@fontsource/geist/latin-700.css";
@custom-variant dark (&:is(.dark *));
@custom-variant dark (&:is(.dark *));
@theme inline {
  --text-base: 14px;
    --font-sans: "Geist Sans", ui-sans-serif, system-ui, sans-serif;
    --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
:root {
  --radius: 0.5rem;
  --background: oklch(1.000 0.000 0);
  --foreground: oklch(0.148 0.004 165.53208295239287);
  --card: oklch(1.000 0.000 0);
  --card-foreground: oklch(0.148 0.004 165.53208295239287);
  --popover: oklch(1.000 0.000 0);
  --popover-foreground: oklch(0.148 0.004 165.53208295239287);
  --primary: oklch(0.549 0.097 159.63135618663054);
  --primary-foreground: oklch(1.000 0.000 0);
  --secondary: oklch(0.888 0.006 170.44355814020074);
  --secondary-foreground: oklch(0.232 0.024 167.15740184274037);
  --muted: oklch(0.888 0.006 170.44355814020074);
    --muted-foreground: oklch(0.50 0.012 0);
  --accent: oklch(0.846 0.003 165.061485195223);
  --accent-foreground: oklch(0.245 0.040 159.51768656922368);
  --destructive: oklch(0.580 0.237 28.43022926835137);
  --border: oklch(0.849 0.007 170.36997246667403);
  --input: oklch(0.849 0.007 170.36997246667403);
  --ring: oklch(0.549 0.097 159.63135618663054);
  --chart-1: oklch(0.549 0.097 159.63135618663054);
  --chart-2: oklch(0.814 0.158 158.56764812939187);
  --chart-3: oklch(0.838 0.109 161.8117529018972);
  --chart-4: oklch(0.567 0.140 154.10261494965977);
  --chart-5: oklch(0.426 0.102 154.8464649104687);
  --sidebar: oklch(0.888 0.006 170.44355814020074);
  --sidebar-foreground: oklch(0.232 0.024 167.15740184274037);
  --sidebar-primary: oklch(0.549 0.097 159.63135618663054);
  --sidebar-primary-foreground: oklch(1.000 0.000 0);
  --sidebar-accent: oklch(0.846 0.003 165.061485195223);
  --sidebar-accent-foreground: oklch(0.245 0.040 159.51768656922368);
  --sidebar-border: oklch(0.849 0.007 170.36997246667403);
  --sidebar-ring: oklch(0.549 0.097 159.63135618663054);
}
.dark {
  --background: oklch(0.206 0.021 162.87823389021386);
  --foreground: oklch(0.963 0.003 165.92910884250014);
  --card: oklch(0.257 0.030 162.3860690068186);
  --card-foreground: oklch(0.963 0.003 165.92910884250014);
  --popover: oklch(0.257 0.030 162.3860690068186);
  --popover-foreground: oklch(0.963 0.003 165.92910884250014);
  --primary: oklch(0.648 0.141 156.91744339890334);
  --primary-foreground: oklch(0.963 0.003 165.92910884250014);
  --secondary: oklch(0.277 0.012 169.30779108265398);
  --secondary-foreground: oklch(0.967 0.009 170.3539530764611);
  --muted: oklch(0.277 0.012 169.30779108265398);
    --muted-foreground: oklch(0.65 0.02 0);
  --accent: oklch(0.700 0.033 163.86094521522128);
  --accent-foreground: oklch(0.970 0.016 164.70876026597404);
  --destructive: oklch(0.580 0.237 28.43022926835137);
  --border: oklch(0.388 0.027 168.4167185965618);
  --input: oklch(0.388 0.027 168.4167185965618);
  --ring: oklch(0.648 0.141 156.91744339890334);
  --chart-1: oklch(0.648 0.141 156.91744339890334);
  --chart-2: oklch(0.851 0.158 159.07526861756875);
  --chart-3: oklch(0.892 0.125 161.36446139520822);
  --chart-4: oklch(0.588 0.131 156.4050199896148);
  --chart-5: oklch(0.438 0.083 158.8623429805404);
  --sidebar: oklch(0.351 0.045 161.86639589540508);
  --sidebar-foreground: oklch(0.963 0.003 165.92910884250014);
  --sidebar-primary: oklch(0.648 0.141 156.91744339890334);
  --sidebar-primary-foreground: oklch(0.963 0.003 165.92910884250014);
  --sidebar-accent: oklch(0.700 0.033 163.86094521522128);
  --sidebar-accent-foreground: oklch(0.970 0.016 164.70876026597404);
  --sidebar-border: oklch(0.387 0.029 163.84630675636143);
  --sidebar-ring: oklch(0.648 0.141 156.91744339890334);
}
@layer base {
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  * {
    @apply border-border outline-ring/50;
  }
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  [id]:focus {
    scroll-margin-top: 4rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
table {
  th.actions {
    background-color: var(--card);
  }
  td.actions, th.actions {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0;
    padding-bottom: 0;
    text-align: right;
    position: sticky;
    right: 0;
    width: 1.25rem;
    background-color: var(--card);
    animation: shadow-on-scroll linear;
    animation-timeline: scroll(x);
    overflow: visible;
    z-index: 10;
  }
}
@keyframes shadow-on-scroll {
  0% {
    filter: drop-shadow(rgb(from #21252c r g b / 8%) -2px 10px 6px);
  }
  75% {
    filter: drop-shadow(rgb(from #21252c r g b / 8%) -2px 10px 6px);
  }
  99% {
    filter: none;
  }
}
```

## File: src/components/app-sidebar.tsx
```typescript
import {
  IconBuilding,
  IconCamera,
  IconClipboardCheck,
  IconCreditCard,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHistory,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUser,
  IconUserStar,
} from '@tabler/icons-react'
import * as React from 'react'
import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { NavItem } from '@/shared/hooks/useFilteredNavItems'
import { useFilteredNavItems } from '@/shared/hooks/useFilteredNavItems'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
const navMainItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: IconDashboard,
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH],
  },
  {
    title: 'Mi expediente',
    url: '/collaborator/me',
    icon: IconFileDescription,
    roles: [ERoleUserSlug.COLLABORATOR],
  },
  {
    title: 'Colaboradores',
    url: '/collaborator',
    icon: IconUserStar,
    permissionEntity: 'collaborator',
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
  },
  {
    title: 'Actas administrativas',
    url: '/administrative-minute',
    icon: IconClipboardCheck,
    permissionEntity: 'administrative_minute',
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
  },
  {
    title: 'Usuarios',
    url: '/user',
    icon: IconUser,
    permissionEntity: 'user',
  },
  {
    title: 'Roles',
    url: '/role',
    icon: IconSettings,
    permissionEntity: 'role',
  },
  {
    title: 'Tenants',
    url: '/tenant',
    icon: IconBuilding,
    permissionEntity: 'tenant',
  },
  {
    title: 'Planes de Suscripción',
    url: '/subscription-plan',
    icon: IconCreditCard,
    permissionEntity: 'subscription_plan',
  },
  {
    title: 'Catalogos',
    url: '#',
    icon: IconListDetails,
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH],
    items: [
      {
        title: 'Puestos de trabajo',
        url: '/job-position',
        permissionEntity: 'job_position',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Tipos de contrato',
        url: '/contract-type',
        permissionEntity: 'contract_type',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Áreas',
        url: '/area',
        permissionEntity: 'area',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Documentos',
        url: '/document',
        permissionEntity: 'document',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Tipos de documento',
        url: '/document-type',
        permissionEntity: 'document_type',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Plantillas de documento',
        url: '/document-template',
        permissionEntity: 'document_template',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
    ],
  },
   {
    title: 'Auditoría',
    url: '/audit',
    icon: IconHistory,
    permissionEntity: 'audit',
    roles: [ERoleUserSlug.SUPER_ADMIN, ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.COMPANY_ADMIN]
  },
]
const data = {
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
  ],
  documents: [
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const filteredNavMain = useFilteredNavItems(navMainItems)
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Expediente Pro</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
         {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        {data.navSecondary.length > 0 && <NavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        {<NavUser />}
      </SidebarFooter>
    </Sidebar>
  )
}
```
