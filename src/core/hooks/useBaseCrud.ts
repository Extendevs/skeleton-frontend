import { useState, useCallback, useEffect } from 'react';
import { IEntityStore, IEntity } from '../store/EntityStore';
import { CrudMode } from '../enums/CrudMode';

export interface UseBaseCrudConfig<T extends IEntity> {
    store: () => IEntityStore<T>;
    resource: {
        save?: (data: any) => Promise<any>;
        update?: (id: string, data: any) => Promise<any>;
        delete?: (id: string) => Promise<any>;
        restore?: (id: string) => Promise<any>;
    };
    mode?: CrudMode;
    entityId?: string | number;
    initialData?: Partial<T>;
}

/**
 * Base CRUD Hook - All CRUD logic via composition
 */
export function useBaseCrud<T extends IEntity>(config: UseBaseCrudConfig<T>) {
    const store = config.store();
    const mode = config.mode || CrudMode.CREATE;
    const [formData, setFormData] = useState<Partial<T>>(() => {
        // Initialize with provided data or empty object
        return config.initialData || {};
    });

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
        if (config.initialData) {
            setFormData(config.initialData);
        }
    }, [config.initialData]);

    // Process params before save
    const beforeSave = useCallback((params: Partial<T>): Partial<T> => {
        return params;
    }, []);

    // Clean params
    const cleanParams = useCallback((params: any) => {
        const cleaned = { ...params };
        if ('id' in cleaned && !cleaned.id) {
            delete cleaned.id;
        }
        return cleaned;
    }, []);

    // Save
    const onSave = useCallback(async (data?: Partial<T>) => {
        if (!config.resource.save) return null;

        store.putSaving(true);

        try {
            const saveData = data || formData;
            let params = beforeSave(saveData);
            params = cleanParams(params);

            const entity = await config.resource.save(params);

            store.addEntity(entity);
            store.putNotFound(false);

            return entity;
        } catch (error) {
            throw error;
        } finally {
            store.putSaving(false);
        }
    }, [formData, config.resource, store, beforeSave, cleanParams]);

    // Update
    const onUpdate = useCallback(async (data?: Partial<T>) => {
        if (!config.resource.update) return null;

        const entityId = config.entityId || store.selectId;
        if (!entityId) return null;

        store.putSaving(true);

        try {
            const updateData = data || formData;
            let params = beforeSave(updateData);
            params = cleanParams(params);

            const entity = await config.resource.update(entityId as string, params);

            store.updateEntity({ ...entity, id: entityId });

            return entity;
        } catch (error) {
            throw error;
        } finally {
            store.putSaving(false);
            store.putSelectId(null);
        }
    }, [formData, config.entityId, config.resource, store, beforeSave, cleanParams]);

    // Submit (save or update based on mode)
    const submit = useCallback(async (data?: Partial<T>) => {
        if (mode === CrudMode.EDIT) {
            return onUpdate(data);
        }
        return onSave(data);
    }, [mode, onSave, onUpdate]);

    // Delete
    const onDelete = useCallback(async (id?: string | number) => {
        if (!config.resource.delete) return;

        const entityId = id || config.entityId || store.selectId;
        if (!entityId) return;

        store.putDeleting(true);

        try {
            await config.resource.delete(entityId as string);
            store.removeEntity(entityId);
        } catch (error) {
            throw error;
        } finally {
            store.putDeleting(false);
        }
    }, [config.resource, config.entityId, store]);

    // Restore
    const onRestore = useCallback(async (id?: string | number) => {
        if (!config.resource.restore) return;

        const entityId = id || config.entityId || store.selectId;
        if (!entityId) return;

        try {
            const response = await config.resource.restore(entityId as string);
            store.updateEntity({
                id: entityId,
                deleted_at: null,
                ...response.data
            } as any);
        } catch (error) {
            throw error;
        }
    }, [config.resource, config.entityId, store]);

    return {
        // State
        store,
        formData,
        setFormData,
        mode,

        // Actions
        onSave,
        onUpdate,
        submit,
        onDelete,
        onRestore,

        // Utils
        beforeSave,
        cleanParams
    };
}
