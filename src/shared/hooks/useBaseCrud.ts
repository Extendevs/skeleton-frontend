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

/**
 * Base CRUD Hook - All CRUD logic via composition
 * TEntity = API entity type (what the store holds)
 * TForm   = form payload type (what save/update receive). Defaults to Partial<TEntity>.
 */
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
