/**
 * Print Service - Local Print Server Integration (F3.1)
 *
 * Integrates with the local print server running on localhost:3001.
 * Handles receipt, kitchen, and barista ticket printing.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import type { TPaymentMethod } from '@/types/payment';

// =====================================================
// Configuration
// =====================================================

const PRINT_SERVER_URL = 'http://localhost:3001';
const PRINT_TIMEOUT_MS = 5000;
const HEALTH_CHECK_TIMEOUT_MS = 2000;

// =====================================================
// Types
// =====================================================

/**
 * Order item data for printing
 */
export interface IOrderItemPrintData {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  notes?: string;
}

/**
 * Payment data for receipt printing
 */
export interface IPaymentPrintData {
  method: TPaymentMethod;
  amount: number;
  reference?: string;
}

/**
 * Full order data for receipt printing
 */
export interface IOrderPrintData {
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
  tableNumber?: string;
  customerName?: string;
  items: IOrderItemPrintData[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  payments: IPaymentPrintData[];
  change?: number;
  cashierName: string;
  createdAt: string;
  notes?: string;
}

/**
 * Kitchen ticket data
 */
export interface IKitchenTicketData {
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
  tableNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    modifiers?: string[];
    notes?: string;
  }>;
  createdAt: string;
  priority?: 'normal' | 'rush';
}

/**
 * Print result
 */
export interface IPrintResult {
  success: boolean;
  error?: string;
}

// =====================================================
// Health Check
// =====================================================

/**
 * Check if the print server is available
 *
 * @returns true if server responds within timeout
 */
export async function checkPrintServer(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const response = await fetch(`${PRINT_SERVER_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// =====================================================
// Receipt Printing
// =====================================================

/**
 * Print a receipt for an order
 *
 * @param orderData - Order data to print
 * @returns Print result
 */
export async function printReceipt(orderData: IOrderPrintData): Promise<IPrintResult> {
  const isAvailable = await checkPrintServer();

  if (!isAvailable) {
    console.warn('Print server not available');
    return {
      success: false,
      error: 'Print server not available',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRINT_TIMEOUT_MS);

    const response = await fetch(`${PRINT_SERVER_URL}/print/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Print failed: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Print receipt error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =====================================================
// Kitchen Ticket Printing
// =====================================================

/**
 * Print a kitchen ticket
 *
 * @param ticketData - Kitchen ticket data
 * @returns Print result
 */
export async function printKitchenTicket(ticketData: IKitchenTicketData): Promise<IPrintResult> {
  const isAvailable = await checkPrintServer();

  if (!isAvailable) {
    console.warn('Print server not available');
    return {
      success: false,
      error: 'Print server not available',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRINT_TIMEOUT_MS);

    const response = await fetch(`${PRINT_SERVER_URL}/print/kitchen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Kitchen print failed: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Print kitchen ticket error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =====================================================
// Barista Ticket Printing
// =====================================================

/**
 * Print a barista ticket
 *
 * @param ticketData - Barista ticket data (same format as kitchen)
 * @returns Print result
 */
export async function printBaristaTicket(ticketData: IKitchenTicketData): Promise<IPrintResult> {
  const isAvailable = await checkPrintServer();

  if (!isAvailable) {
    console.warn('Print server not available');
    return {
      success: false,
      error: 'Print server not available',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRINT_TIMEOUT_MS);

    const response = await fetch(`${PRINT_SERVER_URL}/print/barista`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Barista print failed: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Print barista ticket error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =====================================================
// Cash Drawer
// =====================================================

/**
 * Open the cash drawer
 *
 * @returns Print result
 */
export async function openCashDrawer(): Promise<IPrintResult> {
  const isAvailable = await checkPrintServer();

  if (!isAvailable) {
    console.warn('Print server not available');
    return {
      success: false,
      error: 'Print server not available',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRINT_TIMEOUT_MS);

    const response = await fetch(`${PRINT_SERVER_URL}/drawer/open`, {
      method: 'POST',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Cash drawer failed: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Open cash drawer error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =====================================================
// Service Export
// =====================================================

export const printService = {
  checkPrintServer,
  printReceipt,
  printKitchenTicket,
  printBaristaTicket,
  openCashDrawer,
};

export default printService;
