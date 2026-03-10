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
