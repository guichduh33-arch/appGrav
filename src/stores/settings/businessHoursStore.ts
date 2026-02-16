import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { BusinessHours } from '../../types/settings';
import logger from '@/utils/logger';

interface BusinessHoursState {
  businessHours: BusinessHours[];

  loadBusinessHours: () => Promise<void>;
  updateBusinessHours: (dayOfWeek: number, updates: Partial<BusinessHours>) => Promise<boolean>;
}

export const useBusinessHoursStore = create<BusinessHoursState>()((set, get) => ({
  businessHours: [],

  loadBusinessHours: async () => {
    const { data, error } = await supabase
      .from('business_hours')
      .select(`
        id, break_end, break_start, close_time, created_at, day_of_week, 
        is_closed, is_open, open_time, updated_at
      `)
      .order('day_of_week');

    if (error) throw error;
    set({ businessHours: data || [] });
  },

  updateBusinessHours: async (dayOfWeek, updates) => {
    try {
      const { error } = await supabase
        .from('business_hours')
        .update(updates)
        .eq('day_of_week', dayOfWeek);

      if (error) throw error;

      set({
        businessHours: get().businessHours.map((h) =>
          h.day_of_week === dayOfWeek ? { ...h, ...updates } : h
        ),
      });
      return true;
    } catch (error) {
      logger.error('Failed to update business hours:', error);
      return false;
    }
  },
}));
