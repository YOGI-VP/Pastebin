// app/p/[id]/page.tsx
// HTML page to view a paste

import { notFound } from 'next/navigation';
import { getPaste } from '../../../../Lib/kv';
import { isPasteExpired } from '../../../../Lib/utils';

// This function runs on the server
export default async function ViewPastePage({
                                                params,
                                            }: {
    params: Promise<{ id: string }>;
}) {
    // Await params (Next.js 16 change)
    const { id } = await params;

    // Fetch paste from database
    const paste = await getPaste(id);

    // If paste doesn't exist, show 404 page
    if (!paste) {
        notFound();
    }

    // For HTML page view, we use real system time (not TEST_MODE)
    // TEST_MODE only applies to API routes
    const currentTime = Date.now();

    // Check if paste has expired
    if (isPasteExpired(paste, currentTime)) {
        notFound();
    }

    // Return HTML (React automatically escapes the content to prevent XSS)
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">Paste Content</h1>

                    {/* Display paste content (safely escaped by React) */}
                    <div className="bg-gray-100 p-4 rounded border border-gray-300">
            <pre className="whitespace-pre-wrap break-words text-gray-800">
              {paste.content}
            </pre>
                    </div>

                    {/* Show metadata */}
                    <div className="mt-4 text-sm text-gray-600">
                        {paste.max_views && (
                            <p>Views remaining: {paste.max_views - paste.views_used}</p>
                        )}
                        {paste.ttl_seconds && (
                            <p>Expires at: {new Date(paste.created_at + paste.ttl_seconds * 1000).toLocaleString()}</p>
                        )}
                    </div>

                    {/* Link back to home */}
                    <div className="mt-6">
                        <a
                            href="/"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            ← Create another paste
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}