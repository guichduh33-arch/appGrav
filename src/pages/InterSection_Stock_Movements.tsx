
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ArrowRightLeft, Box, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- Types ---
interface Section {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

interface SectionItem {
  id: string;
  section_id: string;
  product_id: string;
  quantity: number;
  products: { name: string; unit: string };
}

// --- API Helpers ---
const FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/intersection_stock_movements';

async function fetchAPI(resource: string, params: string = '') {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { Authorization: `Bearer ${session?.access_token}` };
  const res = await fetch(`${FUNCTION_URL}?resource=${resource}${params}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postTransfer(data: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${FUNCTION_URL}?resource=transfer`, {
    method: 'POST', body: JSON.stringify(data), headers
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const InterSection_Stock_Movements: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer'>('overview');

  // Transfer State
  const [fromSection, setFromSection] = useState('warehouse'); // 'warehouse' or UUID
  const [toSection, setToSection] = useState(''); // 'warehouse' or UUID
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transferQty, setTransferQty] = useState(0);

  // --- Queries ---
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => fetchAPI('sections')
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchAPI('products')
  });

  // Fetch stock for all sections (could be optimized, simplified for now)
  // We'll just fetch items for the 'overview' dashboard
  // Ideally we loop or fetch all. Let's fetch all items for now if API supported 'all', 
  // but our API expects section_id. Let's fetch for the first few sections or just fetch on demand.
  // IMPROVEMENT: Let's assume we view one section at a time or the dashboard iterates queries.
  // For simplicity: Dashboard listing sections. Clicking one shows stock.
  const [viewSectionId, setViewSectionId] = useState<string | null>(null);

  const { data: sectionStock = [], isLoading: loadingStock } = useQuery({
    queryKey: ['stock', viewSectionId],
    queryFn: () => fetchAPI('stock', `&section_id=${viewSectionId}`),
    enabled: !!viewSectionId
  });

  // --- Mutations ---
  const transferMutation = useMutation({
    mutationFn: postTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Update warehouse stock
      queryClient.invalidateQueries({ queryKey: ['stock'] });    // Update section stock
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
            <h3 className="font-semibold text-gray-700">Storage Sections</h3>
            {sections.map((s: Section) => (
              <button
                key={s.id}
                onClick={() => setViewSectionId(s.id)}
                className={`w-full text-left p-4 rounded-lg border transition ${viewSectionId === s.id ? 'border-[#D35400] bg-orange-50' : 'hover:bg-gray-50'
                  }`}
              >
                <div className="font-bold">{s.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{s.slug}</div>
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
                  Stock Level: {sections.find((s: any) => s.id === viewSectionId)?.name}
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
                        {sectionStock.map((item: SectionItem) => (
                          <tr key={item.id}>
                            <td className="py-3">{item.products?.name}</td>
                            <td className="py-3 text-right font-medium">
                              {item.quantity} {item.products?.unit}
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
                <option value="warehouse">Main Warehouse (Master)</option>
                {sections.map((s: Section) => (
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
                <option value="warehouse">Main Warehouse (Master)</option>
                {sections.map((s: Section) => (
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
              {products.map((p: Product) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Whse: {p.current_stock} {p.unit})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * Showing Main Warehouse stock levels
            </p>
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
            disabled={!toSection || !selectedProduct || transferQty <= 0 || fromSection === toSection || transferMutation.isPending}
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
        </div>
      )}
    </div>
  );
};

export default InterSection_Stock_Movements;
