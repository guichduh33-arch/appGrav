import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { PaymentMethod } from '../../types/settings';

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];

  loadPaymentMethods: () => Promise<void>;
  getDefaultPaymentMethod: () => PaymentMethod | null;
  getActivePaymentMethods: () => PaymentMethod[];
  createPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
}

export const usePaymentMethodStore = create<PaymentMethodState>()((set, get) => ({
  paymentMethods: [],

  loadPaymentMethods: async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    set({ paymentMethods: data || [] });
  },

  getDefaultPaymentMethod: () => {
    return get().paymentMethods.find((p) => p.is_default && p.is_active) || null;
  },

  getActivePaymentMethods: () => {
    return get().paymentMethods.filter((p) => p.is_active);
  },

  createPaymentMethod: async (method) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(method)
        .select()
        .single();

      if (error) throw error;

      set({ paymentMethods: [...get().paymentMethods, data] });
      return data;
    } catch (error) {
      console.error('Failed to create payment method:', error);
      return null;
    }
  },

  updatePaymentMethod: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set({
        paymentMethods: get().paymentMethods.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      });
      return true;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      return false;
    }
  },

  deletePaymentMethod: async (id) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ paymentMethods: get().paymentMethods.filter((p) => p.id !== id) });
      return true;
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      return false;
    }
  },
}));
