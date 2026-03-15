import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Env, SanityEvent, Subscriber } from '../index';

// Mock resend before importing the module
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
    },
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocks
import defaultExport, {
  escapeHtml,
  fetchUpcomingEvents,
  fetchSubscribers,
  alreadySent,
  isChannelSent,
  recordSent,
  sendDiscordReminder,
  sendEmailReminder,
} from '../index';

// Helper to create mock D1 env
function createMockEnv(overrides?: Partial<Env>): Env {
  const mockRun = vi.fn().mockResolvedValue({ success: true });
  const mockBind = vi.fn().mockReturnValue({ run: mockRun });
  const mockAll = vi.fn().mockResolvedValue({ results: [] });
  const mockFirst = vi.fn().mockResolvedValue(null);
  const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind, all: mockAll, first: mockFirst });

  return {
    DB: { prepare: mockPrepare } as unknown as D1Database,
    SANITY_PROJECT_ID: 'test-project',
    SANITY_DATASET: 'production',
    SANITY_API_TOKEN: 'test-token',
    DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/test',
    RESEND_API_KEY: 'test-resend-key',
    RESEND_FROM_EMAIL: 'Test <noreply@test.com>',
    ...overrides,
  };
}

const mockEvent: SanityEvent = {
  _id: 'event-1',
  title: 'Test Workshop',
  slug: 'test-workshop',
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  endDate: null,
  location: 'Room 101',
  eventType: 'workshop',
  description: 'A test workshop event',
};

const mockSubscriber: Subscriber = {
  id: 1,
  email: 'sponsor@test.com',
  discord_user_id: 'discord-123',
  remind_days_before: 7,
};

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });

  it('returns plain text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('fetchUpcomingEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries Sanity API with correct URL and auth header', async () => {
    const env = createMockEnv();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [mockEvent] }),
    });

    const result = await fetchUpcomingEvents(env, '2026-04-01T00:00:00.000Z');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('test-project.api.sanity.io');
    expect(url).toContain('production');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(result).toEqual([mockEvent]);
  });

  it('throws on non-OK Sanity response', async () => {
    const env = createMockEnv();
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(fetchUpcomingEvents(env, '2026-04-01T00:00:00.000Z')).rejects.toThrow('Sanity API error: 401');
  });
});

describe('fetchSubscribers', () => {
  it('queries D1 for active subscribers', async () => {
    const mockAll = vi.fn().mockResolvedValue({ results: [mockSubscriber] });
    const mockPrepare = vi.fn().mockReturnValue({ all: mockAll });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await fetchSubscribers(env);

    expect(mockPrepare).toHaveBeenCalledWith(
      'SELECT id, email, discord_user_id, remind_days_before FROM subscribers WHERE active = 1',
    );
    expect(result).toEqual([mockSubscriber]);
  });
});

describe('alreadySent', () => {
  it('returns true for channels already sent', async () => {
    const mockAll = vi.fn().mockResolvedValue({ results: [{ channel: 'discord' }, { channel: 'email' }] });
    const mockBind = vi.fn().mockReturnValue({ all: mockAll });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await alreadySent(env, 'event-1', 1);

    expect(result).toEqual({ discord: true, email: true });
    expect(mockBind).toHaveBeenCalledWith('event-1', 1);
  });

  it('returns false for channels not yet sent', async () => {
    const mockAll = vi.fn().mockResolvedValue({ results: [] });
    const mockBind = vi.fn().mockReturnValue({ all: mockAll });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await alreadySent(env, 'event-1', 1);

    expect(result).toEqual({ discord: false, email: false });
  });

  it('returns partial when only one channel sent', async () => {
    const mockAll = vi.fn().mockResolvedValue({ results: [{ channel: 'discord' }] });
    const mockBind = vi.fn().mockReturnValue({ all: mockAll });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await alreadySent(env, 'event-1', 1);

    expect(result).toEqual({ discord: true, email: false });
  });
});

describe('isChannelSent', () => {
  it('returns true when channel-level record exists (subscriber_id=0)', async () => {
    const mockFirst = vi.fn().mockResolvedValue({ '1': 1 });
    const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await isChannelSent(env, 'event-1', 'discord');

    expect(result).toBe(true);
    expect(mockBind).toHaveBeenCalledWith('event-1', 'discord');
  });

  it('returns false when no channel-level record exists', async () => {
    const mockFirst = vi.fn().mockResolvedValue(null);
    const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    const result = await isChannelSent(env, 'event-1', 'discord');

    expect(result).toBe(false);
  });
});

describe('recordSent', () => {
  it('inserts into sent_reminders with INSERT OR IGNORE', async () => {
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockBind = vi.fn().mockReturnValue({ run: mockRun });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });

    await recordSent(env, 'event-1', 1, 'discord');

    expect(mockPrepare).toHaveBeenCalledWith(
      'INSERT OR IGNORE INTO sent_reminders (event_id, subscriber_id, channel) VALUES (?, ?, ?)',
    );
    expect(mockBind).toHaveBeenCalledWith('event-1', 1, 'discord');
    expect(mockRun).toHaveBeenCalled();
  });
});

describe('sendDiscordReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends Discord embed with correct event details', async () => {
    const env = createMockEnv();
    mockFetch.mockResolvedValue({ ok: true });

    await sendDiscordReminder(env, mockEvent);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://discord.com/api/webhooks/test');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0].title).toContain('Test Workshop');
    expect(body.embeds[0].color).toBe(0x16a34a); // green for workshop
    expect(body.embeds[0].fields.some((f: { name: string }) => f.name === 'Location')).toBe(true);
  });

  it('uses default color for unknown event type', async () => {
    const env = createMockEnv();
    mockFetch.mockResolvedValue({ ok: true });

    await sendDiscordReminder(env, { ...mockEvent, eventType: 'unknown' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.embeds[0].color).toBe(0x6b7280);
  });

  it('omits location field when null', async () => {
    const env = createMockEnv();
    mockFetch.mockResolvedValue({ ok: true });

    await sendDiscordReminder(env, { ...mockEvent, location: null });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    const locationField = body.embeds[0].fields.find((f: { name: string }) => f.name === 'Location');
    expect(locationField).toBeUndefined();
  });
});

describe('sendEmailReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email via Resend with correct parameters', async () => {
    const { Resend } = await import('resend');
    const env = createMockEnv();

    await sendEmailReminder(env, 'sponsor@test.com', mockEvent);

    expect(Resend).toHaveBeenCalledWith('test-resend-key');
  });

  it('escapes HTML in event fields', async () => {
    const { Resend } = await import('resend');
    const env = createMockEnv();

    const xssEvent: SanityEvent = {
      ...mockEvent,
      title: '<script>alert("xss")</script>',
      location: '<img src=x onerror=alert(1)>',
      description: 'Normal & safe <b>text</b>',
    };

    await sendEmailReminder(env, 'sponsor@test.com', xssEvent);

    const resendInstance = (Resend as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const sendCall = resendInstance.emails.send.mock.calls[0][0];
    expect(sendCall.html).toContain('&lt;script&gt;');
    expect(sendCall.html).not.toContain('<script>');
    expect(sendCall.html).toContain('&lt;img');
    expect(sendCall.html).toContain('Normal &amp; safe &lt;b&gt;text&lt;/b&gt;');
  });
});

describe('scheduled handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exits early when no events found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [] }),
    });

    const env = createMockEnv();
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

    await defaultExport.scheduled({ scheduledTime: Date.now() } as ScheduledEvent, env, ctx);

    // Only the Sanity fetch call should have been made
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('exits early when no subscribers found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [mockEvent] }),
    });

    const mockAll = vi.fn().mockResolvedValue({ results: [] });
    const mockPrepare = vi.fn().mockReturnValue({ all: mockAll });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

    await defaultExport.scheduled({ scheduledTime: Date.now() } as ScheduledEvent, env, ctx);

    // Sanity fetch + D1 subscribers query, but no Discord/email sends
    expect(mockFetch).toHaveBeenCalledTimes(1); // Only Sanity
  });

  it('skips events outside subscriber reminder window', async () => {
    const farFutureEvent: SanityEvent = {
      ...mockEvent,
      _id: 'far-event',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [farFutureEvent] }),
    });

    // Subscriber with 7-day window won't match a 25-day-out event
    const subscriberWith7Days: Subscriber = { ...mockSubscriber, remind_days_before: 7 };

    const mockAll = vi.fn().mockResolvedValue({ results: [subscriberWith7Days] });
    const mockPrepare = vi.fn().mockReturnValue({ all: mockAll });
    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

    await defaultExport.scheduled({ scheduledTime: Date.now() } as ScheduledEvent, env, ctx);

    // Only Sanity API call — no Discord/email
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('skips already-sent event+subscriber email combinations', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: [mockEvent] }),
      })
      .mockResolvedValue({ ok: true }); // Discord/email responses

    // Return subscriber
    const mockSubAll = vi.fn().mockResolvedValue({ results: [mockSubscriber] });
    // isChannelSent returns null (not sent yet) → will send Discord
    const mockFirst = vi.fn().mockResolvedValue(null);
    // alreadySent returns email already sent
    const mockSentAll = vi.fn().mockResolvedValue({ results: [{ channel: 'email' }] });
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockBind = vi.fn().mockReturnValue({ all: mockSentAll, run: mockRun, first: mockFirst });
    const mockPrepare = vi
      .fn()
      .mockReturnValueOnce({ all: mockSubAll }) // fetchSubscribers
      .mockReturnValue({ bind: mockBind }); // isChannelSent, recordSent, alreadySent

    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

    await defaultExport.scheduled({ scheduledTime: Date.now() } as ScheduledEvent, env, ctx);

    // Sanity fetch + Discord send = 2 fetch calls (email was already sent, so skipped)
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('sends Discord once per event and email per subscriber', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: [mockEvent] }),
      })
      .mockResolvedValue({ ok: true }); // Discord webhook response

    // Two subscribers
    const sub1: Subscriber = { ...mockSubscriber, id: 1, email: 'sub1@test.com' };
    const sub2: Subscriber = { ...mockSubscriber, id: 2, email: 'sub2@test.com' };

    const mockSubAll = vi.fn().mockResolvedValue({ results: [sub1, sub2] });
    // isChannelSent returns null → not sent
    const mockFirst = vi.fn().mockResolvedValue(null);
    // alreadySent returns neither channel sent
    const mockSentAll = vi.fn().mockResolvedValue({ results: [] });
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockBind = vi.fn().mockReturnValue({ all: mockSentAll, run: mockRun, first: mockFirst });
    const mockPrepare = vi
      .fn()
      .mockReturnValueOnce({ all: mockSubAll }) // fetchSubscribers
      .mockReturnValue({ bind: mockBind }); // isChannelSent, recordSent, alreadySent

    const env = createMockEnv({ DB: { prepare: mockPrepare } as unknown as D1Database });
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

    await defaultExport.scheduled({ scheduledTime: Date.now() } as ScheduledEvent, env, ctx);

    // Sanity fetch (1) + Discord once (1) = 2 fetch calls
    // Email is sent via Resend SDK (not fetch), so not counted here
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Verify Discord was called exactly once
    const discordCalls = mockFetch.mock.calls.filter(
      (call) => call[0] === 'https://discord.com/api/webhooks/test',
    );
    expect(discordCalls).toHaveLength(1);
  });
});
