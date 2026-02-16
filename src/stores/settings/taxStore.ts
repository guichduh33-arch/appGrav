import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { TaxRate } from '../../types/settings';
import logger from '@/utils/logger';

interface TaxState {
  taxRates: TaxRate[];

  loadTaxRates: () => Promise<void>;
  getDefaultTaxRate: () => TaxRate | null;
  getActiveTaxRates: () => TaxRate[];
  createTaxRate: (taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) => Promise<TaxRate | null>;
  updateTaxRate: (id: string, updates: Partial<TaxRate>) => Promise<boolean>;
  deleteTaxRate: (id: string) => Promise<boolean>;
}

export const useTaxStore = create<TaxState>()((set, get) => ({
  taxRates: [],

  loadTaxRates: async () => {
    const { data, error } = await supabase
      .from('tax_rates')
      .select(`
        id, applies_to, code, created_at, is_active, is_default, is_inclusive, 
        name, name_en, name_fr, name_id, rate, updated_at, valid_from, valid_until
      `)
      .order('rate');

    if (error) throw error;
    set({ taxRates: data || [] });
  },

  getDefaultTaxRate: () => {
    return get().taxRates.find((t) => t.is_default && t.is_active) || null;
  },

  getActiveTaxRates: () => {
    return get().taxRates.filter((t) => t.is_active);
  },

  createTaxRate: async (taxRate) => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .insert(taxRate)
        .select(`
          id, applies_to, code, created_at, is_active, is_default, is_inclusive, 
          name, name_en, name_fr, name_id, rate, updated_at, valid_from, valid_until
        `)
        .single();

      if (error) throw error;

      set({ taxRates: [...get().taxRates, data] });
      return data;
    } catch (error) {
      logger.error('Failed to create tax rate:', error);
      return null;
    }
  },

  updateTaxRate: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('tax_rates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set({
        taxRates: get().taxRates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      });
      return true;
    } catch (error) {
      logger.error('Failed to update tax rate:', error);
      return false;
    }
  },

  deleteTaxRate: async (id) => {
    try {
      const { error } = await supabase
        .from('tax_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ taxRates: get().taxRates.filter((t) => t.id !== id) });
      return true;
    } catch (error) {
      logger.error('Failed to delete tax rate:', error);
      return false;
    }
  },
}));
