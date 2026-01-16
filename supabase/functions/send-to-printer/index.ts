// Edge Function: send-to-printer
// Sends print jobs to local print server

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-client.ts';

interface PrintJob {
    type: 'receipt' | 'kitchen' | 'label';
    printer?: string;
    data: ReceiptData | KitchenTicketData;
}

interface ReceiptData {
    order_id: string;
    order_number: string;
    order_type: string;
    table_number?: string;
    items: Array<{
        name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        modifiers?: Array<{ label: string; price: number }>;
    }>;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    payment_method: string;
    cash_received?: number;
    change_given?: number;
    staff_name: string;
    created_at: string;
    customer_name?: string;
    points_earned?: number;
}

interface KitchenTicketData {
    order_number: string;
    table_number?: string;
    order_type: string;
    items: Array<{
        name: string;
        quantity: number;
        modifiers?: string[];
        notes?: string;
    }>;
    station: string;
    created_at: string;
}

function formatReceiptText(data: ReceiptData): string {
    const lines: string[] = [];
    const width = 48; // Standard thermal printer width

    const center = (text: string) => {
        const padding = Math.floor((width - text.length) / 2);
        return ' '.repeat(Math.max(0, padding)) + text;
    };

    const line = (left: string, right: string) => {
        const spaces = width - left.length - right.length;
        return left + ' '.repeat(Math.max(1, spaces)) + right;
    };

    const divider = '='.repeat(width);
    const thinDivider = '-'.repeat(width);

    // Header
    lines.push(center('THE BREAKERY'));
    lines.push(center('French Bakery & Coffee'));
    lines.push(center('Lombok, Indonesia'));
    lines.push('');
    lines.push(divider);
    lines.push('');
    lines.push(line('Order:', data.order_number));
    lines.push(line('Date:', new Date(data.created_at).toLocaleString('id-ID')));
    lines.push(line('Type:', data.order_type.toUpperCase()));
    if (data.table_number) {
        lines.push(line('Table:', data.table_number));
    }
    lines.push(line('Staff:', data.staff_name));
    if (data.customer_name) {
        lines.push(line('Customer:', data.customer_name));
    }
    lines.push('');
    lines.push(divider);
    lines.push('');

    // Items
    for (const item of data.items) {
        lines.push(line(`${item.quantity}x ${item.name}`, `Rp ${item.total_price.toLocaleString()}`));
        if (item.modifiers && item.modifiers.length > 0) {
            for (const mod of item.modifiers) {
                if (mod.price > 0) {
                    lines.push(line(`   + ${mod.label}`, `Rp ${mod.price.toLocaleString()}`));
                } else {
                    lines.push(`   + ${mod.label}`);
                }
            }
        }
    }

    lines.push('');
    lines.push(thinDivider);
    lines.push('');

    // Totals
    lines.push(line('Subtotal:', `Rp ${data.subtotal.toLocaleString()}`));
    if (data.discount_amount > 0) {
        lines.push(line('Discount:', `-Rp ${data.discount_amount.toLocaleString()}`));
    }
    lines.push(line('Tax (11%):', `Rp ${data.tax_amount.toLocaleString()}`));
    lines.push('');
    lines.push(divider);
    lines.push(line('TOTAL:', `Rp ${data.total.toLocaleString()}`));
    lines.push(divider);
    lines.push('');

    // Payment
    lines.push(line('Payment:', data.payment_method.toUpperCase()));
    if (data.cash_received) {
        lines.push(line('Cash:', `Rp ${data.cash_received.toLocaleString()}`));
        lines.push(line('Change:', `Rp ${(data.change_given || 0).toLocaleString()}`));
    }

    // Loyalty
    if (data.points_earned && data.points_earned > 0) {
        lines.push('');
        lines.push(center(`+${data.points_earned} loyalty points earned!`));
    }

    // Footer
    lines.push('');
    lines.push(divider);
    lines.push('');
    lines.push(center('Merci de votre visite!'));
    lines.push(center('See you soon!'));
    lines.push('');
    lines.push('');
    lines.push(''); // Extra lines for cutting

    return lines.join('\n');
}

function formatKitchenTicket(data: KitchenTicketData): string {
    const lines: string[] = [];
    const width = 48;

    const center = (text: string) => {
        const padding = Math.floor((width - text.length) / 2);
        return ' '.repeat(Math.max(0, padding)) + text;
    };

    const divider = '='.repeat(width);

    // Header
    lines.push(divider);
    lines.push(center(`** ${data.station.toUpperCase()} **`));
    lines.push(divider);
    lines.push('');
    lines.push(`Order: ${data.order_number}`);
    lines.push(`Type: ${data.order_type.toUpperCase()}`);
    if (data.table_number) {
        lines.push(`Table: ${data.table_number}`);
    }
    lines.push(`Time: ${new Date(data.created_at).toLocaleTimeString('id-ID')}`);
    lines.push('');
    lines.push(divider);
    lines.push('');

    // Items
    for (const item of data.items) {
        lines.push(`${item.quantity}x ${item.name}`);
        if (item.modifiers && item.modifiers.length > 0) {
            for (const mod of item.modifiers) {
                lines.push(`   > ${mod}`);
            }
        }
        if (item.notes) {
            lines.push(`   !! ${item.notes}`);
        }
        lines.push('');
    }

    lines.push(divider);
    lines.push('');
    lines.push('');

    return lines.join('\n');
}

serve(async (req) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const job: PrintJob = await req.json();

        if (!job.type || !job.data) {
            return errorResponse('type and data are required');
        }

        // Get print server URL from settings
        const { data: settings } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'print_server_url')
            .single();

        const printServerUrl = settings?.value?.replace(/"/g, '') || 'http://192.168.1.50:3001';

        let printContent: string;
        let printer = job.printer || 'receipt';

        if (job.type === 'receipt') {
            printContent = formatReceiptText(job.data as ReceiptData);
        } else if (job.type === 'kitchen') {
            printContent = formatKitchenTicket(job.data as KitchenTicketData);
            printer = (job.data as KitchenTicketData).station || 'kitchen';
        } else {
            return errorResponse('Invalid print job type');
        }

        // Send to print server
        try {
            const printResponse = await fetch(`${printServerUrl}/print`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    printer,
                    content: printContent,
                    type: 'text',
                }),
            });

            if (!printResponse.ok) {
                console.error('Print server error:', await printResponse.text());
                return jsonResponse({
                    success: false,
                    message: 'Print server returned an error',
                    content: printContent, // Return content so client can retry
                });
            }

            return jsonResponse({
                success: true,
                message: 'Print job sent successfully',
            });

        } catch (fetchError) {
            console.error('Failed to reach print server:', fetchError);
            // Return the content so client can handle offline printing
            return jsonResponse({
                success: false,
                message: 'Could not reach print server',
                content: printContent,
                offline: true,
            });
        }

    } catch (error) {
        console.error('Error processing print job:', error);
        return errorResponse('Internal server error', 500);
    }
});
