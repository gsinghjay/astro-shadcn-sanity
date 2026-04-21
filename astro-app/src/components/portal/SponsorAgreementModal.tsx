import { useCallback, useEffect, useRef, useState } from 'react';
// React renderer is required here: this island runs client-side. The server-rendered
// /portal/agreement page uses `astro-portabletext` for the same content (Astro convention),
// so two renderers are intentional — one per render context.
import { PortableText, type PortableTextBlock } from '@portabletext/react';
import SponsorAgreementViewer from './SponsorAgreementViewer';

interface Props {
  title: string;
  intro: PortableTextBlock[] | null;
  pdfUrl: string | null;
  checkboxLabel: string;
  acceptButtonText: string;
}

async function signOut(onError: (msg: string) => void): Promise<void> {
  try {
    const { createAuthClient } = await import('better-auth/client');
    const client = createAuthClient({ baseURL: window.location.origin + '/api/auth' });
    await client.signOut();
    window.location.href = '/portal/login';
  } catch (e) {
    console.error('[SponsorAgreementModal] signOut failed:', e);
    onError('Could not sign out. Check your connection and try again.');
  }
}

function hasNonEmptyBlocks(value: PortableTextBlock[] | null): boolean {
  if (!value || value.length === 0) return false;
  return value.some((block) => {
    if (block._type !== 'block') return true;
    const children = (block as { children?: { text?: string }[] }).children;
    return Array.isArray(children) && children.some((c) => (c.text ?? '').trim().length > 0);
  });
}

export default function SponsorAgreementModal({
  title,
  intro,
  pdfUrl,
  checkboxLabel,
  acceptButtonText,
}: Props) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);

  // Body scroll-lock + initial focus while modal is mounted
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the accept button (or sign-out as fallback) on mount.
    queueMicrotask(() => {
      const target =
        acceptBtnRef.current ??
        (dialogRef.current?.querySelector<HTMLElement>('[data-portal-signout]') ?? null);
      target?.focus();
    });
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Focus trap: keep Tab cycling inside the modal so background portal nav stays unreachable.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const isConfigured = Boolean(pdfUrl);
  const onPdfReady = useCallback((numPages: number) => setPdfReady(numPages > 0), []);

  async function onAccept() {
    if (!accepted || submitting || !pdfReady) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/agreement/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
      });
      if (res.status === 200 || res.status === 409) {
        // Defensive: if reload is blocked or delayed, drop the spinner so user can retry.
        setTimeout(() => setSubmitting(false), 5000);
        window.location.reload();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error ? `Could not accept (${body.error}). Try again.` : 'Could not accept. Try again.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      // Reset on every non-redirect path so the button never gets stuck on "Saving…".
      if (!error) setSubmitting(false);
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sponsor-agreement-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      data-testid="sponsor-agreement-modal"
    >
      <div className="bg-background text-foreground flex w-full max-w-3xl flex-col gap-4 border p-6 max-h-[90vh]">
        <div className="flex flex-col gap-2">
          <h2 id="sponsor-agreement-title" className="text-xl font-bold uppercase tracking-tight">
            {title}
          </h2>
          {hasNonEmptyBlocks(intro) && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <PortableText value={intro!} />
            </div>
          )}
        </div>

        {isConfigured && pdfUrl ? (
          <SponsorAgreementViewer pdfUrl={pdfUrl} maxHeight="60vh" onReady={onPdfReady} />
        ) : (
          <div className="border bg-muted/30 p-6 text-sm text-muted-foreground">
            Sponsor agreement is not yet configured. Please contact your program administrator.
          </div>
        )}

        {isConfigured && (
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!pdfReady}
              className="mt-1 size-4 shrink-0 border-input disabled:opacity-50"
              data-testid="agreement-checkbox"
            />
            <span>{checkboxLabel}</span>
          </label>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => signOut(setError)}
            data-portal-signout
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Sign out
          </button>

          {isConfigured && (
            <button
              ref={acceptBtnRef}
              type="button"
              onClick={onAccept}
              disabled={!accepted || submitting || !pdfReady}
              data-testid="agreement-accept"
              className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : acceptButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
