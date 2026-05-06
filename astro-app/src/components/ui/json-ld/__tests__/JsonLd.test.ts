import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import JsonLd from '../JsonLd.astro';

// Pull the JSON body out of the rendered <script type="application/ld+json">…</script>.
function extractScriptBody(html: string): string {
  const match = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error(`No JSON-LD <script> tag found in: ${html}`);
  return match[1];
}

// Count `</script>` occurrences in the FULL rendered HTML. If escape ever
// regressed, the body would contain a literal `</script>` and the count
// would exceed 1 — extractScriptBody alone can't catch that because its
// non-greedy regex stops at the first `</script>`.
function countScriptCloseTags(html: string): number {
  return (html.match(/<\/script>/g) ?? []).length;
}

// Reverse the unicode escapes we apply in escapeForInlineScript so we can
// assert the original JSON parses back to the input shape.
function decodeEscapes(s: string): string {
  return s
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\u2028/g, ' ')
    .replace(/\\u2029/g, ' ');
}

describe('JsonLd', () => {
  test('escapes </script> in string fields', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: { name: 'Acme</script><script>alert(1)</script>' },
      },
    });

    const body = extractScriptBody(html);
    expect(body).toContain('\\u003c/script\\u003e');
    expect(body).toContain('\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    // The body itself must not contain a literal closing tag that would
    // terminate the inline <script> early. Check the FULL html too — exactly
    // one </script> must appear (the legitimate one closing our tag); any
    // additional one means escape leaked.
    expect(body).not.toContain('</script>');
    expect(body).not.toContain('<script>');
    expect(countScriptCloseTags(html)).toBe(1);
  });

  test('escapes <!-- HTML comment-form smuggling', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: { name: '<!--<script>alert(1)</script>-->' },
      },
    });

    const body = extractScriptBody(html);
    expect(body).toContain('\\u003c!--');
    expect(body).toContain('--\\u003e');
    expect(body).not.toContain('<!--');
    expect(body).not.toContain('-->');
    expect(countScriptCloseTags(html)).toBe(1);
  });

  test('escapes & to \\u0026', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: { schema: { description: 'A & B' } },
    });

    const body = extractScriptBody(html);
    expect(body).toContain('A \\u0026 B');
    expect(body).not.toMatch(/[^\\]&/);
  });

  test('escapes U+2028 / U+2029 line terminators', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: {
          ls: 'before after',
          ps: 'before after',
        },
      },
    });

    const body = extractScriptBody(html);
    expect(body).toContain('\\u2028');
    expect(body).toContain('\\u2029');
    expect(body).not.toContain(' ');
    expect(body).not.toContain(' ');
  });

  test('preserves valid JSON parseability after decoding escapes', async () => {
    const container = await AstroContainer.create();
    const input = {
      '@type': 'Organization',
      name: 'Acme</script>',
      description: 'A & B',
      sep: 'x y z',
    };
    const html = await container.renderToString(JsonLd, {
      props: { schema: input },
    });

    const body = extractScriptBody(html);
    const decoded = decodeEscapes(body);
    const parsed = JSON.parse(decoded);

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('Acme</script>');
    expect(parsed.description).toBe('A & B');
    expect(parsed.sep).toBe('x y z');
  });

  test('forwards slot prop to the rendered <script> tag', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: { name: 'plain' },
        slot: 'structured-data',
      },
    });

    expect(html).toMatch(/<script[^>]*slot="structured-data"[^>]*>/);
  });

  test('omits slot attribute when no slot prop is passed', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: { schema: { name: 'plain' } },
    });

    expect(html).not.toMatch(/<script[^>]*slot=/);
  });

  test('handles array schemas by wrapping each entry with @context', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: [
          { '@type': 'Organization', name: 'A' },
          { '@type': 'Person', name: 'B</script>' },
        ],
      },
    });

    const body = extractScriptBody(html);
    const parsed = JSON.parse(decodeEscapes(body));
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]['@context']).toBe('https://schema.org');
    expect(parsed[1]['@context']).toBe('https://schema.org');
    expect(parsed[1].name).toBe('B</script>');
    expect(body).not.toContain('</script>');
    expect(countScriptCloseTags(html)).toBe(1);
  });

  test('preserves existing @context when caller already supplies one', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: {
        schema: { '@context': 'https://schema.org', '@type': 'Event' },
      },
    });

    const parsed = JSON.parse(decodeEscapes(extractScriptBody(html)));
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Event');
  });
});
