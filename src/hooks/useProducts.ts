import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, Product, ProductWithCategory } from '../types/database'

// --- MOCK DATA FOR DEMO MODE (Matches CSV Files exactly) ---
export const MOCK_CATEGORIES = [
    {
        "id": "cat-1",
        "name": "Speciale Latte",
        "icon": "🥛",
        "color": "#D4A574",
        "sort_order": 1,
        "is_active": true
    },
    {
        "id": "cat-2",
        "name": "Sourdough Breads",
        "icon": "🍞",
        "color": "#8B4513",
        "sort_order": 2,
        "is_active": true
    },
    {
        "id": "cat-3",
        "name": "Savouries",
        "icon": "🥧",
        "color": "#45B39D",
        "sort_order": 3,
        "is_active": true
    },
    {
        "id": "cat-4",
        "name": "Sandwiches Baguette",
        "icon": "🥪",
        "color": "#F4A460",
        "sort_order": 4,
        "is_active": true
    },
    {
        "id": "cat-5",
        "name": "Bagel",
        "icon": "🥯",
        "color": "#D4A574",
        "sort_order": 5,
        "is_active": true
    },
    {
        "id": "cat-6",
        "name": "Cake",
        "icon": "🎂",
        "color": "#FAD7A0",
        "sort_order": 6,
        "is_active": true
    },
    {
        "id": "cat-7",
        "name": "Individual Pastries",
        "icon": "🍰",
        "color": "#FAD7A0",
        "sort_order": 7,
        "is_active": true
    },
    {
        "id": "cat-8",
        "name": "Classic Breads",
        "icon": "📦",
        "color": "#64748b",
        "sort_order": 8,
        "is_active": true
    },
    {
        "id": "cat-9",
        "name": "Others Viennoiserie",
        "icon": "🧁",
        "color": "#F5CBA7",
        "sort_order": 9,
        "is_active": true
    },
    {
        "id": "cat-10",
        "name": "Simple Plate",
        "icon": "🍽️",
        "color": "#45B39D",
        "sort_order": 10,
        "is_active": true
    },
    {
        "id": "cat-11",
        "name": "HASIL BOHEMI",
        "icon": "🏺",
        "color": "#64748b",
        "sort_order": 11,
        "is_active": true
    },
    {
        "id": "cat-12",
        "name": "Panini",
        "icon": "🔥",
        "color": "#EB984E",
        "sort_order": 12,
        "is_active": true
    },
    {
        "id": "cat-13",
        "name": "Classic Viennoiserie",
        "icon": "🥐",
        "color": "#E8B4B8",
        "sort_order": 13,
        "is_active": true
    },
    {
        "id": "cat-14",
        "name": "Buns",
        "icon": "🥯",
        "color": "#D4A574",
        "sort_order": 14,
        "is_active": true
    },
    {
        "id": "cat-15",
        "name": "Special Drinks",
        "icon": "🥤",
        "color": "#4A90A4",
        "sort_order": 15,
        "is_active": true
    },
    {
        "id": "cat-16",
        "name": "Classic Sandwiches",
        "icon": "🥪",
        "color": "#F4A460",
        "sort_order": 16,
        "is_active": true
    },
    {
        "id": "cat-17",
        "name": "Other drinks",
        "icon": "🥤",
        "color": "#4A90A4",
        "sort_order": 17,
        "is_active": true
    },
    {
        "id": "cat-18",
        "name": "Savoury Croissant",
        "icon": "🥐",
        "color": "#E8B4B8",
        "sort_order": 18,
        "is_active": true
    },
    {
        "id": "cat-19",
        "name": "Coffee",
        "icon": "☕",
        "color": "#6F4E37",
        "sort_order": 19,
        "is_active": true
    }
] as Category[];

export const MOCK_PRODUCTS = [
    {
        "id": "p-0",
        "sku": "SKU-0",
        "name": "Caramel Latte (Hot,Fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-1",
        "sku": "SKU-1",
        "name": "Caramel Latte (Hot,oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-2",
        "sku": "SKU-2",
        "name": "Caramel Latte (Ice,fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-3",
        "sku": "SKU-3",
        "name": "Caramel Latte (Ice,Oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-4",
        "sku": "SKU-4",
        "name": "Vanilla Latte (Hot,Fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689022e068c37.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-5",
        "sku": "SKU-5",
        "name": "Vanilla Latte (Hot,oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689022e068c37.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-6",
        "sku": "SKU-6",
        "name": "Vanilla Latte (Ice,fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689022e068c37.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-7",
        "sku": "SKU-7",
        "name": "Vanilla Latte (Ice,Oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689022e068c37.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-8",
        "sku": "SKU-8",
        "name": "Hazelnut Latte (Hot,Fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-9",
        "sku": "SKU-9",
        "name": "Hazelnut Latte (Hot,oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-10",
        "sku": "SKU-10",
        "name": "Hazelnut Latte (Ice,fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-11",
        "sku": "SKU-11",
        "name": "Hazelnut Latte (Ice,Oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-12",
        "sku": "SKU-12",
        "name": "Chocolate latte (Hot,Fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689024170ecc5.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-13",
        "sku": "SKU-13",
        "name": "Chocolate latte (Hot,oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689024170ecc5.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-14",
        "sku": "SKU-14",
        "name": "Chocolate latte (Ice,fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689024170ecc5.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-15",
        "sku": "SKU-15",
        "name": "Chocolate latte (Ice,Oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689024170ecc5.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-16",
        "sku": "SKU-16",
        "name": "Matcha Latte (Hot,Fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-17",
        "sku": "SKU-17",
        "name": "Matcha Latte (Hot,oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-18",
        "sku": "SKU-18",
        "name": "Matcha Latte (Ice,fresh milk)",
        "category_id": "cat-1",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-19",
        "sku": "SKU-19",
        "name": "Matcha Latte (Ice,Oat milk)",
        "category_id": "cat-1",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg",
        "category": {
            "id": "cat-1",
            "name": "Speciale Latte",
            "icon": "🥛",
            "color": "#D4A574",
            "sort_order": 1,
            "is_active": true
        }
    },
    {
        "id": "p-20",
        "sku": "SKU-20",
        "name": "White Sourdough Small",
        "category_id": "cat-2",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f8ba29244.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-21",
        "sku": "SKU-21",
        "name": "White sourdough medium",
        "category_id": "cat-2",
        "retail_price": 52000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a03825a385.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-22",
        "sku": "SKU-22",
        "name": "White poolish small",
        "category_id": "cat-2",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b32bc162af.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-23",
        "sku": "SKU-23",
        "name": "White Poolish Bread Medium",
        "category_id": "cat-2",
        "retail_price": 52000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b32636d8fc.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-24",
        "sku": "SKU-24",
        "name": "Vegetarian Quiche",
        "category_id": "cat-3",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ff134c78c.jpg",
        "category": {
            "id": "cat-3",
            "name": "Savouries",
            "icon": "🥧",
            "color": "#45B39D",
            "sort_order": 3,
            "is_active": true
        }
    },
    {
        "id": "p-25",
        "sku": "SKU-25",
        "name": "Vegetarian Baguette Sandwich",
        "category_id": "cat-4",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f87099207.jpg",
        "category": {
            "id": "cat-4",
            "name": "Sandwiches Baguette",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 4,
            "is_active": true
        }
    },
    {
        "id": "p-26",
        "sku": "SKU-26",
        "name": "Vegetarian Bagel",
        "category_id": "cat-5",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f82316781.jpg",
        "category": {
            "id": "cat-5",
            "name": "Bagel",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 5,
            "is_active": true
        }
    },
    {
        "id": "p-27",
        "sku": "SKU-27",
        "name": "Tropical Fruit Cake 24CM",
        "category_id": "cat-6",
        "retail_price": 350000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a1374f3552.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-28",
        "sku": "SKU-28",
        "name": "Tropical Fruit Cake 16cm",
        "category_id": "cat-6",
        "retail_price": 250000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a13c571d25.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-29",
        "sku": "SKU-29",
        "name": "Tropical Fruit Cake",
        "category_id": "cat-7",
        "retail_price": 47000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a05d6aecca.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-30",
        "sku": "SKU-30",
        "name": "Toast Bread",
        "category_id": "cat-8",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7fc34a67.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-31",
        "sku": "SKU-31",
        "name": "Strawberry tartelette",
        "category_id": "cat-7",
        "retail_price": 45000,
        "image_url": null,
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-32",
        "sku": "SKU-32",
        "name": "Strawberry Cheesecakes Big 24cm",
        "category_id": "cat-6",
        "retail_price": 400000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a118a70d76.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-33",
        "sku": "SKU-33",
        "name": "Strawberry Cheesecake Small 16cm",
        "category_id": "cat-6",
        "retail_price": 250000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a10a9b437e.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-34",
        "sku": "SKU-34",
        "name": "Strawberry Cheesecake",
        "category_id": "cat-7",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b862d40d9d.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-35",
        "sku": "SKU-35",
        "name": "Smoky Fish",
        "category_id": "cat-5",
        "retail_price": 85000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0088b2c4b.jpg",
        "category": {
            "id": "cat-5",
            "name": "Bagel",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 5,
            "is_active": true
        }
    },
    {
        "id": "p-36",
        "sku": "SKU-36",
        "name": "Small Brioche",
        "category_id": "cat-9",
        "retail_price": 15000,
        "image_url": null,
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-37",
        "sku": "SKU-37",
        "name": "Small Baguette Poolish",
        "category_id": "cat-8",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a09c14f5e5.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-38",
        "sku": "SKU-38",
        "name": "Small baguette",
        "category_id": "cat-8",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a08f01b6e8.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-39",
        "sku": "SKU-39",
        "name": "Salade Special",
        "category_id": "cat-10",
        "retail_price": 48000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7cca1680.jpg",
        "category": {
            "id": "cat-10",
            "name": "Simple Plate",
            "icon": "🍽️",
            "color": "#45B39D",
            "sort_order": 10,
            "is_active": true
        }
    },
    {
        "id": "p-40",
        "sku": "SKU-40",
        "name": "Rye Sourdough Small",
        "category_id": "cat-2",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7a713ad5.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-41",
        "sku": "SKU-41",
        "name": "Rye sourdough medium",
        "category_id": "cat-2",
        "retail_price": 52000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f77d95b0d.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-42",
        "sku": "SKU-42",
        "name": "Pizza Slice",
        "category_id": "cat-3",
        "retail_price": 22000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f73cc3606.jpg",
        "category": {
            "id": "cat-3",
            "name": "Savouries",
            "icon": "🥧",
            "color": "#45B39D",
            "sort_order": 3,
            "is_active": true
        }
    },
    {
        "id": "p-43",
        "sku": "SKU-43",
        "name": "Passion Fruit Jam",
        "category_id": "cat-11",
        "retail_price": 110000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0aa723667.jpeg",
        "category": {
            "id": "cat-11",
            "name": "HASIL BOHEMI",
            "icon": "🏺",
            "color": "#64748b",
            "sort_order": 11,
            "is_active": true
        }
    },
    {
        "id": "p-44",
        "sku": "SKU-44",
        "name": "Paris-Brest",
        "category_id": "cat-7",
        "retail_price": 47000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0597c567b.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-45",
        "sku": "SKU-45",
        "name": "Panini 3 cheese",
        "category_id": "cat-12",
        "retail_price": 90000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f6d4e0a37.jpg",
        "category": {
            "id": "cat-12",
            "name": "Panini",
            "icon": "🔥",
            "color": "#EB984E",
            "sort_order": 12,
            "is_active": true
        }
    },
    {
        "id": "p-46",
        "sku": "SKU-46",
        "name": "Opera Cake Small",
        "category_id": "cat-6",
        "retail_price": 250000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11e1b9c7d.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-47",
        "sku": "SKU-47",
        "name": "Opera Cake Big",
        "category_id": "cat-6",
        "retail_price": 420000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11d6163fb.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-48",
        "sku": "SKU-48",
        "name": "Opera",
        "category_id": "cat-7",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ffbc22b8f.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-49",
        "sku": "SKU-49",
        "name": "Omelette",
        "category_id": "cat-10",
        "retail_price": 65000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f3fcde747.jpg",
        "category": {
            "id": "cat-10",
            "name": "Simple Plate",
            "icon": "🍽️",
            "color": "#45B39D",
            "sort_order": 10,
            "is_active": true
        }
    },
    {
        "id": "p-50",
        "sku": "SKU-50",
        "name": "New york Roll Strawberry",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0728cfa62.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-51",
        "sku": "SKU-51",
        "name": "New York Roll Plain",
        "category_id": "cat-9",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a07a483e19.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-52",
        "sku": "SKU-52",
        "name": "New york Roll pistaccio",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a071c6c8a8.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-53",
        "sku": "SKU-53",
        "name": "New york Roll Chocolat",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0703bf5b3.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-54",
        "sku": "SKU-54",
        "name": "New york Roll Caramel",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a076ae8e13.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-55",
        "sku": "SKU-55",
        "name": "Mini Toast Bread",
        "category_id": "cat-8",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f6605af2e.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-56",
        "sku": "SKU-56",
        "name": "Mini Croissant",
        "category_id": "cat-13",
        "retail_price": 15000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f63b180fd.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-57",
        "sku": "SKU-57",
        "name": "Mini Chocolatine",
        "category_id": "cat-13",
        "retail_price": 20000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f61790b5f.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-58",
        "sku": "SKU-58",
        "name": "mini choco almond",
        "category_id": "cat-13",
        "retail_price": 20000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f5f361330.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-59",
        "sku": "SKU-59",
        "name": "Mini burger buns",
        "category_id": "cat-14",
        "retail_price": 8500,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a1cf301d.jpg",
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-60",
        "sku": "SKU-60",
        "name": "Mini Almond Croissant",
        "category_id": "cat-13",
        "retail_price": 20000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f53f9ec54.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-61",
        "sku": "SKU-61",
        "name": "Meat Quiche",
        "category_id": "cat-3",
        "retail_price": 47000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0c863c484.jpg",
        "category": {
            "id": "cat-3",
            "name": "Savouries",
            "icon": "🥧",
            "color": "#45B39D",
            "sort_order": 3,
            "is_active": true
        }
    },
    {
        "id": "p-62",
        "sku": "SKU-62",
        "name": "Madelaine",
        "category_id": "cat-9",
        "retail_price": 10000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f5c837b26.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-63",
        "sku": "SKU-63",
        "name": "Lemon Meringue Pie 24cm",
        "category_id": "cat-6",
        "retail_price": 350000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a1390e0460.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-64",
        "sku": "SKU-64",
        "name": "Lemon Meringue Pie 16cm",
        "category_id": "cat-6",
        "retail_price": 250000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a13cb6716c.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-65",
        "sku": "SKU-65",
        "name": "Lemon Meringue Pie",
        "category_id": "cat-7",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a05270fcd6.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-66",
        "sku": "SKU-66",
        "name": "Lemon cheesecake 24cm",
        "category_id": "cat-6",
        "retail_price": 400000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11217df5d.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-67",
        "sku": "SKU-67",
        "name": "Lemon cheesecake",
        "category_id": "cat-7",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0d90918d5.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-68",
        "sku": "SKU-68",
        "name": "Kombucha",
        "category_id": "cat-15",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b80aa430cb.jpg",
        "category": {
            "id": "cat-15",
            "name": "Special Drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 15,
            "is_active": true
        }
    },
    {
        "id": "p-69",
        "sku": "SKU-69",
        "name": "Italian Panini",
        "category_id": "cat-12",
        "retail_price": 85000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a045346c42.jpg",
        "category": {
            "id": "cat-12",
            "name": "Panini",
            "icon": "🔥",
            "color": "#EB984E",
            "sort_order": 12,
            "is_active": true
        }
    },
    {
        "id": "p-70",
        "sku": "SKU-70",
        "name": "Hot Dog sandwich",
        "category_id": "cat-16",
        "retail_price": 55000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0283d0271.jpg",
        "category": {
            "id": "cat-16",
            "name": "Classic Sandwiches",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 16,
            "is_active": true
        }
    },
    {
        "id": "p-71",
        "sku": "SKU-71",
        "name": "Hot Dog buns",
        "category_id": "cat-14",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a01a0de548.jpg",
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-72",
        "sku": "SKU-72",
        "name": "Granola",
        "category_id": "cat-11",
        "retail_price": 116000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0cd3602ff.jpeg",
        "category": {
            "id": "cat-11",
            "name": "HASIL BOHEMI",
            "icon": "🏺",
            "color": "#64748b",
            "sort_order": 11,
            "is_active": true
        }
    },
    {
        "id": "p-73",
        "sku": "SKU-73",
        "name": "Fresh Juice (ORANGE)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-74",
        "sku": "SKU-74",
        "name": "Fresh Juice (MANGGO)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-75",
        "sku": "SKU-75",
        "name": "Fresh Juice (WATERMELON)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-76",
        "sku": "SKU-76",
        "name": "Fresh Juice (LIME)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-77",
        "sku": "SKU-77",
        "name": "Fresh Juice (STRAWBERRY)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-78",
        "sku": "SKU-78",
        "name": "Fresh Juice (PINNEAPPLE)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-79",
        "sku": "SKU-79",
        "name": "Fresh Juice (BANANA)",
        "category_id": "cat-17",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-80",
        "sku": "SKU-80",
        "name": "Frenchy",
        "category_id": "cat-4",
        "retail_price": 90000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0235ed414.jpg",
        "category": {
            "id": "cat-4",
            "name": "Sandwiches Baguette",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 4,
            "is_active": true
        }
    },
    {
        "id": "p-81",
        "sku": "SKU-81",
        "name": "French Fries",
        "category_id": "cat-18",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a08a76f8d1.jpg",
        "category": {
            "id": "cat-18",
            "name": "Savoury Croissant",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 18,
            "is_active": true
        }
    },
    {
        "id": "p-82",
        "sku": "SKU-82",
        "name": "Egg Benedict",
        "category_id": "cat-10",
        "retail_price": 75000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f59f2538a.jpg",
        "category": {
            "id": "cat-10",
            "name": "Simple Plate",
            "icon": "🍽️",
            "color": "#45B39D",
            "sort_order": 10,
            "is_active": true
        }
    },
    {
        "id": "p-83",
        "sku": "SKU-83",
        "name": "Dulce praline Tartelette",
        "category_id": "cat-7",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687afc12e7a26.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-84",
        "sku": "SKU-84",
        "name": "Dark Choco Peanut Butter",
        "category_id": "cat-11",
        "retail_price": 110000,
        "image_url": null,
        "category": {
            "id": "cat-11",
            "name": "HASIL BOHEMI",
            "icon": "🏺",
            "color": "#64748b",
            "sort_order": 11,
            "is_active": true
        }
    },
    {
        "id": "p-85",
        "sku": "SKU-85",
        "name": "Danish Raisin",
        "category_id": "cat-13",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a04390b1c7.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-86",
        "sku": "SKU-86",
        "name": "Crunchy Peanut Butter",
        "category_id": "cat-11",
        "retail_price": 75000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0c94d06e9.jpg",
        "category": {
            "id": "cat-11",
            "name": "HASIL BOHEMI",
            "icon": "🏺",
            "color": "#64748b",
            "sort_order": 11,
            "is_active": true
        }
    },
    {
        "id": "p-87",
        "sku": "SKU-87",
        "name": "Cruffin",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a013fd26b1.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-88",
        "sku": "SKU-88",
        "name": "Croque-Monsieur",
        "category_id": "cat-3",
        "retail_price": 37000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a00ef08b3c.jpg",
        "category": {
            "id": "cat-3",
            "name": "Savouries",
            "icon": "🥧",
            "color": "#45B39D",
            "sort_order": 3,
            "is_active": true
        }
    },
    {
        "id": "p-89",
        "sku": "SKU-89",
        "name": "Croissant Nutella",
        "category_id": "cat-9",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f575aa4b3.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-90",
        "sku": "SKU-90",
        "name": "Croissant Almond",
        "category_id": "cat-13",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879feb536ea0.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-91",
        "sku": "SKU-91",
        "name": "Croissant",
        "category_id": "cat-13",
        "retail_price": 25000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fe7ace724.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-92",
        "sku": "SKU-92",
        "name": "Croffel",
        "category_id": "cat-9",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a060e95670.jpg",
        "category": {
            "id": "cat-9",
            "name": "Others Viennoiserie",
            "icon": "🧁",
            "color": "#F5CBA7",
            "sort_order": 9,
            "is_active": true
        }
    },
    {
        "id": "p-93",
        "sku": "SKU-93",
        "name": "Countryside Sourdough Small",
        "category_id": "cat-2",
        "retail_price": 42000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b2f06ee657.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-94",
        "sku": "SKU-94",
        "name": "Countryside sourdough medium",
        "category_id": "cat-2",
        "retail_price": 52000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b2f1382f7e.jpg",
        "category": {
            "id": "cat-2",
            "name": "Sourdough Breads",
            "icon": "🍞",
            "color": "#8B4513",
            "sort_order": 2,
            "is_active": true
        }
    },
    {
        "id": "p-95",
        "sku": "SKU-95",
        "name": "Ciabatta",
        "category_id": "cat-14",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a09f3cdf82.jpg",
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-96",
        "sku": "SKU-96",
        "name": "Chocolatine Almond",
        "category_id": "cat-13",
        "retail_price": 32000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fc6780f56.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-97",
        "sku": "SKU-97",
        "name": "Chocolatine",
        "category_id": "cat-13",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879feda899eb.jpg",
        "category": {
            "id": "cat-13",
            "name": "Classic Viennoiserie",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 13,
            "is_active": true
        }
    },
    {
        "id": "p-98",
        "sku": "SKU-98",
        "name": "Chocolat Pie",
        "category_id": "cat-7",
        "retail_price": 47000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0520dd9ab.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-99",
        "sku": "SKU-99",
        "name": "Chocolat Cloud",
        "category_id": "cat-7",
        "retail_price": 22000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0d0490aa3.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-100",
        "sku": "SKU-100",
        "name": "Choco Pie 24cm",
        "category_id": "cat-6",
        "retail_price": 350000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a14dca0872.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-101",
        "sku": "SKU-101",
        "name": "Choco Pie 16cm",
        "category_id": "cat-6",
        "retail_price": 250000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a107517afc.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-102",
        "sku": "SKU-102",
        "name": "Chicken Curry Panini",
        "category_id": "cat-12",
        "retail_price": 85000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0468e8d05.jpg",
        "category": {
            "id": "cat-12",
            "name": "Panini",
            "icon": "🔥",
            "color": "#EB984E",
            "sort_order": 12,
            "is_active": true
        }
    },
    {
        "id": "p-103",
        "sku": "SKU-103",
        "name": "Chicken Banh Mi",
        "category_id": "cat-4",
        "retail_price": 85000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fde9b12db.jpg",
        "category": {
            "id": "cat-4",
            "name": "Sandwiches Baguette",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 4,
            "is_active": true
        }
    },
    {
        "id": "p-104",
        "sku": "SKU-104",
        "name": "Chicken Baguette Sandwich",
        "category_id": "cat-4",
        "retail_price": 85000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fe2c3f679.jpg",
        "category": {
            "id": "cat-4",
            "name": "Sandwiches Baguette",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 4,
            "is_active": true
        }
    },
    {
        "id": "p-105",
        "sku": "SKU-105",
        "name": "Cheesy Brie",
        "category_id": "cat-5",
        "retail_price": 70000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fd8767785.jpg",
        "category": {
            "id": "cat-5",
            "name": "Bagel",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 5,
            "is_active": true
        }
    },
    {
        "id": "p-106",
        "sku": "SKU-106",
        "name": "Burger Buns",
        "category_id": "cat-14",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fcbc7f322.jpg",
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-107",
        "sku": "SKU-107",
        "name": "Burger",
        "category_id": "cat-16",
        "retail_price": 100000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a01cc6b01e.jpg",
        "category": {
            "id": "cat-16",
            "name": "Classic Sandwiches",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 16,
            "is_active": true
        }
    },
    {
        "id": "p-108",
        "sku": "SKU-108",
        "name": "Brown Bread",
        "category_id": "cat-8",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a002076c8d.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-109",
        "sku": "SKU-109",
        "name": "Breakery Cloud",
        "category_id": "cat-7",
        "retail_price": 20000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ff7b3189f.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-110",
        "sku": "SKU-110",
        "name": "Black Forest",
        "category_id": "cat-7",
        "retail_price": 48000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a04dd63a07.jpg",
        "category": {
            "id": "cat-7",
            "name": "Individual Pastries",
            "icon": "🍰",
            "color": "#FAD7A0",
            "sort_order": 7,
            "is_active": true
        }
    },
    {
        "id": "p-111",
        "sku": "SKU-111",
        "name": "Black Burger Buns gr",
        "category_id": "cat-14",
        "retail_price": 10000,
        "image_url": null,
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-112",
        "sku": "SKU-112",
        "name": "Black  Forest Small 18cm",
        "category_id": "cat-6",
        "retail_price": 300000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a104523352.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-113",
        "sku": "SKU-113",
        "name": "Black  Forest BIG 24cm",
        "category_id": "cat-6",
        "retail_price": 400000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a125ce45dd.jpg",
        "category": {
            "id": "cat-6",
            "name": "Cake",
            "icon": "🎂",
            "color": "#FAD7A0",
            "sort_order": 6,
            "is_active": true
        }
    },
    {
        "id": "p-114",
        "sku": "SKU-114",
        "name": "Beef Cheese Croissant",
        "category_id": "cat-18",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f3a62df21.jpg",
        "category": {
            "id": "cat-18",
            "name": "Savoury Croissant",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 18,
            "is_active": true
        }
    },
    {
        "id": "p-115",
        "sku": "SKU-115",
        "name": "Banh Mi Croissant",
        "category_id": "cat-18",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fff45e02c.jpg",
        "category": {
            "id": "cat-18",
            "name": "Savoury Croissant",
            "icon": "🥐",
            "color": "#E8B4B8",
            "sort_order": 18,
            "is_active": true
        }
    },
    {
        "id": "p-116",
        "sku": "SKU-116",
        "name": "Baguette Poolish 280gr",
        "category_id": "cat-8",
        "retail_price": 24000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a00b7ec31c.jpg",
        "category": {
            "id": "cat-8",
            "name": "Classic Breads",
            "icon": "📦",
            "color": "#64748b",
            "sort_order": 8,
            "is_active": true
        }
    },
    {
        "id": "p-117",
        "sku": "SKU-117",
        "name": "Bagels",
        "category_id": "cat-14",
        "retail_price": 12000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f4d542680.jpg",
        "category": {
            "id": "cat-14",
            "name": "Buns",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 14,
            "is_active": true
        }
    },
    {
        "id": "p-118",
        "sku": "SKU-118",
        "name": "American Sandwich",
        "category_id": "cat-4",
        "retail_price": 100000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f498af0dd.jpg",
        "category": {
            "id": "cat-4",
            "name": "Sandwiches Baguette",
            "icon": "🥪",
            "color": "#F4A460",
            "sort_order": 4,
            "is_active": true
        }
    },
    {
        "id": "p-119",
        "sku": "SKU-119",
        "name": "American Bagel",
        "category_id": "cat-5",
        "retail_price": 70000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f46e546ed.jpg",
        "category": {
            "id": "cat-5",
            "name": "Bagel",
            "icon": "🥯",
            "color": "#D4A574",
            "sort_order": 5,
            "is_active": true
        }
    },
    {
        "id": "p-120",
        "sku": "SKU-120",
        "name": "Almond Butter",
        "category_id": "cat-11",
        "retail_price": 140000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0ca461747.jpg",
        "category": {
            "id": "cat-11",
            "name": "HASIL BOHEMI",
            "icon": "🏺",
            "color": "#64748b",
            "sort_order": 11,
            "is_active": true
        }
    },
    {
        "id": "p-121",
        "sku": "SKU-121",
        "name": "Tea (Early grey,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-122",
        "sku": "SKU-122",
        "name": "Tea (Early grey,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-123",
        "sku": "SKU-123",
        "name": "Tea (Green,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-124",
        "sku": "SKU-124",
        "name": "Tea (Green,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-125",
        "sku": "SKU-125",
        "name": "Tea (Jasmin,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-126",
        "sku": "SKU-126",
        "name": "Tea (Jasmin,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-127",
        "sku": "SKU-127",
        "name": "Tea (English breakfasty,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-128",
        "sku": "SKU-128",
        "name": "Tea (English breakfast,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-129",
        "sku": "SKU-129",
        "name": "Tea (Ginger lemon,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-130",
        "sku": "SKU-130",
        "name": "Tea (Ginger lemon,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-131",
        "sku": "SKU-131",
        "name": "Tea (Darjheling,hot)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-132",
        "sku": "SKU-132",
        "name": "Tea (Darjheling,ice)",
        "category_id": "cat-17",
        "retail_price": 35000,
        "image_url": null,
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-133",
        "sku": "SKU-133",
        "name": "Piccolo",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0ab0d371c.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-134",
        "sku": "SKU-134",
        "name": "Moka latte (Hot,Fresh milk)",
        "category_id": "cat-19",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b841762ed4.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-135",
        "sku": "SKU-135",
        "name": "Moka latte (Hot,oat milk)",
        "category_id": "cat-19",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b841762ed4.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-136",
        "sku": "SKU-136",
        "name": "Moka latte (Ice,fresh milk)",
        "category_id": "cat-19",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b841762ed4.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-137",
        "sku": "SKU-137",
        "name": "Moka latte (Ice,Oat milk)",
        "category_id": "cat-19",
        "retail_price": 60000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b841762ed4.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-138",
        "sku": "SKU-138",
        "name": "Milk shake (ORANGE)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-139",
        "sku": "SKU-139",
        "name": "Milk shake (MANGGO)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-140",
        "sku": "SKU-140",
        "name": "Milk shake (WATERMELON)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-141",
        "sku": "SKU-141",
        "name": "Milk shake (LIME)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-142",
        "sku": "SKU-142",
        "name": "Milk shake (STRAWBERRY)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-143",
        "sku": "SKU-143",
        "name": "Milk shake (PINNEAPPLE)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-144",
        "sku": "SKU-144",
        "name": "Milk shake (Chocolat)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-145",
        "sku": "SKU-145",
        "name": "Milk shake (BANANA)",
        "category_id": "cat-17",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg",
        "category": {
            "id": "cat-17",
            "name": "Other drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 17,
            "is_active": true
        }
    },
    {
        "id": "p-146",
        "sku": "SKU-146",
        "name": "Long Black (HOT)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b8518a3096.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-147",
        "sku": "SKU-147",
        "name": "Long Black (ICE)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b8518a3096.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-148",
        "sku": "SKU-148",
        "name": "Latte (Hot,Fresh milk)",
        "category_id": "cat-19",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b84279f70b.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-149",
        "sku": "SKU-149",
        "name": "Latte (Hot,oat milk)",
        "category_id": "cat-19",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b84279f70b.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-150",
        "sku": "SKU-150",
        "name": "Latte (Ice,fresh milk)",
        "category_id": "cat-19",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b84279f70b.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-151",
        "sku": "SKU-151",
        "name": "Latte (Ice,Oat milk)",
        "category_id": "cat-19",
        "retail_price": 50000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b84279f70b.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-152",
        "sku": "SKU-152",
        "name": "Flat white (Hot,Fresh milk)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b814c1445a.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-153",
        "sku": "SKU-153",
        "name": "Flat white (Hot,oat milk)",
        "category_id": "cat-19",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b814c1445a.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-154",
        "sku": "SKU-154",
        "name": "Flat white (Ice,fresh milk)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b814c1445a.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-155",
        "sku": "SKU-155",
        "name": "Flat white (Ice,Oat milk)",
        "category_id": "cat-19",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b814c1445a.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-156",
        "sku": "SKU-156",
        "name": "Expresso",
        "category_id": "cat-19",
        "retail_price": 25000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b7f0e0c067.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-157",
        "sku": "SKU-157",
        "name": "Double expresso",
        "category_id": "cat-19",
        "retail_price": 30000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b7ef9701ab.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-158",
        "sku": "SKU-158",
        "name": "Capuccino (Hot,Fresh milk)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-159",
        "sku": "SKU-159",
        "name": "Capuccino (Hot,oat milk)",
        "category_id": "cat-19",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-160",
        "sku": "SKU-160",
        "name": "Capuccino (Ice,fresh milk)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-161",
        "sku": "SKU-161",
        "name": "Capuccino (Ice,Oat milk)",
        "category_id": "cat-19",
        "retail_price": 45000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-162",
        "sku": "SKU-162",
        "name": "Babyccino",
        "category_id": "cat-19",
        "retail_price": 25000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b8a4b56e.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-163",
        "sku": "SKU-163",
        "name": "Americano (hot)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b2c69a9c.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-164",
        "sku": "SKU-164",
        "name": "Americano (ICED)",
        "category_id": "cat-19",
        "retail_price": 35000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b2c69a9c.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-165",
        "sku": "SKU-165",
        "name": "Affogato",
        "category_id": "cat-19",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b47bcd17.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    },
    {
        "id": "p-166",
        "sku": "SKU-166",
        "name": "Ginger soda",
        "category_id": "cat-15",
        "retail_price": 40000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b807c2aa1c.jpg",
        "category": {
            "id": "cat-15",
            "name": "Special Drinks",
            "icon": "🥤",
            "color": "#4A90A4",
            "sort_order": 15,
            "is_active": true
        }
    },
    {
        "id": "p-167",
        "sku": "SKU-167",
        "name": "Coffee Bean Pack 250gr",
        "category_id": "cat-19",
        "retail_price": 150000,
        "image_url": "https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0f4047838.jpg",
        "category": {
            "id": "cat-19",
            "name": "Coffee",
            "icon": "☕",
            "color": "#6F4E37",
            "sort_order": 19,
            "is_active": true
        }
    }
];

// Fetch all categories
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async (): Promise<Category[]> => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_raw_material', false)
                    .eq('is_active', true)
                    .order('sort_order')

                if (error) throw error
                if (data && data.length > 0) return data

                console.warn('No categories from Supabase, using mock')
                return MOCK_CATEGORIES
            } catch (err) {
                console.error('Error loading categories:', err)
                return MOCK_CATEGORIES
            }
        },
    })
}

// Fetch products (optionally filtered by category)
export function useProducts(categoryId: string | null = null) {
    return useQuery({
        queryKey: ['products', categoryId],
        queryFn: async (): Promise<ProductWithCategory[]> => {
            try {
                let query = supabase
                    .from('products')
                    .select('*, category:categories(*)')
                    .eq('pos_visible', true)
                    .eq('available_for_sale', true)
                    .eq('is_active', true)
                    .order('name')

                if (categoryId) {
                    query = query.eq('category_id', categoryId)
                }

                const { data, error } = await query

                if (error) throw error
                if (data && data.length > 0) return data as ProductWithCategory[]

                console.warn('No products from Supabase, using mock')
                // Filter mock by category if provided
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            } catch (err) {
                console.error('Error loading products:', err)
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            }
        },
    })
}

// Fetch single product with modifiers
export function useProductWithModifiers(productId: string) {
    return useQuery({
        queryKey: ['product', productId, 'modifiers'],
        queryFn: async () => {
            // Get product
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('id', productId)
                .single()

            if (productError || !product) throw productError || new Error('Product not found')

            // Get modifiers (by product_id or category_id)
            const { data: modifiers, error: modifiersError } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('is_active', true)
                .or(`product_id.eq.${productId},category_id.eq.${product.category_id}`)
                .order('group_sort_order')
                .order('option_sort_order')

            if (modifiersError) throw modifiersError

            return {
                product,
                modifiers: modifiers || [],
            }
        },
        enabled: !!productId,
    })
}

// Search products
export function useProductSearch(query: string) {
    return useQuery({
        queryKey: ['products', 'search', query],
        queryFn: async (): Promise<Product[]> => {
            if (!query.trim()) return []

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('pos_visible', true)
                .eq('available_for_sale', true)
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .limit(20)

            if (error) throw error
            return data || []
        },
        enabled: query.length >= 2,
    })
}
