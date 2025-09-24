import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { IEntityStore } from '../../../core/store/EntityStore';
import { ICategory } from '../schema';

/**
 * Category Store - TRUE SINGLETON
 * Created once and shared across all components
 */
const initialPaginationState = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    per_page: 20,
    to: null,
    from: null
};

export const useCategoryStore = create<IEntityStore<ICategory>>()(
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

            // State setters
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

            // Entity operations
            addEntity: (entity) => set(state => {
                const exists = state.entities.some(e => e.id === entity.id);
                if (exists) {
                    return {
                        entities: state.entities.map(e =>
                            e.id === entity.id ? entity : e
                        )
                    };
                }
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

            updateEntity: (entity) => set(state => ({
                entities: state.entities.map(e =>
                    e.id === entity.id ? { ...e, ...entity } : e
                )
            })),

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
                    selectId: ids.includes(state.selectId as any) ? null : state.selectId,
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
        { name: 'categories' }
    )
);
