// @vitest-environment jsdom
import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';

// Silence React 19's "testing environment not configured for act(...)" warning
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock the viewer to skip loading the pdfjs worker in jsdom
vi.mock('../SponsorAgreementViewer', () => ({
  default: ({ pdfUrl }: { pdfUrl: string }) => (
    <div data-testid="agreement-viewer-mock">viewer: {pdfUrl}</div>
  ),
}));

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
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    // @ts-expect-error jsdom - assign reload spy
    window.location = { ...window.location, reload: vi.fn(), origin: 'http://localhost' };
  });

  afterEach(() => {
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

  it('accept button is disabled until checkbox is checked', async () => {
    render(<SponsorAgreementModal {...BASE_PROPS} />);
    const btn = container.querySelector('[data-testid="agreement-accept"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    const cb = container.querySelector('[data-testid="agreement-checkbox"]') as HTMLInputElement;
    await toggleCheckbox(cb);
    expect(btn.disabled).toBe(false);
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
    expect(window.location.reload).toHaveBeenCalled();
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
});
