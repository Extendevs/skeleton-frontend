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
