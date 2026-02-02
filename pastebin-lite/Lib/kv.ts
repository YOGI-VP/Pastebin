// lib/kv.ts
// Database helper functions - like DAO (Data Access Object) in Java

import { kv } from '@vercel/kv';

// Paste entity (like a Java class/POJO)
export interface Paste {
    id: string;
    content: string;
    created_at: number;        // timestamp in milliseconds
    ttl_seconds?: number;      // optional - ? means can be undefined
    max_views?: number;        // optional
    views_used: number;
}

// Get current time (handles TEST_MODE for automated testing)
export function getCurrentTime(headers?: Headers): number {
    // In TEST_MODE, use fake time from header (for testing)
    if (process.env.TEST_MODE === '1' && headers) {
        const testTime = headers.get('x-test-now-ms');
        if (testTime) {
            return parseInt(testTime, 10);
        }
    }
    // Otherwise use real system time
    return Date.now();
}

// Save paste to Redis database
export async function savePaste(paste: Paste): Promise<void> {
    // Store with key "paste:abc123"
    // Like: redisTemplate.opsForValue().set("paste:" + id, paste)
    await kv.set(`paste:${paste.id}`, paste);

    // If TTL exists, set Redis auto-expiration
    // Add 300 seconds buffer to prevent edge cases
    if (paste.ttl_seconds) {
        await kv.expire(`paste:${paste.id}`, paste.ttl_seconds + 300);
    }
}

// Get paste from Redis
export async function getPaste(id: string): Promise<Paste | null> {
    // Like: redisTemplate.opsForValue().get("paste:" + id)
    const paste = await kv.get<Paste>(`paste:${id}`);
    return paste;
}

// Increment view count atomically (thread-safe)
export async function incrementViews(id: string): Promise<void> {
    // Like: AtomicInteger.incrementAndGet() in Java
    // hincrby = Hash Increment By (atomic operation)
    await kv.hincrby(`paste:${id}`, 'views_used', 1);
}
