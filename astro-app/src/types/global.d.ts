declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    __SANITY_SYNC_TAGS__?: string[];
    __SANITY_LIVE_TOKEN__?: string;
  }
}

export {};
