// @vitest-environment jsdom
import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';

// Silence React 19's "testing environment not configured for act(...)" warning
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock the viewer so jsdom doesn't load the pdfjs worker. The mock fires onReady with
// `viewerMockState.numPages` synchronously on mount; tests that need the PDF to be "not ready"
// flip the count to 0 (mirrors empty/corrupt PDF -> checkbox/button stay disabled).
const { viewerMockState } = vi.hoisted(() => ({
  viewerMockState: { numPages: 3 },
}));

vi.mock('../SponsorAgreementViewer', () => {
  return {
    default: ({
      pdfUrl,
      onReady,
    }: {
      pdfUrl: string;
      onReady?: (n: number) => void;
    }) => {
      React.useEffect(() => {
        onReady?.(viewerMockState.numPages);
      }, [onReady]);
      return <div data-testid="agreement-viewer-mock">viewer: {pdfUrl}</div>;
    },
  };
});

// Mock better-auth/client so the sign-out button import resolves in jsdom
vi.mock('better-auth/client', () => ({
  createAuthClient: () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}));

import SponsorAgreementModal from '../SponsorAgreementModal';

let container: HTMLDivElement;
let root: Root;

function render(ui: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(ui);
  });
}

function unmount() {
  act(() => {
    root.unmount();
  });
  container.remove();
}

async function click(el: Element | null) {
  if (!el) throw new Error('element not found');
  await act(async () => {
    (el as HTMLElement).click();
  });
}

async function toggleCheckbox(el: Element | null) {
  if (!el) throw new Error('checkbox not found');
  await act(async () => {
    (el as HTMLInputElement).click();
  });
}

const BASE_PROPS = {
  title: 'Sponsor Agreement',
  intro: null,
  pdfUrl: 'https://cdn.example/agreement.pdf',
  checkboxLabel: 'I accept the agreement',
  acceptButtonText: 'Accept & Continue',
};

describe('SponsorAgreementModal', () => {
  let reloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    viewerMockState.numPages = 3;
    // Stub `location` via vi.stubGlobal so vitest restores it cleanly between
    // tests — direct `window.location =` assignment leaves Location in a broken
    // state that breaks URL.prototype.toString() in any test sharing the worker
    // (CI uses singleFork pool, so leakage is observable).
    reloadSpy = vi.fn();
    vi.stubGlobal('location', {
      ...window.location,
      reload: reloadSpy,
      origin: window.location.origin,
      href: window.location.href,
      toString: () => window.location.href,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (container) unmount();
    document.body.style.overflow = '';
  });

  it('renders title, checkbox label, accept button, and viewer', () => {
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    expect(container.textContent).toContain('Sponsor Agreement');
    expect(container.textContent).toContain('I accept the agreement');
    expect(container.textContent).toContain('Accept & Continue');
    expect(container.querySelector('[data-testid="agreement-viewer-mock"]')).toBeTruthy();
  });

  it('checkbox is unchecked by default and accept button is disabled until it is checked', async () => {
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    const cb = container.querySelector('[data-testid="agreement-checkbox"]') as HTMLInputElement;
    const btn = container.querySelector('[data-testid="agreement-accept"]') as HTMLButtonElement;

    expect(cb.checked).toBe(false);
    expect(btn.disabled).toBe(true);

    await toggleCheckbox(cb);
    expect(cb.checked).toBe(true);
    expect(btn.disabled).toBe(false);
  });

  it('checkbox + accept button are disabled while pdfReady=false (numPages=0)', () => {
    viewerMockState.numPages = 0;
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    const cb = container.querySelector('[data-testid="agreement-checkbox"]') as HTMLInputElement;
    const btn = container.querySelector('[data-testid="agreement-accept"]') as HTMLButtonElement;
    expect(cb.disabled).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it('clicking accept POSTs to /api/portal/agreement/accept then reloads on 200', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ acceptedAt: 123 }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(<SponsorAgreementModal {...BASE_PROPS} />);
    const cb = container.querySelector('[data-testid="agreement-checkbox"]');
    await toggleCheckbox(cb);
    const btn = container.querySelector('[data-testid="agreement-accept"]');
    await click(btn);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/portal/agreement/accept',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    // Allow microtask queue to drain the promise chain
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('shows inline error on non-200/409 response and re-enables accept button', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 500,
        json: async () => ({ error: 'server_error' }),
      }),
    );

    render(<SponsorAgreementModal {...BASE_PROPS} />);
    const cb = container.querySelector('[data-testid="agreement-checkbox"]');
    await toggleCheckbox(cb);
    const btn = container.querySelector('[data-testid="agreement-accept"]') as HTMLButtonElement;
    await click(btn);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toMatch(/could not accept/i);
    expect(btn.disabled).toBe(false);
  });

  it('sign-out link is always visible (both configured and null-doc states)', () => {
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    expect(container.querySelector('[data-portal-signout]')).toBeTruthy();
    unmount();

    render(<SponsorAgreementModal {...BASE_PROPS} pdfUrl={null} />);
    expect(container.querySelector('[data-portal-signout]')).toBeTruthy();
  });

  it('fallback state (no pdfUrl) shows "not yet configured" and hides accept button', () => {
    render(<SponsorAgreementModal {...BASE_PROPS} pdfUrl={null} />);
    expect(container.textContent).toMatch(/not yet configured/i);
    expect(container.querySelector('[data-testid="agreement-accept"]')).toBeNull();
  });

  it('locks body scroll on mount and restores it on unmount', () => {
    expect(document.body.style.overflow).toBe('');
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not render a scroll hint or scroll-related aria-describedby', () => {
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    expect(container.querySelector('[data-testid="agreement-scroll-hint"]')).toBeNull();
    expect(container.querySelector('#agreement-scroll-hint')).toBeNull();
    const cb = container.querySelector('[data-testid="agreement-checkbox"]');
    expect(cb?.getAttribute('aria-describedby')).toBeNull();
  });
});
