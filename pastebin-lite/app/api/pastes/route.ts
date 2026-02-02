// app/api/pastes/route.ts
// POST endpoint to create a new paste

import { nanoid } from 'nanoid';
import { savePaste, getCurrentTime } from '../../../Lib/kv';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse JSON body
        const body = await request.json();

        // Validate required field: content
        if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
            return Response.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate optional field: ttl_seconds
        if (body.ttl_seconds !== undefined) {
            if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
                return Response.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Validate optional field: max_views
        if (body.max_views !== undefined) {
            if (!Number.isInteger(body.max_views) || body.max_views < 1) {
                return Response.json(
                    { error: 'max_views must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Generate unique ID (like UUID in Java)
        const id = nanoid(10);  // e.g., "V1StGXR8_Z"

        // Get current time
        const currentTime = getCurrentTime(request.headers);

        // Create paste object
        const paste = {
            id,
            content: body.content,
            created_at: currentTime,
            ttl_seconds: body.ttl_seconds,
            max_views: body.max_views,
            views_used: 0,
        };

        // Save to database
        await savePaste(paste);

        // Get base URL (like request.getServerName() in Java)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        // Return success response
        return Response.json({
            id,
            url: `${baseUrl}/p/${id}`,
        });

    } catch (error) {
        // Handle unexpected errors
        console.error('Error creating paste:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}