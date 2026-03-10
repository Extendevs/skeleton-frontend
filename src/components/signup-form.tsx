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
