import Links2 from './links-2.astro'

export default {
  title: 'Blocks/Links/Links2',
  component: Links2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    links: [
        {
            text: "Get Started",
            href: "#"
        },
        {
            text: "Learn More",
            href: "#"
        }
    ]
},
}
