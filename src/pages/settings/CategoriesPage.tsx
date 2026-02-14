import { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
import { logError } from '@/utils/logger';
import { SortableCategoryItem, CategoryFormModal } from '@/components/settings/categories';

const emptyForm: CategoryFormData = {
  name: '',
  color: '#EF4444',
  dispatch_station: 'none',
  show_in_pos: true,
  is_raw_material: false,
  is_active: true,
};

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

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || '#EF4444',
      dispatch_station: (category.dispatch_station as 'barista' | 'kitchen' | 'display' | 'none') || 'none',
      show_in_pos: category.show_in_pos ?? true,
      is_raw_material: category.is_raw_material ?? false,
      is_active: category.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, updates: formData });
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
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Categories</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">
              Manage product categories. Drag to reorder. Categories can be shown/hidden in POS.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            New Category
          </button>
        </div>

        {/* Body */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
              <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : categories?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
              <Tags size={48} className="opacity-30" />
              <h3 className="text-white font-semibold">No categories</h3>
              <p className="text-sm">Create your first product category.</p>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm mt-2 transition-colors hover:opacity-90"
                onClick={openCreateModal}
              >
                <Plus size={16} />
                Create Category
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={categories?.map((c) => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div>
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
        <CategoryFormModal
          isEditing={!!editingCategory}
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isSaving={createCategory.isPending || updateCategory.isPending}
        />
      )}
    </>
  );
};

export default CategoriesPage;
