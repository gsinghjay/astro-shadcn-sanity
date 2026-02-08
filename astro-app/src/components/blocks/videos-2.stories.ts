import Videos2 from './videos-2.astro'

export default {
  title: 'Blocks/Video/Videos2',
  component: Videos2,
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
    ],
    items: [
        {
            title: "Introduction",
            video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            href: "#"
        },
        {
            title: "Getting Started",
            video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            href: "#"
        },
        {
            title: "Advanced Usage",
            video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            href: "#"
        }
    ]
},
}
