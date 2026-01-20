// Re-export mock data from centralized location
export { MOCK_CATEGORIES } from './mockCategories'

// Products mock data is still in the legacy file
// TODO: Extract MOCK_PRODUCTS to a separate JSON file for better maintainability
export { MOCK_PRODUCTS } from '../hooks/products'
