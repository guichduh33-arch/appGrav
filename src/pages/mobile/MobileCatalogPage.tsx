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
import type { Product, Category, ProductModifier } from '@/types/database';
import { supabase } from '@/lib/supabase';
import './MobileCatalogPage.css';

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
    <div className="mobile-catalog">
      {/* Search Bar */}
      <div className="mobile-catalog__search">
        <Search size={20} className="mobile-catalog__search-icon" />
        <input
          type="text"
          placeholder="Search a product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mobile-catalog__search-input"
        />
        {searchQuery && (
          <button
            className="mobile-catalog__search-clear"
            onClick={() => setSearchQuery('')}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mobile-catalog__categories">
        <button
          className={`mobile-catalog__category ${!selectedCategory ? 'mobile-catalog__category--active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`mobile-catalog__category ${selectedCategory === cat.id ? 'mobile-catalog__category--active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="mobile-catalog__products">
        {isLoading ? (
          <div className="mobile-catalog__loading">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="mobile-catalog__empty">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="mobile-catalog__product"
              onClick={() => handleProductSelect(product)}
            >
              <button
                className={`mobile-catalog__favorite ${isFavorite(product.id) ? 'mobile-catalog__favorite--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
              >
                <Star size={16} />
              </button>
              <div className="mobile-catalog__product-name">{product.name}</div>
              <div className="mobile-catalog__product-price">
                Rp {(product.retail_price || 0).toLocaleString('id-ID')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {cartItemCount > 0 && (
        <button
          className="mobile-catalog__cart-fab"
          onClick={() => navigate('/mobile/cart')}
        >
          <ShoppingCart size={24} />
          <span className="mobile-catalog__cart-badge">{cartItemCount}</span>
        </button>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="mobile-modal" onClick={handleCloseModal}>
          <div className="mobile-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-modal__close" onClick={handleCloseModal}>
              <X size={24} />
            </button>

            <h2>{selectedProduct.name}</h2>
            <p className="mobile-catalog__modal-price">
              Rp {(selectedProduct.retail_price || 0).toLocaleString('id-ID')}
            </p>

            {/* Modifiers */}
            {selectedProduct.modifiers.length > 0 && (
              <div className="mobile-catalog__modifiers">
                <h3>Options</h3>
                {selectedProduct.modifiers.map((mod) => (
                  <button
                    key={mod.id}
                    className={`mobile-catalog__modifier ${selectedModifiers.has(mod.id) ? 'mobile-catalog__modifier--selected' : ''}`}
                    onClick={() => handleModifierToggle(mod)}
                  >
                    <span>{mod.option_label}</span>
                    <span className="mobile-catalog__modifier-price">
                      {(mod.price_adjustment || 0) > 0 ? '+' : ''}
                      {(mod.price_adjustment || 0) !== 0
                        ? `Rp ${(mod.price_adjustment || 0).toLocaleString('id-ID')}`
                        : 'Free'}
                    </span>
                    {selectedModifiers.has(mod.id) && (
                      <Check size={16} className="mobile-catalog__modifier-check" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="mobile-catalog__notes">
              <label>Notes</label>
              <input
                type="text"
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Quantity */}
            <div className="mobile-catalog__quantity">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>
                <Plus size={20} />
              </button>
            </div>

            {/* Add Button */}
            <button className="mobile-catalog__add-btn" onClick={handleAddToOrder}>
              <Plus size={20} />
              <span>Add - Rp {calculateTotalPrice().toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
