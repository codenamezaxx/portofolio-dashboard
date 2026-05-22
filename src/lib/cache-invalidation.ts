/**
 * Cache Invalidation and ISR Revalidation
 * Handles cache invalidation when content is updated
 */

import { ContentChangeEvent, ContentTableType } from './realtime';

// Cache invalidation endpoints
const REVALIDATE_ENDPOINTS = {
  profiles: '/api/revalidate?tag=profile',
  tech_stack: '/api/revalidate?tag=tech-stack',
  journey_items: '/api/revalidate?tag=journey',
  projects: '/api/revalidate?tag=projects',
  achievements: '/api/revalidate?tag=achievements',
  contact_info: '/api/revalidate?tag=contact-info',
  all: '/api/revalidate?tag=all'
};

// Track pending revalidations to batch them
const pendingRevalidations = new Set<string>();
let revalidationTimeout: NodeJS.Timeout | null = null;

/**
 * Map table name to revalidation tag
 */
function getRevalidationTag(table: ContentTableType): string {
  const tagMap: Record<ContentTableType, string> = {
    profiles: 'profile',
    tech_stack: 'tech-stack',
    journey_items: 'journey',
    projects: 'projects',
    achievements: 'achievements',
    contact_info: 'contact-info'
  };
  return tagMap[table];
}

/**
 * Trigger ISR revalidation for a specific tag
 */
export async function revalidateTag(tag: string): Promise<void> {
  try {
    const response = await fetch(`/api/revalidate?tag=${tag}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to revalidate tag ${tag}:`, response.statusText);
    } else {
      console.log(`Successfully revalidated tag: ${tag}`);
    }
  } catch (error) {
    console.error(`Error revalidating tag ${tag}:`, error);
  }
}

/**
 * Batch revalidate multiple tags
 */
export async function batchRevalidateTags(tags: string[]): Promise<void> {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tags })
    });

    if (!response.ok) {
      console.error('Failed to batch revalidate tags:', response.statusText);
    } else {
      console.log(`Successfully revalidated ${tags.length} tags`);
    }
  } catch (error) {
    console.error('Error batch revalidating tags:', error);
  }
}

/**
 * Queue a revalidation with debouncing
 * This prevents too many revalidation requests when multiple changes occur
 */
export function queueRevalidation(tag: string, delayMs: number = 1000): void {
  pendingRevalidations.add(tag);

  // Clear existing timeout
  if (revalidationTimeout) {
    clearTimeout(revalidationTimeout);
  }

  // Set new timeout to batch revalidations
  revalidationTimeout = setTimeout(async () => {
    const tags = Array.from(pendingRevalidations);
    pendingRevalidations.clear();
    revalidationTimeout = null;

    if (tags.length > 0) {
      await batchRevalidateTags(tags);
    }
  }, delayMs);
}

/**
 * Handle content change event and trigger appropriate cache invalidation
 */
export function handleContentChange(event: ContentChangeEvent): void {
  const tag = getRevalidationTag(event.table);

  // Queue revalidation with debouncing
  queueRevalidation(tag);

  // Also revalidate the main page
  queueRevalidation('main');

  console.log(`Content change detected in ${event.table} (${event.type}), queued revalidation for tag: ${tag}`);
}

/**
 * Immediately invalidate cache without debouncing
 * Use this for critical updates
 */
export async function invalidateCacheImmediate(table: ContentTableType): Promise<void> {
  const tag = getRevalidationTag(table);
  
  // Clear any pending revalidations for this tag
  pendingRevalidations.delete(tag);

  // Revalidate immediately
  await revalidateTag(tag);
  await revalidateTag('main');
}

/**
 * Clear all pending revalidations
 */
export function clearPendingRevalidations(): void {
  if (revalidationTimeout) {
    clearTimeout(revalidationTimeout);
    revalidationTimeout = null;
  }
  pendingRevalidations.clear();
}

/**
 * Get pending revalidation tags
 */
export function getPendingRevalidations(): string[] {
  return Array.from(pendingRevalidations);
}
