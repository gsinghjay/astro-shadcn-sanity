import { stegaClean } from '@sanity/client/stega';

export function buildBreadcrumbJsonLd(
  items: Array<{ label: string; href?: string }>,
  baseUrl: string,
  currentPath: string,
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    ...(baseUrl && currentPath ? { '@id': `${baseUrl}${currentPath}#breadcrumb` } : {}),
    itemListElement: items
      .filter((item, index) => item.href || index === items.length - 1)
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: stegaClean(item.label),
        ...(item.href && { item: `${baseUrl}${item.href}` }),
      })),
  };
}
