import { GripVertical, Edit2, Trash2, Monitor, Package } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '@/types/database';

interface SortableCategoryItemProps {
  category: Category;
  productCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function SortableCategoryItem({
  category,
  productCount,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
        !category.is_active ? 'opacity-50' : ''
      }`}
    >
      {/* Drag handle */}
      <div
        className="cursor-grab text-[var(--theme-text-muted)] hover:text-white active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      {/* Color dot */}
      <div
        className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white/10"
        style={{ backgroundColor: category.color || '#6B7280' }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{category.name}</div>
        <div className="text-xs text-[var(--theme-text-muted)]">
          {productCount} product{productCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5">
        {category.show_in_pos && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
            title="Visible in POS"
          >
            <Monitor size={10} />
            POS
          </span>
        )}
        {category.is_raw_material && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400"
            title="Raw Material"
          >
            <Package size={10} />
            Raw
          </span>
        )}
        {category.dispatch_station && category.dispatch_station !== 'none' && (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-sky-500/10 text-sky-400">
            {category.dispatch_station}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => onEdit(category)}
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onDelete(category)}
          title="Delete"
          disabled={productCount > 0}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default SortableCategoryItem;
