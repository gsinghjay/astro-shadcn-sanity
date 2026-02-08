import Video2 from './video-2.astro'

export default {
  title: 'Blocks/Video/Video2',
  component: Video2,
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
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    list: [
        "First benefit of this product",
        "Second benefit with details",
        "Third key advantage"
    ]
},
}
