import React, { useEffect, useState } from 'react';
import { PortableText, type PortableTextBlock } from '@portabletext/react';
import SponsorAgreementViewer from './SponsorAgreementViewer';

interface Props {
  title: string;
  intro: PortableTextBlock[] | null;
  pdfUrl: string | null;
  checkboxLabel: string;
  acceptButtonText: string;
}

async function signOut() {
  const { createAuthClient } = await import('better-auth/client');
  const client = createAuthClient({ baseURL: window.location.origin + '/api/auth' });
  await client.signOut();
  window.location.href = '/portal/login';
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

  // Body scroll-lock while modal is mounted
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const isConfigured = Boolean(pdfUrl);

  async function onAccept() {
    if (!accepted || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/agreement/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
      });
      if (res.status === 200 || res.status === 409) {
        window.location.reload();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error ? `Could not accept (${body.error}). Try again.` : 'Could not accept. Try again.');
      setSubmitting(false);
    } catch {
      setError('Network error. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <div
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
          {intro && intro.length > 0 && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <PortableText value={intro} />
            </div>
          )}
        </div>

        {isConfigured && pdfUrl ? (
          <SponsorAgreementViewer pdfUrl={pdfUrl} maxHeight="60vh" />
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
              className="mt-1 size-4 shrink-0 border-input"
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
            onClick={signOut}
            data-portal-signout
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Sign out
          </button>

          {isConfigured && (
            <button
              type="button"
              onClick={onAccept}
              disabled={!accepted || submitting}
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
