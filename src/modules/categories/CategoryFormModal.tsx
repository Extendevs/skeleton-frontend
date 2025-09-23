import { Category } from './schema';
import { CategoryForm } from './CategoryForm';
import { Modal } from '../../shared/components/Modal';
import type { CategoriesResource } from './useCategories';

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  category?: Category | null;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
  onError?: (error: unknown) => void;
  resource: CategoriesResource;
}

export const CategoryFormModal = ({
  isOpen,
  mode,
  category,
  onClose,
  onSuccess,
  onError,
  resource
}: CategoryFormModalProps) => {
  const handleSuccess = (result: Category) => {
    onSuccess?.(result);
  };

  const handleError = (error: unknown) => {
    onError?.(error);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'edit' ? 'Edit' : 'New'} Category`}
    >
      <CategoryForm
        mode={mode}
        category={category}
        resource={resource}
        onSuccess={handleSuccess}
        onError={handleError}
        onCancel={onClose}
      />
    </Modal>
  );
};
