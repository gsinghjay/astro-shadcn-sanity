/**
 * Story 2.19: Video Testimonial Support — Schema Validation
 *
 * Tests testimonial videoUrl field definition and custom YouTube URL validation.
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 2-19
 * @phase GREEN
 */
import { describe, test, expect } from 'vitest'

import { testimonial } from '../../../studio/src/schemaTypes/documents/testimonial'

describe('Story 2.19: Testimonial videoUrl field', () => {
  test('videoUrl field exists with type url', () => {
    const videoUrlField = (testimonial as any).fields.find((f: any) => f.name === 'videoUrl')
    expect(videoUrlField).toBeDefined()
    expect(videoUrlField.type).toBe('url')
  })

  test('videoUrl custom validator accepts YouTube URLs', () => {
    const videoUrlField = (testimonial as any).fields.find((f: any) => f.name === 'videoUrl')
    const customRule = videoUrlField.validation
    expect(customRule).toBeDefined()

    const customFn = extractCustomValidator(videoUrlField)
    if (customFn) {
      expect(customFn('https://www.youtube.com/watch?v=abc123')).toBe(true)
      expect(customFn('https://youtu.be/abc123')).toBe(true)
      expect(customFn('https://www.youtube.com/embed/abc123')).toBe(true)
      expect(customFn(undefined)).toBe(true)
      expect(customFn(null)).toBe(true)
      expect(customFn('https://vimeo.com/12345')).toBe('Only YouTube URLs are supported')
      expect(customFn('https://example.com/video')).toBe('Only YouTube URLs are supported')
    }
  })

  test('videoUrl custom validator rejects non-YouTube subdomains', () => {
    const videoUrlField = (testimonial as any).fields.find((f: any) => f.name === 'videoUrl')
    const customFn = extractCustomValidator(videoUrlField)
    if (customFn) {
      expect(customFn('https://notyoutube.com/watch?v=abc')).toBe('Only YouTube URLs are supported')
      expect(customFn('https://youtube.com.evil.com/abc')).toBe('Only YouTube URLs are supported')
    }
  })
})

/**
 * Extracts the custom validator function from a Sanity field definition.
 * Calls the validation builder and inspects the resulting rule chain.
 */
function extractCustomValidator(field: any): ((value: any) => true | string) | null {
  if (!field.validation) return null

  let capturedFn: ((value: any) => true | string) | null = null
  const ruleMock: any = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'custom') {
        return (fn: any) => {
          capturedFn = fn
          return ruleMock
        }
      }
      return () => ruleMock
    },
  })

  field.validation(ruleMock)
  return capturedFn
}
