import { useCallback, useMemo, useState } from 'react';
import { ICategory, CategoryFormValues } from './schema';
import { CategoryForm } from './CategoryForm';
import { Modal } from '../../shared/components/Modal';
import { CrudMode } from '../../core/enums/CrudMode';
import { CategoryResource } from './services/CategoryResource';
import { useCategoryStore } from './store/categoryStore';

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: CrudMode;
  category?: ICategory | null;
  onClose: () => void;
  onSuccess?: (category: ICategory) => void;
  onError?: (error: unknown) => void;
}

export const CategoryFormModal = ({
  isOpen,
  mode,
  category,
  onClose,
  onSuccess,
  onError
}: CategoryFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const addEntity = useCategoryStore((state) => state.addEntity);
  const updateEntity = useCategoryStore((state) => state.updateEntity);

  const handleSubmit = useCallback(async (values: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      let result: any;
      if (mode === CrudMode.EDIT && category) {
        result = await CategoryResource.update(category.id, values);
        // Update with the response data or use the category with updated values
        const updatedCategory = { ...category, ...values };
        updateEntity(updatedCategory);
      } else {
        result = await CategoryResource.create(values);
        // Add with the response data or create a temp category
        const newCategory = result.data || result || { ...values, id: Date.now().toString() };
        addEntity(newCategory);
      }
      
      onSuccess?.(result);
      onClose();
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, category, addEntity, updateEntity, onSuccess, onError, onClose]);

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
        category={initialData as ICategory}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};