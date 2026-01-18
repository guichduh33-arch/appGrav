
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ArrowRightLeft, Box, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Section, Product } from '../types/database';

interface ProductStockView {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
}

export const InterSection_Stock_Movements: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer'>('overview');

  // Transfer State
  const [fromSection, setFromSection] = useState<string>('');
  const [toSection, setToSection] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(0);

  // --- Queries ---
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Section[];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock, unit')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Partial<Product>[];
    }
  });

  // View State
  const [viewSectionId, setViewSectionId] = useState<string | null>(null);

  const { data: sectionStock = [], isLoading: loadingStock } = useQuery({
    queryKey: ['section_stock', viewSectionId],
    queryFn: async () => {
      if (!viewSectionId) return [];

      // Join product_stocks with products to get names
      const { data, error } = await supabase
        .from('product_stocks')
        .select(`
                    quantity,
                    product:products (
                        id,
                        name,
                        unit
                    )
                `)
        .eq('section_id', viewSectionId)
        .order('quantity', { ascending: false }); // Show highest stock first? Or alphabetical by product name logic (needs client sort or complex query)

      if (error) throw error;

      // Transform to flatter structure
      return data.map((item: any) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        unit: item.product.unit,
        quantity: item.quantity
      })) as ProductStockView[];
    },
    enabled: !!viewSectionId
  });

  // --- Mutations ---
  const transferMutation = useMutation({
    mutationFn: async (data: { product_id: string, from_section_id: string, to_section_id: string, quantity: number }) => {
      const { error } = await (supabase.rpc as any)('transfer_stock', {
        p_product_id: data.product_id,
        p_from_section_id: data.from_section_id,
        p_to_section_id: data.to_section_id,
        p_quantity: data.quantity
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section_stock'] });
      toast.success('Stock transfer successful');
      setTransferQty(0);
      setSelectedProduct('');
    },
    onError: (err: any) => toast.error('Transfer failed: ' + err.message)
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('inter_section.title', 'Internal Moves')}</h1>
          <p className="text-gray-500">Track stock across sections (Baker, Pastry, etc.)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'bg-white border'}`}
          >
            <LayoutGrid size={18} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'transfer' ? 'bg-[#D35400] text-white' : 'bg-white border'}`}
          >
            <ArrowRightLeft size={18} /> Transfer
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Sections List */}
          <div className="col-span-4 space-y-3">
            <h3 className="font-semibold text-gray-700">Kitchen Sections</h3>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setViewSectionId(s.id)}
                className={`w-full text-left p-4 rounded-lg border transition ${viewSectionId === s.id ? 'border-[#D35400] bg-orange-50' : 'hover:bg-gray-50'
                  }`}
              >
                <div className="font-bold">{s.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide flex gap-2">
                  {s.slug}
                  {s.is_warehouse && <span className="bg-blue-100 text-blue-800 px-1 rounded">Warehouse</span>}
                  {s.is_sales_point && <span className="bg-green-100 text-green-800 px-1 rounded">Sales</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Stock List */}
          <div className="col-span-8 bg-white rounded-xl shadow p-6 min-h-[400px]">
            {!viewSectionId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Box size={48} className="mb-2" />
                <p>Select a section to view stock</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  Stock Level: {sections.find(s => s.id === viewSectionId)?.name}
                </h3>
                {loadingStock ? <p>Loading...</p> : (
                  sectionStock.length === 0 ? <p className="text-gray-500">No stock items in this section.</p> :
                    <table className="w-full text-left">
                      <thead className="border-b text-gray-500 text-sm">
                        <tr>
                          <th className="py-2">Product</th>
                          <th className="py-2 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {sectionStock.map((item) => (
                          <tr key={item.product_id}>
                            <td className="py-3">{item.product_name}</td>
                            <td className="py-3 text-right font-medium">
                              {item.quantity} {item.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRANSFER TAB */}
      {activeTab === 'transfer' && (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">New Internal Transfer</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (Source)</label>
              <select
                aria-label="Source Section"
                className="w-full border rounded-lg p-2"
                value={fromSection}
                onChange={(e) => setFromSection(e.target.value)}
              >
                <option value="">-- Select --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination)</label>
              <select
                aria-label="Destination Section"
                className="w-full border rounded-lg p-2"
                value={toSection}
                onChange={(e) => setToSection(e.target.value)}
              >
                <option value="">-- Select --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              aria-label="Select Product"
              className="w-full border rounded-lg p-2"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id!}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Move</label>
            <input
              aria-label="Transfer Quantity"
              type="number"
              className="w-full border rounded-lg p-2"
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
            />
          </div>

          <button
            disabled={!toSection || !fromSection || !selectedProduct || transferQty <= 0 || fromSection === toSection || transferMutation.isPending}
            onClick={() => transferMutation.mutate({
              product_id: selectedProduct,
              from_section_id: fromSection,
              to_section_id: toSection,
              quantity: transferQty
            })}
            className="w-full bg-[#D35400] text-white font-bold py-3 rounded-lg hover:bg-[#A04000] disabled:opacity-50"
          >
            {transferMutation.isPending ? 'Processing...' : 'Confirm Transfer'}
          </button>

          {fromSection === toSection && fromSection !== '' && (
            <p className="text-red-500 text-sm text-center">Source and destination must be different.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterSection_Stock_Movements;
