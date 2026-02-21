/**
 * Sanity Live Content API client module.
 * Subscribes to sync tag events from the Content Lake and triggers
 * targeted page refreshes when matching content changes are detected.
 *
 * This module runs exclusively in the browser (imported by SanityLiveUpdater.astro).
 * It uses `client.live.events()` — the officially recommended approach for
 * real-time content updates (not the legacy `client.listen()` API).
 *
 * CDN-compatible: uses `useCdn: true` with `lastLiveEventId` for cache-busting.
 */
import { createClient } from '@sanity/client';

/** Maximum reconnect attempts before giving up silently. */
const MAX_RECONNECT_ATTEMPTS = 5;

/** Initial backoff delay in milliseconds. */
const INITIAL_BACKOFF_MS = 1000;

/**
 * Creates a Sanity client configured for Live Content API subscriptions.
 * Uses the same apiVersion as the main @sanity/astro client config.
 */
export function createLiveClient(config: {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn?: boolean;
  token?: string;
}) {
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: config.token ? false : (config.useCdn ?? true),
    ...(config.token ? { token: config.token } : {}),
  });
}

/**
 * Starts a Live Content API subscription that monitors sync tag events
 * and triggers a callback when matching content changes are detected.
 *
 * @param client - Sanity client instance from createLiveClient()
 * @param onMatch - Callback invoked with the lastLiveEventId when a sync tag match is detected
 * @param onRestart - Callback invoked when a restart event is received (re-fetch without lastLiveEventId)
 * @returns Cleanup function to unsubscribe
 */
export function startLiveSubscription(
  client: ReturnType<typeof createClient>,
  onMatch: (lastLiveEventId: string) => void,
  onRestart: () => void,
): () => void {
  let reconnectAttempts = 0;
  let subscription: { unsubscribe: () => void } | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function getSyncTags(): string[] {
    return window.__SANITY_SYNC_TAGS__ ?? [];
  }

  function subscribe() {
    try {
      subscription = client.live.events().subscribe({
        next: (event) => {
          if (event.type === 'message') {
            const pageTags = getSyncTags();
            const hasMatch = event.tags.some((tag: string) => pageTags.includes(tag));
            if (hasMatch) {
              onMatch(event.id);
            }
            // Reset reconnect counter on successful message
            reconnectAttempts = 0;
          }

          if (event.type === 'restart') {
            onRestart();
            reconnectAttempts = 0;
          }

          if (event.type === 'welcome') {
            reconnectAttempts = 0;
          }
        },
        error: (err) => {
          if (import.meta.env.DEV) {
            console.warn('[sanity-live] Subscription error:', err);
          }
          attemptReconnect();
        },
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[sanity-live] Failed to start subscription:', err);
      }
      attemptReconnect();
    }
  }

  function attemptReconnect() {
    reconnectAttempts++;
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      if (import.meta.env.DEV) {
        console.warn(
          `[sanity-live] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`,
        );
      }
      return;
    }

    const delay = INITIAL_BACKOFF_MS * Math.pow(2, reconnectAttempts - 1);
    if (import.meta.env.DEV) {
      console.log(`[sanity-live] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    }
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      cleanup();
      subscribe();
    }, delay);
  }

  function cleanup() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  // Start the subscription
  subscribe();

  // Return cleanup function
  return cleanup;
}
