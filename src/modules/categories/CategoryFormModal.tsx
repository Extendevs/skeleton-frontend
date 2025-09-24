import { useMemo } from 'react';
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
  const initialData = useMemo(() => {
    if (mode === CrudMode.EDIT && category) {
      return {
        ...category,
        description: category.description ?? '',
        color: category.color ?? ''
      };
    }
    return {
      name: '',
      status: 'active' as const,
      displayOrder: 0,
      description: '',
      color: ''
    } satisfies Partial<ICategory>;
  }, [mode, category]);

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
      title={mode === CrudMode.EDIT ? 'Edit Category' : 'New Category'}
    >
      <CategoryForm
        mode={mode}
        category={initialData}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};