// app/api/pastes/[id]/route.ts
// GET endpoint to fetch a paste by ID

import { NextRequest } from 'next/server';
import { getPaste, getCurrentTime, incrementViews } from '../../../../Lib/kv';
import { isPasteExpired, getExpiresAt, getRemainingViews } from '../../../../Lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params (Next.js 16 change)
        const { id } = await params;

        // Fetch paste from database
        const paste = await getPaste(id);

        // If paste doesn't exist, return 404
        if (!paste) {
            return Response.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Get current time (supports TEST_MODE)
        const currentTime = getCurrentTime(request.headers);

        // Check if paste has expired
        if (isPasteExpired(paste, currentTime)) {
            return Response.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Increment view count BEFORE checking if we hit the limit
        // This is important: the current request counts as a view
        await incrementViews(id);

        // Fetch updated paste to get new view count
        const updatedPaste = await getPaste(id);

        if (!updatedPaste) {
            return Response.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Calculate response fields
        const remaining_views = getRemainingViews(updatedPaste);
        const expires_at = getExpiresAt(updatedPaste);

        // Return paste data
        return Response.json({
            content: updatedPaste.content,
            remaining_views,
            expires_at,
        });

    } catch (error) {
        console.error('Error fetching paste:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}