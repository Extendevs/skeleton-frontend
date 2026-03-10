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
