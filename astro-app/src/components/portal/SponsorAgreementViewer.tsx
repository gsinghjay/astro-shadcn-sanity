import React, { useEffect, useRef, useState } from 'react';
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
}

export default function SponsorAgreementViewer({
  pdfUrl,
  maxHeight = '70vh',
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`border bg-muted/30 overflow-y-auto ${className}`}
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
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setLoadError('Could not load PDF. Try refreshing.')}
          loading={<div className="p-8 text-center text-sm text-muted-foreground">Loading agreement…</div>}
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page-${i + 1}`}
                pageNumber={i + 1}
                width={width}
                className="mb-2"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
        </Document>
      )}
    </div>
  );
}
