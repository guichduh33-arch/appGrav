import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { PrinterConfiguration } from '../../types/settings';
import logger from '@/utils/logger';

interface PrinterState {
  printers: PrinterConfiguration[];

  loadPrinters: () => Promise<void>;
  createPrinter: (printer: Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>) => Promise<PrinterConfiguration | null>;
  updatePrinter: (id: string, updates: Partial<PrinterConfiguration>) => Promise<boolean>;
  deletePrinter: (id: string) => Promise<boolean>;
}

export const usePrinterStore = create<PrinterState>()((set, get) => ({
  printers: [],

  loadPrinters: async () => {
    const { data, error } = await supabase
      .from('printer_configurations')
      .select('*')
      .order('name');

    if (error) throw error;
    set({ printers: data || [] });
  },

  createPrinter: async (printer) => {
    try {
      const { data, error } = await supabase
        .from('printer_configurations')
        .insert(printer)
        .select()
        .single();

      if (error) throw error;

      set({ printers: [...get().printers, data] });
      return data;
    } catch (error) {
      logger.error('Failed to create printer:', error);
      return null;
    }
  },

  updatePrinter: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('printer_configurations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set({
        printers: get().printers.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      });
      return true;
    } catch (error) {
      logger.error('Failed to update printer:', error);
      return false;
    }
  },

  deletePrinter: async (id) => {
    try {
      const { error } = await supabase
        .from('printer_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ printers: get().printers.filter((p) => p.id !== id) });
      return true;
    } catch (error) {
      logger.error('Failed to delete printer:', error);
      return false;
    }
  },
}));
