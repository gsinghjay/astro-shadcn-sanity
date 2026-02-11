import Blocks4 from './blocks-4.astro'

export default {
  title: 'Blocks/Meta/Blocks4',
  component: Blocks4,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    items: [
      { block: "hero-1", href: "/blocks/hero-1/" },
      { block: "features-3", href: "/blocks/features-3/" },
      { block: "cta-1", href: "/blocks/cta-1/" },
      { block: "stats-1", href: "/blocks/stats-1/" },
      { block: "content-1", href: "/blocks/content-1/" },
      { block: "faqs-1", href: "/blocks/faqs-1/" },
    ],
  },
}
