import { Handler } from '@netlify/functions';
import { BUSINESS_ID } from '../../src/config/businessServer';
import { supabase } from '../../src/config/supabaseServerClient';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { appointmentId, googleEventId } = body;

        if (!appointmentId || !googleEventId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'appointmentId and googleEventId are required' }),
            };
        }

        let query = supabase
            .from('appointments')
            .update({
                google_event_id: googleEventId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId);

        if (BUSINESS_ID) {
            query = query.eq('business_id', BUSINESS_ID);
        }

        const { error } = await query;

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Appointment updated successfully' }),
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[update-appointment-google-id] Error:', message, err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to update appointment',
                message,
            }),
        };
    }
};
