import Videos1 from './videos-1.astro'

export default {
  title: 'Blocks/Video/Videos1',
  component: Videos1,
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
