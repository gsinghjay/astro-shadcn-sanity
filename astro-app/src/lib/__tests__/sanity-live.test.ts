/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @sanity/client
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    live: {
      events: vi.fn(() => ({
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      })),
    },
  })),
}));

import { createClient } from '@sanity/client';
import { createLiveClient, startLiveSubscription } from '@/lib/sanity-live';

beforeEach(() => {
  vi.restoreAllMocks();
  // Reset window sync tags
  window.__SANITY_SYNC_TAGS__ = [];
});

describe('createLiveClient()', () => {
  it('creates a client with CDN enabled by default', () => {
    createLiveClient({
      projectId: 'test-project',
      dataset: 'production',
      apiVersion: '2025-03-01',
    });

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'test-project',
        dataset: 'production',
        apiVersion: '2025-03-01',
        useCdn: true,
      }),
    );
  });

  it('disables CDN and includes token when token is provided', () => {
    createLiveClient({
      projectId: 'test-project',
      dataset: 'production',
      apiVersion: '2025-03-01',
      token: 'sk-test-token',
    });

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'test-project',
        dataset: 'production',
        useCdn: false,
        token: 'sk-test-token',
      }),
    );
  });
});

describe('startLiveSubscription()', () => {
  it('subscribes to client.live.events()', () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscribe = vi.fn(() => ({ unsubscribe: mockUnsubscribe }));
    const mockClient = {
      live: {
        events: vi.fn(() => ({ subscribe: mockSubscribe })),
      },
    } as any;

    const cleanup = startLiveSubscription(mockClient, vi.fn(), vi.fn());

    expect(mockClient.live.events).toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalled();
    expect(typeof cleanup).toBe('function');
  });

  it('calls onMatch when sync tags match incoming event', () => {
    const onMatch = vi.fn();
    const onRestart = vi.fn();
    let subscriberCallback: any;

    const mockClient = {
      live: {
        events: vi.fn(() => ({
          subscribe: vi.fn((handler: any) => {
            subscriberCallback = handler;
            return { unsubscribe: vi.fn() };
          }),
        })),
      },
    } as any;

    // Set page sync tags
    window.__SANITY_SYNC_TAGS__ = ['s1:abc', 's1:def'];

    startLiveSubscription(mockClient, onMatch, onRestart);

    // Simulate a message event with matching tag
    subscriberCallback.next({
      type: 'message',
      id: 'evt-123',
      tags: ['s1:abc', 's1:xyz'],
    });

    expect(onMatch).toHaveBeenCalledWith('evt-123');
    expect(onRestart).not.toHaveBeenCalled();
  });

  it('does not call onMatch when no sync tags match', () => {
    const onMatch = vi.fn();
    let subscriberCallback: any;

    const mockClient = {
      live: {
        events: vi.fn(() => ({
          subscribe: vi.fn((handler: any) => {
            subscriberCallback = handler;
            return { unsubscribe: vi.fn() };
          }),
        })),
      },
    } as any;

    window.__SANITY_SYNC_TAGS__ = ['s1:abc'];

    startLiveSubscription(mockClient, onMatch, vi.fn());

    subscriberCallback.next({
      type: 'message',
      id: 'evt-456',
      tags: ['s1:xyz'],
    });

    expect(onMatch).not.toHaveBeenCalled();
  });

  it('calls onRestart on restart event', () => {
    const onRestart = vi.fn();
    let subscriberCallback: any;

    const mockClient = {
      live: {
        events: vi.fn(() => ({
          subscribe: vi.fn((handler: any) => {
            subscriberCallback = handler;
            return { unsubscribe: vi.fn() };
          }),
        })),
      },
    } as any;

    startLiveSubscription(mockClient, vi.fn(), onRestart);

    subscriberCallback.next({ type: 'restart', id: 'evt-restart' });

    expect(onRestart).toHaveBeenCalled();
  });

  it('cleanup function calls unsubscribe', () => {
    const mockUnsubscribe = vi.fn();
    const mockClient = {
      live: {
        events: vi.fn(() => ({
          subscribe: vi.fn(() => ({ unsubscribe: mockUnsubscribe })),
        })),
      },
    } as any;

    const cleanup = startLiveSubscription(mockClient, vi.fn(), vi.fn());
    cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('handles empty window.__SANITY_SYNC_TAGS__ gracefully', () => {
    const onMatch = vi.fn();
    let subscriberCallback: any;

    const mockClient = {
      live: {
        events: vi.fn(() => ({
          subscribe: vi.fn((handler: any) => {
            subscriberCallback = handler;
            return { unsubscribe: vi.fn() };
          }),
        })),
      },
    } as any;

    delete window.__SANITY_SYNC_TAGS__;

    startLiveSubscription(mockClient, onMatch, vi.fn());

    subscriberCallback.next({
      type: 'message',
      id: 'evt-789',
      tags: ['s1:abc'],
    });

    expect(onMatch).not.toHaveBeenCalled();
  });
});
