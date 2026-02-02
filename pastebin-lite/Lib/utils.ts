// lib/utils.ts
// Utility functions for business logic

import { Paste } from './kv';

// Check if paste has expired (time-based OR view-based)
export function isPasteExpired(paste: Paste, currentTime: number): boolean {
    // Check TTL (Time To Live) expiry
    if (paste.ttl_seconds) {
        const expiresAt = paste.created_at + (paste.ttl_seconds * 1000);
        if (currentTime >= expiresAt) {
            return true;  // Expired by time
        }
    }

    // Check view limit expiry
    if (paste.max_views !== undefined && paste.views_used >= paste.max_views) {
        return true;  // Expired by view count
    }

    return false;  // Still valid
}

// Calculate when paste expires (ISO 8601 format)
export function getExpiresAt(paste: Paste): string | null {
    if (!paste.ttl_seconds) return null;

    const expiresAtMs = paste.created_at + (paste.ttl_seconds * 1000);
    const expiresAt = new Date(expiresAtMs);
    return expiresAt.toISOString();  // "2026-01-01T00:00:00.000Z"
}

// Calculate remaining views (never negative)
export function getRemainingViews(paste: Paste): number | null {
    if (paste.max_views === undefined) return null;

    const remaining = paste.max_views - paste.views_used;
    return Math.max(0, remaining);  // Math.max prevents negative numbers
}
