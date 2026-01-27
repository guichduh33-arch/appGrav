/**
 * Mobile Store
 * Epic 6 - Application Mobile Serveurs
 *
 * Manages state for the mobile server app.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Mobile order item
 */
export interface IMobileOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  modifiers: Array<{
    id: string;
    name: string;
    priceAdjustment: number;
  }>;
  notes: string;
  totalPrice: number;
}

/**
 * Active order on mobile
 */
export interface IMobileOrder {
  id: string;
  tableNumber: string | null;
  items: IMobileOrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
  status: 'draft' | 'sent' | 'preparing' | 'ready' | 'completed';
}

/**
 * Sent order for tracking
 */
export interface ISentOrder {
  orderId: string;
  orderNumber: string;
  tableNumber: string | null;
  status: 'sent' | 'preparing' | 'ready';
  sentAt: string;
  itemCount: number;
}

/**
 * Mobile state
 */
interface MobileState {
  // Authentication
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  sessionExpiresAt: string | null;
  loginAttempts: number;
  lockoutUntil: string | null;

  // Current order
  currentOrder: IMobileOrder | null;
  selectedTableNumber: string | null;

  // Sent orders
  sentOrders: ISentOrder[];

  // Favorites
  favoriteProducts: string[];

  // Settings
  hapticEnabled: boolean;
  sessionTimeoutMinutes: number;

  // Actions - Auth
  login: (userId: string, userName: string) => void;
  logout: () => void;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  setLockout: (until: string) => void;
  extendSession: () => void;
  isSessionValid: () => boolean;

  // Actions - Order
  selectTable: (tableNumber: string | null) => void;
  addItem: (item: IMobileOrderItem) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearOrder: () => void;
  markOrderSent: (orderId: string, orderNumber: string) => void;

  // Actions - Sent Orders
  updateSentOrderStatus: (orderId: string, status: ISentOrder['status']) => void;
  removeSentOrder: (orderId: string) => void;
  clearCompletedOrders: () => void;

  // Actions - Favorites
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Actions - Settings
  setHapticEnabled: (enabled: boolean) => void;
  setSessionTimeout: (minutes: number) => void;
}

// Session timeout default: 30 minutes (NFR-S2)
const DEFAULT_SESSION_TIMEOUT = 30;

// Max login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 3;

// Lockout duration: 30 seconds
const LOCKOUT_DURATION_MS = 30 * 1000;

export const useMobileStore = create<MobileState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      userId: null,
      userName: null,
      sessionExpiresAt: null,
      loginAttempts: 0,
      lockoutUntil: null,

      currentOrder: null,
      selectedTableNumber: null,
      sentOrders: [],
      favoriteProducts: [],

      hapticEnabled: true,
      sessionTimeoutMinutes: DEFAULT_SESSION_TIMEOUT,

      // Auth actions
      login: (userId, userName) => {
        const expiresAt = new Date(
          Date.now() + get().sessionTimeoutMinutes * 60 * 1000
        ).toISOString();

        set({
          isAuthenticated: true,
          userId,
          userName,
          sessionExpiresAt: expiresAt,
          loginAttempts: 0,
          lockoutUntil: null,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          userId: null,
          userName: null,
          sessionExpiresAt: null,
          currentOrder: null,
          selectedTableNumber: null,
        });
      },

      incrementLoginAttempts: () => {
        const attempts = get().loginAttempts + 1;
        const updates: Partial<MobileState> = { loginAttempts: attempts };

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          updates.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
        }

        set(updates);
      },

      resetLoginAttempts: () => {
        set({ loginAttempts: 0, lockoutUntil: null });
      },

      setLockout: (until) => {
        set({ lockoutUntil: until });
      },

      extendSession: () => {
        const expiresAt = new Date(
          Date.now() + get().sessionTimeoutMinutes * 60 * 1000
        ).toISOString();
        set({ sessionExpiresAt: expiresAt });
      },

      isSessionValid: () => {
        const { isAuthenticated, sessionExpiresAt } = get();
        if (!isAuthenticated || !sessionExpiresAt) return false;
        return new Date(sessionExpiresAt) > new Date();
      },

      // Order actions
      selectTable: (tableNumber) => {
        set({ selectedTableNumber: tableNumber });

        // Create or update current order
        const { currentOrder } = get();
        if (!currentOrder) {
          set({
            currentOrder: {
              id: crypto.randomUUID(),
              tableNumber,
              items: [],
              subtotal: 0,
              total: 0,
              createdAt: new Date().toISOString(),
              status: 'draft',
            },
          });
        } else {
          set({
            currentOrder: { ...currentOrder, tableNumber },
          });
        }
      },

      addItem: (item) => {
        const { currentOrder, selectedTableNumber } = get();

        if (currentOrder) {
          const items = [...currentOrder.items, item];
          const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
          set({
            currentOrder: {
              ...currentOrder,
              items,
              subtotal,
              total: subtotal,
            },
          });
        } else {
          // Create new order with item
          const items = [item];
          const subtotal = item.totalPrice;
          set({
            currentOrder: {
              id: crypto.randomUUID(),
              tableNumber: selectedTableNumber,
              items,
              subtotal,
              total: subtotal,
              createdAt: new Date().toISOString(),
              status: 'draft',
            },
          });
        }
      },

      updateItemQuantity: (itemId, quantity) => {
        const { currentOrder } = get();
        if (!currentOrder) return;

        const items = currentOrder.items.map((item) => {
          if (item.id === itemId) {
            const unitTotal = item.unitPrice + item.modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
            return {
              ...item,
              quantity,
              totalPrice: unitTotal * quantity,
            };
          }
          return item;
        });

        const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
        set({
          currentOrder: {
            ...currentOrder,
            items,
            subtotal,
            total: subtotal,
          },
        });
      },

      removeItem: (itemId) => {
        const { currentOrder } = get();
        if (!currentOrder) return;

        const items = currentOrder.items.filter((item) => item.id !== itemId);
        const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

        if (items.length === 0) {
          set({ currentOrder: null });
        } else {
          set({
            currentOrder: {
              ...currentOrder,
              items,
              subtotal,
              total: subtotal,
            },
          });
        }
      },

      clearOrder: () => {
        set({ currentOrder: null, selectedTableNumber: null });
      },

      markOrderSent: (orderId, orderNumber) => {
        const { currentOrder, sentOrders } = get();
        if (!currentOrder) return;

        const sentOrder: ISentOrder = {
          orderId,
          orderNumber,
          tableNumber: currentOrder.tableNumber,
          status: 'sent',
          sentAt: new Date().toISOString(),
          itemCount: currentOrder.items.reduce((sum, i) => sum + i.quantity, 0),
        };

        set({
          sentOrders: [sentOrder, ...sentOrders],
          currentOrder: null,
          selectedTableNumber: null,
        });
      },

      // Sent orders actions
      updateSentOrderStatus: (orderId, status) => {
        set({
          sentOrders: get().sentOrders.map((order) =>
            order.orderId === orderId ? { ...order, status } : order
          ),
        });
      },

      removeSentOrder: (orderId) => {
        set({
          sentOrders: get().sentOrders.filter((order) => order.orderId !== orderId),
        });
      },

      clearCompletedOrders: () => {
        set({
          sentOrders: get().sentOrders.filter((order) => order.status !== 'ready'),
        });
      },

      // Favorites
      toggleFavorite: (productId) => {
        const { favoriteProducts } = get();
        if (favoriteProducts.includes(productId)) {
          set({ favoriteProducts: favoriteProducts.filter((id) => id !== productId) });
        } else {
          set({ favoriteProducts: [...favoriteProducts, productId] });
        }
      },

      isFavorite: (productId) => {
        return get().favoriteProducts.includes(productId);
      },

      // Settings
      setHapticEnabled: (enabled) => {
        set({ hapticEnabled: enabled });
      },

      setSessionTimeout: (minutes) => {
        set({ sessionTimeoutMinutes: minutes });
      },
    }),
    {
      name: 'mobile-store',
      partialize: (state) => ({
        favoriteProducts: state.favoriteProducts,
        hapticEnabled: state.hapticEnabled,
        sessionTimeoutMinutes: state.sessionTimeoutMinutes,
      }),
    }
  )
);
