import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type EntityId = string | number;

export interface IEntity {
    id: EntityId;
    [key: string]: any;
}

export interface IPaginationState {
    page: number;
    limit: number;
    total: number;
    pages: number;
    per_page: number;
    to: number | null;
    from: number | null;
}

export interface IEntityStore<T extends IEntity> {
    // Entities
    entities: T[];
    selectId: EntityId | null;

    // State flags
    isLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    notFound: boolean;
    initial: boolean;

    // Pagination
    pagination: IPaginationState;

    // Meta
    meta: any;

    // Methods - exactly like NgRx
    putInitial: (initial: boolean) => void;
    putSelectId: (selectId: EntityId | null) => void;
    putMeta: (meta: any) => void;
    putPagination: (pagination: Partial<IPaginationState>) => void;
    putLoading: (isLoading: boolean) => void;
    putSaving: (isSaving: boolean) => void;
    putDeleting: (isDeleting: boolean) => void;
    putNotFound: (notFound: boolean) => void;

    // Entity operations - exactly like NgRx
    addEntity: (entity: T) => void;
    addEntities: (entities: T[]) => void;
    setEntity: (entity: T) => void;
    setEntities: (entities: T[]) => void;
    setAllEntities: (entities: T[]) => void;
    updateEntity: (entity: Partial<T> & { id: EntityId }) => void;
    updateEntities: (ids: EntityId[], changes: Partial<T>) => void;
    updateAllEntities: (changes: Partial<T>) => void;
    removeEntity: (id: EntityId) => void;
    removeEntities: (ids: EntityId[]) => void;
    removeAllEntities: () => void;

    // Computed
    entity: () => T | null;

    // Reset
    reset: () => void;
}

const initialPaginationState: IPaginationState = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    per_page: 20,
    to: null,
    from: null
};

/**
 * Creates an entity store exactly like NgRx signals store
 */
export function createEntityStore<T extends IEntity>(name: string) {
    return create<IEntityStore<T>>()(
        devtools(
            (set, get) => ({
                // Initial state
                entities: [],
                selectId: null,
                isLoading: false,
                isSaving: false,
                isDeleting: false,
                notFound: false,
                initial: false,
                pagination: initialPaginationState,
                meta: null,

                // State setters - exactly like patchState in NgRx
                putInitial: (initial) => set({ initial }),
                putSelectId: (selectId) => set({ selectId }),
                putMeta: (meta) => set({ meta }),
                putPagination: (pagination) => set(state => ({
                    pagination: { ...state.pagination, ...pagination }
                })),
                putLoading: (isLoading) => set({ isLoading }),
                putSaving: (isSaving) => set({ isSaving }),
                putDeleting: (isDeleting) => set({ isDeleting }),
                putNotFound: (notFound) => set({ notFound }),

                // Entity operations - exactly like NgRx entity adapter
                addEntity: (entity) => set(state => {
                    console.log('EntityStore: addEntity called with:', entity);
                    // Check if entity already exists
                    const exists = state.entities.some(e => e.id === entity.id);
                    if (exists) {
                        console.log('EntityStore: Entity exists, updating instead');
                        // If exists, update it instead
                        return {
                            entities: state.entities.map(e =>
                                e.id === entity.id ? entity : e
                            )
                        };
                    }
                    console.log('EntityStore: Adding new entity');
                    // If new, add to the beginning
                    return {
                        entities: [entity, ...state.entities],
                        pagination: {
                            ...state.pagination,
                            total: state.pagination.total + 1
                        }
                    };
                }),

                addEntities: (entities) => set(state => ({
                    entities: [...entities, ...state.entities]
                })),

                setEntity: (entity) => set(state => {
                    const index = state.entities.findIndex(e => e.id === entity.id);
                    if (index >= 0) {
                        const newEntities = [...state.entities];
                        newEntities[index] = entity;
                        return { entities: newEntities };
                    }
                    return { entities: [entity, ...state.entities] };
                }),

                setEntities: (entities) => set(state => {
                    const entityMap = new Map(state.entities.map(e => [e.id, e]));
                    entities.forEach(entity => entityMap.set(entity.id, entity));
                    return { entities: Array.from(entityMap.values()) };
                }),

                setAllEntities: (entities) => set({ entities }),

                updateEntity: (entity) => set(state => {
                    console.log('EntityStore: updateEntity called with:', entity);
                    return {
                        entities: state.entities.map(e =>
                            e.id === entity.id ? { ...e, ...entity } : e
                        )
                    };
                }),

                updateEntities: (ids, changes) => set(state => ({
                    entities: state.entities.map(e =>
                        ids.includes(e.id) ? { ...e, ...changes } : e
                    )
                })),

                updateAllEntities: (changes) => set(state => ({
                    entities: state.entities.map(e => ({ ...e, ...changes }))
                })),

                removeEntity: (id) => set(state => ({
                    entities: state.entities.filter(e => e.id !== id),
                    selectId: state.selectId === id ? null : state.selectId,
                    pagination: {
                        ...state.pagination,
                        total: Math.max(0, state.pagination.total - 1)
                    }
                })),

                removeEntities: (ids) => set(state => {
                    const removedCount = state.entities.filter(e => ids.includes(e.id)).length;
                    return {
                        entities: state.entities.filter(e => !ids.includes(e.id)),
                        selectId: ids.includes(state.selectId as EntityId) ? null : state.selectId,
                        pagination: {
                            ...state.pagination,
                            total: Math.max(0, state.pagination.total - removedCount)
                        }
                    };
                }),

                removeAllEntities: () => set({
                    entities: [],
                    selectId: null
                }),

                // Computed
                entity: () => {
                    const state = get();
                    return state.selectId
                        ? state.entities.find(e => e.id === state.selectId) || null
                        : null;
                },

                // Reset
                reset: () => set({
                    entities: [],
                    selectId: null,
                    isLoading: false,
                    isSaving: false,
                    isDeleting: false,
                    notFound: false,
                    initial: false,
                    pagination: initialPaginationState,
                    meta: null
                })
            }),
            { name }
        )
    );
}
