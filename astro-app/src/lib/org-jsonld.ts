import { getSiteSettings } from '@/lib/sanity';
import { stegaClean } from '@sanity/client/stega';

export async function buildOrgJsonLd(origin: string): Promise<Record<string, unknown>> {
  const siteSettings = await getSiteSettings();
  const cleanDescription = stegaClean(siteSettings?.siteDescription ?? '');

  return {
    '@type': 'EducationalOrganization',
    '@id': `${origin}/#organization`,
    name: stegaClean(siteSettings?.siteName) ?? 'YWCC Industry Capstone',
    url: origin,
    ...(cleanDescription && { description: cleanDescription }),
  };
}
