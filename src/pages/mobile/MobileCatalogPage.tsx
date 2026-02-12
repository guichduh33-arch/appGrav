/**
 * Mobile Catalog Page
 * Story 6.2 - Mobile Product Catalog
 *
 * Product catalog optimized for mobile with offline support.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Star,
  Plus,
  X,
  Minus,
  Check,
} from 'lucide-react';
import { useMobileStore, type IMobileOrderItem } from '@/stores/mobileStore';
import { useOfflineData } from '@/hooks/useOfflineData';
import { cn } from '@/lib/utils';
import type { Product, Category, ProductModifier } from '@/types/database';
import { supabase } from '@/lib/supabase';

/**
 * Product with modifiers for selection
 */
interface IProductWithModifiers extends Product {
  modifiers: ProductModifier[];
}

/**
 * Mobile Catalog Page Component
 */
export default function MobileCatalogPage() {
  const navigate = useNavigate();
  const { currentOrder, addItem, isFavorite, toggleFavorite, extendSession } = useMobileStore();
  const { products: offlineProducts, categories: offlineCategories } = useOfflineData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<IProductWithModifiers | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Map<string, ProductModifier>>(new Map());
  const [notes, setNotes] = useState('');

  // Extend session on activity
  useEffect(() => {
    extendSession();
  }, [extendSession]);

  // Load products (from offline or online)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Use offline data if available
      if (offlineProducts && offlineProducts.length > 0 && offlineCategories && offlineCategories.length > 0) {
        setProducts(offlineProducts as unknown as Product[]);
        setCategories(offlineCategories as unknown as Category[]);
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .in('product_type', ['finished', 'semi_finished'])
            .order('name'),
          supabase
            .from('categories')
            .select('*')
            .order('name'),
        ]);

        if (productsRes.data) setProducts(productsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
      } catch (error) {
        console.error('[MobileCatalog] Error loading data:', error);
      }

      setIsLoading(false);
    };

    loadData();
  }, [offlineProducts, offlineCategories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Load product modifiers when selected
  const handleProductSelect = useCallback(async (product: Product) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Load modifiers
    const { data: modifiers } = await supabase
      .from('product_modifiers')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true);

    setSelectedProduct({
      ...product,
      modifiers: modifiers || [],
    });
    setQuantity(1);
    setSelectedModifiers(new Map());
    setNotes('');
  }, []);

  // Handle modifier toggle
  const handleModifierToggle = useCallback((modifier: ProductModifier) => {
    setSelectedModifiers((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(modifier.id)) {
        newMap.delete(modifier.id);
      } else {
        newMap.set(modifier.id, modifier);
      }
      return newMap;
    });
  }, []);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.retail_price || 0;
    const modifiersTotal = Array.from(selectedModifiers.values()).reduce(
      (sum, m) => sum + (m.price_adjustment || 0),
      0
    );
    return (basePrice + modifiersTotal) * quantity;
  }, [selectedProduct, selectedModifiers, quantity]);

  // Add to order
  const handleAddToOrder = useCallback(() => {
    if (!selectedProduct) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }

    const modifiersArray = Array.from(selectedModifiers.values()).map((m) => ({
      id: m.id,
      name: m.option_label,
      priceAdjustment: m.price_adjustment || 0,
    }));

    const item: IMobileOrderItem = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.retail_price || 0,
      modifiers: modifiersArray,
      notes,
      totalPrice: calculateTotalPrice(),
    };

    addItem(item);
    setSelectedProduct(null);
  }, [selectedProduct, selectedModifiers, quantity, notes, calculateTotalPrice, addItem]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // Cart item count
  const cartItemCount = currentOrder?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="relative p-4 bg-white border-b border-border">
        <Search size={20} className="absolute left-[calc(1rem+12px)] top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search a product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 px-4 pl-10 border border-border rounded-xl text-base min-h-11 focus:outline-none focus:border-primary"
        />
        {searchQuery && (
          <button
            className="absolute right-[calc(1rem+8px)] top-1/2 -translate-y-1/2 bg-transparent border-none text-muted-foreground cursor-pointer p-1"
            onClick={() => setSearchQuery('')}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-1 py-2 px-4 bg-white overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
        <button
          className={cn(
            'shrink-0 py-1 px-4 border rounded-full text-sm cursor-pointer transition-all duration-150 min-h-9',
            !selectedCategory
              ? 'bg-primary border-primary text-white'
              : 'bg-secondary border-border text-muted-foreground'
          )}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              'shrink-0 py-1 px-4 border rounded-full text-sm cursor-pointer transition-all duration-150 min-h-9',
              selectedCategory === cat.id
                ? 'bg-primary border-primary text-white'
                : 'bg-secondary border-border text-muted-foreground'
            )}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2 content-start">
        {isLoading ? (
          <div className="col-span-2 text-center p-8 text-muted-foreground">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-2 text-center p-8 text-muted-foreground">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="relative bg-white border border-border rounded-xl p-4 cursor-pointer transition-all duration-150 min-h-[88px] active:bg-secondary active:scale-[0.98]"
              onClick={() => handleProductSelect(product)}
            >
              <button
                className={cn(
                  'absolute top-1 right-1 bg-transparent border-none cursor-pointer p-1',
                  isFavorite(product.id) ? 'text-warning' : 'text-muted'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
              >
                <Star size={16} />
              </button>
              <div className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</div>
              <div className="text-sm text-primary font-semibold">
                Rp {(product.retail_price || 0).toLocaleString('id-ID')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {cartItemCount > 0 && (
        <button
          className="fixed bottom-[calc(72px+1rem+env(safe-area-inset-bottom,0px))] right-4 w-14 h-14 bg-primary border-none rounded-full text-white shadow-lg cursor-pointer flex items-center justify-center transition-all duration-150 z-50 active:scale-95"
          onClick={() => navigate('/mobile/cart')}
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold py-0.5 px-1.5 rounded-full min-w-5 text-center">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end z-[1000] animate-[fadeIn_0.2s_ease]"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full bg-white rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-slide-up max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-transparent border-none text-muted-foreground cursor-pointer p-1"
              onClick={handleCloseModal}
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-center">{selectedProduct.name}</h2>
            <p className="text-xl font-semibold text-primary mt-1 mb-6">
              Rp {(selectedProduct.retail_price || 0).toLocaleString('id-ID')}
            </p>

            {/* Modifiers */}
            {selectedProduct.modifiers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Options</h3>
                {selectedProduct.modifiers.map((mod) => (
                  <button
                    key={mod.id}
                    className={cn(
                      'flex items-center gap-2 w-full py-2 px-4 border rounded-md mb-1 cursor-pointer transition-all duration-150 min-h-12',
                      selectedModifiers.has(mod.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-secondary border-border'
                    )}
                    onClick={() => handleModifierToggle(mod)}
                  >
                    <span>{mod.option_label}</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {(mod.price_adjustment || 0) > 0 ? '+' : ''}
                      {(mod.price_adjustment || 0) !== 0
                        ? `Rp ${(mod.price_adjustment || 0).toLocaleString('id-ID')}`
                        : 'Free'}
                    </span>
                    {selectedModifiers.has(mod.id) && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-muted-foreground mb-1 uppercase">Notes</label>
              <input
                type="text"
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full py-2 px-4 border border-border rounded-md text-base"
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                className="w-11 h-11 flex items-center justify-center bg-secondary border border-border rounded-full cursor-pointer transition-all duration-150 active:bg-primary active:text-white active:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold min-w-10 text-center">{quantity}</span>
              <button
                className="w-11 h-11 flex items-center justify-center bg-secondary border border-border rounded-full cursor-pointer transition-all duration-150 active:bg-primary active:text-white active:border-primary"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Add Button */}
            <button
              className="flex items-center justify-center gap-2 w-full p-4 bg-primary border-none rounded-xl text-white text-lg font-semibold cursor-pointer transition-all duration-150 active:opacity-90"
              onClick={handleAddToOrder}
            >
              <Plus size={20} />
              <span>Add - Rp {calculateTotalPrice().toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
