import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Vite bundles the worker as an asset; `new URL(..., import.meta.url)` resolves to a same-origin URL.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Props {
  pdfUrl: string;
  maxHeight?: string;
  className?: string;
  /** Fires when the PDF reports its page count. Empty/corrupt PDFs report 0 — caller should
   *  use this to keep the accept checkbox/button disabled. */
  onReady?: (numPages: number) => void;
  /** Fires once per mount when the user has scrolled to the end of the agreement (8px tolerance).
   *  Short PDFs that fit entirely in the viewport fire this immediately after `onReady`. */
  onScrolledToEnd?: () => void;
}

const DEFAULT_WIDTH = 800;
const SCROLL_TOLERANCE_PX = 8;

export default function SponsorAgreementViewer({
  pdfUrl,
  maxHeight = '70vh',
  className = '',
  onReady,
  onScrolledToEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Default width keeps pages legible before/without ResizeObserver (older browsers).
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [reloadKey, setReloadKey] = useState(0);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [renderedPages, setRenderedPages] = useState(0);
  const hasFiredRef = useRef(false);

  // Debounced ResizeObserver: avoid thrashing pdfjs on every resize tick.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') return;
    let pending: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (!w || w <= 0) return;
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => setWidth(w), 100);
    });
    observer.observe(el);
    return () => {
      if (pending) clearTimeout(pending);
      observer.disconnect();
    };
  }, []);

  // Scroll listener: fire onScrolledToEnd once when within 8px of the bottom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onScrolledToEnd) return;
    const onScroll = () => {
      if (hasFiredRef.current) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_TOLERANCE_PX) {
        hasFiredRef.current = true;
        setScrolledToEnd(true);
        onScrolledToEnd();
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScrolledToEnd]);

  // Short-PDF auto-fire: once ALL pages have rendered (not just `onLoadSuccess`) and width has
  // settled, measure scrollHeight. Without waiting for `onRenderSuccess`, the rAF tick can run
  // while pages are still laying out, making `scrollHeight <= clientHeight` falsely true and
  // bypassing the scroll gate on multi-page PDFs.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !numPages || hasFiredRef.current || !onScrolledToEnd) return;
    if (renderedPages < numPages) return;
    const id = requestAnimationFrame(() => {
      if (!el || hasFiredRef.current) return;
      if (el.scrollHeight <= el.clientHeight + SCROLL_TOLERANCE_PX) {
        hasFiredRef.current = true;
        setScrolledToEnd(true);
        onScrolledToEnd();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [numPages, renderedPages, width, onScrolledToEnd]);

  const onPageRendered = useCallback(() => setRenderedPages((n) => n + 1), []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setRenderedPages(0);
      setNumPages(n);
      onReady?.(n);
      if (n === 0) setLoadError('PDF is empty. Contact your program administrator.');
    },
    [onReady],
  );
  const onDocumentLoadError = useCallback(
    () => setLoadError('Could not load PDF. Try refreshing.'),
    [],
  );

  // Memoize the page list so an unrelated parent re-render doesn't reset every page.
  const pages = useMemo(() => {
    if (!numPages) return null;
    return Array.from({ length: numPages }, (_, i) => (
      <Page
        key={`page-${i + 1}`}
        pageNumber={i + 1}
        width={width}
        className="mb-2"
        onRenderSuccess={onPageRendered}
      />
    ));
  }, [numPages, width, onPageRendered]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="border bg-muted/30 overflow-y-auto"
        style={{ maxHeight }}
        data-testid="agreement-viewer"
      >
        {loadError ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                setNumPages(null);
                setRenderedPages(0);
                hasFiredRef.current = false;
                setScrolledToEnd(false);
                setReloadKey((k) => k + 1);
              }}
              className="text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <Document
            key={reloadKey}
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="p-8 text-center text-sm text-muted-foreground">Loading agreement…</div>}
          >
            {pages}
          </Document>
        )}
      </div>
      {!loadError && numPages != null && !scrolledToEnd && onScrolledToEnd && (
        <span
          aria-hidden="true"
          data-testid="agreement-scroll-indicator"
          className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow"
        >
          Keep scrolling
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      )}
    </div>
  );
}
