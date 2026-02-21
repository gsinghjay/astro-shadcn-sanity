import type { SomePortableTextComponents } from 'astro-portabletext/types';
import PortableTextImage from './PortableTextImage.astro';
import PortableTextCallout from './PortableTextCallout.astro';
import PortableTextLink from './PortableTextLink.astro';
import PortableTextInternalLink from './PortableTextInternalLink.astro';

export const portableTextComponents: SomePortableTextComponents = {
  type: {
    image: PortableTextImage,
    callout: PortableTextCallout,
  },
  mark: {
    link: PortableTextLink,
    internalLink: PortableTextInternalLink,
  },
};
