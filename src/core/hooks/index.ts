/**
 * Professional React Hooks Architecture
 * Inspired by Angular's BaseListService and BaseCrudService
 */

// List management
export { useListManager } from './useListManager';
export type { ListManager } from './useListManager';

// CRUD management
export { useCrudManager } from './useCrudManager';
export type { CrudManager } from './useCrudManager';

// Combined CRUD + List resource
export { useCrudResource } from './useCrudResource';
export type { CrudResource } from './useCrudResource';

// Other hooks
export { useCrudSubmit } from './useCrudSubmit';

// Export types
export * from '../interfaces/list.types';
export * from '../interfaces/crud.types';
