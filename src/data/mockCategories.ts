import type { Category } from '../types/database'

// Mock categories for demo mode (matches CSV files)
export const MOCK_CATEGORIES: Category[] = [
    { id: "cat-1", name: "Speciale Latte", icon: "\ud83e\udd5b", color: "#D4A574", sort_order: 1, is_active: true },
    { id: "cat-2", name: "Sourdough Breads", icon: "\ud83c\udf5e", color: "#8B4513", sort_order: 2, is_active: true },
    { id: "cat-3", name: "Savouries", icon: "\ud83e\udd67", color: "#45B39D", sort_order: 3, is_active: true },
    { id: "cat-4", name: "Sandwiches Baguette", icon: "\ud83e\udd6a", color: "#F4A460", sort_order: 4, is_active: true },
    { id: "cat-5", name: "Bagel", icon: "\ud83e\udd6f", color: "#D4A574", sort_order: 5, is_active: true },
    { id: "cat-6", name: "Cake", icon: "\ud83c\udf82", color: "#FAD7A0", sort_order: 6, is_active: true },
    { id: "cat-7", name: "Individual Pastries", icon: "\ud83c\udf70", color: "#FAD7A0", sort_order: 7, is_active: true },
    { id: "cat-8", name: "Classic Breads", icon: "\ud83d\udce6", color: "#64748b", sort_order: 8, is_active: true },
    { id: "cat-9", name: "Others Viennoiserie", icon: "\ud83e\uddc1", color: "#F5CBA7", sort_order: 9, is_active: true },
    { id: "cat-10", name: "Simple Plate", icon: "\ud83c\udf7d\ufe0f", color: "#45B39D", sort_order: 10, is_active: true },
    { id: "cat-11", name: "HASIL BOHEMI", icon: "\ud83c\udffe", color: "#64748b", sort_order: 11, is_active: true },
    { id: "cat-12", name: "Panini", icon: "\ud83d\udd25", color: "#EB984E", sort_order: 12, is_active: true },
    { id: "cat-13", name: "Classic Viennoiserie", icon: "\ud83e\udd50", color: "#E8B4B8", sort_order: 13, is_active: true },
    { id: "cat-14", name: "Buns", icon: "\ud83e\udd6f", color: "#D4A574", sort_order: 14, is_active: true },
    { id: "cat-15", name: "Special Drinks", icon: "\ud83e\udd64", color: "#4A90A4", sort_order: 15, is_active: true },
    { id: "cat-16", name: "Classic Sandwiches", icon: "\ud83e\udd6a", color: "#F4A460", sort_order: 16, is_active: true },
    { id: "cat-17", name: "Other drinks", icon: "\ud83e\udd64", color: "#4A90A4", sort_order: 17, is_active: true },
    { id: "cat-18", name: "Savoury Croissant", icon: "\ud83e\udd50", color: "#E8B4B8", sort_order: 18, is_active: true },
    { id: "cat-19", name: "Coffee", icon: "\u2615", color: "#6F4E37", sort_order: 19, is_active: true },
] as Category[]
