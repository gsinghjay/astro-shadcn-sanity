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
  mockState: { forceLoadError: false, numPages: 3 },
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
      else onLoadSuccess?.({ numPages: mockState.numPages });
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

beforeEach(() => {
  documentMock.mockClear();
  pageMock.mockClear();
  mockState.forceLoadError = false;
  mockState.numPages = 3;
});

afterEach(() => {
  if (container) unmount();
});

describe('SponsorAgreementViewer — onReady', () => {
  it('fires onReady with numPages when the PDF reports its page count', async () => {
    const onReady = vi.fn();
    render(<SponsorAgreementViewer pdfUrl="/agreement.pdf" onReady={onReady} />);
    await flush();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith(3);
  });

  it('fires onReady(0) for empty PDFs and surfaces an error', async () => {
    const onReady = vi.fn();
    mockState.numPages = 0;
    render(<SponsorAgreementViewer pdfUrl="/empty.pdf" onReady={onReady} />);
    await flush();
    expect(onReady).toHaveBeenCalledWith(0);
    expect(container.textContent).toMatch(/pdf is empty/i);
  });

  it('surfaces a reload UI on PDF load error', async () => {
    mockState.forceLoadError = true;
    render(<SponsorAgreementViewer pdfUrl="/agreement.pdf" />);
    await flush();
    const btn = container.querySelector('button');
    expect(btn?.textContent).toMatch(/try again/i);
  });

  it('does not render any scroll-gate indicator', async () => {
    render(<SponsorAgreementViewer pdfUrl="/agreement.pdf" />);
    await flush();
    expect(container.querySelector('[data-testid="agreement-scroll-indicator"]')).toBeNull();
  });
});
