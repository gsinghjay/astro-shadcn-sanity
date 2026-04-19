export function buildPageGraph(
  ...schemas: (Record<string, unknown> | null | undefined | false)[]
): Record<string, unknown> {
  const graph = schemas
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map(({ '@context': _, ...rest }) => rest);
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
