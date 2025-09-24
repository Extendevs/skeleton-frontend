import { ICategory } from './schema';
import { CategoryForm } from './CategoryForm';
import { Modal } from '../../shared/components/Modal';
import { CrudMode } from '../../core/enums/CrudMode';

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: CrudMode;
  category?: ICategory | null;
  onClose: () => void;
  onSuccess?: (category: ICategory) => void;
}

export const CategoryFormModal = ({
  isOpen,
  mode,
  category,
  onClose,
  onSuccess
}: CategoryFormModalProps) => {

  const handleSuccess = (result: ICategory) => {
    onSuccess?.(result);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === CrudMode.EDIT ? 'Editar Categoría' : 'Nueva Categoría'}
    >
      <CategoryForm
        mode={mode}
        category={category || undefined}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};