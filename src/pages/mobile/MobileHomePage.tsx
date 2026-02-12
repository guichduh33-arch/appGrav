/**
 * Mobile Home Page
 * Story 6.2-6.3 - Mobile Product Catalog & Table Selection
 *
 * Dashboard showing quick actions and active orders.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Clock, Table2, ChevronRight, Bell } from 'lucide-react';
import { useMobileStore } from '@/stores/mobileStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { FloorPlanItem } from '@/types/database';

/** Status-specific badge styles */
const orderStatusStyles: Record<string, string> = {
  sent: 'bg-info-bg text-info',
  preparing: 'bg-warning-bg text-warning',
  ready: 'bg-success-bg text-success',
};

/**
 * Mobile Home Page Component
 */
export default function MobileHomePage() {
  const navigate = useNavigate();
  const {
    userName,
    currentOrder,
    sentOrders,
    selectedTableNumber,
    selectTable,
    extendSession,
  } = useMobileStore();

  const [tables, setTables] = useState<FloorPlanItem[]>([]);
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Extend session on activity
  useEffect(() => {
    extendSession();
  }, [extendSession]);

  // Load floor plan tables
  useEffect(() => {
    const loadTables = async () => {
      const { data, error } = await supabase
        .from('floor_plan_items')
        .select('*')
        .eq('type', 'table')
        .order('table_number', { ascending: true });

      if (!error && data) {
        setTables(data);
      }
    };

    loadTables();
  }, []);

  // Count ready orders
  const readyOrders = sentOrders.filter((o) => o.status === 'ready');

  const handleNewOrder = () => {
    if (!selectedTableNumber) {
      setShowTablePicker(true);
    } else {
      navigate('/mobile/catalog');
    }
  };

  const handleTableSelect = (tableNumber: string) => {
    selectTable(tableNumber);
    setShowTablePicker(false);
    navigate('/mobile/catalog');
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Welcome Section */}
      <section className="p-6 bg-gradient-to-br from-[#BA90A2] to-[#DDB892] rounded-xl text-white">
        <h1 className="text-2xl font-bold m-0">Hello, {userName}</h1>
        <p className="text-sm opacity-90 mt-1 mb-0">Ready to take orders?</p>
      </section>

      {/* Ready Orders Alert */}
      {readyOrders.length > 0 && (
        <section
          className="flex items-center gap-2 p-4 bg-success-bg rounded-xl text-success font-semibold cursor-pointer"
          onClick={() => navigate('/mobile/orders')}
        >
          <Bell size={20} className="animate-pulse-alert" />
          <span>
            {readyOrders.length} order{readyOrders.length > 1 ? 's' : ''} ready
          </span>
          <ChevronRight size={20} />
        </section>
      )}

      {/* Quick Actions */}
      <section className="flex flex-col gap-2">
        <button
          className="flex items-center gap-4 py-4 px-6 bg-primary border border-primary rounded-xl text-base font-medium text-white cursor-pointer transition-all duration-150 min-h-14 active:opacity-90 active:scale-[0.98]"
          onClick={handleNewOrder}
        >
          <Plus size={24} />
          <span>New Order</span>
        </button>

        {currentOrder && currentOrder.items.length > 0 && (
          <button
            className="flex items-center gap-4 py-4 px-6 bg-white border border-border rounded-xl text-base font-medium text-foreground cursor-pointer transition-all duration-150 min-h-14 active:bg-secondary active:scale-[0.98]"
            onClick={() => navigate('/mobile/cart')}
          >
            <ShoppingCart size={24} />
            <span>Cart ({currentOrder.items.length})</span>
          </button>
        )}

        <button
          className="flex items-center gap-4 py-4 px-6 bg-white border border-border rounded-xl text-base font-medium text-foreground cursor-pointer transition-all duration-150 min-h-14 active:bg-secondary active:scale-[0.98]"
          onClick={() => navigate('/mobile/orders')}
        >
          <Clock size={24} />
          <span>My Orders ({sentOrders.length})</span>
        </button>
      </section>

      {/* Current Order Summary */}
      {currentOrder && currentOrder.items.length > 0 && (
        <section className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold m-0">Current Order</h2>
            {currentOrder.tableNumber && (
              <span className="flex items-center gap-1 py-1 px-2 bg-secondary rounded-full text-sm text-muted-foreground">
                <Table2 size={14} /> Table {currentOrder.tableNumber}
              </span>
            )}
          </div>

          <div className="flex justify-between mb-4">
            <span>{currentOrder.items.length} item{currentOrder.items.length > 1 ? 's' : ''}</span>
            <span className="font-semibold text-primary">
              Rp {currentOrder.total.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            className="flex items-center justify-center gap-2 w-full p-4 bg-primary border-none rounded-xl text-white font-semibold cursor-pointer transition-all duration-150 active:opacity-90"
            onClick={() => navigate('/mobile/cart')}
          >
            Continue order
            <ChevronRight size={20} />
          </button>
        </section>
      )}

      {/* Recent Orders */}
      {sentOrders.length > 0 && (
        <section className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold m-0">Recent Orders</h2>
            <button
              className="flex items-center gap-1 bg-transparent border-none text-primary text-sm font-medium cursor-pointer p-1"
              onClick={() => navigate('/mobile/orders')}
            >
              View all <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {sentOrders.slice(0, 3).map((order) => (
              <div
                key={order.orderId}
                className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="text-sm text-muted-foreground">Table {order.tableNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium py-1 px-2 rounded-full',
                    orderStatusStyles[order.status] ?? ''
                  )}
                >
                  {order.status === 'sent' && 'Sent'}
                  {order.status === 'preparing' && 'Preparing'}
                  {order.status === 'ready' && 'Ready'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Table Picker Modal */}
      {showTablePicker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end z-[1000] animate-[fadeIn_0.2s_ease]"
          onClick={() => setShowTablePicker(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-slide-up max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">Choose a table</h2>
            <div className="grid grid-cols-3 gap-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  className="flex flex-col items-center justify-center gap-1 p-4 bg-secondary border border-border rounded-xl text-foreground text-sm font-medium cursor-pointer transition-all duration-150 min-h-20 active:bg-primary active:text-white active:border-primary"
                  onClick={() => handleTableSelect(table.table_number?.toString() || '')}
                >
                  <Table2 size={24} />
                  <span>Table {table.table_number}</span>
                </button>
              ))}
              <button
                className="col-span-3 flex flex-row items-center justify-center gap-1 p-4 bg-secondary border border-border rounded-xl text-foreground text-sm font-medium cursor-pointer transition-all duration-150 min-h-14 active:bg-primary active:text-white active:border-primary"
                onClick={() => handleTableSelect('')}
              >
                <ShoppingCart size={24} />
                <span>Takeaway</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
