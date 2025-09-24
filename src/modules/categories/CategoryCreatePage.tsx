import { CategoryForm } from './CategoryForm';
import { CrudMode } from '../../core/enums/CrudMode';

/**
 * Category Create Page - Uses hook, not class
 */
export const CategoryCreatePage = () => {
  return (
    <CategoryForm
      mode={CrudMode.CREATE}
    />
  );
};