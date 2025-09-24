import { useState, useCallback } from 'react';
import { useCategoryList } from './hooks/useCategoryList';
import { useCategoryStore } from './store/categoryStore';
import { ICategory } from './schema';
import { PageHeader } from '../../shared/components/atoms/PageHeader';
import { Button } from '../../shared/ui/button';
import { PlusIcon } from '../../shared/components/icons/Icons';
import { TableLoading } from '../../shared/components/TableLoading';
import { TableEmptyState } from '../../shared/components/TableEmptyState';
import { ListActionButtons } from '../../shared/components/ListActionButtons';
import { Pagination } from '../../shared/components/Pagination';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { CrudMode } from '../../core/enums/CrudMode';
import { cn } from '../../shared/utils/cn';
import { SearchList } from '../../shared/components/SearchList';
import { ISearchParams } from '../../core/interfaces/list.types';
import { useMultiplePermissions } from '../../shared/hooks/usePermissions';
import { PermissionGuard } from '../../shared/components/PermissionGuard';

export const CategoryList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useCategoryList();
  const entities = useCategoryStore((state) => state.entities);
  const pagination = useCategoryStore((state) => state.pagination);
  const isLoading = useCategoryStore((state) => state.isLoading);
  const isDeleting = useCategoryStore((state) => state.isDeleting);
  const isSaving = useCategoryStore((state) => state.isSaving);


  // Verificar permisos múltiples de una vez
  const permissions = useMultiplePermissions({
    canCreate: 'create.category',
    canEdit: 'update.category',
    canDelete: 'delete.category',
    canReport: 'report.category',
    canRestore: 'restore.category'
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE);
  const [selectedEntity, setSelectedEntity] = useState<ICategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

  // Data is loaded automatically by useBaseList with autoInit: true
  // No need for manual useEffect here

  const handleCreate = useCallback(() => {
    setSelectedEntity(null);
    setModalMode(CrudMode.CREATE);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((category: ICategory) => {
    setSelectedEntity(category);
    setModalMode(CrudMode.EDIT);
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((category: ICategory) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;
    
    try {
      await onRemove(categoryToDelete);
      setCategoryToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      // Handle error silently or show toast
    }
  }, [categoryToDelete, onRemove]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEntity(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setModalOpen(false);
    setSelectedEntity(null);
  }, []);

  const handleSearch = useCallback((params: ISearchParams) => {
    onSearch(params);
  }, [onSearch]);

  const handleSearchReset = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Categories"
          total={pagination.total}
          isLoading={isLoading}
          isEmpty={entities.length === 0}
        />
        <PermissionGuard permission="create.category">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Category
          </Button>
        </PermissionGuard>
      </div>

      {/* Search Component */}
      <SearchList
        paramsSearch={paramsSearch}
        onSearch={handleSearch}
        onReset={handleSearchReset}
        placeholder="Search categories..."
      >
        {/* Additional filters can be added here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select 
              name="status"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue=""
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SearchList>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          {isLoading && (
            <caption className="px-4 py-3 text-left text-sm text-slate-500">
              <TableLoading className="!border-0 !bg-transparent !px-0 !py-0" />
            </caption>
          )}
          {!isLoading && entities.length === 0 && (
            <caption className="px-4 py-3 text-left text-sm text-slate-500">
              <TableEmptyState className="!border-0 !bg-transparent !px-0 !py-0" />
            </caption>
          )}
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Color
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Order
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!isLoading && entities.length > 0 &&
              entities.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-slate-500">{category.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        category.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      )}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {category.color ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs font-mono">{category.color}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{category.displayOrder}</td>
             <td className="px-4 py-3 text-right text-sm">
               <ListActionButtons
                 disabled={isLoading || isDeleting || isSaving}
                 dropdown={false}
                 edit={permissions.canEdit}
                 remove={permissions.canDelete}
                 onEdit={() => handleEdit(category)}
                 onRemove={() => handleDeleteClick(category)}
               />
             </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {entities.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          pageSize={pagination.per_page}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => onPageChanged(page)}
          onPageSizeChange={(size) => onPageChanged(1, size)}
        />
      )}

      <CategoryFormModal
        isOpen={modalOpen}
        mode={modalMode}
        category={selectedEntity ?? undefined}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};