/**
 * useKdsOrderQueue Hook
 * Story 4.4 - KDS Order Queue Display
 *
 * Manages the local state of orders in the KDS queue with:
 * - FIFO sorting by created_at
 * - Separation of urgent vs normal orders
 * - Methods for adding, updating, and removing orders
 * - Integration with LAN order receiver (Story 4.3)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Order item structure for KDS
 */
export interface IKdsOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  modifiers?: string;
  notes?: string;
  item_status: 'new' | 'preparing' | 'ready' | 'served';
  dispatch_station: string;
  is_held: boolean;
}

/**
 * Order structure for KDS queue
 */
export interface IKdsOrder {
  id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
  table_name?: string;
  customer_name?: string;
  items: IKdsOrderItem[];
  created_at: string;
  status: string;
  source?: 'pos' | 'mobile' | 'web' | 'lan';
}

/**
 * Options for the useKdsOrderQueue hook
 */
export interface IUseKdsOrderQueueOptions {
  /** Threshold in seconds for considering an order urgent (default: 600 = 10 minutes) */
  urgentThresholdSeconds?: number;
  /** Callback when an order becomes urgent */
  onOrderBecameUrgent?: (order: IKdsOrder) => void;
}

/**
 * Result returned by the useKdsOrderQueue hook
 */
export interface IUseKdsOrderQueueResult {
  /** All orders in the queue, sorted by created_at (FIFO) */
  orders: IKdsOrder[];
  /** Orders that have exceeded the urgent threshold */
  urgentOrders: IKdsOrder[];
  /** Orders that are within normal time */
  normalOrders: IKdsOrder[];
  /** Count of urgent orders */
  urgentCount: number;
  /** Add a new order to the queue */
  addOrder: (order: IKdsOrder) => void;
  /** Update an existing order */
  updateOrder: (orderId: string, updates: Partial<IKdsOrder>) => void;
  /** Update a specific item within an order */
  updateOrderItem: (orderId: string, itemId: string, updates: Partial<IKdsOrderItem>) => void;
  /** Remove an order from the queue */
  removeOrder: (orderId: string) => void;
  /** Set all orders (replaces existing) */
  setOrders: (orders: IKdsOrder[]) => void;
  /** Clear all orders */
  clearOrders: () => void;
}

/**
 * Hook for managing the KDS order queue with FIFO sorting and urgent order separation
 */
export function useKdsOrderQueue(
  options: IUseKdsOrderQueueOptions = {}
): IUseKdsOrderQueueResult {
  const { urgentThresholdSeconds = 600, onOrderBecameUrgent } = options;

  const [orders, setOrdersState] = useState<IKdsOrder[]>([]);
  const previousUrgentIdsRef = useRef<Set<string>>(new Set());

  /**
   * Sort orders by created_at (FIFO - oldest first)
   */
  const sortOrders = useCallback((orderList: IKdsOrder[]): IKdsOrder[] => {
    return [...orderList].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, []);

  /**
   * Set all orders with automatic FIFO sorting
   */
  const setOrders = useCallback((newOrders: IKdsOrder[]) => {
    setOrdersState(sortOrders(newOrders));
  }, [sortOrders]);

  /**
   * Add a single order to the queue
   * Automatically handles duplicate detection and FIFO sorting
   */
  const addOrder = useCallback((order: IKdsOrder) => {
    setOrdersState(prev => {
      // Check for duplicates
      if (prev.some(o => o.id === order.id)) {
        return prev;
      }
      return sortOrders([...prev, order]);
    });
  }, [sortOrders]);

  /**
   * Update an existing order's properties
   */
  const updateOrder = useCallback((orderId: string, updates: Partial<IKdsOrder>) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
    );
  }, []);

  /**
   * Update a specific item within an order
   */
  const updateOrderItem = useCallback((
    orderId: string,
    itemId: string,
    updates: Partial<IKdsOrderItem>
  ) => {
    setOrdersState(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        };
      })
    );
  }, []);

  /**
   * Remove an order from the queue
   */
  const removeOrder = useCallback((orderId: string) => {
    setOrdersState(prev => prev.filter(o => o.id !== orderId));
  }, []);

  /**
   * Clear all orders from the queue
   */
  const clearOrders = useCallback(() => {
    setOrdersState([]);
  }, []);

  /**
   * Periodic tick to re-evaluate urgency classification
   * Without this, orders only get reclassified when the orders array changes,
   * not when time passes and an order crosses the threshold.
   */
  const [urgencyTick, setUrgencyTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setUrgencyTick(t => t + 1);
    }, 30000); // Re-evaluate every 30s
    return () => clearInterval(interval);
  }, []);

  /**
   * Separate orders into urgent and normal categories
   * Uses useMemo to avoid recalculating on every render
   */
  const { urgentOrders, normalOrders } = useMemo(() => {
    // urgencyTick forces re-evaluation periodically
    void urgencyTick;
    const now = Date.now();
    const urgent: IKdsOrder[] = [];
    const normal: IKdsOrder[] = [];

    for (const order of orders) {
      const elapsedSeconds = (now - new Date(order.created_at).getTime()) / 1000;
      if (elapsedSeconds > urgentThresholdSeconds) {
        urgent.push(order);
      } else {
        normal.push(order);
      }
    }

    return { urgentOrders: urgent, normalOrders: normal };
  }, [orders, urgentThresholdSeconds, urgencyTick]);

  /**
   * Track when orders become urgent and trigger callback
   */
  useEffect(() => {
    if (!onOrderBecameUrgent) return;

    const currentUrgentIds = new Set(urgentOrders.map(o => o.id));

    // Find newly urgent orders
    for (const order of urgentOrders) {
      if (!previousUrgentIdsRef.current.has(order.id)) {
        onOrderBecameUrgent(order);
      }
    }

    previousUrgentIdsRef.current = currentUrgentIds;
  }, [urgentOrders, onOrderBecameUrgent]);

  return {
    orders,
    urgentOrders,
    normalOrders,
    urgentCount: urgentOrders.length,
    addOrder,
    updateOrder,
    updateOrderItem,
    removeOrder,
    setOrders,
    clearOrders,
  };
}
