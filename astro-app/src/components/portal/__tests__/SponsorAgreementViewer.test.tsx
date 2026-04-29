// @vitest-environment jsdom
import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Replace `react-pdf` with a minimal stub so jsdom doesn't try to load the worker.
// Document fires onLoadSuccess on mount (or onLoadError when forceLoadError is set).
const { documentMock, pageMock, mockState } = vi.hoisted(() => ({
  documentMock: vi.fn(),
  pageMock: vi.fn(),
  mockState: { forceLoadError: false },
}));

vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
  Document: ({
    file,
    onLoadSuccess,
    onLoadError,
    children,
  }: {
    file: string;
    onLoadSuccess?: (info: { numPages: number }) => void;
    onLoadError?: (e: Error) => void;
    children?: React.ReactNode;
  }) => {
    documentMock(file);
    React.useEffect(() => {
      if (mockState.forceLoadError) onLoadError?.(new Error('boom'));
      else onLoadSuccess?.({ numPages: 3 });
    }, [onLoadSuccess, onLoadError]);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber }: { pageNumber: number }) => {
    pageMock(pageNumber);
    return <div data-testid="pdf-page" data-page={pageNumber} style={{ height: 600 }} />;
  },
}));

// React-pdf CSS imports — stub as empty modules
vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}));
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}));

import SponsorAgreementViewer from '../SponsorAgreementViewer';

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

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function getViewerEl(): HTMLDivElement {
  const el = container.querySelector<HTMLDivElement>('[data-testid="agreement-viewer"]');
  if (!el) throw new Error('viewer container not found');
  return el;
}

/** Override scroll metrics on a div so we can drive the scroll listener deterministically. */
function setScrollMetrics(el: HTMLElement, opts: {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}) {
  Object.defineProperty(el, 'scrollTop', { configurable: true, get: () => opts.scrollTop });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => opts.clientHeight });
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => opts.scrollHeight });
}

beforeEach(() => {
  documentMock.mockClear();
  pageMock.mockClear();
  mockState.forceLoadError = false;
  // Polyfill rAF for the short-pdf detection path
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (container) unmount();
});

describe('SponsorAgreementViewer — onScrolledToEnd', () => {
  it('fires when scroll position reaches the bottom (within 8px tolerance)', async () => {
    const onScrolledToEnd = vi.fn();
    render(
      <SponsorAgreementViewer
        pdfUrl="/agreement.pdf"
        onScrolledToEnd={onScrolledToEnd}
      />,
    );
    await flush();

    const el = getViewerEl();
    // Tall content, NOT at bottom → no fire
    setScrollMetrics(el, { scrollTop: 0, clientHeight: 200, scrollHeight: 1000 });
    await act(async () => {
      el.dispatchEvent(new Event('scroll'));
    });
    expect(onScrolledToEnd).not.toHaveBeenCalled();

    // Within tolerance (scrollHeight - (top+client) = 5 < 8)
    setScrollMetrics(el, { scrollTop: 795, clientHeight: 200, scrollHeight: 1000 });
    await act(async () => {
      el.dispatchEvent(new Event('scroll'));
    });
    expect(onScrolledToEnd).toHaveBeenCalledTimes(1);
  });

  it('fires immediately for short PDFs that fit entirely in the viewport', async () => {
    const onScrolledToEnd = vi.fn();

    // Pre-set "fits in viewport" metrics on every fresh div the component creates.
    // Patch at the prototype level for this test.
    const origScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
    const origClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 400 });

    try {
      render(
        <SponsorAgreementViewer
          pdfUrl="/short.pdf"
          onScrolledToEnd={onScrolledToEnd}
        />,
      );
      // Wait for onLoadSuccess effect + rAF callback
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      await flush();
      expect(onScrolledToEnd).toHaveBeenCalledTimes(1);
    } finally {
      if (origScrollHeight) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', origScrollHeight);
      else Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
      if (origClientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', origClientHeight);
      else Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
    }
  });

  it('reload (Try again) resets the once-only guard so the user must scroll again', async () => {
    const onScrolledToEnd = vi.fn();
    // Force the container scrollable so the short-PDF auto-fire path doesn't trigger
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 1000 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, get: () => 0, set: () => {} });

    try {
      mockState.forceLoadError = true;
      render(
        <SponsorAgreementViewer
          pdfUrl="/agreement.pdf"
          onScrolledToEnd={onScrolledToEnd}
        />,
      );
      await flush();

      mockState.forceLoadError = false;
      const btn = container.querySelector('button');
      expect(btn?.textContent).toMatch(/try again/i);
      await act(async () => {
        btn?.click();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      await flush();

      // After reload, onScrolledToEnd has not yet fired (PDF is scrollable, user hasn't scrolled).
      expect(onScrolledToEnd).not.toHaveBeenCalled();

      const el = getViewerEl();
      setScrollMetrics(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });
      await act(async () => {
        el.dispatchEvent(new Event('scroll'));
      });
      expect(onScrolledToEnd).toHaveBeenCalledTimes(1);
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
      Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollTop');
    }
  });

  it('fires exactly once even when the user scrolls past the threshold multiple times', async () => {
    const onScrolledToEnd = vi.fn();
    render(
      <SponsorAgreementViewer
        pdfUrl="/agreement.pdf"
        onScrolledToEnd={onScrolledToEnd}
      />,
    );
    await flush();

    const el = getViewerEl();
    setScrollMetrics(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        el.dispatchEvent(new Event('scroll'));
      });
    }
    expect(onScrolledToEnd).toHaveBeenCalledTimes(1);
  });

  it('hides the "Keep scrolling" indicator after onScrolledToEnd fires', async () => {
    const onScrolledToEnd = vi.fn();

    // Ensure scrollable (scrollHeight > clientHeight + tolerance) so the short-PDF auto-fire
    // doesn't trip and the indicator is visible before the user scrolls.
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 1000 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, get: () => 0, set: () => {} });

    try {
      render(
        <SponsorAgreementViewer
          pdfUrl="/agreement.pdf"
          onScrolledToEnd={onScrolledToEnd}
        />,
      );
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      await flush();
      expect(container.querySelector('[data-testid="agreement-scroll-indicator"]')).toBeTruthy();

      const el = getViewerEl();
      // Override on this specific element so we can simulate scroll-to-bottom
      setScrollMetrics(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });
      await act(async () => {
        el.dispatchEvent(new Event('scroll'));
      });

      expect(container.querySelector('[data-testid="agreement-scroll-indicator"]')).toBeNull();
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
      Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollTop');
    }
  });
});
