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
