# Professional React Architecture

## Overview

This architecture is inspired by Angular's `BaseListService` and `BaseCrudService` but properly adapted to React patterns. It provides enterprise-grade list management and CRUD operations without code duplication.

## Core Hooks

### `useListManager`
Professional list management with:
- Advanced search params (filters, scopes, includes, aggregates, sort)
- Pagination with URL synchronization
- Selection management (single/multiple)
- Debounced search
- Store-like state management
- Optimistic updates

### `useCrudManager`
Professional CRUD operations with:
- Form state management
- Validation with field-level errors
- Before/after hooks for save/update
- Select data management
- Clean params processing
- Error handling with toast notifications

### `useCrudResource`
Combines list and CRUD management:
- Backward compatible with existing code
- Progressive enhancement with `useAdvancedList`
- Batch operations
- React Query integration

## Usage Examples

### Basic Usage (Backward Compatible)
```typescript
// Works exactly like before
const categories = useCategories({ 
  search: '', 
  page: 1, 
  pageSize: 20 
});

// Access data
categories.data.list
categories.state.isLoading
categories.actions.create(formData)
```

### Professional Usage with Advanced Features
```typescript
// Enable professional list management
const categories = useCategories();

// Advanced list operations
categories.listManager.search('text');
categories.listManager.addFilter({ 
  field: 'status', 
  operator: '=', 
  value: 'active' 
});
categories.listManager.setSort('name', 'asc');
categories.listManager.goToPage(2);

// Selection management
categories.listManager.toggleSelection(item);
categories.listManager.selectAll();
await categories.actions.batchDelete(
  Array.from(categories.listManager.selectedIds)
);

// URL synchronization (automatic)
// URL: /categories?page=2&search=text&sort=name,asc
```

### Using List Manager Directly
```typescript
const listManager = useListManager(fetchFn, {
  resourceKey: 'products',
  preserveQueryParams: true,
  debounceMs: 400,
  defaultPageSize: 20,
  defaultSort: { field: 'created_at', direction: 'desc' },
  transformResponse: (data) => data.map(transformItem),
  onSuccess: (data) => console.log('Loaded', data.length),
  onError: (error) => console.error('Failed', error)
});

// Advanced search params (like Angular)
listManager.actions.fetch({
  search: { value: 'laptop', case_sensitive: false },
  filters: [
    { field: 'price', operator: '>=', value: 100 },
    { field: 'category', operator: 'in', value: ['electronics', 'computers'] }
  ],
  sort: [{ field: 'price', direction: 'asc' }],
  scopes: [{ name: 'active', parameters: [] }],
  includes: [{ relation: 'manufacturer' }],
  aggregates: [{ relation: 'reviews', type: 'count' }]
});

// Pagination
listManager.actions.goToNext();
listManager.actions.setPageSize(50);

// Selection
listManager.actions.selectAll();
const selected = listManager.computed.selectedEntities;
```

### Using CRUD Manager Directly
```typescript
const crudManager = useCrudManager(
  {
    save: api.createProduct,
    update: api.updateProduct,
    delete: api.deleteProduct,
    getSelects: api.getProductSelects
  },
  {
    mode: entity ? 'edit' : 'create',
    entity,
    beforeSave: async (values) => {
      // Transform data before saving
      return { ...values, slug: generateSlug(values.name) };
    },
    afterSave: async (saved) => {
      // Redirect after save
      navigate(`/products/${saved.id}`);
    },
    messages: {
      saveSuccess: 'Product created!',
      updateSuccess: 'Product updated!'
    }
  }
);

// Form operations
crudManager.actions.setValue('name', 'New Product');
crudManager.actions.setValues({ price: 99.99, stock: 100 });

// Validation
crudManager.setValidationRules({
  name: (value) => !value ? 'Name is required' : null,
  price: (value) => value <= 0 ? 'Price must be positive' : null
});

// Save/Update
const saved = await crudManager.actions.save();
const updated = await crudManager.actions.update();

// Load select options
await crudManager.loadSelects({ 
  categories: true, 
  manufacturers: true 
});

// Access selects
crudManager.selects.categories.map(opt => (
  <option key={opt.value} value={opt.value}>
    {opt.label}
  </option>
))
```

## Creating a New Module

```typescript
// 1. Define your types
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ProductFormValues {
  name: string;
  price: number;
  category: string;
}

// 2. Create API
const productApi = createCrudApi<Product, ProductFormValues>({
  basePath: '/api/products'
});

// 3. Create hook
export const useProducts = (params?: any) => {
  const isSimple = params && 'page' in params;
  
  return useCrudResource<Product, ProductFormValues>({
    resourceKey: 'products',
    params: isSimple ? params : undefined,
    listFn: productApi.list,
    createFn: productApi.create,
    updateFn: productApi.update,
    deleteFn: productApi.remove,
    messages: {
      createSuccess: 'Product created',
      updateSuccess: 'Product updated',
      deleteSuccess: 'Product deleted'
    },
    useAdvancedList: !isSimple,
    preserveQueryParams: true
  });
};

// 4. Use in component
const ProductsPage = () => {
  const products = useProducts();
  
  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => products.listManager.search(e.target.value)}
      />
      
      <button onClick={() => products.listManager.selectAll()}>
        Select All
      </button>
      
      {products.computed.hasSelection && (
        <button onClick={() => products.actions.batchDelete(
          Array.from(products.listManager.selectedIds)
        )}>
          Delete Selected ({products.computed.selectedCount})
        </button>
      )}
      
      {products.data.list.map(product => (
        <ProductCard 
          key={product.id} 
          product={product}
          selected={products.listManager.selectedIds.has(product.id)}
          onToggle={() => products.listManager.toggleSelection(product)}
        />
      ))}
      
      <Pagination
        page={products.data.pagination.page}
        total={products.data.pagination.pages}
        onPageChange={products.listManager.setPage}
      />
    </div>
  );
};
```

## Key Principles

1. **No Code Duplication**: Generic hooks handle all common functionality
2. **Progressive Enhancement**: Start simple, add features as needed
3. **Type Safety**: Full TypeScript support with generics
4. **Backward Compatible**: Existing code continues to work
5. **Professional Patterns**: Inspired by enterprise Angular patterns
6. **React Native**: Properly adapted to React hooks and patterns
7. **Composable**: Hooks can be used together or separately

## Architecture Benefits

- **Maintainable**: Single source of truth for list/CRUD logic
- **Scalable**: Easy to add new modules without duplication
- **Testable**: Business logic separated in hooks
- **Performant**: Optimistic updates, debouncing, memoization
- **User-Friendly**: URL sync, selection persistence, loading states
- **Developer-Friendly**: Clear API, good TypeScript support, documentation
