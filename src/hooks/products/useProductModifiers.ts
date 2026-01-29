import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ProductModifier } from '../../types/database'

// ============================================================================
// Types
// ============================================================================

export interface ModifierOption {
    id: string           // option_id from DB
    dbId?: string        // UUID from database (for updates)
    label: string        // option_label
    icon?: string        // option_icon (emoji)
    priceAdjustment: number
    isDefault: boolean
    sortOrder: number
}

export interface ModifierGroup {
    name: string         // group_name
    type: 'single' | 'multiple'
    required: boolean
    sortOrder: number
    options: ModifierOption[]
    isInherited?: boolean  // True if from category, false if product-specific
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Groups flat database rows into structured modifier groups
 */
export function groupModifiers(rawModifiers: ProductModifier[]): ModifierGroup[] {
    const groupMap = new Map<string, ModifierGroup>()

    for (const mod of rawModifiers) {
        const groupKey = mod.group_name

        if (!groupMap.has(groupKey)) {
            groupMap.set(groupKey, {
                name: mod.group_name,
                type: mod.group_type as 'single' | 'multiple',
                required: mod.group_required ?? false,
                sortOrder: mod.group_sort_order ?? 0,
                options: [],
            })
        }

        const group = groupMap.get(groupKey)!
        group.options.push({
            id: mod.option_id,
            dbId: mod.id,
            label: mod.option_label,
            icon: mod.option_icon ?? undefined,
            priceAdjustment: Number(mod.price_adjustment) || 0,
            isDefault: mod.is_default ?? false,
            sortOrder: mod.option_sort_order ?? 0,
        })
    }

    // Sort groups and options
    const groups = Array.from(groupMap.values())
    groups.sort((a, b) => a.sortOrder - b.sortOrder)
    groups.forEach(g => g.options.sort((a, b) => a.sortOrder - b.sortOrder))

    return groups
}

/**
 * Resolves modifiers with product-specific taking priority over category
 * Product groups override category groups with the same name
 */
export function resolveModifiers(
    productModifiers: ProductModifier[],
    categoryModifiers: ProductModifier[]
): ModifierGroup[] {
    // Group both sets
    const productGroups = groupModifiers(productModifiers)
    const categoryGroups = groupModifiers(categoryModifiers)

    // Mark category groups as inherited
    categoryGroups.forEach(g => g.isInherited = true)

    // Get names of product-specific groups
    const productGroupNames = new Set(productGroups.map(g => g.name))

    // Keep category groups that don't have product overrides
    const inheritedGroups = categoryGroups.filter(g => !productGroupNames.has(g.name))

    // Combine: product groups + non-overridden category groups
    const combined = [...productGroups, ...inheritedGroups]

    // Sort by sortOrder
    combined.sort((a, b) => a.sortOrder - b.sortOrder)

    return combined
}

// ============================================================================
// Hooks for POS (Read-only)
// ============================================================================

/**
 * Fetch and resolve modifiers for a product (for POS usage)
 * Automatically handles product vs category modifier inheritance
 */
export function useProductModifiersForPOS(
    productId: string | undefined,
    categoryId: string | null | undefined
) {
    return useQuery({
        queryKey: ['product-modifiers-pos', productId, categoryId],
        queryFn: async () => {
            if (!productId) return []

            // Fetch product-specific modifiers
            const { data: productMods, error: pError } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('product_id', productId)
                .eq('is_active', true)
                .order('group_sort_order')
                .order('option_sort_order')

            if (pError) throw pError

            // Fetch category modifiers if category exists
            let categoryMods: ProductModifier[] = []
            if (categoryId) {
                const { data, error: cError } = await supabase
                    .from('product_modifiers')
                    .select('*')
                    .eq('category_id', categoryId)
                    .eq('is_active', true)
                    .order('group_sort_order')
                    .order('option_sort_order')

                if (cError) throw cError
                categoryMods = data || []
            }

            // Resolve with product taking priority
            return resolveModifiers(productMods || [], categoryMods)
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ============================================================================
// Hooks for Admin (CRUD)
// ============================================================================

/**
 * Fetch product-specific modifiers for admin editing
 * Returns raw grouped data without category inheritance
 */
export function useProductModifiersAdmin(productId: string | undefined) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['product-modifiers-admin', productId],
        queryFn: async () => {
            if (!productId) return { productGroups: [], categoryGroups: [] }

            // Fetch product-specific modifiers
            const { data: productMods, error: pError } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('product_id', productId)
                .eq('is_active', true)
                .order('group_sort_order')
                .order('option_sort_order')

            if (pError) throw pError

            // Fetch product to get category_id
            const { data: product, error: prodError } = await supabase
                .from('products')
                .select('category_id')
                .eq('id', productId)
                .single()

            if (prodError) throw prodError

            // Fetch category modifiers
            let categoryMods: ProductModifier[] = []
            if (product?.category_id) {
                const { data, error: cError } = await supabase
                    .from('product_modifiers')
                    .select('*')
                    .eq('category_id', product.category_id)
                    .eq('is_active', true)
                    .order('group_sort_order')
                    .order('option_sort_order')

                if (cError) throw cError
                categoryMods = data || []
            }

            return {
                productGroups: groupModifiers(productMods || []),
                categoryGroups: groupModifiers(categoryMods || []).map(g => ({ ...g, isInherited: true })),
                categoryId: product?.category_id,
            }
        },
        enabled: !!productId,
    })

    // Save all modifiers (delete + insert pattern)
    const saveMutation = useMutation({
        mutationFn: async (groups: ModifierGroup[]) => {
            if (!productId) throw new Error('No product ID')

            // Delete existing product modifiers
            const { error: deleteError } = await supabase
                .from('product_modifiers')
                .delete()
                .eq('product_id', productId)

            if (deleteError) throw deleteError

            // Insert new modifiers (flatten groups to rows)
            const rows = groups.flatMap((group, groupIndex) =>
                group.options.map((opt, optIndex) => ({
                    product_id: productId,
                    group_name: group.name,
                    group_type: group.type,
                    group_required: group.required,
                    group_sort_order: groupIndex,
                    option_id: opt.id,
                    option_label: opt.label,
                    option_icon: opt.icon || null,
                    price_adjustment: opt.priceAdjustment,
                    is_default: opt.isDefault,
                    option_sort_order: optIndex,
                    is_active: true,
                }))
            )

            if (rows.length > 0) {
                const { error: insertError } = await supabase
                    .from('product_modifiers')
                    .insert(rows)

                if (insertError) throw insertError
            }

            return true
        },
        onSuccess: () => {
            // Invalidate both admin and POS queries
            queryClient.invalidateQueries({ queryKey: ['product-modifiers-admin', productId] })
            queryClient.invalidateQueries({ queryKey: ['product-modifiers-pos', productId] })
        },
    })

    return {
        ...query,
        productGroups: query.data?.productGroups || [],
        categoryGroups: query.data?.categoryGroups || [],
        categoryId: query.data?.categoryId,
        saveModifiers: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        saveError: saveMutation.error,
    }
}

/**
 * Hook for managing local modifier state in admin UI
 * Provides helper functions for group/option manipulation
 */
export function useModifierEditor(initialGroups: ModifierGroup[] = []) {
    const [groups, setGroups] = useState<ModifierGroup[]>(initialGroups)
    const [hasChanges, setHasChanges] = useState(false)

    // Sync with initial groups when they change
    useEffect(() => {
        setGroups(initialGroups)
        setHasChanges(false)
    }, [JSON.stringify(initialGroups)])

    const addGroup = useCallback((name: string, type: 'single' | 'multiple' = 'single', required = false) => {
        setGroups(prev => [
            ...prev,
            {
                name,
                type,
                required,
                sortOrder: prev.length,
                options: [],
            },
        ])
        setHasChanges(true)
    }, [])

    const updateGroup = useCallback((index: number, updates: Partial<ModifierGroup>) => {
        setGroups(prev => prev.map((g, i) => i === index ? { ...g, ...updates } : g))
        setHasChanges(true)
    }, [])

    const deleteGroup = useCallback((index: number) => {
        setGroups(prev => prev.filter((_, i) => i !== index))
        setHasChanges(true)
    }, [])

    const addOption = useCallback((groupIndex: number, option: Omit<ModifierOption, 'sortOrder'>) => {
        setGroups(prev => prev.map((g, i) => {
            if (i !== groupIndex) return g
            return {
                ...g,
                options: [
                    ...g.options,
                    { ...option, sortOrder: g.options.length },
                ],
            }
        }))
        setHasChanges(true)
    }, [])

    const updateOption = useCallback((groupIndex: number, optionIndex: number, updates: Partial<ModifierOption>) => {
        setGroups(prev => prev.map((g, gi) => {
            if (gi !== groupIndex) return g
            return {
                ...g,
                options: g.options.map((o, oi) =>
                    oi === optionIndex ? { ...o, ...updates } : o
                ),
            }
        }))
        setHasChanges(true)
    }, [])

    const deleteOption = useCallback((groupIndex: number, optionIndex: number) => {
        setGroups(prev => prev.map((g, gi) => {
            if (gi !== groupIndex) return g
            return {
                ...g,
                options: g.options.filter((_, oi) => oi !== optionIndex),
            }
        }))
        setHasChanges(true)
    }, [])

    const setDefaultOption = useCallback((groupIndex: number, optionIndex: number) => {
        setGroups(prev => prev.map((g, gi) => {
            if (gi !== groupIndex) return g
            // For single-select groups, only one default allowed
            if (g.type === 'single') {
                return {
                    ...g,
                    options: g.options.map((o, oi) => ({
                        ...o,
                        isDefault: oi === optionIndex,
                    })),
                }
            }
            // For multi-select, toggle the default
            return {
                ...g,
                options: g.options.map((o, oi) =>
                    oi === optionIndex ? { ...o, isDefault: !o.isDefault } : o
                ),
            }
        }))
        setHasChanges(true)
    }, [])

    const reorderGroups = useCallback((fromIndex: number, toIndex: number) => {
        setGroups(prev => {
            const result = [...prev]
            const [removed] = result.splice(fromIndex, 1)
            result.splice(toIndex, 0, removed)
            return result.map((g, i) => ({ ...g, sortOrder: i }))
        })
        setHasChanges(true)
    }, [])

    const resetChanges = useCallback(() => {
        setGroups(initialGroups)
        setHasChanges(false)
    }, [initialGroups])

    return {
        groups,
        hasChanges,
        addGroup,
        updateGroup,
        deleteGroup,
        addOption,
        updateOption,
        deleteOption,
        setDefaultOption,
        reorderGroups,
        resetChanges,
        setGroups,
    }
}
