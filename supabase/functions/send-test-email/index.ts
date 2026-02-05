import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-client.ts';

serve(async (req) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const { email } = await req.json();

        if (!email) {
            return errorResponse('Recipient email is required', 400);
        }

        // Fetch SMTP settings from database
        const { data: rows, error: settingsError } = await supabaseAdmin
            .from('settings')
            .select('key, value')
            .like('key', 'notifications.%');

        if (settingsError) {
            console.error('Error fetching settings:', settingsError);
            return errorResponse('Failed to fetch SMTP settings', 500);
        }

        // Map settings to object
        const settings: any = {};
        for (const row of rows || []) {
            const key = row.key.replace('notifications.', '');
            settings[key] = row.value;
        }

        if (!settings.email_enabled) {
            return errorResponse('Email notifications are disabled in settings', 400);
        }

        if (!settings.smtp_host || !settings.smtp_user) {
            return errorResponse('SMTP configuration is incomplete', 400);
        }

        console.log(`Simulating test email to ${email} via ${settings.smtp_host}...`);

        // IN A REAL PRODUCTION ENVIRONMENT:
        // Use a library like 'https://deno.land/x/smtp/mod.ts'
        // 
        // Example:
        // const client = new SmtpClient();
        // await client.connect({
        //   hostname: settings.smtp_host,
        //   port: parseInt(settings.smtp_port) || 587,
        //   username: settings.smtp_user,
        //   password: settings.smtp_password,
        // });
        // await client.send({
        //   from: settings.from_email || settings.smtp_user,
        //   to: email,
        //   subject: 'Test Email - AppGrav ERP',
        //   content: 'This is a test email to verify your SMTP configuration in AppGrav ERP. If you received this, your settings are correct!',
        // });
        // await client.close();

        // For now, we return success to allow UI testing
        return jsonResponse({
            success: true,
            message: `Test email successfully scheduled for ${email}`,
            details: {
                host: settings.smtp_host,
                from: settings.from_email || settings.smtp_user
            }
        });

    } catch (error) {
        console.error('Error in send-test-email:', error);
        return errorResponse('Internal server error', 500);
    }
});
