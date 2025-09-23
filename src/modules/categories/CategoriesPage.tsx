import { useCallback, useMemo, useState } from 'react';
import { Category } from './schema';
import { useCategories } from './useCategories';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryList } from './CategoryList';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { ListActions } from '../../shared/components/ListActions';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';

export const CategoriesPage = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const queryParams = useMemo(() => ({ search: debouncedSearch, page: 1, pageSize: 20 }), [debouncedSearch]);

  const categories = useCategories(queryParams);

  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const handleFormError = useCallback((error: unknown) => {
    console.error('Category operation failed', error);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditTarget(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmTarget) return;
    
    try {
      await categories.actions.remove(confirmTarget.id);
      setConfirmTarget(null);
    } catch (error) {
      handleFormError(error);
    }
  }, [confirmTarget, categories.actions, handleFormError]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
          </div>
          <ListActions
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search categories..."
            allowCreate
            createLabel="New category"
            onCreate={() => {
              setEditTarget(null);
              setIsModalOpen(true);
            }}
          />
        </div>

        <CategoryList
          categories={categories.data.list}
          isLoading={categories.state.isFetching}
          onEdit={(category) => {
            setEditTarget(category);
            setIsModalOpen(true);
          }}
          onDelete={(category) => setConfirmTarget(category)}
        />
      </section>

      <CategoryFormModal
        isOpen={isModalOpen}
        mode={editTarget ? 'edit' : 'create'}
        category={editTarget}
        onClose={handleModalClose}
        onSuccess={() => handleModalClose()}
        onError={handleFormError}
        resource={categories}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        title="Delete Category"
        description={`Are you sure you want to delete "${confirmTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={categories.state.isDeleting}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
