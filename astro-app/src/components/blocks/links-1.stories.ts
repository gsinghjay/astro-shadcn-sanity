import Links1 from './links-1.astro'

export default {
  title: 'Blocks/Links/Links1',
  component: Links1,
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
