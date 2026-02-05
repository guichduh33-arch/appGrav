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
import type { FloorPlanItem } from '@/types/database';
import './MobileHomePage.css';

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
    <div className="mobile-home">
      {/* Welcome Section */}
      <section className="mobile-home__welcome">
        <h1>Bonjour, {userName}</h1>
        <p>Prêt à prendre des commandes ?</p>
      </section>

      {/* Ready Orders Alert */}
      {readyOrders.length > 0 && (
        <section
          className="mobile-home__alert"
          onClick={() => navigate('/mobile/orders')}
        >
          <Bell size={20} className="mobile-home__alert-icon" />
          <span>
            {readyOrders.length} commande{readyOrders.length > 1 ? 's' : ''} prête{readyOrders.length > 1 ? 's' : ''}
          </span>
          <ChevronRight size={20} />
        </section>
      )}

      {/* Quick Actions */}
      <section className="mobile-home__actions">
        <button className="mobile-home__action mobile-home__action--primary" onClick={handleNewOrder}>
          <Plus size={24} />
          <span>Nouvelle Commande</span>
        </button>

        {currentOrder && currentOrder.items.length > 0 && (
          <button
            className="mobile-home__action"
            onClick={() => navigate('/mobile/cart')}
          >
            <ShoppingCart size={24} />
            <span>Panier ({currentOrder.items.length})</span>
          </button>
        )}

        <button
          className="mobile-home__action"
          onClick={() => navigate('/mobile/orders')}
        >
          <Clock size={24} />
          <span>Mes Commandes ({sentOrders.length})</span>
        </button>
      </section>

      {/* Current Order Summary */}
      {currentOrder && currentOrder.items.length > 0 && (
        <section className="mobile-home__current-order">
          <div className="mobile-home__section-header">
            <h2>Commande en cours</h2>
            {currentOrder.tableNumber && (
              <span className="mobile-home__table-badge">
                <Table2 size={14} /> Table {currentOrder.tableNumber}
              </span>
            )}
          </div>

          <div className="mobile-home__order-summary">
            <span>{currentOrder.items.length} article{currentOrder.items.length > 1 ? 's' : ''}</span>
            <span className="mobile-home__order-total">
              Rp {currentOrder.total.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            className="mobile-home__continue-btn"
            onClick={() => navigate('/mobile/cart')}
          >
            Continuer la commande
            <ChevronRight size={20} />
          </button>
        </section>
      )}

      {/* Recent Orders */}
      {sentOrders.length > 0 && (
        <section className="mobile-home__recent">
          <div className="mobile-home__section-header">
            <h2>Dernières commandes</h2>
            <button onClick={() => navigate('/mobile/orders')}>
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          <div className="mobile-home__orders-list">
            {sentOrders.slice(0, 3).map((order) => (
              <div key={order.orderId} className="mobile-home__order-item">
                <div className="mobile-home__order-info">
                  <span className="mobile-home__order-number">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="mobile-home__order-table">Table {order.tableNumber}</span>
                  )}
                </div>
                <span className={`mobile-home__order-status mobile-home__order-status--${order.status}`}>
                  {order.status === 'sent' && 'Envoyée'}
                  {order.status === 'preparing' && 'En préparation'}
                  {order.status === 'ready' && 'Prête'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Table Picker Modal */}
      {showTablePicker && (
        <div className="mobile-modal" onClick={() => setShowTablePicker(false)}>
          <div className="mobile-modal__content" onClick={(e) => e.stopPropagation()}>
            <h2>Choisir une table</h2>
            <div className="mobile-home__table-grid">
              {tables.map((table) => (
                <button
                  key={table.id}
                  className="mobile-home__table-btn"
                  onClick={() => handleTableSelect(table.table_number?.toString() || '')}
                >
                  <Table2 size={24} />
                  <span>Table {table.table_number}</span>
                </button>
              ))}
              <button
                className="mobile-home__table-btn mobile-home__table-btn--takeaway"
                onClick={() => handleTableSelect('')}
              >
                <ShoppingCart size={24} />
                <span>À emporter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
