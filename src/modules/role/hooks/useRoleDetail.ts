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
