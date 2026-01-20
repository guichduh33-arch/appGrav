// Product-related hooks - modular exports
export { useCategories } from './useCategories'
export { useProducts, useProductList } from './useProductList'
export { useProduct, useProductWithModifiers } from './useProductDetail'
export { useProductSearch } from './useProductSearch'

// Re-export mock data for backward compatibility
export { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../useProducts'
