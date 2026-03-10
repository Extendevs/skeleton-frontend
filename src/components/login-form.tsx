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
