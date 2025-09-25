import { useState, useCallback, memo, useMemo } from 'react';
import { useCategoryList } from './hooks/useCategoryList';
import { useCategoryStore } from './store/categoryStore';
import { ICategory } from './schema';
import { PageHeader } from '../../shared/components/atoms/PageHeader';
import { Button } from '../../shared/ui/button';
import { PlusIcon } from '../../shared/components/icons/Icons';
import { TableLoadingState } from '../../shared/components/molecules/TableLoadingState';
import { TableEmptyState } from '../../shared/components/molecules/TableEmptyState';
import { Pagination } from '../../shared/components/Pagination';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { CrudMode } from '../../core/enums/CrudMode';
import { SearchList } from '../../shared/components/SearchList';
import { ISearchParams } from '../../core/interfaces/list.types';
import { useMultiplePermissions } from '../../shared/hooks/usePermissions';
import { PermissionGuard } from '../../shared/components/PermissionGuard';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '../../shared/ui';
import { CategoryTableRow } from './components/CategoryTableRow';
import { useStableCallbacks } from '../../shared/hooks/useOptimizedCallbacks';

const CategoryListComponent = () => {
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
  const [entityToDelete, setEntityToDelete] = useState<ICategory | null>(null);

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
    setEntityToDelete(category);
    setDeleteConfirmOpen(true);
  }, []);

  // Optimize callbacks for list items
  const stableCallbacks = useStableCallbacks(
    handleEdit,
    handleDeleteClick,
    [handleEdit, handleDeleteClick]
  );

  // Memoize expensive computations
  const memoizedEntities = useMemo(() => entities, [entities]);
  const memoizedPermissions = useMemo(() => permissions, [permissions.canEdit, permissions.canDelete]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!entityToDelete) return;
    
    try {
      await onRemove(entityToDelete);
      setEntityToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      // Handle error silently or show toast
    }
  }, [entityToDelete, onRemove]);

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
            Nueva Categoría
          </Button>
        </PermissionGuard>
      </div>

      {/* Search Component */}
      <SearchList
        paramsSearch={paramsSearch}
        onSearch={handleSearch}
        onReset={handleSearchReset}
        placeholder="Buscar categorías..."
      >
        {/* Additional filters can be added here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select 
              name="status"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue=""
            >
              <option value="">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </SearchList>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <TableLoadingState />
        </div>
      ) : entities.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <TableEmptyState />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoizedEntities.map((category) => (
              <CategoryTableRow
                key={category.id}
                category={category}
                canEdit={memoizedPermissions.canEdit}
                canDelete={memoizedPermissions.canDelete}
                isLoading={isLoading}
                isDeleting={isDeleting}
                isSaving={isSaving}
                onEdit={stableCallbacks.onEdit}
                onDelete={stableCallbacks.onDelete}
              />
            ))}
          </TableBody>
        </Table>
      )}

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
          setEntityToDelete(null);
        }}
      />
    </div>
  );
};

// Memoized export with custom comparison
export const CategoryList = memo(CategoryListComponent, (_prevProps, _nextProps) => {
  // Since this component has no props, it only re-renders when internal state changes
  // The memo will prevent re-renders from parent components
  return false; // Always allow re-render since we depend on internal hooks
});