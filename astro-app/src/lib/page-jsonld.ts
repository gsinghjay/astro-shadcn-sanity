export function buildPageGraph(
  ...schemas: (Record<string, unknown> | null | undefined | false)[]
): Record<string, unknown> {
  const filtered = schemas.filter(
    (s): s is Record<string, unknown> => !!s && typeof s === 'object',
  );
  for (const schema of filtered) {
    delete schema['@context'];
  }
  return {
    '@context': 'https://schema.org',
    '@graph': filtered,
  };
}
