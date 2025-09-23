import { ListActions } from '../../shared/components/ListActions';
import { TableLoading } from '../../shared/components/TableLoading';
import { TableEmptyState } from '../../shared/components/TableEmptyState';
import { Category } from './schema';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export const CategoryList = ({ categories, isLoading, onEdit, onDelete }: CategoryListProps) => {
  const captionContent = isLoading ? (
    <TableLoading  />
  ) : categories.length === 0 ? (
    <TableEmptyState  />
  ) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Color</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Order</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">Actions</th>
          </tr>
        </thead>
                
        <tbody className="divide-y divide-slate-100 bg-white">
          {!isLoading && categories.length > 0 &&
            categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{category.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                <span className={category.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}>{category.status}</span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {category.color ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: category.color }} />
                    {category.color}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{category.displayOrder}</td>
              <td className="px-4 py-3 text-right text-sm">
                <ListActions
                  showSearch={false}
                  className="justify-end"
                  allowEdit={Boolean(onEdit)}
                  allowRemove={Boolean(onDelete)}
                  onEdit={() => onEdit?.(category)}
                  onRemove={() => onDelete?.(category)}
                />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {captionContent && <div className="px-4 py-3 text-left text-sm text-slate-500">{captionContent}</div>}
    </div>
  );
};
