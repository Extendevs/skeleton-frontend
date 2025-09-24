/**
 * Core hooks - Base functionality
 */

// List management
export { useBaseList } from './useBaseList';
export type { UseBaseListConfig } from './useBaseList';

// CRUD operations
export { useBaseCrud } from './useBaseCrud';
export type { UseBaseCrudConfig } from './useBaseCrud';

// Export types
export * from '../interfaces/list.types';
export * from '../interfaces/crud.types';
