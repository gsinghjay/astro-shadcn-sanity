/**
 * Custom VisualEditing wrapper for Astro (MPA).
 *
 * The default @sanity/astro VisualEditing component does not pass a `history`
 * adapter, so Presentation Tool navigation events (clicking document locations)
 * are silently dropped. This component adds an MPA-compatible HistoryAdapter
 * that performs full-page navigation via window.location.
 */
import {
  VisualEditing,
  type HistoryAdapter,
  type HistoryUpdate,
} from '@sanity/visual-editing/react'

function createMPAHistoryAdapter(): HistoryAdapter {
  return {
    update(data: HistoryUpdate) {
      // Full page navigation for MPA — the new page will re-mount VisualEditing
      window.location.href = data.url
    },
    subscribe(navigate) {
      // Report the current URL to the Studio on mount
      navigate({
        type: 'push',
        url: window.location.href,
        title: document.title,
      })

      // Report browser back/forward navigation
      const onPopState = () => {
        navigate({
          type: 'pop',
          url: window.location.href,
          title: document.title,
        })
      }
      window.addEventListener('popstate', onPopState)
      return () => {
        window.removeEventListener('popstate', onPopState)
      }
    },
  }
}

const historyAdapter = createMPAHistoryAdapter()

export default function VisualEditingMPA() {
  return (
    <VisualEditing
      portal
      history={historyAdapter}
      refresh={() => {
        return new Promise((resolve) => {
          window.location.reload()
          resolve()
        })
      }}
    />
  )
}
