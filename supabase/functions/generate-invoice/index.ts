// Edge Function: generate-invoice
// Generates HTML/PDF invoice for B2B orders

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-client.ts';

interface InvoiceData {
    order: {
        id: string;
        order_number: string;
        order_date: string;
        delivery_date: string | null;
        subtotal: number;
        discount_amount: number;
        tax_rate: number;
        tax_amount: number;
        total: number;
        notes: string | null;
    };
    customer: {
        name: string;
        company_name: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        tax_id: string | null;
    };
    items: Array<{
        product_name: string;
        product_sku: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function generateInvoiceHTML(data: InvoiceData, invoiceNumber: string): string {
    const itemsHTML = data.items.map(item => `
    <tr>
      <td>${item.product_sku}</td>
      <td>${item.product_name}</td>
      <td class="text-right">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.unit_price)}</td>
      <td class="text-right">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #6F4E37; }
    .logo h1 { color: #6F4E37; font-size: 28px; }
    .logo p { color: #666; font-size: 12px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { color: #6F4E37; font-size: 24px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .party { width: 45%; }
    .party h3 { color: #6F4E37; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
    .party p { font-size: 14px; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #6F4E37; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .text-right { text-align: right; }
    .totals { width: 300px; margin-left: auto; }
    .totals tr td { padding: 8px 12px; }
    .totals .grand-total { font-size: 18px; font-weight: bold; color: #6F4E37; border-top: 2px solid #6F4E37; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
    .notes { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px; }
    .notes h4 { color: #6F4E37; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">
        <h1>THE BREAKERY</h1>
        <p>French Bakery & Coffee</p>
        <p>Lombok, Indonesia</p>
      </div>
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p><strong>No:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${formatDate(data.order.order_date)}</p>
        <p><strong>Order:</strong> ${data.order.order_number}</p>
      </div>
    </div>
    
    <div class="parties">
      <div class="party">
        <h3>Bill To</h3>
        <p><strong>${data.customer.company_name || data.customer.name}</strong></p>
        ${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
        ${data.customer.phone ? `<p>Tel: ${data.customer.phone}</p>` : ''}
        ${data.customer.email ? `<p>Email: ${data.customer.email}</p>` : ''}
        ${data.customer.tax_id ? `<p>NPWP: ${data.customer.tax_id}</p>` : ''}
      </div>
      <div class="party">
        <h3>From</h3>
        <p><strong>The Breakery</strong></p>
        <p>Jl. Example Street No. 123</p>
        <p>Lombok, NTB, Indonesia</p>
        <p>Tel: +62 XXX XXX XXXX</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <table class="totals">
      <tr>
        <td>Subtotal</td>
        <td class="text-right">${formatCurrency(data.order.subtotal)}</td>
      </tr>
      ${data.order.discount_amount > 0 ? `
      <tr>
        <td>Discount</td>
        <td class="text-right">-${formatCurrency(data.order.discount_amount)}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Tax (${(data.order.tax_rate * 100).toFixed(0)}%)</td>
        <td class="text-right">${formatCurrency(data.order.tax_amount)}</td>
      </tr>
      <tr class="grand-total">
        <td>TOTAL</td>
        <td class="text-right">${formatCurrency(data.order.total)}</td>
      </tr>
    </table>
    
    ${data.order.notes ? `
    <div class="notes">
      <h4>Notes</h4>
      <p>${data.order.notes}</p>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Payment terms: Net 30 days | Bank: BCA | Account: XXXX-XXX-XXX</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const { order_id } = await req.json();

        if (!order_id) {
            return errorResponse('order_id is required');
        }

        // Fetch order with customer and items
        const { data: order, error: orderError } = await supabaseAdmin
            .from('b2b_orders')
            .select(`
        id,
        order_number,
        order_date,
        delivery_date,
        subtotal,
        discount_amount,
        tax_rate,
        tax_amount,
        total,
        notes,
        invoice_number,
        customers (
          name,
          company_name,
          address,
          phone,
          email,
          tax_id
        )
      `)
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return errorResponse('Order not found', 404);
        }

        // Fetch order items
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('b2b_order_items')
            .select('product_name, product_sku, quantity, unit_price, total')
            .eq('order_id', order_id);

        if (itemsError) {
            return errorResponse('Failed to fetch order items');
        }

        // Generate invoice number if not exists
        let invoiceNumber = order.invoice_number;
        if (!invoiceNumber) {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

            // Get sequence number for today
            const { count } = await supabaseAdmin
                .from('b2b_orders')
                .select('*', { count: 'exact', head: true })
                .like('invoice_number', `INV-${dateStr}%`);

            const seqNum = (count || 0) + 1;
            invoiceNumber = `INV-${dateStr}-${String(seqNum).padStart(3, '0')}`;

            // Update order with invoice number
            await supabaseAdmin
                .from('b2b_orders')
                .update({
                    invoice_number: invoiceNumber,
                    invoice_generated_at: new Date().toISOString(),
                })
                .eq('id', order_id);
        }

        // Prepare invoice data
        const invoiceData: InvoiceData = {
            order: {
                id: order.id,
                order_number: order.order_number,
                order_date: order.order_date,
                delivery_date: order.delivery_date,
                subtotal: order.subtotal,
                discount_amount: order.discount_amount,
                tax_rate: order.tax_rate,
                tax_amount: order.tax_amount,
                total: order.total,
                notes: order.notes,
            },
            customer: order.customers as InvoiceData['customer'],
            items: items || [],
        };

        // Generate HTML
        const html = generateInvoiceHTML(invoiceData, invoiceNumber);

        return new Response(html, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/html',
            },
        });

    } catch (error) {
        console.error('Error generating invoice:', error);
        return errorResponse('Internal server error', 500);
    }
});
