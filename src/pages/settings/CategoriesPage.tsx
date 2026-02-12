import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  GripVertical,
  Tags,
  Monitor,
  Package,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useCategoryList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useCategoryProductCounts,
  type CategoryFormData,
} from '../../hooks/settings/useCategorySettings';
import type { Category } from '../../types/database';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

// Predefined color palette
const COLOR_PALETTE = [
  { value: '#EF4444', name: 'Red' },
  { value: '#F97316', name: 'Orange' },
  { value: '#EAB308', name: 'Yellow' },
  { value: '#22C55E', name: 'Green' },
  { value: '#14B8A6', name: 'Teal' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#6B7280', name: 'Gray' },
  { value: '#1F2937', name: 'Dark' },
];

// Dispatch stations
const DISPATCH_STATIONS: { value: 'barista' | 'kitchen' | 'display' | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'barista', label: 'Barista' },
  { value: 'display', label: 'Display' },
];

const emptyForm: CategoryFormData = {
  name: '',
  color: COLOR_PALETTE[0].value,
  dispatch_station: 'none',
  show_in_pos: true,
  is_raw_material: false,
  is_active: true,
};

// Sortable category item component
function SortableCategoryItem({
  category,
  productCount,
  onEdit,
  onDelete,
}: {
  category: Category;
  productCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
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
      className={`category-item ${!category.is_active ? 'is-inactive' : ''}`}
    >
      <div className="category-item__drag" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>

      <div
        className="category-item__color"
        style={{ backgroundColor: category.color || '#6B7280' }}
      />

      <div className="category-item__info">
        <div className="category-item__name">{category.name}</div>
        <div className="category-item__meta">
          {productCount} product{productCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="category-item__badges">
        {category.show_in_pos && (
          <span className="category-badge category-badge--pos" title="Visible in POS">
            <Monitor size={12} />
            POS
          </span>
        )}
        {category.is_raw_material && (
          <span className="category-badge category-badge--raw" title="Raw Material">
            <Package size={12} />
            Raw
          </span>
        )}
        {category.dispatch_station && category.dispatch_station !== 'none' && (
          <span className="category-badge category-badge--station">
            {category.dispatch_station}
          </span>
        )}
      </div>

      <div className="category-item__actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(category)}
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          className="btn-icon btn-icon--danger"
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

const CategoriesPage = () => {
  const { data: categories, isLoading } = useCategoryList();
  const { data: productCounts } = useCategoryProductCounts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Open create modal
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || COLOR_PALETTE[0].value,
      dispatch_station: (category.dispatch_station as 'barista' | 'kitchen' | 'display' | 'none') || 'none',
      show_in_pos: category.show_in_pos ?? true,
      is_raw_material: category.is_raw_material ?? false,
      is_active: category.is_active ?? true,
    });
    setShowModal(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: formData,
        });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(formData);
        toast.success('Category created');
      }
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving category';
      logError('Category save error:', error);
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    const count = productCounts?.[category.id] || 0;
    if (count > 0) {
      toast.error(`Cannot delete: ${count} product(s) are linked to this category`);
      return;
    }

    if (!confirm(`Delete "${category.name}"?`)) return;

    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success('Category deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting category';
      logError('Category delete error:', error);
      toast.error(message);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && categories) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      const orderedIds = reorderedCategories.map((c) => c.id);

      try {
        await reorderCategories.mutateAsync(orderedIds);
        toast.success('Order updated');
      } catch (error) {
        logError('Reorder error:', error);
        toast.error('Failed to update order');
      }
    }
  };

  return (
    <>
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title">Categories</h2>
              <p className="settings-section__description">
                Manage product categories. Drag to reorder. Categories can be shown/hidden in POS.
              </p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              New Category
            </button>
          </div>
        </div>

        <div className="settings-section__body">
          {isLoading ? (
            <div className="settings-section__loading">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          ) : categories?.length === 0 ? (
            <div className="settings-section__empty">
              <Tags size={48} />
              <h3>No categories</h3>
              <p>Create your first product category.</p>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                Create Category
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories?.map((c) => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="categories-list">
                  {categories?.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      productCount={productCounts?.[category.id] || 0}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="settings-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__header">
              <h2 className="settings-modal__title">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button className="settings-modal__close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="settings-modal__body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-palette">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`color-palette__item ${formData.color === color.value ? 'is-selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dispatch Station</label>
                <select
                  className="form-input form-select"
                  value={formData.dispatch_station}
                  onChange={(e) => setFormData({
                    ...formData,
                    dispatch_station: e.target.value as 'barista' | 'kitchen' | 'display' | 'none'
                  })}
                >
                  {DISPATCH_STATIONS.map((station) => (
                    <option key={station.value} value={station.value}>
                      {station.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.show_in_pos}
                    onChange={(e) => setFormData({ ...formData, show_in_pos: e.target.checked })}
                  />
                  <span>Show in POS</span>
                </label>
                <p className="form-hint">When enabled, this category appears in the POS product grid</p>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_raw_material}
                    onChange={(e) => setFormData({ ...formData, is_raw_material: e.target.checked })}
                  />
                  <span>Raw Material Category</span>
                </label>
                <p className="form-hint">Mark as raw material for inventory management</p>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div className="settings-modal__footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                <Save size={16} />
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesPage;
