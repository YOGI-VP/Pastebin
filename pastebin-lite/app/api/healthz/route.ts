// app/api/healthz/route.ts
// Health check endpoint - tests if server and database are working

import { kv } from '@vercel/kv';

export async function GET() {
    try {
        // Try to ping database to check connection
        await kv.ping();

        // Return 200 OK with JSON
        return Response.json({ ok: true });
    } catch (error) {
        // If database is down, return 500 error
        return Response.json(
            { ok: false, error: 'Database unavailable' },
            { status: 500 }
        );
    }
}