import { describe, test, expect } from 'vitest';
import { buildPageGraph } from '@/lib/page-jsonld';

describe('buildPageGraph', () => {
  test('wraps schemas in @graph array with single @context', () => {
    const org = { '@type': 'Organization', name: 'Test' };
    const breadcrumb = { '@type': 'BreadcrumbList', itemListElement: [] };

    const result = buildPageGraph(org, breadcrumb);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph']).toHaveLength(2);
    expect((result['@graph'] as Record<string, unknown>[])[0]['@type']).toBe('Organization');
    expect((result['@graph'] as Record<string, unknown>[])[1]['@type']).toBe('BreadcrumbList');
  });

  test('strips @context from child schemas', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Event', name: 'Test' };

    const result = buildPageGraph(schema);

    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0]).not.toHaveProperty('@context');
    expect(result['@context']).toBe('https://schema.org');
  });

  test('filters out null, undefined, and false values', () => {
    const org = { '@type': 'Organization', name: 'Test' };

    const result = buildPageGraph(org, null, undefined, false);

    expect((result['@graph'] as unknown[]).length).toBe(1);
  });

  test('returns empty @graph when no valid schemas provided', () => {
    const result = buildPageGraph(null, undefined);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph']).toEqual([]);
  });

  test('single schema in @graph', () => {
    const org = { '@type': 'Organization', name: 'Test' };

    const result = buildPageGraph(org);

    expect((result['@graph'] as unknown[]).length).toBe(1);
  });
});
