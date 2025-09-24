# Categories Module - React Hooks Architecture

## ✅ Architecture with React Hooks (NOT Classes)

Este módulo usa **hooks y composición**, como debe ser en React.

```
EntityStore          <- Store con todos los métodos NgRx
    ↓
useBaseList          <- Hook base con toda la lógica de listados
useBaseCrud          <- Hook base con toda la lógica CRUD
    ↓
useCategoryList      <- Compone useBaseList con config específica
useCategoryCrud      <- Compone useBaseCrud con config específica
```

## 📝 Crear un Nuevo Módulo (Products)

### 1. Store (1 línea)
```typescript
// products/store/productStore.ts
export const useProductStore = createEntityStore<Product>('products');
```

### 2. Resource API (2 líneas)
```typescript
// products/services/ProductResource.ts
export const ProductResource = createCrudApi<Product>({ 
  basePath: '/products' 
});
```

### 3. List Hook (5 líneas)
```typescript
// products/hooks/useProductList.ts
export function useProductList() {
  return useBaseList<Product>({
    store: useProductStore,
    resource: ProductResource,
    initialSearch: {
      sort: [{ field: 'name', direction: 'asc' }]
    }
  });
}
```

### 4. CRUD Hooks (10 líneas)
```typescript
// products/hooks/useProductCrud.ts
export function useProductCreate() {
  return useBaseCrud<Product>({
    store: useProductStore,
    resource: ProductResource,
    mode: 'create',
    initialData: { name: '', price: 0 }
  });
}

export function useProductEdit(id: string) {
  return useBaseCrud<Product>({
    store: useProductStore,
    resource: ProductResource,
    mode: 'edit',
    entityId: id
  });
}
```

### 5. List Page (15 líneas)
```typescript
export const ProductsListPage = () => {
  const { store, onPageChanged, onRemove } = useProductList();

  return (
    <div>
      <h1>Products ({store.pagination.total})</h1>
      
      <ProductList
        products={store.entities}
        isLoading={store.isLoading}
        onEdit={(p) => store.putSelectId(p.id)}
        onDelete={onRemove}
      />
      
      {/* Pagination */}
      <button onClick={() => onPageChanged(store.pagination.page - 1)}>
        Previous
      </button>
    </div>
  );
};
```

### 6. Create Page (5 líneas)
```typescript
export const ProductCreatePage = () => {
  const crud = useProductCreate();
  return <ProductForm crud={crud} mode="create" />;
};
```

## 🎯 Base Hooks API

### useBaseList Hook
```typescript
const {
  store,              // EntityStore instance
  paramsSearch,       // Current search params
  setParamsSearch,    // Update search params
  getList,           // Fetch data
  onSearch,          // Search with params  
  onReset,           // Reset search
  onPageChanged,     // Change page
  onRemove,          // Delete entity
  onRestore          // Restore entity
} = useBaseList({
  store: useEntityStore,
  resource: ResourceAPI,
  autoInit: true,
  initialSearch: { ... }
});
```

### useBaseCrud Hook
```typescript
const {
  store,              // EntityStore instance
  formData,          // Form state
  setFormData,       // Update form state
  mode,              // 'create' | 'edit'
  onSave,            // Create entity
  onUpdate,          // Update entity
  submit,            // Save or Update based on mode
  onDelete,          // Delete entity
  onRestore          // Restore entity
} = useBaseCrud({
  store: useEntityStore,
  resource: ResourceAPI,
  mode: 'create',
  entityId: id,
  initialData: { ... }
});
```

## 🚀 Store Methods (Inherited)

### State Management
- `putInitial(initial)`
- `putSelectId(id)`
- `putMeta(meta)`
- `putPagination(pagination)`
- `putLoading(loading)`
- `putSaving(saving)`
- `putNotFound(notFound)`

### Entity Operations (NgRx style)
- `addEntity(entity)`
- `addEntities(entities)`
- `setEntity(entity)`
- `setEntities(entities)`
- `setAllEntities(entities)`
- `updateEntity(entity)`
- `updateEntities(ids, changes)`
- `removeEntity(id)`
- `removeEntities(ids)`
- `removeAllEntities()`

## ✅ Benefits

1. **React Idiomatic**: Uses hooks, not classes
2. **Composition**: Compose base hooks with specific config
3. **Minimal Code**: ~40 lines for complete CRUD
4. **Type Safe**: Full TypeScript support
5. **Predictable**: Same API across all modules
6. **NgRx Pattern**: Store methods match NgRx signals

## 📊 Total Lines for New Module

- Store: 1 line
- Resource: 2 lines
- List Hook: 5 lines
- CRUD Hooks: 10 lines
- List Page: 15 lines
- Create Page: 5 lines

**Total: ~40 lines for complete CRUD module**

## 🔥 React Way vs Class Way

### ❌ Wrong (Classes in React)
```typescript
class CategoryListService extends BaseListService {
  constructor() { ... }
}
const service = new CategoryListService();
```

### ✅ Correct (Hooks in React)
```typescript
function useCategoryList() {
  return useBaseList({ ... });
}
const { store, onRemove } = useCategoryList();
```