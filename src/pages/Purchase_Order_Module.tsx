
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Truck, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- Types ---
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  suppliers: { name: string };
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  total: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

interface NewPOItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit: string;
}

// --- API Helpers ---
const FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/purchase_order_module';

async function fetchAPI(resource: string, params: string = '') {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { Authorization: `Bearer ${session?.access_token}` };
  const res = await fetch(`${FUNCTION_URL}?resource=${resource}${params}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postAPI(resource: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${FUNCTION_URL}?resource=${resource}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function patchAPI(resource: string, id: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${FUNCTION_URL}?resource=${resource}&id=${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const Purchase_Order_Module: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'new' | 'suppliers'>('orders');

  // New PO Form State
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [poItems, setPoItems] = useState<NewPOItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  // New Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState('');

  // --- Queries ---
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchAPI('orders')
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetchAPI('suppliers')
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchAPI('products')
  });

  // --- Mutations ---
  const createSupplierMutation = useMutation({
    mutationFn: (name: string) => postAPI('suppliers', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setNewSupplierName('');
      toast.success('Supplier added!');
    },
    onError: () => toast.error('Failed to add supplier')
  });

  const createPOMutation = useMutation({
    mutationFn: (data: any) => postAPI('orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActiveTab('orders');
      setPoItems([]);
      setSelectedSupplier('');
      toast.success('Purchase Order created!');
    },
    onError: (_err: any) => toast.error('Failed to create PO')
  });

  const updatePOStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => patchAPI('orders', id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status updated');
    }
  });

  // --- Handlers ---
  const handleAddItem = () => {
    const product = products.find((p: Product) => p.id === selectedProduct);
    if (!product) return;

    setPoItems([...poItems, {
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: price,
      unit: product.unit
    }]);
    setQty(1);
    setPrice(0);
    setSelectedProduct('');
  };

  const calculateTotal = () => poItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('purchase_orders.title', 'Purchase Orders')}</h1>
          <p className="text-gray-500">Manage suppliers and stock replenishment</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('new')}
            className="bg-[#D35400] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#A04000]"
          >
            <Plus size={18} /> New PO
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className="bg-white border text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Truck size={18} /> Suppliers
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 ${activeTab === 'orders' ? 'border-b-2 border-[#D35400] text-[#D35400] font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('orders')}
        >
          All Orders
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'new' ? 'border-b-2 border-[#D35400] text-[#D35400] font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('new')}
        >
          Create Order
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'suppliers' ? 'border-b-2 border-[#D35400] text-[#D35400] font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-6 min-h-[400px]">

        {/* ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            {loadingOrders ? <p>Loading...</p> : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="py-3">PO Number</th>
                    <th className="py-3">Supplier</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Total</th>
                    <th className="py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((po: PurchaseOrder) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{po.po_number}</td>
                      <td className="py-3">{po.suppliers?.name}</td>
                      <td className="py-3">{new Date(po.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${po.status === 'received' ? 'bg-green-100 text-green-800' :
                          po.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.total || 0)}
                      </td>
                      <td className="py-3 text-center">
                        {po.status === 'draft' && (
                          <button
                            onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'sent' })}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Send
                          </button>
                        )}
                        {po.status === 'sent' && (
                          <button
                            onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'received' })}
                            className="text-green-600 hover:underline text-sm ml-2"
                          >
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* NEW ORDER */}
        {activeTab === 'new' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Supplier</label>
              <select
                aria-label="Select Supplier"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s: Supplier) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedSupplier && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart size={18} /> Add Items
                </h3>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <select
                      aria-label="Select Product"
                      className="w-full rounded border p-2 text-sm"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Product...</option>
                      {products.map((p: Product) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.current_stock} {p.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" className="w-full rounded border p-2 text-sm"
                      placeholder="Qty" value={qty} onChange={e => setQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number" className="w-full rounded border p-2 text-sm"
                      placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={handleAddItem}
                      className="w-full bg-[#D35400] text-white rounded p-2 text-sm hover:bg-[#A04000]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                {poItems.length > 0 && (
                  <table className="w-full text-sm mt-4">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th>Product</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2">{item.product_name}</td>
                          <td className="text-right">{item.quantity} {item.unit}</td>
                          <td className="text-right">{item.unit_price}</td>
                          <td className="text-right">{item.quantity * item.unit_price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right font-bold pt-2">Total:</td>
                        <td className="text-right font-bold pt-2">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button
                disabled={!selectedSupplier || poItems.length === 0 || createPOMutation.isPending}
                onClick={() => createPOMutation.mutate({
                  supplier_id: selectedSupplier,
                  items: poItems,
                  total: calculateTotal(),
                  status: 'draft'
                })}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-green-700"
              >
                {createPOMutation.isPending ? 'Saving...' : 'Create Purchase Order'}
              </button>
            </div>
          </div>
        )}

        {/* SUPPLIERS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Supplier Name..."
                className="border rounded px-3 py-2 flex-1"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
              />
              <button
                onClick={() => { if (newSupplierName) createSupplierMutation.mutate(newSupplierName) }}
                className="bg-[#D35400] text-white px-4 py-2 rounded"
              >
                Add Supplier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s: Supplier) => (
                <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    {s.is_active && <span className="text-green-500 text-xs">Active</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>{s.email || 'No email'}</p>
                    <p>{s.phone || 'No phone'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Purchase_Order_Module;
