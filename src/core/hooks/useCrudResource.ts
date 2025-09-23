import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useListManager } from './useListManager';
import { IResponseListSuccess } from '../interfaces/list.types';
import { useToast } from '../../shared/components/ToastProvider';

interface CrudMessages {
  createSuccess?: string;
  createError?: string;
  updateSuccess?: string;
  updateError?: string;
  deleteSuccess?: string;
  deleteError?: string;
}

interface UseCrudResourceOptions<TRecord, TForm, TParams> {
  resourceKey: string;
  params?: TParams;
  listFn: (params: TParams) => Promise<IResponseListSuccess<TRecord>>;
  createFn: (values: TForm) => Promise<TRecord>;
  updateFn: (id: string, values: TForm) => Promise<TRecord>;
  deleteFn: (id: string) => Promise<unknown>;
  messages?: CrudMessages;
  // Professional list management options
  useAdvancedList?: boolean;
  preserveQueryParams?: boolean;
  debounceMs?: number;
  initialPageSize?: number;
  autoFetch?: boolean;
}

/**
 * Professional CRUD Resource Hook
 * Combines list management and CRUD operations
 */
export const useCrudResource = <
  TRecord extends { id: string | number },
  TForm = Partial<TRecord>,
  TParams extends Record<string, any> = Record<string, any>
>({
  resourceKey,
  params,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  messages = {},
  useAdvancedList = false,
  preserveQueryParams = false,
  debounceMs = 400,
  initialPageSize = 20,
  autoFetch = true
}: UseCrudResourceOptions<TRecord, TForm, TParams>) => {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const {
    createSuccess = 'Created successfully',
    createError = 'Create failed',
    updateSuccess = 'Updated successfully',
    updateError = 'Update failed',
    deleteSuccess = 'Deleted successfully',
    deleteError = 'Delete failed'
  } = messages;

  // Use advanced list management if enabled
  const listManager = useAdvancedList
    ? useListManager<TRecord>(listFn, {
      resourceKey,
      autoInit: autoFetch,
      preserveQueryParams,
      debounceMs,
      defaultPageSize: initialPageSize
    })
    : null;

  // Fallback to simple query for backward compatibility
  const key = useMemo(() => [resourceKey, 'list', params] as const, [resourceKey, params]);

  const simpleQuery = useQuery({
    queryKey: key,
    queryFn: () => listFn(params as TParams),
    placeholderData: (previousData) => previousData,
    enabled: !useAdvancedList && autoFetch
  });

  // Invalidate function
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [resourceKey, 'list'] });
    if (listManager) {
      listManager.actions.refresh();
    }
  }, [queryClient, resourceKey, listManager]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: (newItem) => {
      notify({ type: 'success', title: createSuccess });

      if (listManager) {
        // Add to list manager
        listManager.addEntity(newItem);
      }

      invalidate();
    },
    onError: (error: Error) => {
      notify({
        type: 'error',
        title: createError,
        description: error.message
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TForm }) => updateFn(id, values),
    onSuccess: (updatedItem) => {
      notify({ type: 'success', title: updateSuccess });

      if (listManager) {
        // Update in list manager
        listManager.updateEntity(updatedItem.id, updatedItem);
      }

      invalidate();
    },
    onError: (error: Error) => {
      notify({
        type: 'error',
        title: updateError,
        description: error.message
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: (_, deletedId) => {
      notify({ type: 'success', title: deleteSuccess });

      if (listManager) {
        // Remove from list manager
        listManager.removeEntity(deletedId as string | number);
      }

      invalidate();
    },
    onError: (error: Error) => {
      notify({
        type: 'error',
        title: deleteError,
        description: error.message
      });
    }
  });

  // Batch delete
  const batchDelete = useCallback(async (ids: (string | number)[]) => {
    try {
      await Promise.all(ids.map(id => deleteFn(String(id))));
      notify({ type: 'success', title: `Deleted ${ids.length} items` });

      if (listManager) {
        ids.forEach(id => listManager.removeEntity(id));
        listManager.actions.deselectAll();
      }

      invalidate();
      return true;
    } catch (error) {
      notify({
        type: 'error',
        title: 'Failed to delete some items',
        description: error instanceof Error ? error.message : undefined
      });
      return false;
    }
  }, [deleteFn, notify, listManager, invalidate]);

  // Return advanced interface if using list manager
  if (useAdvancedList && listManager) {
    return {
      // List data
      data: {
        list: listManager.store.entities,
        total: listManager.store.pagination.total,
        meta: listManager.store.meta,
        pagination: listManager.store.pagination
      },

      // State
      state: {
        isLoading: listManager.store.loading,
        isFetching: listManager.store.loading,
        error: listManager.store.error,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending || listManager.store.deleting,
        notFound: listManager.store.notFound
      },

      // CRUD actions
      actions: {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        invalidate,
        batchDelete
      },

      // List management
      listManager: {
        ...listManager.actions,
        paramsSearch: listManager.paramsSearch,
        computed: listManager.computed,
        selectedIds: listManager.store.selectedIds
      }
    };
  }

  // Backward compatibility interface
  return {
    data: {
      list: (simpleQuery.data?.data ?? []) as TRecord[],
      total: simpleQuery.data?.meta?.total ?? 0
    },
    state: {
      isLoading: simpleQuery.isLoading,
      isFetching: simpleQuery.isFetching,
      error: simpleQuery.error,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isDeleting: deleteMutation.isPending
    },
    actions: {
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: deleteMutation.mutateAsync,
      invalidate
    }
  };
};

export type CrudResource<T extends { id: string | number }, TForm = Partial<T>> = ReturnType<typeof useCrudResource<T, TForm>>;