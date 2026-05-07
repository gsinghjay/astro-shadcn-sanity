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
}

const DEFAULT_WIDTH = 800;

export default function SponsorAgreementViewer({
  pdfUrl,
  maxHeight = '70vh',
  className = '',
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Default width keeps pages legible before/without ResizeObserver (older browsers).
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [reloadKey, setReloadKey] = useState(0);

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

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
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
      <Page key={`page-${i + 1}`} pageNumber={i + 1} width={width} className="mb-2" />
    ));
  }, [numPages, width]);

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
    </div>
  );
}
