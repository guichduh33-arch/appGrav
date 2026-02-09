// Product-related hooks - modular exports
export { useCategories } from './useCategories'
export { useProducts, useProductList } from './useProductList'
export { useProduct, useProductWithModifiers } from './useProductDetail'
export { useProductSearch } from './useProductSearch'
export {
    useProductModifiersForPOS,
    useProductModifiersAdmin,
    useModifierEditor,
    groupModifiers,
    resolveModifiers,
    type ModifierOption,
    type ModifierGroup
} from './useProductModifiers'

export { usePOSCombos } from './useCombos'

// Re-export mock data for backward compatibility
export { MOCK_CATEGORIES } from '../../data/mockCategories'
export { MOCK_PRODUCTS } from '../../data/mockProducts'
