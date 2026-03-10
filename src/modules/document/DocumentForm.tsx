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
