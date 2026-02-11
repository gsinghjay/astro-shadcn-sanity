import Blocks2 from './blocks-2.astro'

export default {
  title: 'Blocks/Meta/Blocks2',
  component: Blocks2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Section Title",
    description: "A short description that explains the value proposition of this section.",
    items: [
      { block: "hero-1", href: "/blocks/hero-1/" },
      { block: "features-3", href: "/blocks/features-3/" },
      { block: "cta-1", href: "/blocks/cta-1/" },
      { block: "stats-1", href: "/blocks/stats-1/" },
    ],
  },
}
