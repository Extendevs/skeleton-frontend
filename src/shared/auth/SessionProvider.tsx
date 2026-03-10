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
        /* logout handled inside validateSession */
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
